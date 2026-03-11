const riskVisualizationLabels = {
  English: {
    riskLevel: "Risk Level",
    severity: "Severity",
    recommended: "Recommended Action",
    timeToSeekCare: "Time to Seek Care",
  },
  Hindi: {
    riskLevel: "जोखिम स्तर",
    severity: "गंभीरता",
    recommended: "अनुशंसित कार्रवाई",
    timeToSeekCare: "देखभाल लेने का समय",
  },
  Telugu: {
    riskLevel: "ప్రమాద స్థాయి",
    severity: "తీవ్రత",
    recommended: "సిఫారసు చేసిన చర్య",
    timeToSeekCare: "సంరక్షణ కోసం సময়",
  },
};

const normalizeLanguage = (language) => {
  const value = String(language || "English").toLowerCase();
  if (value.includes("hindi") || value.includes("हिंदी")) return "Hindi";
  if (value.includes("telugu") || value.includes("తెలుగు")) return "Telugu";
  return "English";
};

const riskDetails = {
  HIGH: {
    severity: 95,
    color: "#dc2626",
    icon: "🚨",
    actions: {
      English: ["Call emergency (108)", "Go to hospital immediately", "Inform family members"],
      Hindi: ["आपातकालीन सेवा (108) पर कॉल करें", "तुरंत अस्पताल जाएं", "परिवार के सदस्यों को सूचित करें"],
      Telugu: ["అత్యవసర సేవ (108)కి కాల్ చేయండి", "వెంటనే ఆసుపత్రికి వెళ్లండి", "కుటుంబ సభ్యులకు సమాచారం ఇవ్వండి"],
    },
    timeframe: {
      English: "Immediately (< 30 minutes)",
      Hindi: "तुरंत (< 30 मिनट)",
      Telugu: "వెంటనే (< 30 నిమిషాలు)",
    },
  },
  MEDIUM: {
    severity: 60,
    color: "#ea580c",
    icon: "⚠️",
    actions: {
      English: ["Schedule doctor appointment", "Monitor symptoms closely", "Take prescribed medication"],
      Hindi: ["डॉक्टर की अपॉइंटमेंट लें", "लक्षणों पर नज़र रखें", "निर्धारित दवा लें"],
      Telugu: ["డాక్టర్ అపాయింట్మెంట్ తీసుకోండి", "లక్షణాలను జాగ్రత్తగా గమనించండి", "వైద్యుడు సూచించిన మందులు తీసుకోండి"],
    },
    timeframe: {
      English: "Today (< 24 hours)",
      Hindi: "आज ही (< 24 घंटे)",
      Telugu: "ఈరోజే (< 24 గంటలు)",
    },
  },
  LOW: {
    severity: 25,
    color: "#16a34a",
    icon: "✓",
    actions: {
      English: ["Monitor symptoms", "Stay hydrated", "Rest well", "Follow-up in 3-5 days if needed"],
      Hindi: ["लक्षणों की निगरानी करें", "पर्याप्त पानी पिएं", "अच्छी तरह आराम करें", "ज़रूरत हो तो 3-5 दिनों में फॉलो-अप करें"],
      Telugu: ["లక్షణాలను గమనించండి", "తగినంత నీరు తాగండి", "బాగా విశ్రాంతి తీసుకోండి", "అవసరమైతే 3-5 రోజుల్లో ఫాలో-అప్ చేయండి"],
    },
    timeframe: {
      English: "Within 3-5 days",
      Hindi: "3-5 दिनों के भीतर",
      Telugu: "3-5 రోజులలోపు",
    },
  },
};

export function RiskVisualization({ risk, language = "English" }) {
  if (!risk) return null;

  const normalizedLanguage = normalizeLanguage(language);
  const labels = riskVisualizationLabels[normalizedLanguage];
  const details = riskDetails[risk] || riskDetails.MEDIUM;
  const localizedActions = details.actions[normalizedLanguage] || details.actions.English;
  const localizedTimeframe = details.timeframe[normalizedLanguage] || details.timeframe.English;

  return (
    <div className="risk-visualization">
      <div className="risk-header">
        <span className="risk-icon">{details.icon}</span>
        <div className="risk-title-section">
          <h2 className="risk-title">{labels.riskLevel}</h2>
          <p className="risk-level" style={{ color: details.color }}>
            {risk}
          </p>
        </div>
      </div>

      <div className="severity-meter">
        <div className="meter-background">
          <div
            className="meter-fill"
            style={{
              width: `${details.severity}%`,
              backgroundColor: details.color,
            }}
          ></div>
        </div>
        <p className="meter-label">{labels.severity}: {details.severity}%</p>
      </div>

      <div className="risk-actions-section">
        <h3 className="section-title">{labels.recommended}</h3>
        <div className="actions-list">
          {localizedActions.map((action, idx) => (
            <div key={idx} className="action-item">
              <span className="action-icon">→</span>
              <span className="action-text">{action}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="timeframe-section">
        <h3 className="section-title">{labels.timeToSeekCare}</h3>
        <p className="timeframe-text" style={{ color: details.color }}>
          {localizedTimeframe}
        </p>
      </div>
    </div>
  );
}
