import fetch from 'node-fetch';

const DEV_API_URL = 'http://localhost:3001/api/chat';
const PROD_API_URL = 'https://meridian-one.vercel.app/api/chat';

const testPassenger = {
  id: "volkov",
  name: "Dr. Alexander Volkov",
  title: "The Professor",
  description: "A disgraced academic with forbidden research papers.",
  background: "Former head of theoretical physics at the Imperial Academy, dismissed for dangerous research.",
  trustLevel: 50,
  secrets: [
    "Potential time travel equations",
    "Secret research facility destination"
  ],
  artifacts: [
    {
      id: "research_papers",
      name: "Research Papers",
      description: "Complex equations and diagrams",
      type: "document",
      content: "Temporal mechanics equations",
      discovered: true
    }
  ]
};

const testCases = [
  {
    name: 'Basic question',
    payload: {
      passenger: testPassenger,
      question: "What were you working on at the Academy?",
      discoveredItems: testPassenger.artifacts.map(a => ({
        name: a.name,
        description: a.description,
        type: a.type,
        content: a.content
      })),
      dialogueHistory: [],
      emotionalState: {
        mood: "nervous",
        suspicion: 30,
        stress: 40
      }
    }
  },
  {
    name: 'Follow-up question',
    payload: {
      passenger: testPassenger,
      question: "Can you explain more about your research?",
      discoveredItems: testPassenger.artifacts.map(a => ({
        name: a.name,
        description: a.description,
        type: a.type,
        content: a.content
      })),
      dialogueHistory: [
        {
          speaker: 'inspector',
          text: "What were you working on at the Academy?",
          timestamp: Date.now() - 5000
        },
        {
          speaker: 'character',
          text: "Just theoretical physics, nothing of concern.",
          timestamp: Date.now() - 4000
        }
      ],
      emotionalState: {
        mood: "defensive",
        suspicion: 50,
        stress: 60
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
        id: "volkov"
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
  }
];

async function testAPI(url: string, env: string) {
  console.log(`\nTesting ${env} API endpoint: ${url}\n`);

  // Test OPTIONS request
  console.log('Testing OPTIONS request...');
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
    console.error('OPTIONS Request Failed:', error);
  }

  // Test each test case
  for (const testCase of testCases) {
    console.log(`\nTesting ${testCase.name}...`);
    console.log('Request payload:', JSON.stringify(testCase.payload, null, 2));

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(testCase.payload)
      });

      console.log('POST Response:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      });

      const data = await response.json();
      console.log('Response data:', JSON.stringify(data, null, 2));

      if (!response.ok) {
        console.error('Error response:', data);
      }
    } catch (error) {
      console.error('Request failed:', error);
    }
  }
}

// Test both development and production endpoints
async function runTests() {
  try {
    await testAPI(DEV_API_URL, 'Development');
    await testAPI(PROD_API_URL, 'Production');
  } catch (error) {
    console.error('Test suite failed:', error);
  }
}

runTests(); 