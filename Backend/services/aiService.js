const OpenAI = require("openai").default;

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

const fallbackContentByLanguage = {
  English: {
    condition: "General illness",
    adviceMedium:
      "Please monitor your symptoms. If symptoms are severe or getting worse, consult a doctor as soon as possible.",
    adviceHigh:
      "Your symptoms may be serious. Please seek urgent medical care immediately.",
  },
  Hindi: {
    condition: "लक्षण स्पष्ट नहीं हैं",
    adviceMedium:
      "कृपया अपने लक्षणों पर नज़र रखें। यदि लक्षण गंभीर हों या बढ़ें, तो जल्द से जल्द डॉक्टर से सलाह लें।",
    adviceHigh:
      "आपके लक्षण गंभीर हो सकते हैं। कृपया तुरंत आपातकालीन चिकित्सा सहायता लें।",
  },
  Telugu: {
    condition: "లక్షణాలు స్పష్టంగా లేవు",
    adviceMedium:
      "దయచేసి మీ లక్షణాలను గమనించండి. లక్షణాలు తీవ్రమైతే లేదా పెరిగితే వెంటనే వైద్యుడిని సంప్రదించండి.",
    adviceHigh:
      "మీ లక్షణాలు తీవ్రమై ఉండవచ్చు. దయచేసి వెంటనే అత్యవసర వైద్య సహాయం పొందండి.",
  },
};

const localizedResultByLanguage = {
  English: {
    HIGH: {
      condition: "Possible serious cardiac or respiratory issue",
      advice: "Seek emergency medical care immediately and call 108 if needed.",
    },
    MEDIUM: {
      condition: "Possible moderate health concern requiring medical review",
      advice: "Consult a doctor within 24 hours and monitor symptoms closely.",
    },
    LOW: {
      condition: "Possible mild, non-urgent condition",
      advice: "Rest, stay hydrated, and monitor symptoms for 3-5 days.",
    },
  },
  Hindi: {
    HIGH: {
      condition: "संभावित गंभीर हृदय या श्वसन संबंधी समस्या",
      advice: "तुरंत आपातकालीन चिकित्सा सहायता लें और आवश्यकता हो तो 108 पर कॉल करें।",
    },
    MEDIUM: {
      condition: "संभावित मध्यम स्वास्थ्य समस्या, चिकित्सकीय जांच आवश्यक",
      advice: "24 घंटों के भीतर डॉक्टर से मिलें और लक्षणों की करीबी निगरानी करें।",
    },
    LOW: {
      condition: "संभावित हल्की, गैर-आपातकालीन स्थिति",
      advice: "आराम करें, पर्याप्त पानी पिएं और 3-5 दिनों तक लक्षणों पर नज़र रखें।",
    },
  },
  Telugu: {
    HIGH: {
      condition: "సంభావ్య తీవ్రమైన గుండె లేదా శ్వాసకోశ సమస్య",
      advice: "వెంటనే అత్యవసర వైద్య సహాయం పొందండి మరియు అవసరమైతే 108కి కాల్ చేయండి.",
    },
    MEDIUM: {
      condition: "సంభావ్య మధ్యస్థ ఆరోగ్య సమస్య, వైద్య పరీక్ష అవసరం",
      advice: "24 గంటల్లో డాక్టర్‌ను సంప్రదించి లక్షణాలను జాగ్రత్తగా గమనించండి.",
    },
    LOW: {
      condition: "సంభావ్య తేలికపాటి, అత్యవసరం కాని పరిస్థితి",
      advice: "విశ్రాంతి తీసుకోండి, తగినంత నీరు తాగండి, 3-5 రోజుల పాటు లక్షణాలను గమనించండి.",
    },
  },
};

const getLanguageContent = (language) => fallbackContentByLanguage[language] || fallbackContentByLanguage.English;

const buildLocalizedFallback = (language, risk = "MEDIUM") => {
  const content = getLanguageContent(language);

  return {
    risk,
    condition: content.condition,
    advice: risk === "HIGH" ? content.adviceHigh : content.adviceMedium,
  };
};

const allowedRisk = new Set(["LOW", "MEDIUM", "HIGH"]);

