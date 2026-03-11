import { useState, useEffect } from 'react';
import { Clock, Download, ChevronRight, Activity, List } from 'lucide-react';
import { jsPDF } from "jspdf";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export function HistoryTab({ language }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'analytics'
  const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

  useEffect(() => {
    const fetchHistory = async () => {
      const token = localStorage.getItem('symoraai_token');
      if (!token) {
        setError("User not authenticated.");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${API_URL}/api/auth/history`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error("Failed to load history");
        const data = await res.json();
        setHistory(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [API_URL]);

  if (loading) return <div className="loading-state">Loading your history...</div>;
  if (error) return <div className="error-banner">⚠️ {error}</div>;
  if (history.length === 0) return (
    <div className="empty-state glass-card">
      <Clock size={48} opacity={0.5} />
      <h3>No History Yet</h3>
      <p>Your past triage analysis and medical reports will appear here.</p>
    </div>
  );

  const handleDownloadPDF = (record) => {
    const doc = new jsPDF();
    
    doc.setFontSize(22);
    doc.setTextColor(0, 0, 255);
    doc.text("Symora AI - Historical Record", 20, 20);
    
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    const dateStr = new Date(record.createdAt).toLocaleString();
    doc.text(`Record Date: ${dateStr}`, 20, 35);
    doc.text(`Type: ${record.type.toUpperCase()}`, 20, 45);
    
    let yPos = 65;
    
    if (record.type === 'report' && record.data?.result?.metrics) {
      const metrics = record.data.result.metrics;
      
      if (metrics.vitals && metrics.vitals.length > 0) {
        doc.setFontSize(16);
        doc.text("Vital Signs", 20, yPos);
        yPos += 10;
        doc.setFontSize(12);
        metrics.vitals.forEach(v => {
          doc.text(`${v.name}: ${v.value} ${v.unit}`, 30, yPos);
          yPos += 10;
        });
        yPos += 10;
      }

      if (metrics.labs && metrics.labs.length > 0) {
        doc.setFontSize(16);
        doc.text("Laboratory Findings", 20, yPos);
        yPos += 10;
        doc.setFontSize(12);
        metrics.labs.forEach(l => {
          doc.text(`${l.name}: ${l.value} ${l.unit}`, 30, yPos);
          yPos += 10;
          if (yPos > 270) {
            doc.addPage();
            yPos = 20;
          }
        });
      }
    } else if (record.type === 'triage') {
      doc.setFontSize(14);
      doc.text("Symptoms:", 20, yPos);
      yPos += 10;
      doc.setFontSize(12);
      
      const splitSymptoms = doc.splitTextToSize(record.data.symptoms, 170);
      doc.text(splitSymptoms, 20, yPos);
      yPos += splitSymptoms.length * 7 + 10;

      doc.setFontSize(14);
      doc.text("Analysis Result:", 20, yPos);
      yPos += 10;
      doc.setFontSize(12);
      doc.text(`Condition: ${record.data.result?.condition || 'Unknown'}`, 20, yPos);
      yPos += 10;
      doc.text(`Risk Level: ${record.data.result?.risk || 'Unknown'}`, 20, yPos);
    }

    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text("This is an automatically generated history record from Symora AI.", 20, 280);

    doc.save(`SymoraAI_${record.type}_${new Date(record.createdAt).getTime()}.pdf`);
  };

  const getChartData = () => {
    // Filter to reports that have numeric vitals
    const reportRecords = history
      .filter(h => h.type === 'report' && h.data?.result?.metrics?.vitals)
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

    return reportRecords.map(record => {
      const vitals = record.data.result.metrics.vitals;
      
      const hrObj = vitals.find(v => v.name.toLowerCase().includes('heart'));
      const hrMatch = hrObj ? String(hrObj.value).match(/\d+/) : null;
      const hr = hrMatch ? parseInt(hrMatch[0], 10) : null;

      const bpObj = vitals.find(v => v.name.toLowerCase().includes('blood') || v.name.toLowerCase().includes('bp'));
      let sys = null, dia = null;
      if (bpObj) {
         const match = String(bpObj.value).match(/(\d+)\/(\d+)/);
         if (match) {
             sys = parseInt(match[1], 10);
             dia = parseInt(match[2], 10);
         } else {
             const sysMatch = String(bpObj.value).match(/\d+/);
             if (sysMatch) sys = parseInt(sysMatch[0], 10);
         }
      }

      const dateObj = new Date(record.createdAt);
      return {
        date: dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        fullDate: dateObj.toLocaleString(),
        heartRate: hr,
        systolic: sys,
        diastolic: dia
      };
    }).filter(d => d.heartRate !== null || d.systolic !== null);
  };

  const chartData = getChartData();

  return (
    <div className="history-container">
      <div className="history-header-global">
        <h2 className="history-title">Medical History</h2>
        
        <div className="view-toggle-container">
          <button 
            className={`view-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
          >
            <List size={18} /> List
          </button>
          <button 
            className={`view-toggle-btn ${viewMode === 'analytics' ? 'active' : ''}`}
            onClick={() => setViewMode('analytics')}
          >
            <Activity size={18} /> Analytics
          </button>
        </div>
      </div>

      {viewMode === 'analytics' ? (
        <div className="history-analytics-view fade-in-up">
          <div className="glass-card analytics-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <h3 style={{ margin: '0 0 20px 0', color: 'var(--text-color)', textAlign: 'center' }}>Vitals Trend Over Time</h3>
            
            {chartData.length >= 2 ? (
              <div className="chart-wrapper" style={{ height: '350px', width: '100%', display: 'flex', justifyContent: 'center' }}>
                <ResponsiveContainer width="95%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorSys" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorDia" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorHr" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="date" stroke="var(--text-muted)" tick={{ fill: 'var(--text-muted)' }} />
                    <YAxis stroke="var(--text-muted)" tick={{ fill: 'var(--text-muted)' }} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid var(--border-color)', borderRadius: '8px' }}
                      itemStyle={{ color: '#fff' }}
                      labelStyle={{ color: 'var(--text-muted)', marginBottom: '5px' }}
                    />
                    <Legend verticalAlign="top" height={36} />
                    <Area type="monotone" dataKey="systolic" name="Systolic BP" stroke="#ef4444" fillOpacity={1} fill="url(#colorSys)" />
                    <Area type="monotone" dataKey="diastolic" name="Diastolic BP" stroke="#3b82f6" fillOpacity={1} fill="url(#colorDia)" />
                    <Area type="monotone" dataKey="heartRate" name="Heart Rate" stroke="#10b981" fillOpacity={1} fill="url(#colorHr)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="empty-chart-state" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                <Activity size={48} opacity={0.3} style={{ marginBottom: '15px' }} />
                <p>Not enough report data to generate trends.</p>
                <span style={{ fontSize: '0.85rem' }}>Upload at least 2 reports in the Scanner tab to see your analytics.</span>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="history-list">
          {history.map((record) => (
            <div key={record.id} className="history-card glass-card fade-in-up">
              <div className="history-card-header">
                <div className="history-header-left" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <span className={`history-type badge-${record.type}`}>
                    {record.type.toUpperCase()}
                  </span>
                  <span className="history-date">
                    {new Date(record.createdAt).toLocaleDateString()} at {new Date(record.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </span>
                </div>
                <button 
                  className="download-btn-small" 
                  onClick={() => handleDownloadPDF(record)}
                  title="Download Record PDF"
                >
                  <Download size={14} /> <span>PDF</span>
                </button>
              </div>
              
              <div className="history-card-body">
              {record.type === 'triage' ? (
                <>
                  <p className="history-symptoms"><strong>Symptoms:</strong> "{record.data.symptoms}"</p>
                  <p className="history-result"><strong>Analysis:</strong> {record.data.result?.condition || 'Unknown'}</p>
                  <span className={`risk-badge risk-${record.data.result?.risk?.toLowerCase()}`}>
                    Risk: {record.data.result?.risk}
                  </span>
                </>
              ) : (
                <div className="history-report-preview">
                  <p><strong>Report Metrics Extracted:</strong></p>
                  <ul className="history-metrics-list">
                    {record.data.result?.metrics?.vitals?.slice(0, 3).map((v, i) => (
                      <li key={i}>{v.name}: {v.value} {v.unit}</li>
                    ))}
                    {record.data.result?.metrics?.vitals?.length > 3 && <li>...</li>}
                  </ul>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      )}
    </div>
  );
}
