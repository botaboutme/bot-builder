import { idSchema } from "@reactive-resume/schema";
import { createZodDto } from "nestjs-zod/dto";
import { z } from "nestjs-zod/z";

export const chatMessegesSchema = z.object({
  _id: idSchema,
  chat_id: z.string().nullable(),
  sender_id: z.string().nullable(),
  receiver_id: z.string().nullable(),
  text: z.string().nullable(),
  created_at: z.date().nullable(),
});

export class ChatMessegesDto extends createZodDto(chatMessegesSchema) {}
