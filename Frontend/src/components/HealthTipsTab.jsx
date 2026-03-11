import { useState } from "react";

const healthTipsLabels = {
  English: {
    title: "Health Tips & Wellness",
    allTips: "All Tips",
    generalTips: "General",
    respiratoryTips: "Respiratory Health",
    digestiveTips: "Digestive Health",
    immunityTips: "Immunity Boost",
    mentalHealthTips: "Mental Wellness",
    readMore: "Read More ⮟",
    readLess: "Read Less ⮝",
    category: "Category",
  },
  Hindi: {
    title: "स्वास्थ्य सुझाव और कल्याण",
    allTips: "सभी सुझाव",
    generalTips: "सामान्य",
    respiratoryTips: "श्वसन स्वास्थ्य",
    digestiveTips: "पाचन स्वास्थ्य",
    immunityTips: "प्रतिरक्षा बूस्ट",
    mentalHealthTips: "मानसिक स्वास्थ्य",
    readMore: "अधिक पढ़ें ⮟",
    readLess: "कम पढ़ें ⮝",
    category: "श्रेणी",
  },
  Telugu: {
    title: "ఆరోగ్య సూచనలు & సుస్థిరత",
    allTips: "అన్ని చిట్కాలు",
    generalTips: "సాధారణ",
    respiratoryTips: "శ్వాసన ఆరోగ్యం",
    digestiveTips: "జీర్ణక ఆరోగ్యం",
    immunityTips: "రోగనిరోధక శక్తి",
    mentalHealthTips: "మానసిక సుస్థిరత",
    readMore: "మరిన్ని చదవండి ⮟",
    readLess: "తక్కువ చదవండి ⮝",
    category: "వర్గం",
  },
};

const normalizeLanguage = (language) => {
  const value = String(language || "English").toLowerCase();
  if (value.includes("hindi") || value.includes("हिंदी")) return "Hindi";
  if (value.includes("telugu") || value.includes("తెలుగు")) return "Telugu";
  return "English";
};

