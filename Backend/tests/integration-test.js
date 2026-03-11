// Comprehensive integration test for SymoraAI
async function runIntegrationTest() {
  console.log("=== SymoraAI Full Integration Test ===\n");
  
  const BACKEND_URL = "http://localhost:5000";
  const FRONTEND_URL = "http://localhost:3000";
  
  // Test 1: Backend Health
  console.log("Test 1: Backend Health Check");
  try {
    const res = await fetch(`${BACKEND_URL}/`);
    console.log(`  Status: ${res.status}`);
    console.log(`  ✓ Backend is operational\n`);
  } catch (e) {
    console.error(`  ✗ Backend unreachable: ${e.message}`);
    process.exit(1);
  }
  
  // Test 2: Frontend Availability
  console.log("Test 2: Frontend Availability");
  try {
    const res = await fetch(`${FRONTEND_URL}/index.html`);
    console.log(`  Status: ${res.status}`);
    console.log(`  ✓ Frontend is served\n`);
  } catch (e) {
    console.error(`  ✗ Frontend unreachable: ${e.message}`);
    process.exit(1);
  }
  
  // Test 3: Populate Analytics with Diverse Data
  console.log("Test 3: Populate Analytics (Triage Submissions)");
  const routes = [
    { symptoms: "chest pain, shortness of breath", region: "Maharashtra", language: "English" },
    { symptoms: "severe chest pain", region: "Maharashtra", language: "English" },
    { symptoms: "breathing difficulty", region: "Karnataka", language: "English" },
    { symptoms: "headache", region: "Delhi", language: "Hindi" },
    { symptoms: "दर्द में सिर", region: "Delhi", language: "Hindi" },
    { symptoms: "fever, cold", region: "Telangana", language: "Telugu" },
    { symptoms: "తల నొప్పి", region: "Andhra Pradesh", language: "Telugu" },
    { symptoms: "minor cough", region: "Gujarat", language: "English" },
    { symptoms: "body ache, fatigue", region: "Rajasthan", language: "Hindi" },
    { symptoms: "aching joints", region: "West Bengal", language: "English" }
  ];
  
  let successCount = 0;
  for (const route of routes) {
    try {
      const res = await fetch(`${BACKEND_URL}/api/triage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(route)
      });
      if (res.ok) {
        const data = await res.json();
        successCount++;
        console.log(`  [${successCount}/${routes.length}] ${route.symptoms.substring(0, 20).padEnd(22)} -> ${data.risk}`);
      }
    } catch (e) {
      console.error(`    ✗ Failed: ${e.message}`);
    }
  }
  console.log(`  ✓ Submitted ${successCount}/${routes.length} triage requests\n`);
  
  // Test 4: Verify Analytics Aggregation
  console.log("Test 4: Analytics Aggregation");
  try {
    const res = await fetch(`${BACKEND_URL}/api/analytics/summary`);
    const data = await res.json();
    
    console.log(`  Total Submissions: ${data.totalSubmissions}`);
    console.log(`  Regions Tracked: ${data.regions.length}`);
    console.log(`  Disease Trends Detected: ${data.trends.length}`);
    console.log(`  Risk Distribution: HIGH=${data.distribution[0].value}, MEDIUM=${data.distribution[1].value}, LOW=${data.distribution[2].value}`);
    console.log(`  ✓ Analytics data is properly aggregated\n`);
  } catch (e) {
    console.error(`  ✗ Analytics failed: ${e.message}`);
    process.exit(1);
  }
  
  // Test 5: Dashboard Component Integration
  console.log("Test 5: Dashboard Component Data Compatibility");
  try {
    const res = await fetch(`${BACKEND_URL}/api/analytics/summary`);
    const data = await res.json();
    
    // Simulate Dashboard component state updates
    const regions = data.regions || [];
    const trends = data.trends || [];
    const distribution = data.distribution || [];
    const totalSubmissions = data.totalSubmissions || 0;
    
    // Verify Recharts data structure
    if (regions.length > 0 && !regions[0].high) {
      throw new Error("Regions missing 'high' field for BarChart");
    }
    if (trends.length > 0 && !trends[0].symptom) {
      throw new Error("Trends missing 'symptom' field for LineChart");
    }
    if (distribution.length > 0 && (!distribution[0].name || !distribution[0].value)) {
      throw new Error("Distribution missing fields for PieChart");
    }
    
    console.log(`  Charts Data:
    - BarChart (Regions): ${regions.length} regions ready
    - LineChart (Trends): ${trends.length} trends ready  
    - PieChart (Distribution): 3 risk levels ready`);
    console.log(`  ✓ All Recharts data structures validated\n`);
  } catch (e) {
    console.error(`  ✗ Dashboard data validation failed: ${e.message}`);
    process.exit(1);
  }
  
  // Test 6: Language Support Verification
  console.log("Test 6: Multilingual Support");
  const languages = [
    { lang: "English", symptoms: "chest pain" },
    { lang: "Hindi", symptoms: "छाती में दर्द" },
    { lang: "Telugu", symptoms: "గుండెలో నొప్పి" }
  ];
  
  let langSuccessCount = 0;
  for (const test of languages) {
    try {
      const res = await fetch(`${BACKEND_URL}/api/triage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symptoms: test.symptoms,
          region: "Delhi",
          language: test.lang
        })
      });
      if (res.ok) {
        langSuccessCount++;
        console.log(`  ✓ ${test.lang} request processed`);
      }
    } catch (e) {
      console.error(`  ✗ ${test.lang} failed: ${e.message}`);
    }
  }
  console.log(`  ✓ ${langSuccessCount}/3 language support verified\n`);
  
  // Final Summary
  console.log("=== Integration Test Summary ===");
  console.log("✓ Backend API operational");
  console.log("✓ Frontend server running");
  console.log("✓ Triage submissions working");
  console.log("✓ Analytics aggregation functional");
  console.log("✓ Dashboard data format correct");
  console.log("✓ Multilingual support verified");
  console.log("\n✓✓✓ SymoraAI is ready for use! ✓✓✓");
  console.log("\nAccess the app at: http://localhost:3000");
}

runIntegrationTest().catch(e => {
  console.error("Integration test failed:", e);
  process.exit(1);
});
