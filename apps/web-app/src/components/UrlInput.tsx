import { useState } from "react";
import { fetchPageContent } from "../utils/fetchPageContent";

interface UrlInputProps {
  onContentFetched: (url: string, content: string) => void;
}

const UrlInput = ({ onContentFetched }: UrlInputProps) => {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);

  // fetch content for the entered URL
  const handleLoad = async () => {
    if (!url) return;

    // Set loading to true to disable button
    setLoading(true);
    try {
      const content = await fetchPageContent(url);
      onContentFetched(url, content);
    } catch {
      alert("Failed to fetch page content");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2 mb-4">
      <input
        type="text"
        placeholder="Enter URL (e.g. https://example.com)"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        className="w-full border p-2 rounded"
      />
      <button
        onClick={handleLoad}
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        {loading ? "Loading..." : "Load Page"}
      </button>
    </div>
  );
};

export default UrlInput;
