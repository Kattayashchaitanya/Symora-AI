import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import InputBox from "./components/InputBox";
import ResultCard from "./components/ResultCard";
import { ReportsTab } from "./components/ReportsTab";
import { HospitalsTab } from "./components/HospitalsTab";
import { HealthTipsTab } from "./components/HealthTipsTab";
import { EmergencyAlert } from "./components/EmergencyAlert";
import { RiskVisualization } from "./components/RiskVisualization";
import { LoadingSpinner } from "./components/LoadingSpinner";
import { useOfflineMode } from "./hooks/useOffline";
import { AIChatTab } from "./components/AIChatTab";
import { AuthPage } from "./components/AuthPage";
import { HistoryTab } from "./components/HistoryTab";
import { LogOut, Activity } from "lucide-react";
import "./App.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const translations = {
  English: {
    title: "Symora AI",
    subtitle: "Enter symptoms to get AI-powered triage guidance.",
    analyzing: "Analyzing...",
    disclaimer:
      "This is not a medical diagnosis tool. Please consult a doctor.",
    triageTab: "Triage",
    dashboardTab: "Reports Scanner",
    hospitalsTab: "Hospitals",
    healthTipsTab: "Health Tips",
    aiChatTab: "AI Assistant",
    offline: "🔴 You are offline - Limited functionality available",
    online: "🟢 Online - Full functionality available",
  },
  Hindi: {
    title: "Symora AI",
    subtitle: "एआई-संचालित ट्रिएज सहायता पाने के लिए लक्षण दर्ज करें।",
    analyzing: "विश्लेषण जारी है...",
    disclaimer:
      "यह एक चिकित्सा निदान उपकरण नहीं है। कृपया डॉक्टर से सलाह लें।",
    triageTab: "ट्रिएज",
    dashboardTab: "रिपोर्ट स्कैनर",
    hospitalsTab: "अस्पताल",
    healthTipsTab: "स्वास्थ्य सुझाव",
    aiChatTab: "एआई सहायक",
    offline: "🔴 आप ऑफलाइन हैं - सीमित कार्यक्षमता उपलब्ध है",
    online: "🟢 ऑनलाइन - पूर्ण कार्यक्षमता उपलब्ध है",
  },
  Telugu: {
    title: "Symora AI",
    subtitle:
      "AI-ఆధారిత ట్రిేజ్ సూచనను పొందడానికి లక్షణాలను నమోదు చేయండి.",
    analyzing: "విశ్లేషించబడుతోంది...",
    disclaimer:
      "ఇది వైద్య నిర్ధారణ సాధనం కాదు. దయచేసి డాక్టర్‌ను సంప్రదించండి.",
    triageTab: "ట్రిేజ్",
    dashboardTab: "రిపోర్ట్స్ స్కానర్",
    hospitalsTab: "ఆసుపత్రులు",
    healthTipsTab: "ఆరోగ్య సూచనలు",
    aiChatTab: "AI సహాయకుడు",
    offline: "🔴 మీరు ఆఫ్‌లైన్‌లో ఉన్నారు - సీమిత విధులు లభ్యం",
    online: "🟢 ఆన్‌లైన్ - పూర్ణ విధులు లభ్యం",
  },
};

