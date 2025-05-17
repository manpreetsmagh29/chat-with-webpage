// Listen for messages sent
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "extract_content") {
    let content = "";

    try {
      // Try to extract the text content from the current page's body
      content = document.body.innerText || "";
      // Limit content length to 5000 characters to ensure performance and compatibility with LLM input size constraints
      if (content.length > 5000) {
        content = content.slice(0, 5000) + "...";
      }
    } catch {
      // In case of an error during extraction, fall back to empty content
      content = "";
    }

    sendResponse({ content });
  }
  return true;
});
