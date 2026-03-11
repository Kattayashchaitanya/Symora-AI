import { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Image as ImageIcon, X } from "lucide-react";

const inputLabels = {
  English: {
    title: "Enter your symptoms",
    placeholder: "e.g. fever, headache, chest pain",
    languageLabel: "Language",
    analyzeButton: "Analyze",
    locating: "Locating region...",
    locationError: "Location access denied",
    locationFound: "Region Detected:",
  },
  Hindi: {
    title: "अपने लक्षण दर्ज करें",
    placeholder: "जैसे बुखार, सिरदर्द, सीने में दर्द",
    languageLabel: "भाषा",
    analyzeButton: "विश्लेषण करें",
    locating: "क्षेत्र का पता लगाया जा रहा है...",
    locationError: "स्थान पहुँच अस्वीकृत",
    locationFound: "क्षेत्र ज्ञात हुआ:",
  },
  Telugu: {
    title: "మీ లక్షణాలను నమోదు చేయండి",
    placeholder: "ఉ.దా. జ్వరం, తలనొప్పి, ఛాతి నొప్పి",
    languageLabel: "భాష",
    analyzeButton: "విశ్లేషించు",
    locating: "ప్రాంతాన్ని గుర్తిస్తోంది...",
    locationError: "స్థాన ప్రాప్యత నిరాకరించబడింది",
    locationFound: "ప్రాంతం కనుగొనబడింది:",
  },
};

function InputBox({ onSubmit, disabled, language = "English", onLanguageChange }) {
  const [symptoms, setSymptoms] = useState("");
  const [region, setRegion] = useState("");
  const [locating, setLocating] = useState(true);
  const [locationError, setLocationError] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [imageBase64, setImageBase64] = useState(null);
  const fileInputRef = useRef(null);
  const recognitionRef = useRef(null);
  const labels = inputLabels[language];

  // Auto-detect location on component mount
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocating(false);
      setLocationError(true);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          // Use OpenStreetMap Nominatim for free reverse geocoding
          const { latitude, longitude } = pos.coords;
          const mapRes = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=4&addressdetails=1`,
            {
              headers: {
                "User-Agent": "SymoraAI-App/2.0",
              },
            }
          );
          
          if (!mapRes.ok) throw new Error("Could not fetch location data");
          
          const mapData = await mapRes.json();
          // Extract the precise location
          const addr = mapData.address || {};
          const city = addr.city || addr.town || addr.village || addr.suburb || addr.city_district || "";
          const county = addr.county || "";
          const state = addr.state || "";
          
          let fullRegion = "";
          if (city) fullRegion += city;
          if (county && county !== city) fullRegion += (fullRegion ? ", " : "") + county;
          if (state) fullRegion += (fullRegion ? ", " : "") + state;
          
          // Append coordinates for absolute precision as requested
          const coordStr = `(${latitude.toFixed(4)}, ${longitude.toFixed(4)})`;
          if (fullRegion) {
            setRegion(`${fullRegion} ${coordStr}`);
          } else {
            setRegion(`Detected Location ${coordStr}`);
          }
          
          setLocating(false);
          setLocationError(false);
        } catch (e) {
          console.error("Geocoding failed:", e);
          // Fallback to raw coordinates if geocoding fails but GPS worked
          const { latitude, longitude } = pos.coords;
          setRegion(`GPS: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
          setLocating(false);
          setLocationError(false);
        }
      },
      (err) => {
        console.warn("Geolocation blocked or failed:", err);
        setLocating(false);
        setLocationError(true);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, []); // Run once on mount

  const handleSubmit = () => {
    const trimmedSymptoms = symptoms.trim();
    if ((!trimmedSymptoms && !imageBase64) || disabled) {
      return;
    }

    onSubmit({
      symptoms: trimmedSymptoms || "Analyzed from image",
      region, // Auto-detected region is passed here
      image: imageBase64, // Base64 image
    });
  };

  const handleLanguageChange = (e) => {
    onLanguageChange(e.target.value);
  };

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice input is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    
    // Map our app languages to BCP-47 tags
    let langCode = "en-US";
    if (language === "Hindi") langCode = "hi-IN";
    if (language === "Telugu") langCode = "te-IN";
    recognition.lang = langCode;

    recognition.onresult = (event) => {
      let finalTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript + " ";
        }
      }
      if (finalTranscript) {
        setSymptoms((prev) => (prev ? prev + " " + finalTranscript : finalTranscript));
      }
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error", event.error);
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognition.start();
    recognitionRef.current = recognition;
    setIsRecording(true);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("Image is too large. Please upload an image smaller than 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImageBase64(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const clearImage = () => {
    setImageBase64(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="input-section">
      <h2 className="section-title">{labels.title}</h2>
      <textarea
        rows="5"
        placeholder={labels.placeholder}
        value={symptoms}
        onChange={(e) => setSymptoms(e.target.value)}
        className="symptoms-textarea"
        disabled={disabled}
      />

      <div className="input-actions-bar">
        <button 
          className={`icon-button ${isRecording ? "recording" : ""}`} 
          onClick={toggleRecording}
          disabled={disabled}
          title="Voice Input"
        >
          {isRecording ? <MicOff size={20} /> : <Mic size={20} />}
        </button>
        
        <button 
          className="icon-button" 
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
          title="Upload Image"
        >
          <ImageIcon size={20} />
        </button>
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleImageUpload} 
          accept="image/*" 
          style={{ display: "none" }} 
        />
      </div>

      {imageBase64 && (
        <div className="image-preview-container">
          <img src={imageBase64} alt="Symptom preview" className="uploaded-image-preview" />
          <button className="clear-image-btn" onClick={clearImage}>
            <X size={16} />
          </button>
        </div>
      )}

      <div className="input-options-container">
        {/* Language Selection */}
        <div className="input-row">
          <label htmlFor="language" className="input-label">
            {labels.languageLabel}
          </label>
          <select
            id="language"
            value={language}
            onChange={handleLanguageChange}
            className="language-select modern-select"
            disabled={disabled}
          >
            <option value="English">English</option>
            <option value="Hindi">हिंदी</option>
            <option value="Telugu">తెలుగు</option>
          </select>
        </div>

        {/* Auto-Location Badge */}
        <div className="location-badge-container">
          {locating ? (
            <div className="location-badge loading">
              <span className="loc-icon spinner-icon">◌</span>
              {labels.locating}
            </div>
          ) : locationError ? (
            <div className="location-badge error">
              <span className="loc-icon">🚫</span>
              {labels.locationError}
            </div>
          ) : (
            <div className="location-badge success">
              <span className="loc-icon">📍</span>
              <span className="loc-prefix">{labels.locationFound}</span>
              <strong className="loc-value">{region}</strong>
            </div>
          )}
        </div>
      </div>

      <button
        onClick={handleSubmit}
        className="analyze-button neon-button"
        disabled={disabled || (!symptoms.trim() && !imageBase64)}
      >
        <span className="btn-glow"></span>
        <span className="btn-text">{labels.analyzeButton}</span>
      </button>
    </div>
  );
}

export default InputBox;