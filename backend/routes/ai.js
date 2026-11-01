const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const fetchuser = require('../middlewire/fetchUser');

// POST /api/ai/summarize - Protected by fetchuser
router.post('/summarize', fetchuser, async (req, res) => {
    try {
        const { text } = req.body;
        if (!text || typeof text !== 'string' || !text.trim()) {
            return res.status(400).json({ error: true, message: "No text provided for summarization" });
        }

        if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your-gemini-api-key') {
            return res.json({
                error: false,
                summary: "This is a mock AI summary. Please configure GEMINI_API_KEY in the backend environment variables.",
                tags: ["Mock", "API Key Missing"]
            });
        }

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = `Please summarize the following note in 1-2 short sentences. Then, provide 3 highly relevant single-word tags. Format your response exactly like this:
Summary: [your summary]
Tags: [tag1, tag2, tag3]

Note text:
${text.trim()}`;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        // Robust parsing: strip markdown bold/italics markers if any
        let summary = "Failed to generate summary.";
        let tags = [];

        const lines = responseText.split('\n');
        lines.forEach(line => {
            const cleanLine = line.replace(/^\*+|\*+$/g, '').trim();
            if (/^summary\s*:/i.test(cleanLine)) {
                summary = cleanLine.replace(/^summary\s*:\s*/i, '').trim();
            }
            if (/^tags\s*:/i.test(cleanLine)) {
                const tagsStr = cleanLine.replace(/^tags\s*:\s*/i, '').trim();
                tags = tagsStr.replace(/[\[\]]/g, '').split(',').map(t => t.trim().replace(/^#/, '')).filter(Boolean);
            }
        });

        if (tags.length === 0) {
            tags = ["Note", "Summary"];
        }

        return res.json({ error: false, summary, tags });
    } catch (error) {
        console.error("AI Summarization Error (Fallback to mock):", error.message);
        return res.json({
            error: false,
            summary: "This is an AI generated summary of your note (Fallback: service temporarily unavailable).",
            tags: ["Important", "Note", "Summary"]
        });
    }
});

module.exports = router;
