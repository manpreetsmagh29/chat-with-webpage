# 🧠 Chat with Webpage

This project allows users to ask questions about any webpage using its content. It consists of:

- A **React-based web app** where you can input a URL and chat using the page's content.
- A **Chrome extension** that enables contextual chat on any webpage you're currently visiting.
- A **Node.js backend server** that fetches webpage content and communicates with OpenAI's API to generate responses and suggestions.

---

## 🚀 Getting Started

Follow the steps below to set up and run the project locally.

---

### 1. **Clone the Repository**

```bash
git clone https://github.com/manpreetsmagh29/chat-with-webpage.git
cd chat-with-webpage
npm install
```
### 2. Start the Backend Server

Navigate to the backend server directory:

```bash
cd apps/webpage-fetcher
```

### Create a `.env` file and add your OpenAI API key:

```env
OPENAI_API_KEY=your_openai_api_key
```

### Start the server:

```bash
node server.js
```

The server will now be listening for requests from the frontend apps.

### 3. Run the Web App

Open a new terminal window and start the web app:

```bash
cd apps/web-app
npm run dev
```

Visit the following URL in your browser: http://localhost:5173/

Now you can:

- Provide a webpage URL.
- View suggested questions based on the webpage content.
- Ask custom questions and receive answers if the context exists on the page.

### 4. Use as a Chrome Extension

To use the project as a Chrome extension:

- Open Chrome and go to `chrome://extensions/`.
- Enable **Developer Mode** (toggle on the top-right).
- Click on **Load unpacked**.
- Select the `apps/browser-extension` folder.
- Pin the extension to your browser for easier access.

Once added:

- Navigate to any webpage.
- Click on the extension icon.
- You'll see AI-generated suggested questions.
- You can also type and submit your own questions.
- The extension will respond based on the content of the page you're on.


### 🔁 **Important Note**

Make sure the backend server (`node server.js`) is always running for both the web app and the Chrome extension to function correctly.
