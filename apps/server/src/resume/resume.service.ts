import { PromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { ChatOpenAI } from "@langchain/openai";
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { CreateResumeDto, ImportResumeDto, ResumeDto, UpdateResumeDto } from "@reactive-resume/dto";
import { defaultResumeData, ResumeData } from "@reactive-resume/schema";
import { resumeDataSchema } from "@reactive-resume/schema";
import type { DeepPartial } from "@reactive-resume/utils";
import { generateRandomName, kebabCase } from "@reactive-resume/utils";
import { ErrorMessage } from "@reactive-resume/utils";
import { RedisService } from "@songkeys/nestjs-redis";
import deepmerge from "deepmerge";
import Redis from "ioredis";
import { OutputFixingParser, StructuredOutputParser } from "langchain/output_parsers";
import * as mammoth from "mammoth";
import { PrismaService } from "nestjs-prisma";
import pdfParse from "pdf-parse";

import { PrinterService } from "@/server/printer/printer.service";

import { StorageService } from "../storage/storage.service";
import { UtilsService } from "../utils/utils.service";
@Injectable()
export class ResumeService {
  private readonly redis: Redis;

  constructor(
    private readonly prisma: PrismaService,
    private readonly printerService: PrinterService,
    private readonly storageService: StorageService,
    private readonly redisService: RedisService,
    private readonly utils: UtilsService,
  ) {
    this.redis = this.redisService.getClient();
  }

  async create(userId: string, createResumeDto: CreateResumeDto) {
    const { name, email, picture } = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: { name: true, email: true, picture: true },
    });

    const data = deepmerge(defaultResumeData, {
      basics: { name, email, picture: { url: picture ?? "" } },
    } satisfies DeepPartial<ResumeData>);

    const resume = await this.prisma.resume.create({
      data: {
        data,
        userId,
        title: createResumeDto.title,
        visibility: createResumeDto.visibility,
        slug: createResumeDto.slug ?? kebabCase(createResumeDto.title),
      },
    });

    await Promise.all([
      this.redis.del(`user:${userId}:resumes`),
      this.redis.set(`user:${userId}:resume:${resume.id}`, JSON.stringify(resume)),
    ]);

    return resume;
  }

  async import(userId: string, importResumeDto: ImportResumeDto) {
    const randomTitle = generateRandomName();

    const resume = await this.prisma.resume.create({
      data: {
        userId,
        visibility: "private",
        data: importResumeDto.data,
        title: importResumeDto.title || randomTitle,
        slug: importResumeDto.slug || kebabCase(randomTitle),
      },
    });

    await Promise.all([
      this.redis.del(`user:${userId}:resumes`),
      this.redis.set(`user:${userId}:resume:${resume.id}`, JSON.stringify(resume)),
    ]);

    return resume;
  }

  async importWithURL(userId: string, url: string, importResumeDto: ImportResumeDto) {
    const randomTitle = generateRandomName();

    const resume = await this.prisma.resume.create({
      data: {
        userId,
        visibility: "private",
        data: importResumeDto.data,
        title: importResumeDto.title || randomTitle,
        slug: importResumeDto.slug || kebabCase(randomTitle),
        originalDocumentURL: url,
      },
    });

    await Promise.all([
      this.redis.del(`user:${userId}:resumes`),
      this.redis.set(`user:${userId}:resume:${resume.id}`, JSON.stringify(resume)),
    ]);

    return resume;
  }

  findAll(userId: string) {
    return this.utils.getCachedOrSet(`user:${userId}:resumes`, () =>
      this.prisma.resume.findMany({
        where: { userId },
        orderBy: { updatedAt: "desc" },
      }),
    );
  }

  findOne(id: string, userId?: string) {
    if (userId) {
      return this.utils.getCachedOrSet(`user:${userId}:resume:${id}`, () =>
        this.prisma.resume.findUniqueOrThrow({
          where: { userId_id: { userId, id } },
        }),
      );
    }

    return this.utils.getCachedOrSet(`user:public:resume:${id}`, () =>
      this.prisma.resume.findUniqueOrThrow({
        where: { id },
      }),
    );
  }

  async findOneStatistics(userId: string, id: string) {
    const result = await Promise.all([
      this.redis.get(`user:${userId}:resume:${id}:views`),
      this.redis.get(`user:${userId}:resume:${id}:downloads`),
    ]);

    const [views, downloads] = result.map((value) => Number(value) || 0);

    return { views, downloads };
  }

  async findOneByUsernameSlug(username: string, slug: string, userId?: string) {
    const resume = await this.prisma.resume.findFirstOrThrow({
      where: { user: { username }, slug, visibility: "public" },
    });

    // Update statistics: increment the number of views by 1
    if (!userId) await this.redis.incr(`user:${resume.userId}:resume:${resume.id}:views`);

    return resume;
  }

  async update(userId: string, id: string, updateResumeDto: UpdateResumeDto) {
    try {
      const { locked } = await this.prisma.resume.findUniqueOrThrow({
        where: { id },
        select: { locked: true },
      });

      if (locked) throw new BadRequestException(ErrorMessage.ResumeLocked);

      const resume = await this.prisma.resume.update({
        data: {
          title: updateResumeDto.title,
          slug: updateResumeDto.slug,
          visibility: updateResumeDto.visibility,
          data: updateResumeDto.data as unknown as Prisma.JsonObject,
        },
        where: { userId_id: { userId, id } },
      });

      await Promise.all([
        this.redis.set(`user:${userId}:resume:${id}`, JSON.stringify(resume)),
        this.redis.del(`user:${userId}:resumes`),
        this.redis.del(`user:${userId}:storage:resumes:${id}`),
        this.redis.del(`user:${userId}:storage:previews:${id}`),
      ]);

      return resume;
    } catch (error) {
      if (error.code === "P2025") {
        Logger.error(error);
        throw new InternalServerErrorException(error);
      }
    }
  }

  async lock(userId: string, id: string, set: boolean) {
    const resume = await this.prisma.resume.update({
      data: { locked: set },
      where: { userId_id: { userId, id } },
    });

    await Promise.all([
      this.redis.set(`user:${userId}:resume:${id}`, JSON.stringify(resume)),
      this.redis.del(`user:${userId}:resumes`),
    ]);

    return resume;
  }

  async remove(userId: string, id: string) {
    await Promise.all([
      // Remove cached keys
      this.redis.del(`user:${userId}:resumes`),
      this.redis.del(`user:${userId}:resume:${id}`),

      // Remove files in storage, and their cached keys
      this.storageService.deleteObject(userId, "resumes", id),
      this.storageService.deleteObject(userId, "previews", id),
    ]);

    return this.prisma.resume.delete({ where: { userId_id: { userId, id } } });
  }

  async printResume(resume: ResumeDto, userId?: string) {
    const url = await this.printerService.printResume(resume);

    // Update statistics: increment the number of downloads by 1
    if (!userId) await this.redis.incr(`user:${resume.userId}:resume:${resume.id}:downloads`);

    return url;
  }

  printPreview(resume: ResumeDto) {
    return this.printerService.printPreview(resume);
  }

  async processUploadedResume(file: Express.Multer.File, userId: string) {
    const parser = StructuredOutputParser.fromZodSchema(resumeDataSchema);
    const inputJsonFormat = `{
      "personalInfo": {
        "name": "Jane Doe",
        "address": "123 Maple Street, Anytown, AN",
        "contactNumber": "123-456-7890",
        "email": "janedoe@email.com"
      },
      "summary": "An experienced project manager...",
      "education": [
        {
          "institution": "University A",
          "degree": "Bachelor of Science",
          "fieldOfStudy": "Computer Science",
          "graduationYear": 2010
        }
      ],
      "workExperience": [
        {
          "companyName": "Tech Solutions Ltd",
          "position": "Project Manager",
          "startDate": "March 2015",
          "endDate": "Present",
          "responsibilities": [
            "Lead a team of 10 developers",
            "Manage project timelines"
          ]
        }
      ],
      "skills": ["Project Management", "Agile Methodologies"],
      "certifications": [
        {
          "name": "Certified ScrumMaster",
          "issuingOrganization": "Scrum Alliance",
          "dateIssued": "April 2016"
        }
      ]
    }
`;

    const promptText = `
    Transform the given text of a professional profile into a structured JSON object. The profile includes various sections such as Personal Information, Summary, Education History, Work Experience, Skills, and Certifications. Your task is to ensure every piece of information is captured in the JSON without omissions, using appropriate and sensible key names that reflect the data accurately.
    Personal Information: This section should be encapsulated under a personalInfo key. It includes the person's name, address, contact number, and email. Each of these should be a sub-key within personalInfo.
    Summary: Summarize the professional’s career and objectives under a summary key. This should be a simple string capturing the essence of the individual's professional summary.
    Education History: Place this under an education key. Each entry should be an object in an array, including keys for institution, degree, fieldOfStudy, and graduationYear.
    Work Experience: Use a workExperience key. This section will also be an array of objects, each detailing a job role. Include keys for companyName, position, startDate, endDate, and responsibilities (the last one can be an array of strings for multiple duties).
    Skills: Under a skills key, list all skills as an array of strings. Consider grouping related skills together if the profile is extensive, possibly using sub-arrays or sub-objects categorized by skill type (e.g., technical, soft skills).
    Certifications: Use a certifications key. This will be an array of objects, each containing name, issuingOrganization, and dateIssued
    The JSON structure should look something like this (simplified example):
    \`\`\`json
    ${inputJsonFormat.toString().replaceAll("{", "{".repeat(2)).replaceAll("}", "}".repeat(2))}
    \`\`\`
    Remember to validate the JSON for correctness and completeness. Ensure all dates follow a consistent format, and use null for any unknown or inapplicable values to maintain structure integrity.

    input : {data}
    `;

    const chainInital = RunnableSequence.from([
      PromptTemplate.fromTemplate(promptText),
      new ChatOpenAI({
        modelName: "gpt-4-1106-preview",
        temperature: 0.1,
      }),
      //parser,
    ]);

    const chain = RunnableSequence.from([
      PromptTemplate.fromTemplate(
        "You are given JSON data in one format. You have to convert it into a format defined in format instruction.\n Format Instraction : {format_instructions}\n{question}. \n Make sure that all the id feilds are unique strings.\n Make sure that you return a valid JSON. \n Remove Invalid. Do not remove anything for brevity. No Comments in the JSON. Dont be chatty. ",
      ),
      new ChatOpenAI({
        modelName: "gpt-4-1106-preview",
        temperature: 0.1,
      }),
      //parser,
    ]);

    console.log(parser.getFormatInstructions());

    try {
      // Placeholder for file processing and data extraction logic
      // You might use a third-party library or service here to extract resume data
      const extractedData = await this.extractDataFromFile(file);
      console.log(extractedData);
      const initialResponse = await chainInital.invoke({
        data: extractedData,
      });
      console.log(initialResponse.content.toString());
      // Here you would typically store the extracted data in your database
      // This is a simplified example that just logs the extracted data
      const response = await chain.invoke({
        question: initialResponse.content.toString(),
        format_instructions: parser.getFormatInstructions(),
      });

      // console.log(`Extracted data for user ${userId}`);
      let strucOutput = {};
      try {
        // console.log(response);
        const validJson = this.cleanupAndValidateJSON(response.content.toString());
        if (validJson.isValid && validJson.cleanedJSON) {
          strucOutput = validJson.cleanedJSON;
        }
        this.removeKeyFromJSON(strucOutput, "metadata");
      } catch (error) {
        console.log(error);
      }
      const data = deepmerge(defaultResumeData, strucOutput);
      // console.log(" The Data is : " + JSON.stringify(data));
      return data;
    } catch (error) {
      Logger.error(`Error processing uploaded resume for user ${userId}: ${error.message}`);
      const fixParser = OutputFixingParser.fromLLM(new ChatOpenAI({ temperature: 0 }), parser);
      const output = await fixParser.parse(error.message);
      // console.log("Fixed output: ", output);
      return defaultResumeData;
    }
  }

  private async extractDataFromFile(file: Express.Multer.File): Promise<string> {
    switch (file.mimetype) {
      case "application/pdf":
        return await this.extractTextFromPDF(file.buffer);
      case "application/vnd.openxmlformats-officedocument.wordprocessingml.document": // MIME type for DOCX
        return await this.extractTextFromDocX(file.buffer);
      default:
        throw new Error("Unsupported file type");
    }
  }
  async extractTextFromPDF(fileBuffer: Buffer): Promise<string> {
    try {
      const data = await pdfParse(fileBuffer);
      return data.text;
    } catch (error) {
      console.error("Error extracting text from PDF:", error);
      throw error;
    }
  }

  // Function to extract text from a DOCX file buffer
  async extractTextFromDocX(fileBuffer: Buffer): Promise<string> {
    try {
      const result = await mammoth.extractRawText({ buffer: fileBuffer });
      return result.value; // The raw text
    } catch (error) {
      console.error("Error extracting text from DOCX:", error);
      throw error;
    }
  }

  removeKeyFromJSON(jsonObj: Record<string, never>, keyToRemove: string) {
    // Check if the key exists in the JSON object
    if (Object.prototype.hasOwnProperty.call(jsonObj, keyToRemove)) {
      // If the key exists, remove it
      delete jsonObj[keyToRemove];
    }
    // Return the modified JSON object
    return jsonObj;
  }

  cleanupAndValidateJSON(input: string): { isValid: boolean; cleanedJSON?: Record<string, never> } {
    console.log("Input : ", input);
    // Find the position of "```json" and "```"
    const startTagIndex = input.indexOf("```json");
    const endTagIndex = input.indexOf("```", startTagIndex + 1);

    // Check if both tags exist
    if (startTagIndex !== -1 && endTagIndex !== -1) {
      // Extract the JSON string between "```json" and "```"
      const jsonString = input.substring(startTagIndex + 7, endTagIndex).trim();
      console.log("jsonString : ", jsonString);

      try {
        // Parse the extracted JSON string
        const cleanedJSON = JSON.parse(jsonString);
        // Return the cleaned JSON object and indicate that it's valid
        console.log("output : ", jsonString);

        return { isValid: true, cleanedJSON };
      } catch (error) {
        // If parsing fails, indicate that the JSON is invalid
        return { isValid: false };
      }
    } else {
      // If "```json" tags do not exist, consider the whole string and attempt to parse it as JSON
      try {
        const cleanedJSON = JSON.parse(input);
        // Return the cleaned JSON object and indicate that it's valid
        return { isValid: true, cleanedJSON };
      } catch (error) {
        // If parsing fails, indicate that the JSON is invalid
        return { isValid: false };
      }
    }
  }
}
