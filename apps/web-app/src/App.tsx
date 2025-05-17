import { useState } from "react";
import UrlInput from "./components/UrlInput";
import "./index.css";

const App = () => {
  const [pageContent, setPageContent] = useState<string | null>(null);
  const [url, setUrl] = useState<string | null>(null);

  const handleContentFetched = (url: string, content: string) => {
    setUrl(url);
    setPageContent(content);
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Chat with Webpage</h1>
      <UrlInput onContentFetched={handleContentFetched} />
      {pageContent && (
        <div className="mt-6 p-4 bg-gray-100 rounded whitespace-pre-wrap h-[300px] overflow-auto">
          {url && (
            <p className="text-sm text-gray-500 mb-2">Loaded from: {url}</p>
          )}
          <h2 className="text-lg font-semibold mb-2">Extracted Content:</h2>
          {pageContent}
        </div>
      )}
    </div>
  );
};

export default App;
