import express from "express";
import bodyParser from "body-parser";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(bodyParser.json());
app.use(express.static("public"));
app.set("view engine", "ejs");

// ✅ Home route
app.get("/", (req, res) => {
  res.render("index");
});

// ✅ Improve resume route with logging
app.post("/improve", async (req, res) => {
  console.log("✅ /improve route hit");
  console.log("📩 Request body:", req.body);

  try {
    const { text } = req.body;

    if (!text) {
      console.log("⚠️ No text provided");
      return res.json({ error: "No text provided" });
    }

    // 🔑 Call Groq API
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [
          { role: "system", content: "You are a helpful assistant that improves resumes." },
          { role: "user", content: text }
        ]
      })
    });

    console.log("🌐 Groq API status:", response.status);
    const rawText = await response.text();
    console.log("📄 Raw Groq response:", rawText);

    let data;
    try {
      data = JSON.parse(rawText);
    } catch (err) {
      console.error("❌ Failed to parse JSON from Groq:", err);
      return res.json({ error: "Groq API did not return valid JSON" });
    }

    if (!data || !data.choices || !data.choices[0]) {
      console.log("⚠️ Invalid response structure:", data);
      return res.json({ error: "Invalid response from AI" });
    }

    res.json({ result: data.choices[0].message.content });
  } catch (err) {
    console.error("💥 Server error:", err);
    res.json({ error: "Failed to process request" });
  }
});

// ✅ Start server
app.listen(3000, () => {
  console.log("✅ Server running on http://localhost:3000");
});
