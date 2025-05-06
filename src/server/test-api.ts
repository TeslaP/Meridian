import fetch from 'node-fetch';

const PROD_API_URL = 'https://meridian-one.vercel.app/api/chat';

async function testAPI(url: string) {
  console.log('\nTesting Production API endpoint:', url);

  const testPayload = {
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
  };

  try {
    // Test OPTIONS request
    console.log('\nTesting OPTIONS request...');
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

    // Test POST request
    console.log('\nTesting POST request...');
    console.log('Request payload:', JSON.stringify(testPayload, null, 2));

    const postResponse = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(testPayload)
    });

    console.log('POST Response:', {
      status: postResponse.status,
      statusText: postResponse.statusText,
      headers: Object.fromEntries(postResponse.headers.entries())
    });

    if (postResponse.ok) {
      const data = await postResponse.json();
      console.log('\nResponse data:', JSON.stringify(data, null, 2));
    } else {
      const errorText = await postResponse.text();
      console.error('POST Error Response:', errorText);
      try {
        const errorData = JSON.parse(errorText);
        console.error('Parsed error data:', errorData);
      } catch (e) {
        console.error('Raw error response:', errorText);
      }
    }
  } catch (error) {
    console.error('Test failed:', error);
    if (error instanceof Error) {
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
    }
  }
}

// Run the test
testAPI(PROD_API_URL).catch(console.error); 