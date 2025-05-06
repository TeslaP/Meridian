import { passengers } from '../data/passengers.js';
import { generateCharacterResponse } from '../services/gptService.js';
import { Passenger, Artifact } from '../data/passengers.js';

async function testChat() {
  const professor = passengers.find((p: Passenger) => p.id === 'professor');
  if (!professor) {
    console.error('Professor not found');
    return;
  }

  const questions = [
    "What exactly were you researching at the Imperial Academy?",
    "Why were you dismissed from your position?",
    "What's in your briefcase?",
    "Where are you really going?",
    "Have you had any contact with other researchers since leaving the Academy?"
  ];

  console.log('Starting chat with Dr. Alexander Volkov...\n');

  for (const question of questions) {
    console.log(`\nInspector: ${question}`);
    
    try {
      const response = await generateCharacterResponse(
        professor,
        question,
        professor.artifacts
          .filter((a: Artifact) => a.discovered)
          .map((a: Artifact) => ({
            name: a.name,
            description: a.description
          }))
      );

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
    } catch (error) {
      console.error('Error:', error);
    }

    // Add a small delay between questions
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
}

testChat().catch(console.error); 