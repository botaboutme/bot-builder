import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";

import { AdminChatsController } from "./adminchat.controller";
import { AdminChatsService } from "./adminchat.service";

@Module({
  imports: [HttpModule],
  controllers: [AdminChatsController],
  providers: [AdminChatsService],
})
export class AdminChatsModule {}
