/* eslint-disable lingui/no-unlocalized-strings */
//import "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
import "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
import "./ChatComponent.css";

import {
  Avatar,
  ChatContainer,
  MainContainer,
  Message as CSMessage,
  MessageInput,
  MessageList,
} from "@chatscope/chat-ui-kit-react";
import { marked } from "marked";
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import io, { Socket } from "socket.io-client";

import userIcon from "../../public/icon/dark.svg";
import botIcon from "../../public/icon/light.svg";

interface ChatMessage {
  id: number;
  text: string;
  sender: "user" | "server";
  complete: boolean;
}

const ChatComponent: React.FC = () => {
  const [message, setMessage] = useState<string>("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  const location = useLocation();

  useEffect(() => {
    const newSocket = io("ws://localhost:3000");
    setSocket(newSocket);

    newSocket.on("newChunk", (chunk: string) => {
      setMessages((msgs) => {
        if (chunk === "") return msgs;
        const lastMsg = msgs[msgs.length - 1];
        if (lastMsg && lastMsg.sender === "server" && !lastMsg.complete) {
          return [
            ...msgs.slice(0, -1),
            { ...lastMsg, text: lastMsg.text + chunk, complete: chunk.endsWith("\n") },
          ];
        } else {
          return [
            ...msgs,
            { id: Date.now(), text: chunk, sender: "server", complete: chunk.endsWith("\n") },
          ];
        }
      });
    });

    return () => {
      if (newSocket) newSocket.disconnect();
    };
  }, [location.pathname]);

  const sendMessage = () => {
    if (message.trim() !== "" && socket) {
      const pagePath = location.pathname;
      socket.emit("sendMessage", { message, path: pagePath });
      setMessages((msgs) => [
        ...msgs,
        { id: Date.now(), text: message, sender: "user", complete: true },
      ]);
      setMessage("");
    }
  };

  return (
    <MainContainer>
      <ChatContainer>
        <MessageList>
          {messages.map((msg) => (
            <CSMessage
              key={msg.id}
              model={{
                message: msg.sender === "server" ? (marked.parse(msg.text) as string) : msg.text,
                direction: msg.sender === "user" ? "outgoing" : "incoming",
                position: "single",
              }}
            >
              <Avatar
                src={msg.sender === "user" ? botIcon : userIcon}
                name={msg.sender === "user" ? "User" : "Bot"}
              />
            </CSMessage>
          ))}
        </MessageList>
        <MessageInput
          placeholder="Type message here..."
          value={message}
          onChange={(val) => setMessage(val)}
          onSend={() => sendMessage()}
        />
      </ChatContainer>
    </MainContainer>
  );
};

export default ChatComponent;
