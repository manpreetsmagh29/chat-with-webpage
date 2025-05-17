import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
app.use(cors());

app.get("/proxy", async (req, res) => {
  const url = req.query.url;
  console.log("Proxy request for URL:", url);

  if (!url) return res.status(400).send("Missing URL");

  try {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

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

    const contentType = response.headers.get("content-type") || "text/html";
    const text = await response.text();

    res.setHeader("Content-Type", contentType);
    res.send(text);
  } catch (err) {
    console.error("Proxy fetch error:", err.stack || err);
    res.status(500).send(`Error fetching content: ${err.message}`);
  }
});

const PORT = 3001;
app.listen(PORT, () =>
  console.log(`✅ Webpage fetcher running at http://localhost:${PORT}`)
);