const healthTips = [
  {
    id: 1,
    title: {
      English: "Stay Hydrated Daily",
      Hindi: "रोजाना पर्याप्त पानी पिएं",
      Telugu: "రోజూ తగినంత నీరు తాగండి",
    },
    category: "General",
    description: {
      English: "Drink at least 8-10 glasses of water daily to maintain proper hydration and support body functions.",
      Hindi: "सही हाइड्रेशन और शरीर की कार्यक्षमता के लिए रोज़ 8-10 गिलास पानी पिएं।",
      Telugu: "సరైన హైడ్రేషన్ మరియు శరీర కార్యకలాపాల కోసం రోజుకు కనీసం 8-10 గ్లాసుల నీరు తాగండి.",
    },
    tips: {
      English: ["Drink water before meals", "Keep a water bottle with you", "Avoid excessive caffeine"],
      Hindi: ["भोजन से पहले पानी पिएं", "अपने साथ पानी की बोतल रखें", "अधिक कैफीन से बचें"],
      Telugu: ["భోజనం ముందు నీరు తాగండి", "మీతో నీటి సీసా ఉంచుకోండి", "అధిక కేఫిన్‌ను నివారించండి"],
    },
    expandedDetails: {
      English: "Proper hydration is crucial for overall health. It helps regulate body temperature, lubricates joints, prevents infections, delivers nutrients to cells, and keeps organs functioning properly. Even mild dehydration can drain your energy and make you tired.",
      Hindi: "समग्र स्वास्थ्य के लिए उचित हाइड्रेशन महत्वपूर्ण है। यह शरीर के तापमान को नियंत्रित करने, जोड़ों को चिकनाई देने, संक्रमण को रोकने, कोशिकाओं तक पोषक तत्व पहुंचाने और अंगों को ठीक से काम करने में मदद करता है।",
      Telugu: "మొత్తం ఆరోగ్యానికి సరైన హైడ్రేషన్ కీలకం. ఇది శరీర ఉష్ణోగ్రతను నియంత్రించడంలో, కీళ్లను లూబ్రికేట్ చేయడంలో, ఇన్ఫెక్షన్లను నివారించడంలో సహాయపడుతుంది.",
    },
    icon: "💧",
  },
  {
    id: 2,
    title: {
      English: "Deep Breathing Exercises",
      Hindi: "गहरी सांस के व्यायाम",
      Telugu: "లోతైన శ్వాస వ్యాయామాలు",
    },
    category: "Respiratory",
    description: {
      English: "Practice deep breathing to improve lung capacity and reduce stress.",
      Hindi: "फेफड़ों की क्षमता बढ़ाने और तनाव कम करने के लिए गहरी सांस का अभ्यास करें।",
      Telugu: "ఫెఫ్ఫుసుల సామర్థ్యాన్ని మెరుగుపరచడానికి మరియు ఒత్తిడి తగ్గించడానికి లోతైన శ్వాసను అభ్యసించండి.",
    },
    tips: {
      English: ["Breathe in for 4 counts", "Hold for 4 counts", "Exhale for 4 counts", "Repeat 5-10 times"],
      Hindi: ["4 गिनती तक सांस लें", "4 गिनती तक रोकें", "4 गिनती तक छोड़ें", "5-10 बार दोहराएं"],
      Telugu: ["4 కౌంట్ల వరకు శ్వాస తీసుకోండి", "4 కౌంట్ల వరకు ఉంచండి", "4 కౌంట్ల వరకు విడదీయండి", "5-10 సార్లు పునరావృతం చేయండి"],
    },
    expandedDetails: {
      English: "Deep breathing (diaphragmatic breathing) slows the heartbeat and lowers or stabilizes blood pressure. It tells the brain to relax and calm down, which then relays this message to your body. Regular practice can reduce anxiety and improve respiratory function.",
      Hindi: "गहरी सांस लेने से दिल की धड़कन धीमी होती है और रक्तचाप कम या स्थिर होता है। यह मस्तिष्क को आराम करने और शांत होने के लिए कहता है। नियमित अभ्यास से चिंता कम हो सकती है।",
      Telugu: "లోతైన శ్వాస హృదయ స్పందనను తగ్గిస్తుంది మరియు రక్తపోటును తగ్గిస్తుంది లేదా స్థిరీకరిస్తుంది. క్రమం తప్పకుండా సాధన చేయడం వల్ల ఆందోళన తగ్గుతుంది.",
    },
    icon: "🫁",
  },
  {
    id: 3,
    title: {
      English: "Balanced Diet",
      Hindi: "संतुलित आहार",
      Telugu: "సమతుల ఆహారం",
    },
    category: "Digestive",
    description: {
      English: "Eat a variety of fruits, vegetables, and whole grains for digestive health.",
      Hindi: "पाचन स्वास्थ्य के लिए फल, सब्जियां और साबुत अनाज का संतुलित सेवन करें।",
      Telugu: "జీర్ణక ఆరోగ్యానికి పండ్లు, కూరగాయలు, సంపూర్ణ ధాన్యాలు కలిగిన ఆహారం తీసుకోండి.",
    },
    tips: {
      English: ["Add fiber-rich foods", "Eat slowly and chew well", "Avoid heavy meals at night"],
      Hindi: ["फाइबर युक्त भोजन शामिल करें", "धीरे खाएं और अच्छी तरह चबाएं", "रात में भारी भोजन से बचें"],
      Telugu: ["ఫైబర్ ఉన్న ఆహారం తీసుకోండి", "నెమ్మదిగా తిని బాగా నమలండి", "రాత్రి భారమైన భోజనం నివారించండి"],
    },
    expandedDetails: {
      English: "A diet high in fiber helps keep food moving smoothly through your digestive tract, making you less likely to get constipated. A balanced diet packed with probiotics like yogurt also promotes a healthy gut microbiome, essential for a strong immune system.",
      Hindi: "फाइबर युक्त आहार आपके पाचन तंत्र के माध्यम से भोजन को सुचारू रूप से आगे बढ़ाने में मदद करता है। संतुलित आहार में दही जैसे प्रोबायोटिक्स आंत के माइक्रोबायोम को स्वस्थ रखते हैं।",
      Telugu: "ఫైబర్ ఎక్కువగా ఉండే ఆహారం మీ జీర్ణవ్యవస్థ ద్వారా ఆహారాన్ని సజావుగా తరలించడంలో సహాయపడుతుంది. సమతుల ఆహారం గట్ మైక్రోబయోమ్‌ను ఆరోగ్యంగా ఉంచుతుంది.",
    },
    icon: "🥗",
  },
  {
    id: 4,
    title: {
      English: "Regular Exercise",
      Hindi: "नियमित व्यायाम",
      Telugu: "నియమిత వ్యాయామం",
    },
    category: "General",
    description: {
      English: "Exercise for at least 30 minutes daily to maintain fitness and prevent diseases.",
      Hindi: "फिटनेस बनाए रखने और बीमारियों से बचाव के लिए रोज़ कम से कम 30 मिनट व्यायाम करें।",
      Telugu: "ఫిట్‌నెస్ కోసం మరియు వ్యాధుల నివారణకు రోజూ కనీసం 30 నిమిషాలు వ్యాయామం చేయండి.",
    },
    tips: {
      English: ["Walking for 30 minutes", "Stretching exercises", "Yoga or swimming"],
      Hindi: ["30 मिनट टहलें", "स्ट्रेचिंग करें", "योग या तैराकी करें"],
      Telugu: ["30 నిమిషాలు నడవండి", "స్ట్రెచింగ్ వ్యాయామాలు చేయండి", "యోగ లేదా ఈత చేయండి"],
    },
    expandedDetails: {
      English: "Regular physical activity strengthens your heart and improves your circulation. The increased blood flow raises the oxygen levels in your body. This helps lower your risk of heart diseases such as high cholesterol, coronary artery disease, and heart attack.",
      Hindi: "नियमित शारीरिक गतिविधि आपके हृदय को मजबूत करती है और रक्त परिसंचरण में सुधार करती है। शरीर में बढ़ा हुआ रक्त प्रवाह ऑक्सीजन के स्तर को बढ़ाता है।",
      Telugu: "క్రమమైన శారీరక శ్రమ మీ గుండెను బలపరుస్తుంది మరియు రక్త ప్రసరణను మెరుగుపరుస్తుంది. పెరిగిన రక్త ప్రవాహం శరీరంలో ఆక్సిజన్ స్థాయిలను పెంచుతుంది.",
    },
    icon: "🏃",
  },
  {
    id: 5,
    title: {
      English: "Boost Immunity",
      Hindi: "प्रतिरक्षा बढ़ाएं",
      Telugu: "రోగనిరోధక శక్తి పెంచుకోండి",
    },
    category: "Immunity",
    description: {
      English: "Strengthen your immune system with vitamin C, D, and zinc-rich foods.",
      Hindi: "विटामिन C, D और जिंक युक्त आहार से अपनी प्रतिरक्षा मजबूत करें।",
      Telugu: "విటమిన్ C, D మరియు జింక్ ఉన్న ఆహారంతో రోగనిరోధక శక్తిని పెంచుకోండి.",
    },
    tips: {
      English: ["Eat citrus fruits", "Get sunlight exposure", "Sleep 7-8 hours", "Reduce stress"],
      Hindi: ["खट्टे फल खाएं", "धूप लें", "7-8 घंटे सोएं", "तनाव कम करें"],
      Telugu: ["సిట్రస్ పండ్లు తినండి", "సూర్యకాంతి పొందండి", "7-8 గంటలు నిద్రించండి", "ఒత్తిడి తగ్గించండి"],
    },
    expandedDetails: {
      English: "Your immune system functions best when supported by a mix of nutrients, adequate deep sleep, and low stress. Citrus fruits (Vitamin C), nuts and seeds (Vitamin E and Zinc), and moderate sunlight (Vitamin D) are the foundational pillars of immune strength.",
      Hindi: "आपका प्रतिरक्षा तंत्र तब सबसे अच्छा काम करता है जब उसे पोषक तत्व, पर्याप्त गहरी नींद और कम तनाव मिलता है। साइट्रस फल, मेवे और धूप प्रतिरक्षा की ताकत के आधार हैं।",
      Telugu: "పోషకాలు, తగినంత గాఢ నిద్ర మరియు తక్కువ ఒత్తిడి మద్దతు ఉన్నప్పుడు మీ రోగనిరోధక వ్యవస్థ ఉత్తమంగా పనిచేస్తుంది. సిట్రస్ పండ్లు, గింజలు మరియు సూర్యకాంతి రోగనిరోధక శక్తికి మూలాధారాలు.",
    },
    icon: "💪",
  },
  {
    id: 6,
    title: {
      English: "Meditation & Mindfulness",
      Hindi: "ध्यान और माइंडफुलनेस",
      Telugu: "ధ్యానం & మైండ్‌ఫుల్‌నెస్",
    },
    category: "Mental",
    description: {
      English: "Practice meditation to reduce stress and improve mental clarity.",
      Hindi: "तनाव कम करने और मानसिक स्पष्टता बढ़ाने के लिए ध्यान का अभ्यास करें।",
      Telugu: "ఒత్తిడిని తగ్గించి మానసిక స్పష్టత కోసం ధ్యానం అభ్యసించండి.",
    },
    tips: {
      English: ["Start with 5 minutes", "Find a quiet place", "Focus on your breathing"],
      Hindi: ["5 मिनट से शुरू करें", "शांत स्थान चुनें", "अपनी सांस पर ध्यान दें"],
      Telugu: ["5 నిమిషాలతో ప్రారంభించండి", "నిశ్శబ్ద ప్రదేశం ఎంచుకోండి", "మీ శ్వాసపై దృష్టి పెట్టండి"],
    },
    expandedDetails: {
      English: "Mindfulness meditation involves focusing your attention on the present moment, accepting it without judgment. Over time, it rewires your brain to handle stress more effectively, leading to better focus, improved relationships, and overall emotional well-being.",
      Hindi: "माइंडफुलनेस मेडिटेशन में अपना ध्यान वर्तमान क्षण पर केंद्रित करना और उसे बिना किसी निर्णय के स्वीकार करना शामिल है। समय के साथ, यह तनाव को अधिक प्रभावी ढंग से नियंत्रित करता है।",
      Telugu: "మైండ్‌ఫుల్‌నెస్ ధ్యానంలో వస్తున్న క్షణంపై మీ దృష్టిని కేంద్రీకరించడం ఉంటుంది. కాలక్రమేణా, ఒత్తిడిని సమర్థవంతంగా నిర్వహించడానికి ఇది సహాయపడుతుంది.",
    },
    icon: "🧘",
  },
];

