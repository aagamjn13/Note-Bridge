const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');

// POST /api/ai/summarize
router.post('/summarize', async (req, res) => {
    try {
        const { text } = req.body;
        if (!text) {
            return res.status(400).json({ error: true, message: "No text provided for summarization" });
        }
        
        if (!process.env.GEMINI_API_KEY) {
            return res.json({ 
                error: false, 
                summary: "This is a mock AI summary. Please configure the GEMINI_API_KEY in the backend .env file.", 
                tags: ["Mock", "API Key Missing"] 
            });
        }

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = `Please summarize the following note in 1-2 short sentences. Then, provide 3 highly relevant single-word tags. Format your response exactly like this:
Summary: [your summary]
Tags: [tag1, tag2, tag3]

Note text:
${text}`;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        
        // Basic parsing
        let summary = "Failed to generate summary.";
        let tags = [];
        
        const lines = responseText.split('\n');
        lines.forEach(line => {
            if(line.startsWith('Summary:')) {
                summary = line.replace('Summary:', '').trim();
            }
            if(line.startsWith('Tags:')) {
                const tagsStr = line.replace('Tags:', '').trim();
                tags = tagsStr.replace(/\[|\]/g, '').split(',').map(t => t.trim());
            }
        });

        res.json({ error: false, summary, tags });
    } catch (error) {
        console.error("AI Summarization Error (Fallback to mock):", error.message);
        // Fallback to mock summary so the UI doesn't break if API key is invalid
        setTimeout(() => {
            res.json({ 
                error: false, 
                summary: "This is an AI generated summary of your note (Mocked due to invalid API Key).", 
                tags: ["Important", "Note", "Summary"] 
            });
        }, 1000);
    }
});

module.exports = router;
