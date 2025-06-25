const express = require('express');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Route DeepSeek
app.post('/api/deepseek', async (req, res) => {
  try {
    const response = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: req.body.messages,
        stream: false
      })
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("Erreur API DeepSeek :", response.status, text);
      return res.status(response.status).json({ error: text });
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("Exception DeepSeek :", error);
    res.status(500).json({ error: "Erreur DeepSeek" });
  }
});

// Route Gemini corrigée
app.post('/api/gemini', async (req, res) => {
  try {
    const userMessage = req.body.userMessage;

    if (!userMessage) {
      return res.status(400).json({ error: "Le champ userMessage est requis." });
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${process.env.GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: userMessage }
            ]
          }
        ]
      })
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("Erreur API Gemini :", response.status, text);
      return res.status(response.status).json({ error: text });
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("Exception Gemini :", error);
    res.status(500).json({ error: "Erreur Gemini" });
  }
});

// Route OpenRouter avec DeepSeek corrigée
app.post('/api/openrouter', async (req, res) => {
  try {
    console.log("Clé OpenRouter côté serveur :", process.env.OPENROUTER_API_KEY);

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "deepseek/deepseek-chat-v3-0324:free",
        messages: req.body.messages,
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("Erreur API OpenRouter :", response.status, text);
      return res.status(response.status).json({ error: text });
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("Exception OpenRouter :", error);
    res.status(500).json({ error: "Erreur OpenRouter" });
  }
});

// Petite route de test
app.get('/', (req, res) => {
  res.send("Backend OS AI en ligne !");
});

app.listen(PORT, () => {
  console.log(`Serveur backend en écoute sur le port ${PORT}`);
});
