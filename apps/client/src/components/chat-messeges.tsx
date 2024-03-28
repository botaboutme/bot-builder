import React from "react";

// Define an interface for the message objects
interface Message {
  _id: string;
  sender_id: string;
  text: string;
}

// Define an interface for the component props
interface ChatMessagesProps {
  messages: Message[];
  isCurrentUser: (userId: string) => boolean; // Assuming isCurrentUser is a function that checks if the user is the current user based on their ID
}

const ChatMessages: React.FC<ChatMessagesProps> = ({ messages, isCurrentUser }) => {
  return (
    <div className="chat-messages">
      {messages.map((message) => (
        <div
          key={message._id}
          className={`chat-bubble max-w-3/4 mx-2 my-1 rounded-lg p-2 text-white ${
            isCurrentUser(message.sender_id)
              ? "ml-auto bg-blue-500"
              : "other-user bg-gray-300 text-gray-800"
          }`}
        >
          <p>{message.text}</p>
        </div>
      ))}
    </div>
  );
};

export default ChatMessages;
