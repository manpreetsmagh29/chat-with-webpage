chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "extract_content") {
    sendResponse({
      content: document.body.innerText,
    });
    return true;
  }

  return true;
});
