import { useState, useEffect, useRef } from "react";
import UrlInput from "./components/UrlInput";
import ChatWindow, { type Message } from "./components/ChatWindow";
import ChatInput from "./components/ChatInput";
import "./index.css";

// This is dummy response for now
const dummyResponse = async (
  question: string,
  onUpdate: (partial: string) => void
) => {
  const reply = `Reply to: "${question}"`;
  for (let i = 0; i < reply.length; i++) {
    await new Promise((r) => setTimeout(r, 30));
    onUpdate(reply.slice(0, i + 1));
  }
};

const App = () => {
  const [pageContent, setPageContent] = useState<string | null>(null);
  const [url, setUrl] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);

  const chatWindowRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    chatWindowRef.current?.scrollTo({
      top: chatWindowRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  const handleContentFetched = (url: string, content: string) => {
    setUrl(url);
    setPageContent(content);
    setMessages([]);
  };

  const handleSend = async (question: string) => {
    if (!pageContent) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      text: question,
      sender: "user",
    };
    setMessages((prev) => [...prev, userMsg]);

    const assistantId = Date.now().toString() + "-assistant";
    setMessages((prev) => [
      ...prev,
      { id: assistantId, text: "", sender: "assistant" },
    ]);
    setIsStreaming(true);

    await dummyResponse(question, (partial) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantId ? { ...msg, text: partial } : msg
        )
      );
    });

    setIsStreaming(false);
  };

  return (
    <div className="h-screen flex flex-col max-w-3xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-4">Chat with Webpage</h1>

      <UrlInput onContentFetched={handleContentFetched} />

      {pageContent && (
        <>
          <div className="mt-6 p-4 bg-gray-100 rounded whitespace-pre-wrap h-[200px] overflow-auto">
            {url && (
              <p className="text-sm text-gray-500 mb-2">Loaded from: {url}</p>
            )}
            <h2 className="text-lg font-semibold mb-2">Extracted Content:</h2>
            {pageContent}
          </div>

          <div
            ref={chatWindowRef}
            className="mt-6 flex-grow flex flex-col"
            style={{ minHeight: 300 }}
          >
            <ChatWindow messages={messages} />
          </div>

          <ChatInput onSend={handleSend} disabled={isStreaming} />
        </>
      )}
    </div>
  );
};

export default App;
