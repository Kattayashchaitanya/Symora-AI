const express = require("express");
const router = express.Router();
const { Groq } = require('groq-sdk');

const {
  getHighRiskRegions,
  getDiseaseTrends,
  getRiskDistribution,
  getTotalSubmissions,
} = require("../services/analyticsService");

// Initialize Groq
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

router.get("/high-risk-regions", (req, res) => {
  const regions = getHighRiskRegions();
  res.json({
    status: "ok",
    data: regions,
  });
});

router.get("/disease-trends", (req, res) => {
  const trends = getDiseaseTrends();
  res.json({
    status: "ok",
    data: trends,
  });
});

router.get("/risk-distribution", (req, res) => {
  const distribution = getRiskDistribution();
  res.json({
    status: "ok",
    data: distribution,
  });
});

router.get("/summary", (req, res) => {
  res.json({
    status: "ok",
    totalSubmissions: getTotalSubmissions(),
    regions: getHighRiskRegions(),
    trends: getDiseaseTrends(),
    distribution: getRiskDistribution(),
  });
});

router.get("/insights", async (req, res) => {
  try {
    const total = getTotalSubmissions();
    const trends = getDiseaseTrends();
    const risks = getRiskDistribution();

    if (!process.env.GROQ_API_KEY) {
      return res.json({ insight: "AI Insights are currently disabled due to missing API configuration." });
    }

    // Format data for the prompt
    const trendString = trends.map(t => `${t.name}: ${t.count}`).join(', ');
    
    const highRisk = risks.find(r => r.name === 'High')?.value || 0;
    const medRisk = risks.find(r => r.name === 'Medium')?.value || 0;
    const lowRisk = risks.find(r => r.name === 'Low')?.value || 0;
    
    const prompt = `You are an expert public health analyst AI for 'SymoraAI'.
Based on the following real-time generalized system data, write a brief, engaging 2-to-3 sentence insight summarizing the current overall health trends.
Total cases analyzed: ${total}
Top disease trends: ${trendString}
Risk levels: High (${highRisk}), Medium (${medRisk}), Low (${lowRisk}).
Keep it professional, analytical, yet easy to understand. Do not use markdown like **bold**.`;

    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.1-8b-instant',
      temperature: 0.5,
      max_tokens: 150,
    });

    const aiResponse = completion.choices[0]?.message?.content || "Gathering generic health data trends...";

    res.json({ insight: aiResponse });
  } catch (error) {
    console.error('AI Insight Error:', error);
    res.status(500).json({ error: 'Failed to generate AI insight' });
  }
});

module.exports = router;
