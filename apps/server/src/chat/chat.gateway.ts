// src/chat/chat.gateway.ts
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import { MessageData } from "@reactive-resume/schema";
import { Server, Socket } from "socket.io";

import { ChatService } from "./chat.service";

@WebSocketGateway({
  cors: {
    origin: "*", // Be sure to restrict this in production
  },
})
export class ChatGateway {
  @WebSocketServer()
  server: Server;

  constructor(private chatService: ChatService) {}

  @SubscribeMessage("sendMessage")
  handleMessage(@ConnectedSocket() client: Socket, @MessageBody() messageData: MessageData): void {
    console.log(`Received message: ${messageData}`);
    this.chatService.streamResponse(client, messageData);
  }
}
