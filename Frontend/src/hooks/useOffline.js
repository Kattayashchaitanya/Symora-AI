import { useState, useEffect } from "react";

export function useOfflineMode() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return isOnline;
}

export function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.log(error);
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.log(error);
    }
  };

  return [storedValue, setValue];
}

export function saveDraftTriage(symptoms, language, region) {
  const draft = { symptoms, language, region, timestamp: new Date().toISOString() };
  try {
    window.localStorage.setItem("triageDraft", JSON.stringify(draft));
  } catch (error) {
    console.log("Failed to save draft:", error);
  }
}

export function loadDraftTriage() {
  try {
    const draft = window.localStorage.getItem("triageDraft");
    return draft ? JSON.parse(draft) : null;
  } catch (error) {
    console.log("Failed to load draft:", error);
    return null;
  }
}

export function clearDraftTriage() {
  try {
    window.localStorage.removeItem("triageDraft");
  } catch (error) {
    console.log("Failed to clear draft:", error);
  }
}
