import { Passenger } from '../data/passengers';

export function getCharacterGreeting(passenger: Passenger): string {
  const greetings: { [key: string]: string } = {
    'professor': "Ah, Inspector. I assure you, these are merely theoretical exercises. The Academy's concerns were... exaggerated. How may I assist your investigation?",
    'widow': "My dear Inspector... *clutches photograph tightly* My husband... he was a good man. The war took him from me, but his memory lives on. What brings you to speak with me?",
    'mechanic': "Just doing my job, Inspector. This old train needs constant attention, you know how it is. What can I help you with?",
    'child': "The music box was my mother's. She said it would keep me safe on my journey. Are you here to help me?",
    'official': "I trust you understand the importance of my mission, Inspector. Some questions are better left unasked. What do you need to know?",
    'dr_zhang': "I am Dr. Zhang, Chief Medical Officer. How may I assist you with your investigation?",
    'captain_kovacs': "Captain Kovacs at your service. What do you need to know?",
    'professor_blackwood': "Ah, another curious mind seeking answers. How may I enlighten you today?",
    'engineer_singh': "I'm Engineer Singh. I hope you're not here to question my work. What do you need?",
    'security_chief_vasquez': "Security Chief Vasquez. I don't have time for games. What's your business?"
  };
  return greetings[passenger.id] || passenger.initialDialogue;
} 