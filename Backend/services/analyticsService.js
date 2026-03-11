/**
 * analyticsService.js
 * In-memory analytics store for tracking triage submissions.
 * Keeps the last 500 submissions in memory.
 */

const REGIONS = [
  "Hyderabad",
  "Mumbai",
  "Delhi",
  "Bangalore",
  "Chennai",
  "Kolkata",
  "Pune",
  "Ahmedabad",
  "Jaipur",
  "Lucknow",
  "Other"
];

// In-memory store (resets on server restart)
const submissions = [];
const MAX_SUBMISSIONS = 500;

/**
 * Add a new triage submission to the analytics store.
 * @param {string} symptoms
 * @param {string} risk - "LOW" | "MEDIUM" | "HIGH"
 * @param {string} region
 * @param {string} language
 */
function addSubmission(symptoms, risk, region, language) {
  submissions.push({
    symptoms: symptoms?.slice(0, 200), // Truncate for storage
    risk: risk || "MEDIUM",
    region: region || "Unknown",
    language: language || "English",
    timestamp: new Date().toISOString(),
  });

  // Keep only the latest MAX_SUBMISSIONS
  if (submissions.length > MAX_SUBMISSIONS) {
    submissions.shift();
  }
}

/**
 * Get all stored submissions.
 * @returns {Array}
 */
function getSubmissions() {
  return [...submissions];
}

/**
 * Get summary stats grouped by risk level.
 * @returns {Object}
 */
function getRiskSummary() {
  const summary = { LOW: 0, MEDIUM: 0, HIGH: 0 };
  submissions.forEach(s => {
    if (summary[s.risk] !== undefined) summary[s.risk]++;
  });
  return summary;
}

module.exports = { addSubmission, getSubmissions, getRiskSummary, REGIONS };
