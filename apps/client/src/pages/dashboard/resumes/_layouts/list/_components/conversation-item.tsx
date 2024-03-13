/* eslint-disable lingui/no-unlocalized-strings */
import "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";

import {
  Avatar,
  ChatContainer,
  Conversation,
  ConversationHeader,
  ConversationList,
  EllipsisButton,
  MainContainer,
  Message,
  MessageList,
  Search,
  Sidebar,
  VideoCallButton,
  VoiceCallButton,
} from "@chatscope/chat-ui-kit-react";
import { ChatDto } from "@reactive-resume/dto";
import React, { useEffect, useState } from "react";

import { useChatSessions } from "@/client/services/chat/chats";

// Placeholder avatar import - replace or dynamically assign as needed
import defaultAvatar from "../../../../../../../public/logo/light.svg"; // Ensure you have a default avatar image

export const ConvversationView = () => {
  const { chatSessions } = useChatSessions();
  const [selectedChat, setSelectedChat] = useState<ChatDto | null>(null);

  useEffect(() => {
    if (chatSessions && chatSessions.length > 0) {
      setSelectedChat(chatSessions[0]);
    }
  }, [chatSessions]);

  //const selectedChat = chatSessions?.find((chat) => chat.id === selectedChatId);
  console.log("Selected Chat : ", selectedChat);
  return (
    <MainContainer
      responsive
      style={{
        height: "300px",
      }}
    >
      <Sidebar position="left" scrollable={false}>
        <Search placeholder="Search..." />
        <ConversationList>
          {chatSessions?.map((chat) => (
            <Conversation
              key={chat.id}
              name={`Chat ${chat.id}`} // Assuming no specific name for chats, using ID
              lastSenderName="User" // Placeholder, adjust based on your data
              info={chat.messages[chat.messages.length - 1]?.text}
              onClick={() => setSelectedChat(chat)}
              active={selectedChat?.id === chat.id}
            >
              <Avatar src={defaultAvatar} name="User" status="available" />
            </Conversation>
          ))}
        </ConversationList>
      </Sidebar>

      {selectedChat && (
        <ChatContainer>
          <ConversationHeader>
            <ConversationHeader.Back />
            <Avatar src={defaultAvatar} name="User" />
            <ConversationHeader.Content userName={`Chat ${selectedChat.id}`} info="Active now" />
            <ConversationHeader.Actions>
              <VoiceCallButton />
              <VideoCallButton />
              <EllipsisButton orientation="vertical" />
            </ConversationHeader.Actions>
          </ConversationHeader>
          <MessageList>
            {selectedChat.messages?.map((message) => (
              <Message
                key={message.id}
                model={{
                  message: message.text ? message.text : "",
                  sentTime: new Date(message.createdAt).toLocaleTimeString(),
                  sender: message.senderId ? "User" : "Bot", // Placeholder, adjust based on your data
                  direction: message.senderId ? "outgoing" : "incoming",
                  position: "single",
                }}
              >
                <Avatar src={defaultAvatar} name="User" />
              </Message>
            ))}
          </MessageList>
        </ChatContainer>
      )}
    </MainContainer>
  );
};
