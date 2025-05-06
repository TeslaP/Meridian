const testQuestions = [
  "What exactly were you researching at the Imperial Academy?",
  "Why were you dismissed from your position?",
  "What's in your briefcase?",
  "Where are you really going?",
  "Have you had any contact with other researchers since leaving the Academy?"
];

const passenger = {
  id: "professor",
  name: "Dr. Alexander Volkov",
  title: "The Professor",
  description: "A disgraced academic with a briefcase full of forbidden research papers.",
  background: "Former head of theoretical physics at the Imperial Academy. Dismissed after his research into temporal mechanics was deemed \"dangerous to the state.\" Claims to be traveling to a new teaching position at a provincial university.",
  trustLevel: 50,
  secrets: [
    "The equations could potentially allow time travel",
    "He was forced to leave the Academy after a failed experiment",
    "His destination is not a university but a secret research facility"
  ]
};

async function askQuestion(question) {
  try {
    const response = await fetch('http://localhost:3001/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        passenger,
        question,
        discoveredItems: []
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error:', error);
    return null;
  }
}

async function runTest() {
  console.log('Starting chat with Dr. Alexander Volkov...\n');

  for (const question of testQuestions) {
    console.log(`\nInspector: ${question}`);
    
    const response = await askQuestion(question);
    if (response) {
      console.log(`\nDr. Volkov: ${response.response}`);
      console.log(`Trust Change: ${response.trustChange}`);
      
      if (response.revelations) {
        console.log('\nRevelations:');
        if (response.revelations.newAssociates) {
          console.log('New Associates:', response.revelations.newAssociates);
        }
        if (response.revelations.biographyUpdates) {
          console.log('Biography Updates:', response.revelations.biographyUpdates);
        }
      }
    }

    // Add a small delay between questions
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
}

runTest().catch(console.error); 