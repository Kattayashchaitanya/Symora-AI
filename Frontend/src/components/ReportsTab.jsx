import { useState, useRef } from "react";
import * as pdfjsLib from "pdfjs-dist";
import PdfWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import { jsPDF } from "jspdf";

import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from "recharts";

// Load worker from the installed pdfjs-dist package using Vite's ?url import
// This guarantees the worker version always matches the library version
pdfjsLib.GlobalWorkerOptions.workerSrc = PdfWorker;


const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const labelsMap = {
  English: {
    title: "Reports Scanner",
    description: "Upload a medical report (Image or PDF) to instantly extract and visualize key health metrics using AI.",
    dragDropText: "Drag & Drop your report (Image/PDF) here",
    orClickToBrowse: "or click to browse files",
    analyzing: "Scanning & analyzing document...",
    error: "Failed to analyze document. Please try again.",
    noData: "Upload a report to see visualizations.",
    vitalSigns: "Vital Signs Overview",
    bloodTest: "Blood Test Breakdown",
    overallHealth: "Health Index (Radar)",
    generateSample: "✨ Generate Sample Report (PDF)",
    processing: "Processing report..."
  },
  Hindi: {
    title: "रिपोर्ट स्कैनर",
    description: "AI का उपयोग करके प्रमुख स्वास्थ्य मैट्रिक्स निकालने और विज़ुअलाइज़ करने के लिए मेडिकल रिपोर्ट (छवि या पीडीएफ) अपलोड करें।",
    dragDropText: "अपनी रिपोर्ट (छवि/पीडीएफ) यहां खींचें और छोड़ें",
    orClickToBrowse: "या फ़ाइलें ब्राउज़ करने के लिए क्लिक करें",
    analyzing: "दस्तावेज़ को स्कैन और विश्लेषित किया जा रहा है...",
    error: "दस्तावेज़ का विश्लेषण करने में विफल। कृपया पुन: प्रयास करें।",
    noData: "विज़ुअलाइज़ेशन देखने के लिए एक रिपोर्ट अपलोड करें।",
    vitalSigns: "महत्वपूर्ण संकेत अवलोकन",
    bloodTest: "रक्त परीक्षण ब्रेकडाउन",
    overallHealth: "स्वास्थ्य सूचకాంక (రడార్)",
    generateSample: "✨ नमूना रिपोर्ट उत्पन्न करें (PDF)",
    processing: "रिपोर्ट संसाधित की जा रही है..."
  },
  Telugu: {
    title: "రిపోర్ట్స్ స్కానర్",
    description: "AIని ఉపయోగించి కీలక ఆరోగ్య కొలమానాలను సేకరించి, దృశ్యీకరించడానికి వైద్య నివేదిక (చిత్రం లేదా PDF)ను అప్‌లోడ్ చేయండి.",
    dragDropText: "మీ నివేదిక (చిత్రం/PDF)ను ఇక్కడ లాగండి మరియు వదలండి",
    orClickToBrowse: "లేదా ఫైల్‌లను బ్రౌజ్ చేయడానికి క్లిక్ చేయండి",
    analyzing: "పత్రం స్కాన్ చేయబడుతోంది మరియు విశ్లేషించబడుతోంది...",
    error: "పత్రాన్ని విశ్లేషించడం విఫలమైంది. దయచేసి మళ్లీ ప్రయత్నించండి.",
    noData: "దృశ్యీకరణలను చూడటానికి ఒక నివేదికను అప్‌లోడ్ చేయండి.",
    vitalSigns: "ప్రాణ సమాచారం అవలోకనం",
    bloodTest: "రక్త పరీక్ష విచ్ఛిన్నం",
    overallHealth: "ఆరోగ్య సూచిక (రాడార్)",
  },
};

const COLORS = ["#00C49F", "#FFBB28", "#FF8042", "#0088FE", "#ef4444", "#8b5cf6"];

