const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const fetch = require("node-fetch");

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

// Chat endpoint
app.post("/api/chat", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const response = await fetch(OPENROUTER_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`, // Use OpenRouter API key
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "meta-llama/llama-4-maverick:free", // Specify the OpenRouter model
        messages: [{ role: "user", content: message }],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("OpenRouter API Error:", errorData);
      return res.status(response.status).json({
        error: `OpenRouter API Error: ${response.statusText}`,
        details: errorData,
      });
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;
    res.json({ message: aiResponse });
  } catch (error) {
    console.error("Fetch Error:", error);
    res.status(500).json({
      error: "An error occurred while processing your request via OpenRouter",
      details: error.message,
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: "Something broke!",
    details: err.message,
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
