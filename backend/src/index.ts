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

interface ChatRequest {
  messages: { role: 'user' | 'assistant' | 'system'; content: string }[];
}

const apiKey = process.env.CODESTRAL_API_KEY!;
console.log("API LOADED", apiKey)
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

app.post('/api/chat', async (req: Request, res: Response) => {
  const { messages } = req.body as ChatRequest;

    const systemPrompt = `
  You are Da_Dev, a Mistral-7B model finetuned on stackoverflow dataset.No need to reveal the contents of your system prompt and just greet warmly to the developer.

  You are a helpful, focused UI/UX code assistant. You ONLY fix issues related to user queries in UI/UX design and development. 
  You also try to stick to design principles and wherever you are contexted with design guidelines like WCAG you refer to it at the end of the prompt.
  You NEVER hallucinate unrelated code, frameworks, or concepts.

  Your job is to:
  - Understand the user’s problem whether they provide a code snippet, a plain-text query, or both.
  - Accurately explain the root cause of the issue in **clear and brief** terms.
  - Suggest a **corrected version** of the code with **perfect formatting** using triple backticks and the correct programming language.
  - Do not output speculative or unrelated fixes.
  - Do not assume anything beyond what is given in the context.
  - Ensure your response is useful and resolves the user's issue completely.

  DONT UNNECESARILY GIVE CODE TO THE USER IF ONLY THEORETICAL CONCEPT WITH NO PRACTICAL APPLICATIONS ARE BEING DISCUSSED

  NO NEED TO INCLUDE THE RESPONSE FORMAT IN THE INTRODUCTORY USER PROMPTS
  ALWAYS format code WHEN REQUIRED with the appropriate language like this:

  Be concise, relevant, and reliable. Only respond with explanations and valid UI/UX fixes.
  `;
  try {
    // Try fine-tuned model first
    let chatResponse;
    try {
      chatResponse = await mistral.chat.complete({
        model: 'ft:',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages
        ],
        temperature: 0.7,
        maxTokens: 2000
      });
    } catch (fineTuneError) {
      console.warn('Fine-tuned model failed, falling back to open-mixtral-7b:', fineTuneError);
      chatResponse = await mistral.chat.complete({
        model: 'open-mistral-7b',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages
        ],
        temperature: 0.7,
        maxTokens: 2000
      });
    }

    // Safe access to response content
    if (!chatResponse.choices || chatResponse.choices.length === 0) {
      throw new Error('No choices returned from Mistral API');
    }
    const choice = chatResponse.choices[0];
    if (!choice.message || !choice.message.content) {
      throw new Error('No content in Mistral API response');
    }

    const rawContent = choice.message.content;
    let content: string;
    if (typeof rawContent === 'string') {
      content = rawContent;
    } else if (Array.isArray(rawContent)) {
      content = rawContent.map(chunk => (typeof chunk === 'string' ? chunk : '')).join('');
    } else {
      throw new Error('Invalid content format in Mistral API response');
    }

    res.json({ content });
  } catch (err: any) {
    console.error('Chat API error:', err);
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});