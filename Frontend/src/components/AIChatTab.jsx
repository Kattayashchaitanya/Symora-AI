import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const chatLabels = {
  English: {
    title: "AI Medical Companion",
    subtitle: "Ask me anything about health, symptoms, or general wellness.",
    inputPlaceholder: "Type your message here...",
    sendButton: "Send",
    loading: "AI is typing...",
    error: "Failed to get response. Try again.",
    welcome: "Hello! I am your AI health assistant. How can I help you today?",
  },
  Hindi: {
    title: "एआई मेडिकल साथी",
    subtitle: "स्वास्थ्य, लक्षणों या सामान्य कल्याण के बारे में मुझसे कुछ भी पूछें।",
    inputPlaceholder: "अपना संदेश यहाँ टाइप करें...",
    sendButton: "भेजें",
    loading: "एआई टाइप कर रहा है...",
    error: "प्रतिक्रिया प्राप्त करने में विफल। पुनः प्रयास करें।",
    welcome: "नमस्ते! मैं आपका एआई स्वास्थ्य सहायक हूं। आज मैं आपकी कैसे मदद कर सकता हू?",
  },
  Telugu: {
    title: "AI మెడికల్ కంపానియన్",
    subtitle: "ఆరోగ్యం, లక్షణాలు లేదా సాధారణ ఆరోగ్యం గురించి నన్ను ఏదైనా అడగండి.",
    inputPlaceholder: "మీ సందేశాన్ని ఇక్కడ టైప్ చేయండి...",
    sendButton: "పంపు",
    loading: "AI టైప్ చేస్తోంది...",
    error: "ప్రతిస్పందనను పొందడంలో విఫలమైంది. మళ్లీ ప్రయత్నించండి.",
    welcome: "నమస్కారం! నేను మీ AI ఆరోగ్య సహాయకుడిని. ఈ రోజు నేను మీకు ఎలా సహాయపడగలను?",
  },
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export function AIChatTab({ language = "English" }) {
  const labels = chatLabels[language];
  const [messages, setMessages] = useState([
    { role: "assistant", content: labels.welcome },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setIsLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg, language }),
      });

      if (!res.ok) throw new Error("API Error");
      const data = await res.json();
      
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [...prev, { role: "error", content: labels.error }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chat-container">
      <div className="view-header" style={{ marginBottom: "20px" }}>
        <h2>{labels.title}</h2>
        
      </div>

      <div className="chat-window glass-card">
        <div className="chat-messages">
          {messages.map((msg, index) => (
            <div key={index} className={`chat-bubble-wrapper ${msg.role}`}>
              <div className={`chat-bubble-container ${msg.role}`}>
                {msg.role === "assistant" && <span className="chat-icon">🤖</span>}
                {msg.role === "user" && <span className="chat-icon">🧑</span>}
                <div className={`chat-bubble ${msg.role}`}>
                  <div className="chat-content markdown-body">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="chat-bubble-wrapper assistant">
              <div className="chat-bubble-container assistant">
                 <span className="chat-icon">🤖</span>
                 <div className="chat-bubble assistant loading-bubble">
                   <span className="dot"></span>
                   <span className="dot"></span>
                   <span className="dot"></span>
                 </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="chat-input-area">
          <input
            type="text"
            className="chat-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder={labels.inputPlaceholder}
            disabled={isLoading}
          />
          <button
            className="chat-send-btn neon-button"
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
          >
            {labels.sendButton}
          </button>
        </div>
      </div>
    </div>
  );
}
