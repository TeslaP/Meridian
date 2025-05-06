import fetch from 'node-fetch';

const PROD_API_URL = 'https://meridian-one.vercel.app/api/chat';

const testCases = [
  {
    name: 'Valid request',
    payload: {
      passenger: {
        id: "volkov",
        name: "Dr. Alexander Volkov",
        title: "The Professor",
        description: "A disgraced academic with forbidden research papers.",
        background: "Former head of theoretical physics at the Imperial Academy, dismissed for dangerous research.",
        trustLevel: 50,
        secrets: [
          "Potential time travel equations",
          "Secret research facility destination"
        ]
      },
      question: "What were you working on at the Academy?",
      discoveredItems: [],
      dialogueHistory: [],
      emotionalState: {
        mood: "nervous",
        suspicion: 30,
        stress: 40
      }
    }
  },
  {
    name: 'Missing passenger data',
    payload: {
      question: "What were you working on at the Academy?",
      discoveredItems: [],
      dialogueHistory: [],
      emotionalState: {
        mood: "nervous",
        suspicion: 30,
        stress: 40
      }
    }
  },
  {
    name: 'Invalid passenger data',
    payload: {
      passenger: {
        id: "volkov",
        // Missing required fields
      },
      question: "What were you working on at the Academy?",
      discoveredItems: [],
      dialogueHistory: [],
      emotionalState: {
        mood: "nervous",
        suspicion: 30,
        stress: 40
      }
    }
  },
  {
    name: 'Missing question',
    payload: {
      passenger: {
        id: "volkov",
        name: "Dr. Alexander Volkov",
        title: "The Professor",
        description: "A disgraced academic with forbidden research papers.",
        background: "Former head of theoretical physics at the Imperial Academy, dismissed for dangerous research.",
        trustLevel: 50,
        secrets: [
          "Potential time travel equations",
          "Secret research facility destination"
        ]
      },
      discoveredItems: [],
      dialogueHistory: [],
      emotionalState: {
        mood: "nervous",
        suspicion: 30,
        stress: 40
      }
    }
  }
];

async function testAPI(url: string) {
  console.log('\nTesting Production API endpoint:', url);

  // Test OPTIONS request
  console.log('\nTesting OPTIONS request...');
  try {
    const optionsResponse = await fetch(url, {
      method: 'OPTIONS',
      headers: {
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type, Authorization, Accept'
      }
    });

    console.log('OPTIONS Response:', {
      status: optionsResponse.status,
      statusText: optionsResponse.statusText,
      headers: Object.fromEntries(optionsResponse.headers.entries())
    });

    if (!optionsResponse.ok) {
      const errorText = await optionsResponse.text();
      console.error('OPTIONS Error Response:', errorText);
    }
  } catch (error) {
    console.error('OPTIONS request failed:', error);
  }

  // Test each test case
  for (const testCase of testCases) {
    console.log(`\nTesting ${testCase.name}...`);
    console.log('Request payload:', JSON.stringify(testCase.payload, null, 2));

    try {
      const postResponse = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(testCase.payload)
      });

      console.log('POST Response:', {
        status: postResponse.status,
        statusText: postResponse.statusText,
        headers: Object.fromEntries(postResponse.headers.entries())
      });

      const responseText = await postResponse.text();
      try {
        const responseData = JSON.parse(responseText);
        console.log('Response data:', JSON.stringify(responseData, null, 2));
      } catch (e) {
        console.log('Raw response:', responseText);
      }
    } catch (error) {
      console.error('POST request failed:', error);
      if (error instanceof Error) {
        console.error('Error details:', {
          name: error.name,
          message: error.message,
          stack: error.stack
        });
      }
    }
  }
}

// Run the test
testAPI(PROD_API_URL).catch(console.error); 