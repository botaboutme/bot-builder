import { idSchema } from "@reactive-resume/schema";
import { createZodDto } from "nestjs-zod/dto";
import { z } from "nestjs-zod/z";

export const chatMessegesSchema = z.object({
  _id: idSchema,
  userId: z.string().nullable(),
  participants: z.array(z.string()).default([]),
  created_at: z.date().nullable(),
  last_message_at: z.date().nullable(),
  last_message_preview:z.string().nullable(),
});

export class ChatMessegesDto extends createZodDto(chatMessegesSchema) {}
