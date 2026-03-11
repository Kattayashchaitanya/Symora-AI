const resultLabels = {
  English: {
    riskLevel: "Risk Level",
    condition: "Possible Condition",
    advice: "Advice",
  },
  Hindi: {
    riskLevel: "जोखिम स्तर",
    condition: "संभावित स्थिति",
    advice: "सलाह",
  },
  Telugu: {
    riskLevel: "ఝామ స్థాయి",
    condition: "సంభవ్య పరिస్థితి",
    advice: "సూచన",
  },
};

const localizedRiskContent = {
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

const normalizeLanguage = (value) => {
  const language = String(value || "English").toLowerCase();
  if (language.includes("hindi") || language.includes("हिंदी")) return "Hindi";
  if (language.includes("telugu") || language.includes("తెలుగు")) return "Telugu";
  return "English";
};

function ResultCard({ result, language = "English" }) {
  if (!result) return null;

  const normalizedRisk = (result.risk || "MEDIUM").toUpperCase();
  const normalizedLanguage = normalizeLanguage(language);

  const riskClassMap = {
    HIGH: "risk-high",
    MEDIUM: "risk-medium",
    LOW: "risk-low",
  };

  const riskClass = riskClassMap[normalizedRisk] || "risk-medium";
  const labels = resultLabels[normalizedLanguage] || resultLabels.English;
  const localizedContent =
    localizedRiskContent[normalizedLanguage]?.[normalizedRisk] ||
    localizedRiskContent.English.MEDIUM;

  const displayCondition =
    normalizedLanguage === "English"
      ? result.condition || localizedContent.condition
      : localizedContent.condition;

  const displayAdvice =
    normalizedLanguage === "English"
      ? result.advice || localizedContent.advice
      : localizedContent.advice;

  return (
    <div className="result-card">
      <h3 className={`risk-title ${riskClass}`}>
        {labels.riskLevel}: {normalizedRisk}
      </h3>

      <p>
        <strong>{labels.condition}:</strong> {displayCondition}
      </p>
      <p>
        <strong>{labels.advice}:</strong> {displayAdvice}
      </p>
    </div>
  );
}

export default ResultCard;