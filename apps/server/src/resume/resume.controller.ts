import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  InternalServerErrorException,
  Logger,
  Param,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import { UploadedFile, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiTags } from "@nestjs/swagger";
import { User as UserEntity } from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { CreateResumeDto, ImportResumeDto, ResumeDto, UpdateResumeDto } from "@reactive-resume/dto";
import { ReactiveResumeParser } from "@reactive-resume/parser";
import { ResumeData, resumeDataSchema } from "@reactive-resume/schema";
import { ErrorMessage } from "@reactive-resume/utils";
// import { Express } from "express";
import { zodToJsonSchema } from "zod-to-json-schema";

import { User } from "@/server/user/decorators/user.decorator";

import { OptionalGuard } from "../auth/guards/optional.guard";
import { TwoFactorGuard } from "../auth/guards/two-factor.guard";
import { UtilsService } from "../utils/utils.service";
import { Resume } from "./decorators/resume.decorator";
import { ResumeGuard } from "./guards/resume.guard";
import { ResumeService } from "./resume.service";

@ApiTags("Resume")
@Controller("resume")
export class ResumeController {
  constructor(
    private readonly resumeService: ResumeService,
    private readonly utils: UtilsService,
  ) {}

  @Get("schema")
  getSchema() {
    return this.utils.getCachedOrSet(
      `resume:schema`,
      () => zodToJsonSchema(resumeDataSchema),
      1000 * 60 * 60 * 24, // 24 hours
    );
  }

  @Post()
  @UseGuards(TwoFactorGuard)
  async create(@User() user: UserEntity, @Body() createResumeDto: CreateResumeDto) {
    try {
      return await this.resumeService.create(user.id, createResumeDto);
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError && error.code === "P2002") {
        throw new BadRequestException(ErrorMessage.ResumeSlugAlreadyExists);
      }

      Logger.error(error);
      throw new InternalServerErrorException(error);
    }
  }

  @Post("import")
  @UseGuards(TwoFactorGuard)
  async import(@User() user: UserEntity, @Body() importResumeDto: ImportResumeDto) {
    try {
      return await this.resumeService.import(user.id, importResumeDto);
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError && error.code === "P2002") {
        throw new BadRequestException(ErrorMessage.ResumeSlugAlreadyExists);
      }

      Logger.error(error);
      throw new InternalServerErrorException(error);
    }
  }

  @Get()
  @UseGuards(TwoFactorGuard)
  findAll(@User() user: UserEntity) {
    return this.resumeService.findAll(user.id);
  }

  @Get(":id")
  @UseGuards(TwoFactorGuard, ResumeGuard)
  findOne(@Resume() resume: ResumeDto) {
    return resume;
  }

  @Get(":id/statistics")
  @UseGuards(TwoFactorGuard)
  findOneStatistics(@User("id") userId: string, @Param("id") id: string) {
    return this.resumeService.findOneStatistics(userId, id);
  }

  @Get("/public/:username/:slug")
  @UseGuards(OptionalGuard)
  findOneByUsernameSlug(
    @Param("username") username: string,
    @Param("slug") slug: string,
    @User("id") userId: string,
  ) {
    return this.resumeService.findOneByUsernameSlug(username, slug, userId);
  }

  @Patch(":id")
  @UseGuards(TwoFactorGuard)
  update(
    @User() user: UserEntity,
    @Param("id") id: string,
    @Body() updateResumeDto: UpdateResumeDto,
  ) {
    return this.resumeService.update(user.id, id, updateResumeDto);
  }

  @Patch(":id/lock")
  @UseGuards(TwoFactorGuard)
  lock(@User() user: UserEntity, @Param("id") id: string, @Body("set") set: boolean = true) {
    return this.resumeService.lock(user.id, id, set);
  }

  @Delete(":id")
  @UseGuards(TwoFactorGuard)
  remove(@User() user: UserEntity, @Param("id") id: string) {
    return this.resumeService.remove(user.id, id);
  }

  @Get("/print/:id")
  @UseGuards(OptionalGuard, ResumeGuard)
  async printResume(@User("id") userId: string | undefined, @Resume() resume: ResumeDto) {
    try {
      const url = await this.resumeService.printResume(resume, userId);

      return { url };
    } catch (error) {
      Logger.error(error);
      throw new InternalServerErrorException(error);
    }
  }

  @Get("/print/:id/preview")
  @UseGuards(TwoFactorGuard, ResumeGuard)
  async printPreview(@Resume() resume: ResumeDto) {
    try {
      const url = await this.resumeService.printPreview(resume);

      return { url };
    } catch (error) {
      Logger.error(error);
      throw new InternalServerErrorException(error);
    }
  }
  @Post("upload")
  @UseGuards(TwoFactorGuard) // Assuming you want the upload to be protected by 2FA as well
  @UseInterceptors(
    FileInterceptor("file", {
      fileFilter: (_req, file, callback) => {
        const allowedTypes = [
          "application/pdf",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ];
        if (!allowedTypes.includes(file.mimetype)) {
          return callback(new BadRequestException("Invalid file type"), false);
        }
        callback(null, true);
      },
    }),
  )
  async uploadResume(@UploadedFile() file: Express.Multer.File, @User() user: UserEntity) {
    // Assuming you have a method in your ResumeService to handle the file processing
    try {
      const result = await this.resumeService.processUploadedResume(file, user.id);
      const parser = new ReactiveResumeParser();
      const isValid = parser.validate(result);
      const parsedData = parser.convert(result as ResumeData);
      console.log("Is valid" + JSON.stringify(isValid, null, 2));
      console.log("parsedData" + JSON.stringify(parsedData, null, 2));

      return await this.resumeService.import(user.id, { data: parsedData });
    } catch (error) {
      Logger.error(error);
      throw new InternalServerErrorException("Failed to process resume");
    }
  }
}
