import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { RunnableWithMessageHistory } from "@langchain/core/runnables";
import { ChatOpenAI } from "@langchain/openai";
import { RedisChatMessageHistory } from "@langchain/redis";
import { Injectable } from "@nestjs/common";
import { MessageData } from "@reactive-resume/schema";
import { BufferMemory } from "langchain/memory";
import { PrismaService } from "nestjs-prisma";
import { createClient } from "redis";
import { Socket } from "socket.io";

import { ResumeService } from "../resume/resume.service";

function replace_braces(text: string) {
  return text.replace(/{/g, "{{").replace(/}/g, "}}");
}
@Injectable()
export class ChatService {
  constructor(
    private resumeService: ResumeService,
    private prismaService: PrismaService,
  ) {} // Resume Service

  async streamResponse(client: Socket, messageData: MessageData) {
    const parts = messageData.path.split("/").filter((part) => part);
    const username = parts[0];
    const slug = parts[1];
    const resume = await this.resumeService.findOneByUsernameSlug(username, slug);
    // console.log(JSON.stringify(resume, null, 3));
    const model = new ChatOpenAI({
      openAIApiKey: process.env.OPENAI_API_KEY, // Ensure you've set your API key in the environment variables
      //modelName: "gpt-4-0125-preview",
    });
    const systemPromptRaw =
      "You are a helpful bot who talks about the given profile.The profile is given in the following json format \n" +
      JSON.stringify(resume, null, 2) +
      "\n You will only answer based on the data that is given, to best of your knowledge. If there is some data not available you will say you dont know very politely." +
      " \n You Always respond in mark down format";

      this.prismaServive
    const systemPrompt = replace_braces(systemPromptRaw);
    const prompt = ChatPromptTemplate.fromMessages([
      ["system", systemPrompt],
      new MessagesPlaceholder("history"),
      ["human", "{question}"],
    ]);
    console.log(messageData.path);
    const chain = prompt.pipe(model);
    // Default "inputKey", "outputKey", and "memoryKey values would work here
    // but we specify them for clarity.
    const memory = new BufferMemory({
      chatHistory: new RedisChatMessageHistory({
        sessionId: client.id, // Or some other unique identifier for the conversation
        sessionTTL: 300, // 5 minutes, omit this parameter to make sessions never expire
        client: createClient({ url: process.env.REDIS_URL }), // Default value, override with your own instance's URL
      }),
    });

    console.log(await memory.loadMemoryVariables({}));

    /*
      { history: [] }
    */

    const chainWithHistory = new RunnableWithMessageHistory({
      runnable: chain,
      getMessageHistory: (sessionId) =>
        new RedisChatMessageHistory({
          sessionId: sessionId, // Or some other unique identifier for the conversation
          sessionTTL: 300, // 5 minutes, omit this parameter to make sessions never expire
          client: createClient({ url: process.env.REDIS_URL }), // Default value, override with your own instance's URL
        }),
      inputMessagesKey: "question",
      historyMessagesKey: "history",
    });

    // const inputs = {
    //   input: message,
    // };

    try {
      const stream = await chainWithHistory.stream(
        {
          question: messageData.message,
        },
        {
          configurable: {
            sessionId: client.id,
          },
        },
      );

      for await (const chunk of stream) {
        console.log(`${chunk.content}|`); // Optional: for debugging purposes
        client.emit("newChunk", chunk.content); // Stream the chunk content to the client
      }
    } catch (error) {
      console.error("Error streaming response from OpenAI:", error);
      client.emit("error", "Failed to stream response"); // Notify the client about the error
    }
  }
}
