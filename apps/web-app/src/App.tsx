import { useState, useEffect, useRef } from "react";
import UrlInput from "./components/UrlInput";
import ChatWindow, { type Message } from "./components/ChatWindow";
import ChatInput from "./components/ChatInput";
import "./index.css";
import { streamChatResponse } from "./utils/streamChatResponse";

const App = () => {
  const [pageContent, setPageContent] = useState<string | null>(null);
  const [url, setUrl] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([]);

  const chatWindowRef = useRef<HTMLDivElement | null>(null);

  // Scroll chat window to bottom whenever messages change
  useEffect(() => {
    chatWindowRef.current?.scrollTo({
      top: chatWindowRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  // called after page content is fetched
  const handleContentFetched = (url: string, content: string) => {
    setUrl(url);
    setPageContent(content);
    setMessages([]);
    setSuggestedQuestions([]);
    fetchSuggestedQuestions(content);
  };

  // Fetches suggested questions based on the given page content
  const fetchSuggestedQuestions = async (content: string) => {
    try {
      const response = await fetch("http://localhost:3001/suggest-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pageContent: content }),
      });

      const data = await response.json();
      if (data.questions) {
        setSuggestedQuestions(data.questions);
      }
    } catch (error) {
      console.error("Error fetching suggested questions:", error);
    }
  };

  // Handler for sending a question to the chatbot
  const handleSend = async (question: string) => {
    const id = Date.now().toString();
    setMessages((prev) => [...prev, { id, sender: "user", text: question }]);
    setIsStreaming(true);

    let answer = "";
    setMessages((prev) => [
      ...prev,
      { id: id + "-bot", sender: "bot", text: "" },
    ]);

    // Stream chat response from backend, updating bot message with incoming chunks
    await streamChatResponse({
      question,
      pageContent: pageContent!,
      onChunk: (chunk) => {
        answer += chunk;
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === id + "-bot" ? { ...msg, text: answer } : msg
          )
        );
      },
    });

    setIsStreaming(false);
  };

  return (
    <div className="h-screen flex flex-col max-w-3xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-4">Chat with Webpage</h1>

      <UrlInput onContentFetched={handleContentFetched} />

      {pageContent && (
        <>
          <div className="mt-6 p-4 bg-gray-100 rounded">
            {url && (
              <p className="text-sm text-gray-600 font-medium">
                Webpage URL: <span className="text-blue-600">{url}</span>
              </p>
            )}
          </div>

          {suggestedQuestions.length > 0 && (
            <div className="mt-4 p-4 bg-blue-50 rounded">
              <h3 className="font-semibold mb-2">Suggested Questions:</h3>
              <ul className="list-disc list-inside space-y-1">
                {suggestedQuestions.map((q, i) => (
                  <li
                    key={i}
                    className="cursor-pointer text-blue-700 hover:underline"
                    onClick={() => handleSend(q)}
                  >
                    {q}
                  </li>
                ))}
              </ul>
            </div>
          )}

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
