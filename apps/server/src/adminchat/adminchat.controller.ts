import { Controller, Get,Param } from "@nestjs/common";
import { AdminChatsService } from "./adminchat.service";

@Controller("adminchats")
export class AdminChatsController {
  constructor(
    private readonly adminchatsService: AdminChatsService,
  ) {}


  @Get('/sessions/:userId')
  async getSessionsForUser(@Param('userId') userId: string) {
     return await this.adminchatsService.getSessionsForUser(userId);
  }

  @Get('/messages/:chatId')
  async getMessagesForSession(@Param('chatId') chatId: string) {
    return await this.adminchatsService.getMessagesForSession(chatId);
  }

}
