// src/chat/chat.module.ts
import { Module } from "@nestjs/common";

import { ResumeModule } from "../resume/resume.module";
import { ChatGateway } from "./chat.gateway";
import { ChatService } from "./chat.service";

@Module({
  imports: [ResumeModule], // Import ModuleA to use its exported providers
  providers: [ChatService, ChatGateway],
})
export class ChatModule {}
