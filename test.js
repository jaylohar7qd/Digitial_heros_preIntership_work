const axios = require('axios');

async function runTests() {
  const url = 'http://localhost:3000/api/audit';
  const testCases = [
    {
      name: 'Valid URL (example.com)',
      body: { url: 'https://example.com' },
      expectedSuccess: true
    },
    {
      name: 'Non-HTML URL (JSON file)',
      body: { url: 'http://localhost:3000/test.json' },
      expectedSuccess: false
    },
    {
      name: 'Invalid Domain name',
      body: { url: 'https://thisdomaindoesnotexistatall123.com' },
      expectedSuccess: false
    },
    {
      name: 'Invalid URL Format',
      body: { url: 'not-a-url' },
      expectedSuccess: false
    }
  ];

  console.log('--- Starting API Integration Tests ---');
  let passed = 0;

  for (const tc of testCases) {
    try {
      console.log(`\nRunning test: ${tc.name}...`);
      const response = await axios.post(url, tc.body, { validateStatus: () => true });
      
      console.log(`Status: ${response.status}`);
      console.log(`Body:`, JSON.stringify(response.data, null, 2));

      if (response.data.success === tc.expectedSuccess) {
        console.log(`✓ PASS`);
        passed++;
      } else {
        console.log(`✗ FAIL (Expected success: ${tc.expectedSuccess}, got success: ${response.data.success})`);
      }
    } catch (e) {
      console.log(`✗ FAIL (Network or runtime error: ${e.message})`);
    }
  }

  console.log(`\n--- Results: ${passed}/${testCases.length} tests passed ---`);
  process.exit(passed === testCases.length ? 0 : 1);
}

runTests();
