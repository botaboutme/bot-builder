import { Controller, Get, Param, UseGuards } from "@nestjs/common";
import { User as UserEntity } from "@prisma/client";

import { User } from "@/server/user/decorators/user.decorator";

import { TwoFactorGuard } from "../auth/guards/two-factor.guard";
import { ChatService } from "./chat.service";

@Controller("chat")
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get("/sessions/:userId")
  async getSessionsForUser(@Param("userId") userId: string) {
    return await this.chatService.getSessionsForUser(userId);
  }

  @Get("/messages/:chatId")
  async getMessagesForSession(@Param("chatId") chatId: string) {
    return await this.chatService.getMessagesForSession(chatId);
  }
  @Get("/chats")
  @UseGuards(TwoFactorGuard)
  getAllChatsForUser(@User() user: UserEntity) {
    return this.chatService.getAllChatsForUser(user.id);
  }
}
