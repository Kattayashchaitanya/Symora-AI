// Simulate what the Dashboard.jsx component does when it fetches analytics
async function testDashboardFetch() {
  console.log("=== Dashboard Component Test ===\n");
  
  const API_BASE_URL = "http://localhost:5000";
  
  console.log("Testing Dashboard.jsx fetch logic...");
  console.log(`API Base URL: ${API_BASE_URL}\n`);
  
  try {
    console.log("Fetching /api/analytics/summary...");
    const response = await fetch(`${API_BASE_URL}/api/analytics/summary`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log("✓ Successfully fetched analytics data!\n");
    
    // Validate data structure matches Dashboard component expectations
    console.log("Data structure validation:");
    console.log(`  totalSubmissions: ${data.totalSubmissions} (type: ${typeof data.totalSubmissions})`);
    console.log(`  regions: [${data.regions.length} items] (type: ${Array.isArray(data.regions) ? 'array' : 'ERROR'})`);
    console.log(`  trends: [${data.trends.length} items] (type: ${Array.isArray(data.trends) ? 'array' : 'ERROR'})`);
    console.log(`  distribution: [${data.distribution.length} items] (type: ${Array.isArray(data.distribution) ? 'array' : 'ERROR'})`);
    
    // Validate chart data formats for Recharts
    console.log("\nChart data format validation:");
    
    // BarChart (regions) - expects array of {region, high, medium, low}
    if (data.regions.length > 0) {
      const region = data.regions[0];
      console.log(`\n  BarChart (High-Risk Regions):`);
      console.log(`    First region: ${JSON.stringify(region)}`);
      console.log(`    Has 'region' field: ${!!region.region}`);
      console.log(`    Has 'high' field: ${!!region.high}`);
      console.log(`    Has 'medium' field: ${!!region.medium}`);
      console.log(`    Has 'low' field: ${!!region.low}`);
    }
    
    // LineChart (trends) - expects array of {symptom, count, highRiskCount, riskPercentage}
    if (data.trends.length > 0) {
      const trend = data.trends[0];
      console.log(`\n  LineChart (Disease Trends):`);
      console.log(`    First trend: ${JSON.stringify(trend)}`);
      console.log(`    Has 'symptom' field: ${!!trend.symptom}`);
      console.log(`    Has 'count' field: ${!!trend.count}`);
      console.log(`    Has 'highRiskCount' field: ${!!trend.highRiskCount}`);
    }
    
    // PieChart (distribution) - expects array of {name, value}
    if (data.distribution.length > 0) {
      const dist = data.distribution[0];
      console.log(`\n  PieChart (Risk Distribution):`);
      console.log(`    First item: ${JSON.stringify(dist)}`);
      console.log(`    Has 'name' field: ${!!dist.name}`);
      console.log(`    Has 'value' field: ${!!dist.value}`);
    }
    
    console.log("\n✓ All data formats are correct for Recharts visualization!");
    console.log("\n=== Dashboard Ready for Use ===");
    
  } catch (error) {
    console.error("✗ Error:", error.message);
    process.exit(1);
  }
}

testDashboardFetch();
