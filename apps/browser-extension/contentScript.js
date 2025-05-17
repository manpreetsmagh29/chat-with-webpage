chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "extract_content") {
    let content = "";

    try {
      content = document.body.innerText || "";
      if (content.length > 5000) {
        content = content.slice(0, 5000) + "...";
      }
    } catch {
      content = "";
    }

    sendResponse({ content });
  }
  return true;
});
