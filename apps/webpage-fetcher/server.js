import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import { JSDOM } from "jsdom";
import { Readability } from "@mozilla/readability";
import bodyParser from "body-parser";
import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: "5mb" }));

console.log("openAIKey", process.env.OPENAI_API_KEY);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.post("/chat", async (req, res) => {
  try {
    const { pageContent = "", messages } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "Invalid messages array" });
    }

    const systemMessage = {
      role: "system",
      content: `You are an assistant that answers questions based ONLY on the following page content:\n${pageContent}`,
    };

    const allMessages = [systemMessage, ...messages];

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: allMessages,
      stream: true,
    });

    for await (const chunk of completion) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        res.write(`data: ${content}\n\n`);
      }
    }

    res.end();
  } catch (error) {
    console.error("OpenAI stream error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/extractPageContent", async (req, res) => {
  const url = req.query.url;

  if (!url) return res.status(400).send("Missing URL");

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) " +
          "AppleWebKit/537.36 (KHTML, like Gecko) " +
          "Chrome/114.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const html = await response.text();

    const dom = new JSDOM(html, { url });
    const reader = new Readability(dom.window.document);
    const article = reader.parse();

    const extractedText = article?.textContent || "";

    res.json({ text: extractedText });
  } catch (err) {
    console.error("Content extraction error:", err.stack || err);
    res.status(500).send(`Error extracting content: ${err.message}`);
  }
});

const PORT = 3001;
app.listen(PORT, () =>
  console.log(`Webpage fetcher running at http://localhost:${PORT}`)
);
