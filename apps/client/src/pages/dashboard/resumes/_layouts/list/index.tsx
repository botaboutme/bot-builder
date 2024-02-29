import { useState } from "react";
import { sortByDate } from "@reactive-resume/utils";
import { AnimatePresence, motion } from "framer-motion";

import { useResumes } from "@/client/services/resume";
import { useChatSessions } from "@/client/services/chat";

import { BaseListItem } from "./_components/base-item";
import { CreateResumeListItem } from "./_components/create-item";
import { ImportResumeListItem } from "./_components/import-item";
import { ResumeListItem } from "./_components/resume-item";
import ChatList from "@/client/components/chat-list";
import ChatMessages from "@/client/components/chat-messeges";
import { axios } from "@/client/libs/axios";
import { ChatsDto } from "@reactive-resume/dto";
import { useQuery } from "@tanstack/react-query";
import { log } from "console";

const StatisticsCard = ({ title, value }) => (
  <div className="p-4 shadow rounded-lg flex justify-between items-center bg-white">
    <h5 className="text-md font-bold">{title}</h5>
    <p className="text-xl">{value}</p>
  </div>
);

const ChatSummaryList = ({ summaries }) => (
  <div className="shadow rounded-lg p-2 pl-1 bg-white">
    {summaries.map((summary, index) => (
      <div key={index} className="border-b py-2">
        {summary}
      </div>
    ))}
  </div>
);

export const ListView = () => {
  const { resumes, loading } = useResumes();
  const { chatSessions } = useChatSessions("user456");

  console.log("test", chatSessions);
  // Mock data for demonstration
  const mockSessions = [
    {
      _id: "chat456",
      userId: "user456",
      participants: ["user456", "anonymous"],
      created_at: "2024-02-25T16:00:00Z",
      last_message_at: "2024-02-26T12:05:00Z",
      last_message_preview: "Hey, how are you doing?",
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

  const mockMessages = [
    {
      _id: "message1",
      chat_id: "chat456",
      sender_id: "anonymous",
      text: "Hey, how are you doing?",
      created_at: "2024-02-26T12:05:00Z",
      read_by: ["user456"],
      attachments: [],
    },
    {
      _id: "message2",
      chat_id: "chat456",
      sender_id: "bot",
      text: "I am doing great. How can I help you?",
      created_at: "2024-02-26T12:05:01Z",
      read_by: ["user456"],
      attachments: [],
    },
    {
      _id: "message3",
      chat_id: "chat456",
      sender_id: "anonymous",
      text: "What skills does this resume have?",
      created_at: "2024-02-26T12:06:00Z",
      read_by: ["user456"],
      attachments: [],
    },
    // Add more message objects as needed
  ];

  const [selectedChatId, setSelectedChatId] = useState(null);
  //const [chatSessionsData] = useState(mockSessions); // Assuming mockChats is defined
  const [chatSessionsData] = useState(chatSessions);
  const [chatMessages] = useState(mockMessages); // Assuming mockMessages is defined

  const onSelectChat = (chatId) => {
    setSelectedChatId(chatId);
  };

  return (
    <div className="">
      {/* First Row */}
      <h2 className="text-lg font-semibold mb-4">Profile Statistics</h2>
      <div className="grid grid-cols-2 gap-4 mb-8">
        {/* Profile Statistics Section */}
        <div className="grid grid-cols-2 ">
          <div>
            <StatisticsCard title="Resume Views" value="100" />
          </div>
          <div>
            <StatisticsCard title="Bot Chats" value="500" />
          </div>
        </div>

        {/* Buttons Section */}
        <div className="flex flex-col space-y-2">
          {/* Existing ListView Content */}
          <motion.div initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }}>
            <CreateResumeListItem />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0, transition: { delay: 0.1 } }}
          >
            <ImportResumeListItem />
          </motion.div>
        </div>
      </div>
      {/* Second Row */}
      <div className="grid gap-2">
        {/* Resumes Section */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Resumes</h2>
          {resumes && (
            <AnimatePresence>
              {resumes
                .sort((a, b) => sortByDate(a, b, "updatedAt"))
                .map((resume, index) => (
                  <motion.div
                    key={resume.id}
                    initial={{ opacity: 0, y: -50 }}
                    animate={{ opacity: 1, y: 0, transition: { delay: (index + 2) * 0.1 } }}
                    exit={{ opacity: 0, filter: "blur(8px)", transition: { duration: 0.5 } }}
                  >
                    <ResumeListItem resume={resume} />
                  </motion.div>
                ))}
            </AnimatePresence>
          )}
        </div>
      </div>

      {loading &&
        [...Array(1)].map((_, i) => (
          <div
            key={i}
            className="duration-300 animate-in fade-in"
            style={{ animationFillMode: "backwards", animationDelay: `${i * 300}ms` }}
          >
            "Loading"
          </div>
        ))}

      {chatSessions && (
        <div className="grid gap-2 pt-8">
          {/* {chatSessions.map((chat, index) => (
            <div>{chat.last_message_preview} - abcd</div>
          ))} */}
          {/* Chat Bots Section */}
          <h2 className="text-lg font-semibold mb-4">Bot Chats</h2>
          <div className="flex">
            <div className="chat-list-panel w-1/3 bg-gray-100 overflow-y-auto min-h-screen">
              <ChatList sessions={chatSessions} onSelectChat={onSelectChat} />
            </div>
            <div className="chat-messages-panel w-2/3 flex flex-col bg-white overflow-y-auto min-h-screen p-2">
              {selectedChatId && (
                // Assuming you have a ChatMessages component to display the messages
                <ChatMessages
                  key={selectedChatId}
                  messages={chatMessages.filter((message) => message.chat_id === selectedChatId)}
                  isCurrentUser={true}
                />
              )}
            </div>
          </div>
        </div>
      )}

      {chatSessionsData && (
        <AnimatePresence>
          {chatSessionsData.map((chat, index) => (
            <motion.div
              layout
              key={chat.id}
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0, transition: { delay: (index + 2) * 0.1 } }}
              exit={{ opacity: 0, filter: "blur(8px)", transition: { duration: 0.5 } }}
            >
              test
            </motion.div>
          ))}
        </AnimatePresence>
      )}
    </div>
  );
};
