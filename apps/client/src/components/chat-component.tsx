/* eslint-disable lingui/no-unlocalized-strings */
import { marked } from "marked";
import React, { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import io, { Socket } from "socket.io-client";

const ChatComponent: React.FC = () => {
  const [chatVisible, setChatVisible] = useState<boolean>(true); // Chat is visible by default
  const [isExpanded, setIsExpanded] = useState<boolean>(true); // Track if the chat is expanded
  const [message, setMessage] = useState<string>("");
  const [messages, setMessages] = useState<
    Array<{
      id: number;
      text: string;
      sender: "user" | "server";
      complete: boolean;
    }>
  >([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  useEffect(() => {
    const newSocket = io();
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
      newSocket.disconnect();
    };
  }, [location.pathname]); // Added dependency to ensure the effect is correctly applied on path change

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") sendMessage();
  };

  return (
    <div>
      {chatVisible && (
        <div
          className={`fixed bottom-20 right-5 z-50 w-80 rounded-lg bg-background shadow-lg ${isExpanded ? "p-4" : "p-2"} border border-border`}
        >
          <div className="flex items-center justify-between">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-foreground focus:outline-none"
            >
              {isExpanded ? "−" : "□"}
            </button>
            <button onClick={() => setChatVisible(false)} className="text-error focus:outline-none">
              ×
            </button>
          </div>
          {isExpanded && (
            <>
              <div className="mb-4 h-60 space-y-2 overflow-y-auto p-2">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`break-words rounded-lg p-2 ${msg.sender === "user" ? "ml-auto bg-secondary text-secondary-foreground" : "bg-foreground text-background"}`}
                    dangerouslySetInnerHTML={{
                      __html: msg.sender === "server" ? marked.parse(msg.text) : msg.text,
                    }}
                  />
                ))}
                <div ref={messagesEndRef} />
              </div>
              <input
                type="text"
                className="w-full rounded border bg-background px-3 py-2 leading-tight text-foreground focus:outline-none focus:ring-2 focus:ring-primary-accent"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <button
                onClick={sendMessage}
                className="mt-2 w-full rounded bg-primary px-4 py-2 text-primary-foreground hover:bg-primary-accent focus:outline-none"
              >
                Send
              </button>
            </>
          )}
        </div>
      )}
      {!chatVisible && (
        <button
          className="fixed bottom-20 right-5 z-50 rounded-full bg-primary px-4 py-2 text-primary-foreground hover:bg-primary-accent focus:outline-none"
          onClick={() => setChatVisible(true)}
        >
          Chat
        </button>
      )}
    </div>
  );
};

export default ChatComponent;
