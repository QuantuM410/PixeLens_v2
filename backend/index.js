// backend/index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.post('/api/scan-ui', async (req, res) => {
  const { html, css } = req.body;

  // Compose a prompt for Codestral
  const prompt = `
You are an expert UI reviewer. Analyze the following HTML and CSS for UI/UX/accessibility issues. 
For each issue, provide:
- a title,
- a description,
- severity (high, medium, low),
- type (e.g., accessibility, styling, performance),
- the affected element (as a CSS selector),
- and a suggested code fix (HTML/CSS/JS).

HTML:
${html}

CSS:
${css}
`;

  try {
    const codestralRes = await fetch('https://codestral.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.CODESTRAL_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "codestral-latest", // or the specific model you want
        messages: [
          { role: "system", content: "You are a helpful assistant for UI code review." },
          { role: "user", content: prompt }
        ],
        max_tokens: 1024,
        temperature: 0.2
      })
    });

    if (!codestralRes.ok) {
      const errorText = await codestralRes.text();
      return res.status(500).json({ error: "Codestral API error", details: errorText });
    }

    const codestralData = await codestralRes.json();
    // Parse Codestral's response to extract issues
    // Expecting a JSON array in the response, otherwise try to parse from text
    let issues = [];
    try {
      // Try to parse as JSON if Codestral returns a code block or JSON
      const match = codestralData.choices[0].message.content.match(/```json\\s*([\\s\\S]*?)```/i);
      if (match) {
        issues = JSON.parse(match[1]);
      } else {
        // Try to parse as plain JSON
        issues = JSON.parse(codestralData.choices[0].message.content);
      }
    } catch (e) {
      // Fallback: return the raw text as a single issue
      issues = [{
        id: "codestral-raw",
        title: "Codestral Output",
        description: codestralData.choices[0].message.content,
        severity: "medium",
        type: "ai-output",
        element: "body",
        fix: ""
      }];
    }

    // Add IDs if missing
    issues = issues.map((issue, idx) => ({
      id: issue.id || `codestral-${idx + 1}`,
      ...issue
    }));

    res.json({ issues });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error", details: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});