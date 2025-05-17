import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import { JSDOM } from "jsdom";
import { Readability } from "@mozilla/readability";

const app = express();
app.use(cors());

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
