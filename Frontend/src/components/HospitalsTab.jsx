import { useState, useEffect } from "react";

const hospitalLabels = {
    English: {
    title: "Nearby Hospitals",
    searchPlaceholder: "Enter your location",
    useCurrentLocation: "📍 Use Current Location",
    openMaps: "Open in Maps",
    mapPreview: "Directions Locator",
    liveNotice: "Live results within 8km. NOTE: Distances shown are actual road travel distances.",
    distance: "Road Distance",
    phone: "Phone",
    address: "Address",
    emergency: "24/7 Emergency",
    call: "📞 Call",
    directions: "Open Road Directions",
    noResults: "No hospitals found within road distance. Use the map to search wider.",
    loading: "Calculating road distances...",
  },
  Hindi: {
    title: "पास के अस्पताल",
    searchPlaceholder: "अपना स्थान दर्ज करें",
    useCurrentLocation: "📍 वर्तमान स्थान का उपयोग करें",
    openMaps: "मैप्स में खोलें",
    mapPreview: "दिशा लोकेटर",
    liveNotice: "8 किमी के भीतर परिणाम। नोट: दिखाई गई दूरियां वास्तविक सड़क यात्रा की दूरी हैं।",
    distance: "सड़क की दूरी",
    phone: "फोन",
    address: "पता",
    emergency: "24/7 आपातकालीन",
    call: "📞 कॉल करें",
    directions: "सड़क मार्ग खोलें",
    noResults: "सड़क की दूरी के भीतर कोई अस्पताल नहीं मिला। व्यापक खोज के लिए मानचित्र का उपयोग करें।",
    loading: "सड़क की दूरी की गणना की जा रही है...",
  },
  Telugu: {
    title: "సమీపంలోని ఆసుపత్రులు",
    searchPlaceholder: "మీ స్థానాన్ని నమోదు చేయండి",
    useCurrentLocation: "📍 ప్రస్తుత స్థానాన్ని ఉపయోగించండి",
    openMaps: "మ్యాప్స్‌లో తెరవండి",
    mapPreview: "దిశల లొకేటర్",
    liveNotice: "8 కి.మీ పరిధిలో ఫలితాలు. గమనిక: చూపిన దూరాలు అసలైన రోడ్డు ప్రయాణ దూరాలు.",
    distance: "రోడ్డు దూరం",
    phone: "ఫోన్",
    address: "చిరునామా",
    emergency: "24/7 ఎమర్జెన్సీ",
    call: "📞 కాల్ చేయండి",
    directions: "రోడ్డు దిశలను ప్రారంభించండి",
    noResults: "రోడ్డు దూరం లోపల ఆసుపత్రులు లేవు. మ్యాప్‌ని ఉపయోగించి విస్తృతంగా శోధించండి.",
    loading: "రోడ్డు దూరాలను గణిస్తోంది...",
  },
};

// Haversine formula to calculate distance in KM
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; 
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return (R * c).toFixed(1);
};

const buildGoogleMapsEmbedUrl = (locationValue, coords) => {
  const trimmed = String(locationValue || "").trim();
  if (coords) {
    const origin = `${coords.lat},${coords.lng}`;
    const destination = trimmed ? `hospitals near ${trimmed}` : "hospital";
    return `https://www.google.com/maps?saddr=${encodeURIComponent(origin)}&daddr=${encodeURIComponent(destination)}&dirflg=d&output=embed`;
  }
  if (!trimmed) {
    return "https://www.google.com/maps?q=hospitals&output=embed";
  }
  const destination = `hospitals near ${trimmed}`;
  return `https://www.google.com/maps?saddr=${encodeURIComponent(trimmed)}&daddr=${encodeURIComponent(destination)}&dirflg=d&output=embed`;
};

