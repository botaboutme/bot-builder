import { idSchema } from "@reactive-resume/schema";
import { createZodDto } from "nestjs-zod/dto";
import { z } from "nestjs-zod/z";

export const chatsSchema = z.object({
  id: idSchema,
  resumeId: z.string().nullable(),
  created_at: z.date().nullable(),
  last_message_at: z.date().nullable(),  
});

export class ChatsDto extends createZodDto(chatsSchema) {}