export function HealthTipsTab({ language = "English" }) {
  const [activeCategory, setActiveCategory] = useState("All");
  const [expandedId, setExpandedId] = useState(null);
  const normalizedLanguage = normalizeLanguage(language);
  const labels = healthTipsLabels[normalizedLanguage];

  const categories = [
    { key: "All", label: labels.allTips },
    { key: "General", label: labels.generalTips },
    { key: "Respiratory", label: labels.respiratoryTips },
    { key: "Digestive", label: labels.digestiveTips },
    { key: "Immunity", label: labels.immunityTips },
    { key: "Mental", label: labels.mentalHealthTips },
  ];

  const categoryLabels = {
    All: labels.allTips,
    General: labels.generalTips,
    Respiratory: labels.respiratoryTips,
    Digestive: labels.digestiveTips,
    Immunity: labels.immunityTips,
    Mental: labels.mentalHealthTips,
  };
  
  const filteredTips = activeCategory === "All" 
    ? healthTips 
    : healthTips.filter(tip => tip.category === activeCategory);

  const toggleExpand = (id) => {
    if (expandedId === id) {
      setExpandedId(null);
    } else {
      setExpandedId(id);
    }
  };

  return (
    <div className="health-tips-container">
      <h1 className="tab-title">{labels.title}</h1>

      <div className="category-filter">
        {categories.map((cat) => (
          <button
            key={cat.key}
            className={`category-button ${activeCategory === cat.key ? "active" : ""}`}
            onClick={() => {
              setActiveCategory(cat.key);
              setExpandedId(null);
            }}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <div className="tips-grid">
        {filteredTips.map((tip) => (
          <div key={tip.id} className="tip-card" style={{ height: expandedId === tip.id ? 'auto' : '' }}>
            <div className="tip-icon">{tip.icon}</div>
            <h3 className="tip-title">{tip.title[normalizedLanguage] || tip.title.English}</h3>
            <p className="tip-category">{categoryLabels[tip.category]}</p>
            <p className="tip-description">{tip.description[normalizedLanguage] || tip.description.English}</p>
            
            <ul className="tip-list">
              {(tip.tips[normalizedLanguage] || tip.tips.English).map((item, idx) => (
                <li key={idx}>✓ {item}</li>
              ))}
            </ul>

            {expandedId === tip.id && (
              <div className="expanded-details fade-in-up" style={{ marginTop: '16px', padding: '16px', background: 'var(--surface-200)', borderRadius: 'var(--radius-lg)', color: 'var(--text-secondary)' }}>
                <p style={{ margin: 0, lineHeight: '1.6', fontSize: '0.95rem' }}>
                    {tip.expandedDetails[normalizedLanguage] || tip.expandedDetails.English}
                </p>
              </div>
            )}

            <button 
              className={`expand-button-futuristic ${expandedId === tip.id ? 'expanded' : ''}`}
              onClick={() => toggleExpand(tip.id)}
            >
              <span className="btn-content">
                {expandedId === tip.id ? labels.readLess : labels.readMore}
              </span>
              <span className="btn-icon">↯</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
