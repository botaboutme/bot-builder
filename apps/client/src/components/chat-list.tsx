import React from "react";

// ChatList component updated with TailwindCSS classes
const ChatList = ({ sessions, onSelectChat }) => {
  return (
    <div className="bg-white-200 h-full overflow-auto">
      {sessions.map((chat) => (
        <div
          key={chat._id}
          className="flex flex-col p-4 border-b border-gray-300 cursor-pointer hover:bg-gray-100"
          onClick={() => onSelectChat(chat._id)}
        >
          <div className="flex justify-between">
            {/* Assuming you'll replace "your_user_id" with the actual user's ID */}
            <span className="text-sm text-zinc-500">
              {new Date(chat.last_message_at).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
          <p className="text-red-600 mt-1 truncate">{chat.last_message_preview}</p>
        </div>
      ))}
    </div>
  );
};

export default ChatList;
