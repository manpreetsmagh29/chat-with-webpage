export type Message = {
  id: string;
  sender: "user" | "bot";
  text: string;
};

interface ChatWindowProps {
  messages: Message[];
}

const ChatWindow = ({ messages }: ChatWindowProps) => {
  return (
    <div className="flex flex-col space-y-2 p-4 bg-gray-50 rounded-md overflow-y-auto">
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={`p-3 rounded-lg max-w-[70%] break-words whitespace-pre-wrap ${
            msg.sender === "user"
              ? "bg-blue-600 text-white self-end"
              : "bg-gray-200 text-gray-900 self-start"
          }`}
        >
          {msg.text}
        </div>
      ))}
    </div>
  );
};

export default ChatWindow;
