import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Mistral } from '@mistralai/mistralai';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

interface ScanRequest {
  html: string;
  css: string;
}

interface Issue {
  id: string;
  title: string;
  description: string;
  severity: string;
  type: string;
  element: string;
  suggestedFix: string;
}

const apiKey = process.env.CODESTRAL_API_KEY!;
const mistral = new Mistral({ apiKey: apiKey });

app.post('/api/scan-ui', async (req: Request, res: Response) => {
  const { html, css } = req.body as ScanRequest;

  const prompt = `
You are an expert UI reviewer. Analyze the following HTML and CSS for UI/UX/accessibility issues. 
For each issue, provide an object with the following keys (use these exact names):
- title (string)
- description (string)
- severity ("high", "medium", or "low")
- type (e.g., "accessibility", "styling", "performance")
- element (the CSS selector or tag for the affected element)
- suggestedFix (the code or suggestion to fix the issue)
Return the result as a JSON array of such objects, using these exact keys for every object.

HTML:
${html}

CSS:
${css}
`;

  try {
    const chatResponse = await mistral.chat.complete({
      model: 'codestral-latest',
      messages: [
        { role: 'system', content: 'You are a helpful assistant for UI code review.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.2
    });

    let issues: Issue[] = [];
    try {
      let content: string | undefined = undefined;
      const rawContent = chatResponse.choices[0].message.content;
      if (typeof rawContent === 'string') {
        content = rawContent;
      } else if (Array.isArray(rawContent)) {
        content = rawContent.map(chunk => (typeof chunk === 'string' ? chunk : '')).join('');
      }
      if (content) {
        const match = content.match(/```json\s*([\s\S]*?)```/i);
        if (match) {
          issues = JSON.parse(match[1]);
        } else {
          issues = JSON.parse(content);
        }
      } else {
        throw new Error('No content returned from Codestral');
      }
    } catch (e) {
      let fallbackDescription: string = '';
      const fallbackContent = chatResponse.choices[0].message.content;
      if (typeof fallbackContent === 'string') {
        fallbackDescription = fallbackContent;
      } else if (Array.isArray(fallbackContent)) {
        fallbackDescription = fallbackContent.map(chunk => (typeof chunk === 'string' ? chunk : '')).join('');
      } else {
        fallbackDescription = 'No content available.';
      }
      issues = [{
        id: "codestral-raw",
        title: "Codestral Output",
        description: fallbackDescription,
        severity: "medium",
        type: "ai-output",
        element: "body",
        suggestedFix: ""
      }];
    }

    issues = issues.map((issue, idx) => ({
      ...issue,
      id: issue.id || `codestral-${idx + 1}`
    }));

    res.json({ issues });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: "Internal server error", details: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});