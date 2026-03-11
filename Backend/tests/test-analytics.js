async function test() {
  console.log('Testing analytics pipeline...\n');
  
  const inputs = [
    {symptoms:'chest pain', region:'Maharashtra'},
    {symptoms:'headache', region:'Karnataka'},
    {symptoms:'fever', region:'Delhi'}
  ];
  
  console.log('Submitting triage requests:');
  for(const body of inputs) {
    const res = await fetch('http://localhost:5000/api/triage',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({...body, language:'English'})
    });
    const data = await res.json();
    console.log(`  ${body.symptoms} (${body.region}) -> ${data.risk}`);
  }
  
  console.log('\nFetching analytics summary...');
  const analytics = await fetch('http://localhost:5000/api/analytics/summary');
  const data = await analytics.json();
  
  console.log(`Total submissions: ${data.totalSubmissions}`);
  console.log(`High-risk regions: ${data.regions.length}`);
  console.log(`Disease trends tracked: ${data.trends.length}`);
  console.log(`Risk distribution:`, data.distribution);
}

test().catch(e => console.error('Error:', e.message));
