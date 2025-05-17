const chatBox = document.getElementById("chat-box");
const input = document.getElementById("input");
const form = document.getElementById("chat-form");
const suggestionsContainer = document.getElementById("suggestions");

// Scroll chat box to the bottom to show the latest message
function scrollToBottom() {
  chatBox.scrollTop = chatBox.scrollHeight;
}

// Append a chat message to the chat box
function appendMessage(content, isUser = false) {
  const wrapper = document.createElement("div");
  wrapper.style.display = "flex";
  wrapper.style.width = "100%";
  wrapper.style.marginBottom = "8px";
  wrapper.style.justifyContent = isUser ? "flex-end" : "flex-start";

  const messageDiv = document.createElement("div");
  messageDiv.style.maxWidth = "80%";
  messageDiv.style.padding = "10px 14px";
  messageDiv.style.borderRadius = "18px";
  messageDiv.style.whiteSpace = "pre-wrap";
  messageDiv.style.wordBreak = "break-word";
  messageDiv.style.fontSize = "14px";
  messageDiv.style.lineHeight = "1.4";

  if (isUser) {
    messageDiv.style.backgroundColor = "#3b82f6";
    messageDiv.style.color = "white";
    messageDiv.style.borderBottomRightRadius = "4px";
  } else {
    messageDiv.style.backgroundColor = "#e5e7eb";
    messageDiv.style.color = "black";
    messageDiv.style.borderBottomLeftRadius = "4px";
  }

  messageDiv.textContent = content;

  wrapper.appendChild(messageDiv);
  chatBox.appendChild(wrapper);
  scrollToBottom();
}

// Render the list of suggested questions in the suggestions container
function appendSuggestions(suggestions) {
  suggestionsContainer.innerHTML = "";
  if (!suggestions || suggestions.length === 0) {
    suggestionsContainer.style.display = "none";
    return;
  }
  suggestionsContainer.style.display = "block";
  suggestions.forEach((q) => {
    const suggestionDiv = document.createElement("div");
    suggestionDiv.textContent = q;
    suggestionDiv.style.padding = "6px 10px";
    suggestionDiv.style.borderRadius = "8px";
    suggestionDiv.style.backgroundColor = "#f3f4f6";
    suggestionDiv.style.color = "#1f2937";
    suggestionDiv.style.fontSize = "13px";
    suggestionDiv.style.cursor = "pointer";
    suggestionDiv.addEventListener("click", () => {
      input.value = q;
      input.focus();
    });
    suggestionsContainer.appendChild(suggestionDiv);
  });
}

// Fetches suggested questions by communicating with backend API
async function fetchSuggestions() {
  try {
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      const tab = tabs[0];
      if (!tab || !tab.id) {
        appendSuggestions([]);
        return;
      }

      chrome.tabs.sendMessage(
        tab.id,
        { action: "extract_content" },
        async (response) => {
          if (!response?.content) {
            appendSuggestions([]);
            return;
          }

          const body = { pageContent: response.content };

          const res = await fetch("http://localhost:3001/suggest-questions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          });

          if (!res.ok) {
            appendSuggestions([]);
            return;
          }

          const data = await res.json();
          appendSuggestions(data.questions || []);
        }
      );
    });
  } catch (err) {
    appendSuggestions([]);
  }
}

document.addEventListener("DOMContentLoaded", fetchSuggestions);

// Handles sending a user message
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const userInput = input.value.trim();
  if (!userInput) return;

  appendMessage(userInput, true);
  input.value = "";

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    if (!tab || !tab.id) {
      appendMessage("Error: Could not find active tab.", false);
      return;
    }

    chrome.tabs.sendMessage(
      tab.id,
      { action: "extract_content" },
      async (response) => {
        if (!response?.content) {
          appendMessage("Error: Could not extract page content.", false);
          return;
        }

        const pageContent = response.content;

        try {
          const suggestRes = await fetch(
            "http://localhost:3001/suggest-questions",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ pageContent }),
            }
          );
          const suggestData = await suggestRes.json();
          if (Array.isArray(suggestData.questions)) {
            appendSuggestions(suggestData.questions);
          }
        } catch (err) {
          console.error("Suggestion error:", err);
        }

        const body = {
          pageContent,
          messages: [{ role: "user", content: userInput }],
        };

        try {
          const res = await fetch("http://localhost:3001/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          });

          if (!res.ok) {
            throw new Error(`Server error: ${res.statusText}`);
          }

          const botWrapper = document.createElement("div");
          botWrapper.style.display = "flex";
          botWrapper.style.width = "100%";
          botWrapper.style.marginBottom = "8px";
          botWrapper.style.justifyContent = "flex-start";

          const botDiv = document.createElement("div");
          botDiv.style.maxWidth = "80%";
          botDiv.style.padding = "10px 14px";
          botDiv.style.borderRadius = "18px";
          botDiv.style.whiteSpace = "pre-wrap";
          botDiv.style.wordBreak = "break-word";
          botDiv.style.fontSize = "14px";
          botDiv.style.lineHeight = "1.4";
          botDiv.style.backgroundColor = "#e5e7eb";
          botDiv.style.color = "black";
          botDiv.style.borderBottomLeftRadius = "4px";

          botWrapper.appendChild(botDiv);
          chatBox.appendChild(botWrapper);
          scrollToBottom();

          const reader = res.body.getReader();
          const decoder = new TextDecoder();
          let buffer = "";

          while (true) {
            const { value, done } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n\n");
            buffer = lines.pop();

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const data = line.slice(6);
                if (data === "[DONE]") {
                  break;
                }
                botDiv.textContent += data;
                scrollToBottom();
              }
            }
          }
        } catch (err) {
          appendMessage(`Error: ${err.message}`, false);
        }
      }
    );
  });
});

input.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    form.dispatchEvent(new Event("submit"));
  }
});
