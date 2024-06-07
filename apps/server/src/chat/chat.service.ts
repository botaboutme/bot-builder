import { RedisChatMessageHistory } from "@langchain/community/stores/message/ioredis";
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { RunnableWithMessageHistory } from "@langchain/core/runnables";
import { ChatMistralAI } from "@langchain/mistralai";
import { Injectable } from "@nestjs/common";
import { ChatDto } from "@reactive-resume/dto";
import { MessageData } from "@reactive-resume/schema";
import { PrismaService } from "nestjs-prisma";
import { Socket } from "socket.io";

import { ResumeService } from "../resume/resume.service";

function replace_braces(text: string) {
  return text.replace(/{/g, "{{").replace(/}/g, "}}");
}

@Injectable()
export class ChatService {
  constructor(
    private resumeService: ResumeService, // Resume Service
    private readonly prisma: PrismaService,
  ) {}

  async streamResponse(client: Socket, messageData: MessageData) {
    const parts = messageData.path.split("/").filter((part) => part);
    const username = parts[0];
    const slug = parts[1];
    const resume = await this.resumeService.findOneByUsernameSlug(username, slug);

    //create chat session in db
    const chatSession = await this.prisma.chat.upsert({
      where: {
        sessionId: client.id.toString(),
      },
      update: {
        lastMessageAt: new Date().toISOString(),
      },
      create: {
        resumeId: resume.id,
        sessionId: client.id,
        createdAt: new Date().toISOString(),
        lastMessageAt: new Date().toISOString(),
      },
    });

    // const model = new ChatOpenAI({
    //   openAIApiKey: process.env.OPENAI_API_KEY, // Ensure you've set your API key in the environment variables
    //   modelName: "gpt-4-0125-preview",
    // });
    const model = new ChatMistralAI({
      apiKey: process.env.MISTRAL_API_KEY,
      modelName: "mistral-large-latest",
    });
    const systemPromptRaw =
      "You are a helpful bot who talks about the given profile.The profile is given in the following json format \n" +
      JSON.stringify(resume, null, 2) +
      "\n You will only answer based on the data that is given, to best of your knowledge. If there is some data not available you will say you dont know very politely." +
      " \n You Always respond in mark down format";

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
    // const memory = new BufferMemory({
    //   chatHistory: new RedisChatMessageHistory({
    //     sessionId: client.id, // Or some other unique identifier for the conversation
    //     sessionTTL: 300, // 5 minutes, omit this parameter to make sessions never expire
    //     client: createClient({ url: process.env.REDIS_URL }), // Default value, override with your own instance's URL
    //   }),
    // });

    // console.log(await memory.loadMemoryVariables({}));

    const chainWithHistory = new RunnableWithMessageHistory({
      runnable: chain,
      getMessageHistory: (sessionId) =>
        new RedisChatMessageHistory({
          sessionId: sessionId, // Or some other unique identifier for the conversation
          sessionTTL: 300, // 5 minutes, omit this parameter to make sessions never expire
          url: process.env.REDIS_URL, // Default value, override with your own instance's URL
        }),
      inputMessagesKey: "question",
      historyMessagesKey: "history",
    });

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

      //write user question to database
      await this.prisma.message.create({
        data: {
          chatId: chatSession.id,
          text: messageData.message,
          createdAt: new Date().toISOString(),
        },
      });

      //write response to database
      let msg = "";
      for await (const chunk of stream) {
        console.log(`${chunk.content}|`); // Optional: for debugging purposes
        client.emit("newChunk", chunk.content); // Stream the chunk content to the client

        msg += chunk.content;
        if (chunk.content === "" && msg != "") {
          await this.prisma.message.create({
            data: {
              chatId: chatSession.id,
              text: msg,
              createdAt: new Date().toISOString(),
              senderId: resume.id,
            },
          });

          //reset the message
          msg = "";
        }
      }
    } catch (error) {
      console.error("Error streaming response from OpenAI:", error);
      client.emit("error", "Failed to stream response"); // Notify the client about the error
    }
  }

  // // Mock data for demonstration
  // private mockSessions = [
  //   {
  //     _id: "chat456",
  //     userId: "user456",
  //     participants: ["user456", "anonymous"],
  //     created_at: "2024-02-25T16:00:00Z",
  //     last_message_at: "2024-02-26T12:05:00Z",
  //     last_message_preview: "Hey, how are you doingxxx?",
  //   },
  //   {
  //     _id: "chat123",
  //     userId: "user123",
  //     participants: ["user123", "anonymous"],
  //     created_at: "2024-02-26T16:00:00Z",
  //     last_message_at: "2024-02-26T12:05:00Z",
  //     last_message_preview: "Does he have skills on Chat?",
  //   },
  //   {
  //     _id: "chat789",
  //     userId: "user789",
  //     participants: ["user789", "anonymous"],
  //     created_at: "2024-02-26T16:00:00Z",
  //     last_message_at: "2024-02-26T12:05:00Z",
  //     last_message_preview: "What languageus does he speak?",
  //   },
  // ];

  // private mockMessages = [
  //   {
  //     _id: "message1",
  //     chat_id: "chat456",
  //     sender_id: "anonymous",
  //     text: "Hey, how are you doing?",
  //     created_at: "2024-02-26T12:05:00Z",
  //     read_by: ["user456"],
  //     attachments: [],
  //   },
  //   // Add more message objects as needed
  // ];

  // // Method to retrieve sessions for a user
  // async getSessionsForUser(userId: string) {
  //   try {
  //     return this.mockSessions.filter((session) => session.userId === userId);
  //   } catch (error) {
  //     return [];
  //   }
  // }

  // // Method to retrieve messages for a session
  // async getMessagesForSession(chatId: string) {
  //   try {
  //     return this.mockMessages.filter((message) => message.chat_id === chatId);
  //   } catch (error) {
  //     return [];
  //   }
  // }

  async getAllChatsForUser(userId: string): Promise<ChatDto[]> {
    try {
      const chats = await this.prisma.chat.findMany({
        where: {
          resume: {
            userId: userId,
          },
        },
        include: {
          messages: true,
        },
      });

      // Transform and validate each chat against the ChatDto schema
      // This step assumes ChatDto is compatible with Zod's parse method
      const chatDtos = chats.map((chat: ChatDto) =>
        ChatDto.schema.parse({
          ...chat,
          messages: chat.messages
            ? chat.messages.map((message) => ({
                id: message.id,
                chatId: message.chatId,
                senderId: message.senderId,
                text: message.text,
                createdAt: message.createdAt,
              }))
            : undefined,
        }),
      );

      return chatDtos;
    } catch (error) {
      console.error("Error fetching chats for user:", error);
      throw error;
    }
  }
}
