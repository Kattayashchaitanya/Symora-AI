const emergencyMessages = {
  English: {
    high: "⚠️ HIGH RISK - Seek urgent medical care immediately!",
    medium: "⚡ MEDIUM RISK - Visit a doctor within 24 hours",
    low: "✓ LOW RISK - Monitor symptoms and stay hydrated",
  },
  Hindi: {
    high: "⚠️ उच्च जोखिम - तुरंत चिकित्सा सहायता प्राप्त करें!",
    medium: "⚡ माध्यम जोखिम - 24 घंटे में डॉक्टर से मिलें",
    low: "✓ निम्न जोखिम - लक्षणों की निगरानी करें",
  },
  Telugu: {
    high: "⚠️ అధిక ప్రమాదం - వెంటనే వైద్య సహాయం పొందండి!",
    medium: "⚡ మధ్యమ ప్రమాదం - 24 గంటల్లో డాక్టర్‌ను సందర్శించండి",
    low: "✓ తక్క ప్రమాదం - లక్షణాలను పర్యవేక్షించండి",
  },
};

export function EmergencyAlert({ risk, language = "English" }) {
  if (!risk) return null;

  const riskLower = risk.toLowerCase();
  const message = emergencyMessages[language]?.[riskLower] || emergencyMessages.English[riskLower];
  const isHighRisk = risk === "HIGH";

  return (
    <div className={`emergency-alert alert-${riskLower}`}>
      <div className="alert-content">
        <h3 className="alert-title">{message}</h3>
        {isHighRisk && (
          <div className="alert-actions">
            <button className="emergency-button" onClick={() => window.open("tel:108")}>
              📞 Call Emergency
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
