const { getAIResponse } = require("../services/aiService");
const { addSubmission, REGIONS } = require("../services/analyticsService");

const fallbackByLanguage = {
  English: {
    risk: "MEDIUM",
    condition: "General illness",
    advice:
      "Please monitor your symptoms. If they worsen or you have severe symptoms, consult a doctor immediately.",
  },
  Hindi: {
    risk: "MEDIUM",
    condition: "सामान्य बीमारी",
    advice:
      "कृपया अपने लक्षणों पर नज़र रखें। यदि लक्षण गंभीर हों या बढ़ें, तो तुरंत डॉक्टर से सलाह लें।",
  },
  Telugu: {
    risk: "MEDIUM",
    condition: "సాధారణ అనారోగ్యం",
    advice:
      "దయచేసి మీ లక్షణాలను గమనించండి. అవి తీవ్రమైతే లేదా పెరిగితే వెంటనే వైద్యుడిని సంప్రదించండి.",
  },
};

const getControllerFallback = (language) => fallbackByLanguage[language] || fallbackByLanguage.English;

const allowedLanguages = new Set(["English", "Hindi", "Telugu"]);

exports.analyzeSymptoms = async (req, res) => {
  const { symptoms, language, region, image } = req.body;
  const selectedLanguage = language?.trim() || "English";
  const selectedRegion = region?.trim() || "Unknown";
  const normalizedSymptoms = typeof symptoms === "string" ? symptoms.trim() : "";

  if (!normalizedSymptoms) {
    return res.status(400).json({
      error: "Symptoms are required.",
      details: "Provide a non-empty symptoms string.",
    });
  }

  if (normalizedSymptoms.length < 3) {
    return res.status(400).json({
      error: "Symptoms are too short.",
      details: "Please describe your symptoms with a bit more detail.",
    });
  }

  if (language !== undefined && (typeof language !== "string" || !language.trim())) {
    return res.status(400).json({
      error: "Invalid language.",
      details: "Language must be a non-empty string when provided.",
    });
  }

  if (language !== undefined && !allowedLanguages.has(language.trim())) {
    return res.status(400).json({
      error: "Unsupported language.",
      details: "Supported languages are English, Hindi, and Telugu.",
    });
  }

  try {
    const result = await getAIResponse(normalizedSymptoms, selectedLanguage, image);
    addSubmission(normalizedSymptoms, result.risk, selectedRegion, selectedLanguage);
    res.json(result);
  } catch (error) {
    console.error(error);
    const fallback = getControllerFallback(selectedLanguage);
    addSubmission(normalizedSymptoms, fallback.risk, selectedRegion, selectedLanguage);
    res.status(200).json(fallback);
  }
};