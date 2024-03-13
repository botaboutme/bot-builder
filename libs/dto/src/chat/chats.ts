import { idSchema } from "@reactive-resume/schema";
import { createZodDto } from "nestjs-zod/dto";
import { z } from "nestjs-zod/z";

// Define Zod schema for Message
const messageSchema = z.object({
  id: idSchema,
  chatId: idSchema.nullable(), // Assuming chatId can be nullable, adjust as needed
  senderId: idSchema.nullable(), // Assuming senderId can be nullable, adjust as needed
  text: z.string().nullable(), // Assuming text can be nullable, adjust as needed
  createdAt: z.date().nullable(), // Assuming createdAt can be nullable, adjust as needed
});

// Define Zod schema for Chat without including the Resume details
const chatSchema = z.object({
  id: idSchema,
  sessionId: z.string(),
  resumeId: idSchema, // Link to the resume, kept here for reference to the schema
  createdAt: z.date(),
  lastMessageAt: z.date(),
  messages: z.array(messageSchema).optional(), // Including messages is optional; adjust as necessary
});

// Extend schemas into DTOs using createZodDto
export class ChatMessageDto extends createZodDto(messageSchema) {}
export class ChatDto extends createZodDto(chatSchema) {}