export function HospitalsTab({ language = "English" }) {
  const [location, setLocation] = useState("");
  const [coords, setCoords] = useState(null);
  const [hospitals, setHospitals] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const labels = hospitalLabels[language];
  const mapsEmbedUrl = buildGoogleMapsEmbedUrl(location, coords);

  const fetchHospitals = async (lat, lng) => {
    setIsLoading(true);
    setHospitals([]);
    try {
      // Expanded query for better local coverage
      const overpassQuery = `[out:json];(node["amenity"~"hospital|clinic|doctors"](around:8000,${lat},${lng});way["amenity"~"hospital|clinic|doctors"](around:8000,${lat},${lng});node["healthcare"~"hospital|clinic"](around:8000,${lat},${lng}););out center 20;`;
      const overpassRes = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(overpassQuery)}`);
      
      if (!overpassRes.ok) {
        if (overpassRes.status === 429) throw new Error("Server busy. Please try again in a few seconds.");
        throw new Error("Overpass API Error");
      }
      const overpassData = await overpassRes.json();
      
      let initialResults = overpassData.elements.map(el => {
        const elLat = el.lat || el.center?.lat;
        const elLng = el.lon || el.center?.lon;
        
        return {
          id: el.id,
          name: el.tags?.name || el.tags?.operator || "Medical Facility",
          address: el.tags?.['addr:full'] || el.tags?.['addr:street'] || "Address details unavailable",
          phone: el.tags?.phone || el.tags?.['contact:phone'] || null,
          emergency: el.tags?.emergency === 'yes' || el.tags?.['healthcare:speciality']?.includes('emergency'),
          aerialDistance: parseFloat(calculateDistance(lat, lng, elLat, elLng)),
          lat: elLat,
          lng: elLng
        };
      }).sort((a, b) => a.aerialDistance - b.aerialDistance).slice(0, 15);

      // Fetch Road Distances using OSRM Table API
      const coordinates = `${lng},${lat};` + initialResults.map(h => `${h.lng},${h.lat}`).join(';');
      const osrmRes = await fetch(`https://router.project-osrm.org/table/v1/driving/${coordinates}?sources=0&annotations=distance`);
      
      let finalResults = initialResults;
      if (osrmRes.ok) {
        const osrmData = await osrmRes.json();
        if (osrmData.distances && osrmData.distances[0]) {
          finalResults = initialResults.map((h, index) => ({
            ...h,
            // OSRM returns distances in meters, convert to km
            roadDistance: osrmData.distances[0][index + 1] ? (osrmData.distances[0][index + 1] / 1000).toFixed(1) : h.aerialDistance,
            distance: osrmData.distances[0][index + 1] ? (osrmData.distances[0][index + 1] / 1000).toFixed(1) : h.aerialDistance
          })).sort((a, b) => parseFloat(a.roadDistance) - parseFloat(b.roadDistance));
        }
      }

      // Filter out duplicate names
      const uniqueResults = [];
      const seenNames = new Set();
      for (const h of finalResults) {
        if (!seenNames.has(h.name.toLowerCase())) {
          seenNames.add(h.name.toLowerCase());
          uniqueResults.push(h);
        }
        if (uniqueResults.length >= 12) break;
      }

      setHospitals(uniqueResults);
    } catch (err) {
      console.error("Error fetching hospitals:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetLocation = () => {
    if ("geolocation" in navigator) {
      setIsLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
          setCoords({ lat: latitude, lng: longitude });
          fetchHospitals(latitude, longitude);
        },
        (error) => {
          console.error("Geolocation error:", error);
          setIsLoading(false);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    }
  };

  // Attempt to load GPS on component mount if permission is granted
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.permissions.query({ name: "geolocation" }).then((result) => {
        if (result.state === "granted") {
          handleGetLocation();
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="hospitals-container">
      <h1 className="tab-title">{labels.title}</h1>

      <div className="location-search">
        <input
          type="text"
          placeholder={labels.searchPlaceholder}
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="location-input"
        />
        <button className="location-button neon-button" onClick={handleGetLocation}>
          {labels.useCurrentLocation}
        </button>
      </div>

      <p className="tab-subtitle" style={{marginBottom: "20px", color: "var(--text-secondary)"}}>
        {labels.liveNotice}
      </p>

      <div className="hospitals-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        
        {/* Hospitals List Column */}
        <div className="hospitals-list" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {isLoading && <div className="loading-state">{labels.loading}</div>}
          
          {!isLoading && hospitals.length === 0 && coords && (
            <div className="empty-state glass-card">{labels.noResults}</div>
          )}

          {!isLoading && hospitals.map(hospital => (
             <div key={hospital.id} className="hospital-card glass-card">
               <div className="hospital-header">
                 <h3 className="hospital-name">{hospital.name}</h3>
                 {hospital.emergency && <span className="emergency-badge">{labels.emergency}</span>}
               </div>
               
               <div className="hospital-info">
                 <p className="info-value address-text">{hospital.address}</p>
                 <p className="info-value"><strong>{labels.distance}:</strong> {hospital.distance} km</p>
                 {hospital.phone && <p className="info-value"><strong>{labels.phone}:</strong> {hospital.phone}</p>}
               </div>
               
               <div className="hospital-actions" style={{display: 'flex', gap: '10px'}}>
                 <button
                   className="action-button directions"
                   onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&origin=${coords.lat},${coords.lng}&destination=${hospital.lat},${hospital.lng}&travelmode=driving`, "_blank")}
                 >
                   {labels.directions}
                 </button>
                 {hospital.phone && (
                   <button
                     className="action-button call-btn"
                     onClick={() => window.open(`tel:${hospital.phone}`)}
                     style={{background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success-500)'}}
                   >
                     {labels.call}
                   </button>
                 )}
               </div>
             </div>
          ))}
        </div>

        {/* Map Preview Column */}
        <div className="hospital-card map-preview-card glass-card" style={{ height: '100%', minHeight: '400px', margin: 0 }}>
          <div className="hospital-header">
            <h3 className="hospital-name" style={{padding: '16px 20px 0'}}>{labels.mapPreview}</h3>
          </div>
          <div className="hospital-info" style={{ height: 'calc(100% - 60px)', padding: '20px' }}>
            <iframe
              title="Nearby hospitals map"
              src={mapsEmbedUrl}
              className="map-preview-frame"
              style={{ width: '100%', height: '100%', borderRadius: 'var(--radius-lg)' }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>
        
      </div>
    </div>
  );
}
