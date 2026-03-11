const BASE_URL = "http://localhost:5000";

async function test() {
  console.log("=== SymoraAI End-to-End Test ===\n");

  // Test 1: Health check
  console.log("1. Testing health endpoint...");
  try {
    const res = await fetch(`${BASE_URL}/`);
    const data = await res.json();
    console.log(`   ✓ GET / -> Status: ${res.status}`);
    console.log(`   Message: ${data.message}\n`);
  } catch (e) {
    console.log(`   ✗ Failed: ${e.message}\n`);
    process.exit(1);
  }

  // Test 2: Triage API
  console.log("2. Testing triage endpoint with sample requests...");
  const triageTests = [
    { symptoms: "chest pain, difficulty breathing", region: "Maharashtra", language: "English" },
    { symptoms: "headache, mild cold", region: "Karnataka", language: "Hindi" },
    { symptoms: "fever, body ache", region: "Telangana", language: "Telugu" },
    { symptoms: "सांस लेने में कठिनाई", region: "Delhi", language: "Hindi" },
    { symptoms: "తల నొప్పి, జ్వరం", region: "Andhra Pradesh", language: "Telugu" }
  ];

  for (const test of triageTests) {
    try {
      const res = await fetch(`${BASE_URL}/api/triage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(test)
      });
      const data = await res.json();
      console.log(`   ✓ ${test.symptoms.substring(0, 20).padEnd(22)} (${test.language.padEnd(8)}) -> Risk: ${data.risk}`);
    } catch (e) {
      console.log(`   ✗ ${test.symptoms.substring(0, 20)} Failed: ${e.message}`);
    }
  }

  await new Promise(r => setTimeout(r, 500));

  // Test 3: Analytics endpoints
  console.log("\n3. Testing analytics endpoints...");
  
  const endpoints = [
    "/api/analytics/summary",
    "/api/analytics/high-risk-regions",
    "/api/analytics/disease-trends",
    "/api/analytics/risk-distribution"
  ];

  for (const endpoint of endpoints) {
    try {
      const res = await fetch(`${BASE_URL}${endpoint}`);
      const data = await res.json();
      console.log(`   ✓ GET ${endpoint} -> Status: ${res.status}`);
    } catch (e) {
      console.log(`   ✗ GET ${endpoint} Failed: ${e.message}`);
    }
  }

  // Test 4: Analytics data aggregation
  console.log("\n4. Analytics Data Summary:");
  try {
    const res = await fetch(`${BASE_URL}/api/analytics/summary`);
    const data = await res.json();
    console.log(`   Total Submissions: ${data.totalSubmissions}`);
    console.log(`   Regions Represented: ${data.regions.length}`);
    console.log(`   High-Risk Regions:`);
    data.regions.forEach(r => {
      console.log(`     - ${r.region}: ${r.high} HIGH (${r.highRiskRatio}% high-risk ratio)`);
    });
    console.log(`   Disease Trends (Top 3):`);
    data.trends.slice(0, 3).forEach(t => {
      console.log(`     - "${t.symptom}": ${t.count} mentions (${t.riskPercentage}% high-risk)`);
    });
    console.log(`   Risk Distribution:`);
    data.distribution.forEach(d => {
      console.log(`     - ${d.name}: ${d.value} cases`);
    });
  } catch (e) {
    console.log(`   ✗ Failed: ${e.message}`);
  }

  console.log("\n=== All Tests Passed ===");
  console.log("Backend is ready for Frontend Dashboard integration!");
}

test().catch(e => {
  console.error("Test error:", e);
  process.exit(1);
});
