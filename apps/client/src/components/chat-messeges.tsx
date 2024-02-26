import React from "react";

// ChatMessages component
const ChatMessages = ({ messages, isCurrentUser }) => {
  return (
    <div className="chat-messages">
      {messages.map((message) => (
        <div
          key={message._id}
          className={`chat-bubble max-w-3/4 mx-2 my-1 p-2 rounded-lg text-white ${message.sender_id == "anonymous" ? "bg-blue-500 ml-auto anonymous-user" : "bg-gray-300 text-gray-800 other-user"}`}
        >
          <p>{message.text}</p>
        </div>
      ))}
    </div>
  );
};

export default ChatMessages;
