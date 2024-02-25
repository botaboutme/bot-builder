import { HttpService } from "@nestjs/axios";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Config } from "../config/schema";

@Injectable()
export class AdminChatsService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService<Config>,
  ) {}

  // Mock data for demonstration
  private mockSessions = [
    {
      _id: "chat456",
      userId: "user456",
      participants: ["user456", "anonymous"],
      created_at: "2024-02-25T16:00:00Z",
      last_message_at: "2024-02-26T12:05:00Z",
      last_message_preview: "Hey, how are you doingxxx?",
    },
    {
      _id: "chat123",
      userId: "user123",
      participants: ["user123", "anonymous"],
      created_at: "2024-02-26T16:00:00Z",
      last_message_at: "2024-02-26T12:05:00Z",
      last_message_preview: "Does he have skills on Chat?",
    },
    {
      _id: "chat789",
      userId: "user789",
      participants: ["user789", "anonymous"],
      created_at: "2024-02-26T16:00:00Z",
      last_message_at: "2024-02-26T12:05:00Z",
      last_message_preview: "What languageus does he speak?",
    },
  ];

  private mockMessages = [
    {
      _id: "message1",
      chat_id: "chat456",
      sender_id: "anonymous",
      text: "Hey, how are you doing?",
      created_at: "2024-02-26T12:05:00Z",
      read_by: ["user456"],
      attachments: [],
    },
    // Add more message objects as needed
  ];

  // Method to retrieve sessions for a user
  async getSessionsForUser(userId: string) {
    try {
    return this.mockSessions.filter(session => session.userId === userId);
    } catch (error) {
      return [];
    }
  }

  // Method to retrieve messages for a session
  async getMessagesForSession(chatId: string) {
    try {
      return this.mockMessages.filter(message => message.chat_id === chatId);
      } catch (error) {
        return [];
    }    
  }
}
