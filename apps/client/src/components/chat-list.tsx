import React from "react";

// Define an interface for the chat session objects
interface ChatSession {
  _id: string;
  last_message_at: string; // Assuming this is a string representation of a date
  last_message_preview: string;
}

// Define an interface for the component props
interface ChatListProps {
  sessions: ChatSession[];
  onSelectChat: (chatId: string) => void; // Assuming onSelectChat expects a chat ID as a parameter
}

const ChatList: React.FC<ChatListProps> = ({ sessions, onSelectChat }) => {
  return (
    <div className="h-full overflow-auto">
      {sessions.map((chat) => (
        <div
          key={chat._id}
          className="flex cursor-pointer flex-col border-b border-gray-300 p-4 hover:bg-gray-100"
          onClick={() => onSelectChat(chat._id)}
        >
          <div className="flex justify-between">
            <span className="text-sm text-zinc-500">
              {new Date(chat.last_message_at).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
          <p className="mt-1 truncate text-red-600">{chat.last_message_preview}</p>
        </div>
      ))}
    </div>
  );
};

export default ChatList;