function MainDashboard({ user, onLogout }) {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [language, setLanguage] = useState("English");
  const [view, setView] = useState("triage");
  
  // Theme Management
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem("symoraai_theme");
    return saved ? saved : "dark"; // Default to dark neon
  });

  const isOnline = useOfflineMode();
  const t = translations[language];

  // Apply theme class to root
  useEffect(() => {
    if (theme === "light") {
      document.body.classList.add("light-mode");
    } else {
      document.body.classList.remove("light-mode");
    }
    localStorage.setItem("symoraai_theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === "dark" ? "light" : "dark");
  };

  // Register service worker for offline mode
  useEffect(() => {
    if (!("serviceWorker" in navigator)) {
      return;
    }

    if (import.meta.env.PROD) {
      navigator.serviceWorker
        .register("/sw.js")
        .then(() => console.log("Service Worker registered"))
        .catch((err) => console.log("Service Worker registration failed:", err));
      return;
    }

    navigator.serviceWorker
      .getRegistrations()
      .then((registrations) => Promise.all(registrations.map((registration) => registration.unregister())))
      .then(() => caches.keys())
      .then((keys) => Promise.all(keys.map((key) => caches.delete(key))))
      .catch((err) => console.log("Service Worker cleanup failed:", err));
  }, []);

  const analyzeSymptoms = async ({ symptoms, region }) => {
    if (!isOnline) {
      const errMsg =
        language === "Hindi"
          ? "ऑफलाइन मोड में विश्लेषण उपलब्ध नहीं है।"
          : language === "Telugu"
          ? "ఆఫ్‌లైన్ మోడ్‌లో విశ్లేషణ అందుబాటులో లేదు."
          : "Analysis not available in offline mode.";
      setError(errMsg);
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch(`${API_BASE_URL}/api/triage`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ symptoms, language, region }),
      });

      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        const errorMsg =
          language === "Hindi"
            ? "इस समय लक्षणों का विश्लेषण नहीं किया जा सका।"
            : language === "Telugu"
            ? "ఇప్పుడు లక్షణాలను విశ్లేషించడం సాధ్యం కాలేదు."
            : "Unable to analyze symptoms right now.";
        throw new Error(payload.error || errorMsg);
      }

      const data = await res.json();
      setResult(data);
    } catch (error) {
      const errMsg =
        language === "Hindi"
          ? "कुछ गलत हुआ। कृपया फिर से प्रयास करें।"
          : language === "Telugu"
          ? "ఏదో తప్పు జరిగింది. దయచేసి మళ్లీ ప్రయత్నించండి."
          : "Something went wrong. Please try again.";
      setError(error.message || errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-layout">
      {/* Desktop Sidebar */}
      <nav className="sidebar">
        <div className="sidebar-header">
          <div className="logo-container">
            <div className="logo-icon-bg">
              <span className="logo-icon">🏥</span>
            </div>
            <h1 className="app-brand">Symora AI</h1>
          </div>
          <p className="app-brand-subtitle">Welcome, {user?.username}</p>
        </div>

        <div className="sidebar-nav">
          <button className={`nav-item ${view === "triage" ? "active" : ""}`} onClick={() => setView("triage")}>
            <span className="nav-icon">🩺</span>
            <span className="nav-text">{t.triageTab}</span>
          </button>
          
          <button className={`nav-item ai-chat-nav ${view === "aichat" ? "active" : ""}`} onClick={() => setView("aichat")}>
            <span className="nav-icon">🤖</span>
            <span className="nav-text">{t.aiChatTab}</span>
          </button>

          <button className={`nav-item ${view === "reports" ? "active" : ""}`} onClick={() => setView("reports")}>
            <span className="nav-icon">📋</span>
            <span className="nav-text">{t.dashboardTab}</span>
          </button>
          <button className={`nav-item ${view === "hospitals" ? "active" : ""}`} onClick={() => setView("hospitals")}>
            <span className="nav-icon">📍</span>
            <span className="nav-text">{t.hospitalsTab}</span>
          </button>
          <button className={`nav-item ${view === "health-tips" ? "active" : ""}`} onClick={() => setView("health-tips")}>
            <span className="nav-icon">💡</span>
            <span className="nav-text">{t.healthTipsTab}</span>
          </button>
          <button className={`nav-item ${view === "history" ? "active" : ""}`} onClick={() => setView("history")}>
            <span className="nav-icon">🕒</span>
            <span className="nav-text">History</span>
          </button>
        </div>

        <div className="sidebar-footer">
          <button className="theme-toggle-btn" onClick={toggleTheme} aria-label="Toggle Theme">
             {theme === "dark" ? "☀️ Light Mode" : "🌙 Dark Mode"}
          </button>
          
          <button className="nav-item logout-sidebar-btn" onClick={onLogout} style={{ marginTop: '12px', color: '#ff6b6b', background: 'rgba(255,107,107,0.1)' }}>
            <span className="nav-icon"><LogOut size={18}/></span>
            <span className="nav-text">Logout</span>
          </button>

          <div className={`status-pill ${isOnline ? "online" : "offline"}`} style={{ marginTop: '16px' }}>
            <div className="status-dot"></div>
            <span>{isOnline ? "System Online" : "Offline Mode"}</span>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="main-content">
        {/* Mobile Top Header */}
        <header className="mobile-header">
          <div className="logo-container">
            <span className="logo-icon">🏥</span>
            <h1 className="app-brand">Symora AI</h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
             <button className="theme-toggle-btn-mobile" onClick={toggleTheme} aria-label="Toggle Theme">
                 {theme === "dark" ? "☀️" : "🌙"}
             </button>
             <div className={`status-dot-only ${isOnline ? "online" : "offline"}`} title={isOnline ? "Online" : "Offline"}></div>
          </div>
        </header>

        <div className="content-scroll-area">
          <div className="content-container">
            {/* Triage View */}
            {view === "triage" && (
              <div className="fade-in-up">
                <div className="view-header">
                  <h2>{t.triageTab}</h2>
                  <p>{t.subtitle}</p>
                </div>
                
                {/* Emergency Alert if HIGH risk */}
                {result?.risk && <EmergencyAlert risk={result.risk} language={language} />}

                <div className="glass-card triage-card">
                  <InputBox
                    onSubmit={analyzeSymptoms}
                    disabled={loading || !isOnline}
                    language={language}
                    onLanguageChange={setLanguage}
                  />

                  {loading && <LoadingSpinner message={t.analyzing} />}
                  {error && <div className="error-banner"><span className="error-icon">⚠️</span><p>{error}</p></div>}
                </div>

                {/* Risk Visualization */}
                {result?.risk && (
                  <div className="results-section slide-up">
                    <RiskVisualization risk={result.risk} language={language} />
                    <ResultCard result={result} language={language} />
                  </div>
                )}
              </div>
            )}

            {/* AI Chat View */}
            {view === "aichat" && (
              <div className="fade-in-up">
                <AIChatTab language={language} />
              </div>
            )}

            {/* Reports Scanner View */}
            {view === "reports" && (
              <div className="fade-in-up">
                <ReportsTab language={language} />
              </div>
            )}

            {/* Hospitals View */}
            {view === "hospitals" && (
              <div className="fade-in-up">
                <HospitalsTab language={language} />
              </div>
            )}

            {/* Health Tips View */}
            {view === "health-tips" && (
              <div className="fade-in-up">
                <HealthTipsTab language={language} />
              </div>
            )}

            {/* History View */}
            {view === "history" && (
              <div className="fade-in-up">
                <HistoryTab language={language} />
              </div>
            )}

            <div className="footer-disclaimer">
              <p>{t.disclaimer}</p>
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="mobile-bottom-nav">
        <button className={`bottom-nav-item ${view === "triage" ? "active" : ""}`} onClick={() => setView("triage")}>
          <span className="nav-icon">🩺</span>
          <span className="nav-text">{t.triageTab}</span>
        </button>
        <button className={`bottom-nav-item ai-chat-nav ${view === "aichat" ? "active" : ""}`} onClick={() => setView("aichat")}>
          <span className="nav-icon">🤖</span>
          <span className="nav-text">{t.aiChatTab}</span>
        </button>
        <button className={`bottom-nav-item ${view === "reports" ? "active" : ""}`} onClick={() => setView("reports")}>
          <span className="nav-icon">📋</span>
          <span className="nav-text">{t.dashboardTab}</span>
        </button>
        <button className={`bottom-nav-item ${view === "hospitals" ? "active" : ""}`} onClick={() => setView("hospitals")}>
          <span className="nav-icon">📍</span>
          <span className="nav-text">{t.hospitalsTab}</span>
        </button>
        <button className={`bottom-nav-item ${view === "history" ? "active" : ""}`} onClick={() => setView("history")}>
          <span className="nav-icon">🕒</span>
          <span className="nav-text">History</span>
        </button>
      </nav>
    </div>
  );
}

// Router and Auth Wrapper
export default function App() {
  const [user, setUser] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    // Check if logged in already
    const storedUser = localStorage.getItem('symoraai_user');
    const token = localStorage.getItem('symoraai_token');
    
    if (storedUser && token) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem('symoraai_user');
        localStorage.removeItem('symoraai_token');
      }
    }
    setIsInitializing(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('symoraai_user');
    localStorage.removeItem('symoraai_token');
    setUser(null);
  };

  if (isInitializing) return <div className="loading-screen">Loading Medical API...</div>;

  return (
    <Router>
      <Routes>
        <Route 
          path="/" 
          element={user ? <Navigate to="/dashboard" /> : <AuthPage onLogin={setUser} />} 
        />
        <Route 
          path="/dashboard" 
          element={
            user ? 
              <MainDashboard user={user} onLogout={handleLogout} /> : 
              <Navigate to="/" />
          } 
        />
      </Routes>
    </Router>
  );
}
