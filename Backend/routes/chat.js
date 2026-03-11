const express = require('express');
const router = express.Router();
const { Groq } = require('groq-sdk');

// Ensure Groq is initialized. The API key should be in the environment.
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const generateSystemPrompt = (language) => {
  let langInstruction = '';
  switch (language) {
    case 'Hindi':
      langInstruction = 'You must respond entirely in the Hindi language. Translate all medical terms to Hindi where appropriate, while keeping them easy to understand.';
      break;
    case 'Telugu':
      langInstruction = 'You must respond entirely in the Telugu language. Translate all medical terms to Telugu where appropriate, while keeping them easy to understand.';
      break;
    default:
      langInstruction = 'You must respond entirely in the English language.';
  }

  return `You are "SymoraAI AI Companion", a friendly, highly intelligent, and empathetic virtual health assistant.
Your goal is to provide general wellness advice, answer health-related questions, and offer preliminary information about symptoms.

CRITICAL INSTRUCTION: You MUST ONLY answer questions related to health, medicine, wellness, biology, fitness, diet, or psychology. If a user asks you about ANY non-medical topic (such as programming, math, sports, politics, movies, general chit-chat, etc.), you must politely refuse to answer and remind them that you are a specialized healthcare assistant.

You are NOT a substitute for a real doctor.
Keep your responses concise, helpful, and formatted beautifully using markdown (bullet points, bold text for emphasis).
Do not offer definitive life-or-death medical diagnoses, always recommend consulting a healthcare professional for serious issues.
Your tone should be calming, supportive, and professional.
${langInstruction}`;
};

router.post('/', async (req, res) => {
  try {
    const { message, language = 'English' } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    if (!process.env.GROQ_API_KEY) {
      return res.status(500).json({ error: "API Key not configured." });
    }

    const systemPrompt = generateSystemPrompt(language);

    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ],
      model: 'llama-3.1-8b-instant', // Fast model for chat
      temperature: 0.7,
      max_tokens: 1024,
    });

    const aiResponse = completion.choices[0]?.message?.content || "I'm sorry, I couldn't process your request.";

    res.json({ reply: aiResponse });
  } catch (error) {
    console.error('Chat AI Error:', error);
    res.status(500).json({ error: 'Failed to generate AI response' });
  }
});

module.exports = router;