const normalizeSymptoms = (text) =>
  text
    .toLowerCase()
    .replace(/[.,!?;:()[\]{}"']/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const highRiskKeywords = [
  "chest pain",
  "chest tightness",
  "shortness of breath",
  "breathing issue",
  "difficulty breathing",
  "cannot breathe",
  "trouble breathing",
  "सीने में दर्द",
  "छाती में दर्द",
  "सांस लेने में दिक्कत",
  "साँस लेने में दिक्कत",
  "सांस फूलना",
  "साँस फूलना",
  "श्वास लेने में कठिनाई",
  "seene me dard",
  "saans lene me dikkat",
  "sans lene me dikkat",
  "saans phoolna",
  "ఛాతి నొప్పి",
  "ఉపిరి తీసుకోవడంలో ఇబ్బంది",
  "శ్వాస తీసుకోవడంలో ఇబ్బంది",
  "శ్వాసకోశ ఇబ్బంది",
  "శ్వాస తీసుకోవడం కష్టం",
  "శ్వాస తీసుకోవడం కష్టంగా ఉంది",
  "chaati noppi",
  "upiri teesukovadamlō ibbandi",
  "upiri teesukovadamlo ibbandi",
  "swaasa teesukovadam kashtam",
];

const lowRiskKeywords = [
  "mild cold",
  "cold",
  "runny nose",
  "sneezing",
  "headache",
  "mild headache",
  "हल्का जुकाम",
  "सर्दी",
  "नाक बहना",
  "छींक",
  "हल्का सिरदर्द",
  "सिरदर्द",
  "halka jukam",
  "sardi",
  "sirdard",
  "తేలికపాటి జలుబు",
  "జలుబు",
  "ముక్కు కారడం",
  "తుమ్ములు",
  "తలనొప్పి",
  "తేలికపాటి తలనొప్పి",
  "jalubu",
  "talanoppi",
];

const detectRuleBasedRisk = (symptoms) => {
  const text = normalizeSymptoms(symptoms);

  if (highRiskKeywords.some((keyword) => text.includes(keyword))) {
    return "HIGH";
  }

  if (lowRiskKeywords.some((keyword) => text.includes(keyword))) {
    return "LOW";
  }

  return "MEDIUM";
};

const sanitizeAIResponse = (value, language) => {
  const localizedFallback = buildLocalizedFallback(language, "MEDIUM");

  if (!value || typeof value !== "object") {
    return localizedFallback;
  }

  const risk = typeof value.risk === "string" ? value.risk.toUpperCase().trim() : "MEDIUM";
  const condition =
    typeof value.condition === "string" ? value.condition.trim() : localizedFallback.condition;
  const advice = typeof value.advice === "string" ? value.advice.trim() : localizedFallback.advice;

  // Allow INVALID risk to pass through for non-medical inputs
  const finalRisk = allowedRisk.has(risk) || risk === "INVALID" ? risk : "MEDIUM";

  return {
    risk: finalRisk,
    condition: condition || localizedFallback.condition,
    advice: advice || localizedFallback.advice,
  };
};

const localizeResponseContent = (response, language) => {
  if (!response || typeof response !== "object" || !response.condition) {
    return buildLocalizedFallback(language, response?.risk || "MEDIUM");
  }

  const risk = allowedRisk.has(response.risk) ? response.risk : "MEDIUM";

  // Use the AI's response directly, as it generates the localized version based on the prompt.
  // We only rely on localized logic if the AI's string is too short or clearly failed.
  if (response.condition.length > 5 || risk === "INVALID") {
    return {
      risk: response.risk, // preserve INVALID
      condition: response.condition,
      advice: response.advice,
    };
  }

  const selectedLanguage = fallbackContentByLanguage[language] ? language : "English";
  const localized = localizedResultByLanguage[selectedLanguage][risk];

  return {
    risk,
    condition: localized.condition,
    advice: localized.advice,
  };
};

const extractJSONObject = (text) => {
  const trimmed = text.trim();

  if (trimmed.startsWith("```") && trimmed.endsWith("```")) {
    const cleaned = trimmed.replace(/^```(?:json)?\s*/i, "").replace(/```$/, "").trim();
    return cleaned;
  }

  // Find the first { and last } to extract JSON from markdown clutter
  const firstBrace = trimmed.indexOf("{");
  const lastBrace = trimmed.lastIndexOf("}");
  
  if (firstBrace !== -1 && lastBrace !== -1) {
     return trimmed.substring(firstBrace, lastBrace + 1);
  }

  return trimmed;
};

exports.getAIResponse = async (symptoms, language = "English", imageBase64 = null) => {
  // We no longer force a naive rule-based risk. Let the AI decide based on context, duration, etc.
  const riskAwareFallback = buildLocalizedFallback(language, "MEDIUM");

  const prompt = `
You are an AI healthcare triage assistant.

Task:
- Analyze the user input symptoms carefully.
- Return risk, possible general condition, and simple advice.
- IF an image is provided, analyze the visual symptoms in combination with the text.

Rules:
1. STRICT MEDICAL CONTEXT: If the user input is NOT related to a physical or mental health symptom, injury, or medical condition (e.g. if they say "hello", "what is code", "123", "bye", or random text), you MUST set risk to "INVALID". Set the condition to "Non-medical input detected" and advice to "Please provide a valid health symptom for analysis."
2. Assess severity intelligently:
    - If there are clearly life-threatening symptoms (e.g. severe chest pain, unable to breathe, suspected stroke), set risk to HIGH.
    - If the symptoms are mild (e.g. just a common cold, mild headache, single sneeze) and short duration, set risk to LOW.
    - If it's a mild symptom but lasting for a long time (e.g. "cold for 2 weeks", "headache for 10 days" or "getting worse"), elevate the risk to MEDIUM or HIGH as appropriate.
    - For moderate concerns (fevers, localized pain, mild to moderate infections that need a checkup), set risk to MEDIUM.
3. Keep the condition general (e.g., "possible respiratory issue"). Do NOT give an exact medical diagnosis.
4. Suggest consulting a doctor for serious, worsening, or long-lasting symptoms.
5. Output MUST be localized in ${language} language.
6. Input symptoms can be in English, Hindi, or Telugu.

Accuracy policy:
- Follow these rules exactly and prioritize symptom safety.
- Keep condition general.
- Advice must be short, practical, and non-diagnostic.

Respond ONLY in JSON format:

{
  "risk": "LOW | MEDIUM | HIGH | INVALID",
  "condition": "Possible condition or Non-medical input detected",
  "advice": "Simple advice in ${language}"
}

User Symptoms Provided: ${symptoms}
`;

  if (!process.env.GROQ_API_KEY) {
    return riskAwareFallback;
  }

  let jsonText = "";

  try {
    let messages = [
      {
        role: "system",
        content: "You are a careful medical triage assistant. Never provide definitive diagnosis. Return only valid JSON.",
      }
    ];

    let modelToUse = "llama-3.1-8b-instant";

    if (imageBase64) {
      // Use Groq's Vision model when an image is provided
      modelToUse = "llama-3.2-11b-vision-preview";
      // ensure we have proper prefix, groq expects data URI
      const dataUri = imageBase64.startsWith("data:image") ? imageBase64 : `data:image/jpeg;base64,${imageBase64}`;
      messages.push({
        role: "user",
        content: [
          { type: "text", text: prompt },
          {
            type: "image_url",
            image_url: {
              url: dataUri,
            },
          },
        ],
      });
    } else {
      messages.push({ role: "user", content: prompt });
    }

    const response = await client.chat.completions.create({
      model: modelToUse,
      messages: messages,
      temperature: 0.3,
    });

    const text = response?.choices?.[0]?.message?.content || "";
    jsonText = extractJSONObject(text);
  } catch (error) {
    return riskAwareFallback;
  }

  try {
    // Note: if the LLM output is INVALID, sanitizeAIResponse won't override it.
    const parsed = sanitizeAIResponse(JSON.parse(jsonText), language);
    // Don't enforce any naive rule-based risk anymore
    return localizeResponseContent(parsed, language);
  } catch (err) {
    return riskAwareFallback;
  }
};