export function ReportsTab({ language = "English" }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [metrics, setMetrics] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = useRef(null);

  const labels = labelsMap[language];

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  // Compress/resize an image data URL to keep under 4MB before sending to API
  const compressImage = (dataUrl, maxSizePx = 1024) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const scale = Math.min(1, maxSizePx / Math.max(img.width, img.height));
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.8));
      };
      img.src = dataUrl;
    });
  };

  const convertPdfToImage = async (file) => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) });
      const pdf = await loadingTask.promise;
      const page = await pdf.getPage(1);
      const viewport = page.getViewport({ scale: 1.5 });

      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      await page.render({ canvasContext: context, viewport }).promise;
      const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
      return dataUrl;
    } catch (err) {
      console.error("PDF Conversion Error:", err);
      throw new Error("PDF conversion failed. Error: " + err.message);
    }
  };

  const generateSamplePdf = () => {
    const doc = new jsPDF();
    
    // Generate random realistic vitals
    const hr = Math.floor(Math.random() * (100 - 60 + 1) + 60);
    const sys = Math.floor(Math.random() * (135 - 110 + 1) + 110);
    const dia = Math.floor(Math.random() * (85 - 65 + 1) + 65);
    const o2 = Math.floor(Math.random() * (100 - 95 + 1) + 95);
    const temp = (Math.random() * (99.1 - 97.5) + 97.5).toFixed(1);

    const glucose = Math.floor(Math.random() * (110 - 80 + 1) + 80);
    const chol = Math.floor(Math.random() * (220 - 150 + 1) + 150);
    const hemo = (Math.random() * (16.0 - 13.0) + 13.0).toFixed(1);
    const wbc = Math.floor(Math.random() * (9500 - 4500 + 1) + 4500);

    // Header
    doc.setFontSize(22);
    doc.setTextColor(0, 0, 255);
    doc.text("City Hospital - Medical Report", 20, 20);
    
    // Patient Info
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text("Patient Name: John Doe", 20, 40);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 50);
    doc.text(`Report ID: AR-${Math.floor(Math.random() * 90000) + 10000}`, 20, 60);
    
    // Vitals Section
    doc.setFontSize(16);
    doc.text("Vital Signs", 20, 80);
    doc.setFontSize(12);
    doc.text(`Heart Rate: ${hr} bpm`, 30, 90);
    doc.text(`Blood Pressure: ${sys}/${dia} mmHg`, 30, 100);
    doc.text(`Oxygen Level: ${o2}%`, 30, 110);
    doc.text(`Temperature: ${temp} F`, 30, 120);
    
    // Lab Results
    doc.setFontSize(16);
    doc.text("Laboratory Findings", 20, 140);
    doc.setFontSize(12);
    doc.text(`Glucose (Fasting): ${glucose} mg/dL`, 30, 150);
    doc.text(`Total Cholesterol: ${chol} mg/dL`, 30, 160);
    doc.text(`Hemoglobin: ${hemo} g/dL`, 30, 170);
    doc.text(`WBC Count: ${wbc.toLocaleString()} /uL`, 30, 180);

    // Summary
    doc.setFontSize(14);
    doc.text("Consultant's Note:", 20, 200);
    doc.setFontSize(11);
    doc.text("Parameters appear within standard physiological variance. Regular exercise and", 20, 210);
    doc.text("balanced diet recommended for maintaining health index.", 20, 220);
    
    const blob = doc.output("blob");
    const file = new File([blob], "sample_report.pdf", { type: "application/pdf" });
    handleFile(file);
  };

  const handleFile = async (file) => {
    setError("");
    setLoading(true);
    setMetrics(null);
    console.log("Processing file:", file.name, file.type);
    
    try {
      let base64Str = "";
      if (file.type === "application/pdf") {
        console.log("Converting PDF...");
        base64Str = await convertPdfToImage(file);
        console.log("PDF converted, size:", Math.round(base64Str.length / 1024), "KB");
      } else if (file.type.startsWith("image/")) {
        console.log("Reading image...");
        const rawBase64 = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target.result);
          reader.onerror = () => reject(new Error("File reading failed"));
          reader.readAsDataURL(file);
        });
        // Compress to keep under API limits
        base64Str = await compressImage(rawBase64, 1200);
        console.log("Image compressed, size:", Math.round(base64Str.length / 1024), "KB");
      } else {
        throw new Error("Unsupported file type. Please upload Image or PDF.");
      }

      setPreviewUrl(base64Str);
      console.log("Starting analysis...");
      await analyzeReport(base64Str);
    } catch (err) {
      console.error("Handle File Error:", err);
      setError(err.message || labels.error);
      setLoading(false);
    }
  };

  const analyzeReport = async (base64Image) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/reports/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: base64Image, language }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to analyze report");
      }

      const data = await res.json();
      console.log("Analysis Result:", data);
      if (data.metrics) {
        setMetrics(data.metrics);
        
        // Save to history using user token
        const token = localStorage.getItem('symoraai_token');
        if (token) {
          fetch(`${API_BASE_URL}/api/auth/history`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ type: 'report', data: { result: data } })
          }).catch(err => console.error("History save failed:", err));
        }
      } else {
        throw new Error("Unexpected response format from server");
      }
    } catch (err) {
      console.error("Analyze Report API Error:", err);
      setError(err.message || labels.error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reports-container fade-in-up">
      <h1 className="tab-title">{labels.title}</h1>
      

      {/* Sample Generator */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
        <button 
          onClick={generateSamplePdf}
          className="neon-button"
          style={{ 
            padding: '12px 24px', 
            borderRadius: 'var(--radius-lg)',
            fontSize: '1rem',
            background: 'rgba(139, 92, 246, 0.1)',
            border: '1px solid var(--primary-color)',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
          disabled={loading}
        >
          {labels.generateSample}
        </button>
      </div>

      {/* Upload Zone */}
      <div 
        className="upload-zone glass-card"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current.click()}
        style={{
          padding: "40px",
          textAlign: "center",
          border: "2px dashed rgba(255, 255, 255, 0.2)",
          cursor: "pointer",
          marginBottom: "32px",
          transition: "all 0.3s ease"
        }}
      >
        <span style={{ fontSize: "3rem", display: "block", marginBottom: "16px" }}>📄</span>
        <input 
          type="file" 
          ref={fileInputRef} 
          style={{ display: "none" }} 
          accept="image/*,application/pdf" 
          onChange={handleFileChange}
        />
        <h3 style={{ margin: "0 0 8px 0" }}>{labels.dragDropText}</h3>
        <p style={{ margin: "0", color: "var(--text-secondary)" }}>{labels.orClickToBrowse}</p>
      </div>

      {loading && (
        <div className="loading-state glass-card slide-up" style={{ padding: "20px", textAlign: "center", marginBottom: "32px" }}>
           <span className="spinner-icon" style={{display: 'inline-block', marginRight: '10px'}}>◌</span>
           {labels.analyzing}
        </div>
      )}

      {error && (
        <div className="error-banner slide-up" style={{ marginBottom: "32px" }}>
          <span className="error-icon">⚠️</span>
          <p>{error}</p>
        </div>
      )}

      {/* Visualizations */}
      {metrics && !loading && (
        <div className="dashboard-grid fade-in-up">
          {/* Radial/Pie Chart for Blood or Component Breakdown */}
          {metrics.components && metrics.components.length > 0 && (
             <div className="chart-container glass-card">
               <h2>{labels.bloodTest}</h2>
               <ResponsiveContainer width="100%" height={300}>
                 <PieChart>
                   <Pie
                     data={metrics.components}
                     cx="50%"
                     cy="50%"
                     labelLine={false}
                     label={({ name, value }) => `${name}: ${value}`}
                     outerRadius={100}
                     fill="#8884d8"
                     dataKey="value"
                   >
                     {metrics.components.map((entry, index) => (
                       <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                     ))}
                   </Pie>
                   <Tooltip contentStyle={{background: "var(--surface-color)", border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)"}} />
                 </PieChart>
               </ResponsiveContainer>
             </div>
          )}

          {/* Bar Chart for Vitals or Absolute Measurements */}
          {metrics.vitals && metrics.vitals.length > 0 && (
            <div className="chart-container glass-card">
              <h2>{labels.vitalSigns}</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={metrics.vitals} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="name" stroke="var(--text-secondary)" />
                  <YAxis stroke="var(--text-secondary)" />
                  <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{background: "var(--surface-color)", border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)"}} />
                  <Legend />
                  <Bar dataKey="value" fill="#3b82f6" name="Measurement" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Radar Chart for Overall Health Distribution */}
          {metrics.healthIndex && metrics.healthIndex.length > 0 && (
             <div className="chart-container glass-card" style={{ gridColumn: '1 / -1' }}>
               <h2>{labels.overallHealth}</h2>
               <ResponsiveContainer width="100%" height={400}>
                 <RadarChart cx="50%" cy="50%" outerRadius="80%" data={metrics.healthIndex}>
                   <PolarGrid stroke="rgba(255,255,255,0.1)" />
                   <PolarAngleAxis dataKey="subject" stroke="var(--text-primary)" />
                   <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="var(--text-secondary)" />
                   <Radar name="Score" dataKey="A" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.5} />
                   <Tooltip contentStyle={{background: "var(--surface-color)", border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)"}} />
                 </RadarChart>
               </ResponsiveContainer>
             </div>
          )}
        </div>
      )}

      {!metrics && !loading && !error && (
         <div className="empty-state glass-card" style={{textAlign: "center", padding: "40px", color: "var(--text-secondary)"}}>
           {labels.noData}
         </div>
      )}
    </div>
  );
}
