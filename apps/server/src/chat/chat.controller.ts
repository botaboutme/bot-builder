import { Controller, Get,Param } from "@nestjs/common";
import { ChatService } from "./chat.service";

@Controller("chat")
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
  ) {}


  @Get('/sessions/:userId')
  async getSessionsForUser(@Param('userId') userId: string) {
     return await this.chatService.getSessionsForUser(userId);
  }

  @Get('/messages/:chatId')
  async getMessagesForSession(@Param('chatId') chatId: string) {
    return await this.chatService.getMessagesForSession(chatId);
  }

}
