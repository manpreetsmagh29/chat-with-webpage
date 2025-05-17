export async function streamChatResponse({
  pageContent,
  question,
  onChunk,
}: {
  pageContent: string;
  question: string;
  onChunk: (chunk: string) => void;
}): Promise<void> {
  // creating user message to be sent to chat backend
  const messages = [{ role: "user", content: question }];

  // POST request to chat API with page content and user message
  const response = await fetch("http://localhost:3001/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ pageContent, messages }),
  });

  if (!response.body) throw new Error("No response body");

  const reader = response.body.getReader();
  const decoder = new TextDecoder("utf-8");
  let done = false;

  // read chunks from the stream until done
  while (!done) {
    const { value, done: doneReading } = await reader.read();
    done = doneReading;
    const chunk = decoder.decode(value);
    const lines = chunk.split("\n").filter((line) => line.startsWith("data: "));

    for (const line of lines) {
      // clean the data by removing "data:" from each line
      const data = line.replace("data: ", "");
      if (data === "[DONE]") return;
      onChunk(data);
    }
  }
}
