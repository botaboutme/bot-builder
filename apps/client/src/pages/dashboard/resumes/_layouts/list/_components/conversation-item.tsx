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
import { t } from "@lingui/macro";
import { ChatDto } from "@reactive-resume/dto";
import React, { useEffect, useState } from "react";

import { useChatSessions } from "@/client/services/chat/chats";

import defaultAvatar from "../../../../../../../public/logo/light.svg";

export const ConvversationView = () => {
  const { chatSessions } = useChatSessions();
  const [selectedChat, setSelectedChat] = useState<ChatDto | null>(null);

  useEffect(() => {
    if (chatSessions && chatSessions.length > 0) {
      setSelectedChat(chatSessions[0]);
    }
  }, [chatSessions]);

  return (
    <MainContainer
      responsive
      style={{
        height: "300px",
      }}
    >
      <Sidebar position="left" scrollable={false}>
        <Search placeholder={t`Search...`} />
        <ConversationList>
          {chatSessions?.map((chat) => (
            <Conversation
              key={chat.id}
              name={t`Chat`}
              lastSenderName={t`User`}
              info={
                chat.messages && chat.messages.length > 0
                  ? chat.messages[chat.messages.length - 1].text
                  : ""
              }
              onClick={() => setSelectedChat(chat)}
              active={selectedChat?.id === chat.id}
            >
              <Avatar src={defaultAvatar} name={t`User`} status="available" />
            </Conversation>
          ))}
        </ConversationList>
      </Sidebar>

      {selectedChat && (
        <ChatContainer>
          <ConversationHeader>
            <ConversationHeader.Back />
            <Avatar src={defaultAvatar} name={t`User`} />
            <ConversationHeader.Content userName={t`Chat`} info={t`Active now`} />
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
                  message: message.text || "",
                  sentTime: message.createdAt
                    ? new Date(message.createdAt).toLocaleTimeString()
                    : "",
                  // eslint-disable-next-line lingui/no-unlocalized-strings
                  sender: message.senderId ? "User" : "Bot",
                  direction: message.senderId ? "outgoing" : "incoming",
                  position: "single",
                }}
              >
                <Avatar src={defaultAvatar} name={t`User`} />
              </Message>
            ))}
          </MessageList>
        </ChatContainer>
      )}
    </MainContainer>
  );
};