export interface Artifact {
  id: string;
  name: string;
  description: string;
  type: 'document' | 'photograph' | 'object' | 'letter';
  content?: string;
  imageUrl?: string;
  discovered: boolean;
  discoveryChance: number; // 1-10, where 10 is always found
}

export interface Associate {
  name: string;
  relationship: string;
  details: string;
}

export interface Passenger {
  id: string;
  name: string;
  title: string;
  description: string;
  background: string;
  trustLevel: number;
  secrets: string[];
  artifacts: Artifact[];
  knownAssociates: Associate[];
  initialDialogue: string;
}

export const passengers: Passenger[] = [
  {
    id: 'professor',
    name: 'Dr. Alexander Volkov',
    title: 'The Professor',
    description: 'A disgraced academic with a briefcase full of forbidden research papers.',
    background: 'Former head of theoretical physics at the Imperial Academy. Dismissed after his research into temporal mechanics was deemed "dangerous to the state." Claims to be traveling to a new teaching position at a provincial university.',
    artifacts: [
      {
        id: 'research_papers',
        name: 'Forbidden Equations',
        description: 'Complex mathematical formulas that seem to describe time manipulation.',
        type: 'document',
        content: 'The equations suggest a method of temporal displacement...',
        discovered: false,
        discoveryChance: 10
      },
      {
        id: 'academy_badge',
        name: 'Imperial Academy Badge',
        description: 'A tarnished brass badge showing his former position.',
        type: 'object',
        imageUrl: '/assets/artifacts/academy_badge.png',
        discovered: false,
        discoveryChance: 10
      }
    ],
    initialDialogue: "I assure you, Inspector, these are merely theoretical exercises. The Academy's concerns were... exaggerated.",
    secrets: [
      'The equations could potentially allow time travel',
      'He was forced to leave the Academy after a failed experiment',
      'His destination is not a university but a secret research facility'
    ],
    trustLevel: 50,
    knownAssociates: []
  },
  {
    id: 'widow',
    name: 'Madame Elena Petrovna',
    title: 'The Widow',
    description: 'A mysterious woman in black, clutching a worn photograph.',
    background: 'Claims to be traveling to visit her husband\'s grave, but her luggage contains items that suggest a different journey entirely.',
    artifacts: [
      {
        id: 'photograph',
        name: 'Worn Photograph',
        description: 'A faded photograph of a man in military uniform.',
        type: 'object',
        imageUrl: '/assets/artifacts/photograph.png',
        discovered: false,
        discoveryChance: 10
      },
      {
        id: 'mysterious_package',
        name: 'Mysterious Package',
        description: 'A carefully wrapped package with strange symbols.',
        type: 'object',
        imageUrl: '/assets/artifacts/package.png',
        discovered: false,
        discoveryChance: 10
      }
    ],
    initialDialogue: "My dear Inspector... *clutches photograph tightly* My husband... he was a good man. The war took him from me, but his memory lives on.",
    secrets: [
      'The photograph is not of her husband',
      'The package contains stolen military documents',
      'She\'s working with a resistance group'
    ],
    trustLevel: 50,
    knownAssociates: []
  },
  {
    id: 'mechanic',
    name: 'Boris "The Fixer"',
    title: 'The Mechanic',
    description: 'A gruff individual with oil-stained hands and a mysterious toolbox.',
    background: 'Their knowledge of the train\'s inner workings seems too detailed for a simple repairman.',
    artifacts: [
      {
        id: 'toolbox',
        name: 'Mysterious Toolbox',
        description: 'Contains unusual tools and blueprints.',
        type: 'object',
        imageUrl: '/assets/artifacts/toolbox.png',
        discovered: false,
        discoveryChance: 10
      },
      {
        id: 'blueprints',
        name: 'Train Blueprints',
        description: 'Detailed schematics of the train\'s systems.',
        type: 'document',
        content: 'The blueprints show hidden compartments...',
        discovered: false,
        discoveryChance: 10
      }
    ],
    initialDialogue: "Just doing my job, Inspector. This old train needs constant attention, you know how it is.",
    secrets: [
      'They\'re not a real mechanic',
      'The toolbox contains surveillance equipment',
      'They know about the train\'s secret purpose'
    ],
    trustLevel: 50,
    knownAssociates: []
  },
  {
    id: 'child',
    name: 'Anya',
    title: 'The Child',
    description: 'Traveling alone with a music box that plays a haunting melody.',
    background: 'Their innocence might be a facade, and their connection to the train\'s past is deeper than it appears.',
    artifacts: [
      {
        id: 'music_box',
        name: 'Haunting Music Box',
        description: 'Plays a melody that seems to affect the train\'s systems.',
        type: 'object',
        imageUrl: '/assets/artifacts/music_box.png',
        discovered: false,
        discoveryChance: 10
      },
      {
        id: 'doll',
        name: 'Strange Doll',
        description: 'A doll that seems to move on its own.',
        type: 'object',
        imageUrl: '/assets/artifacts/doll.png',
        discovered: false,
        discoveryChance: 10
      }
    ],
    initialDialogue: "The music box was my mother's. She said it would keep me safe on my journey.",
    secrets: [
      'The music box controls the train',
      'They\'re not really a child',
      'They know about the train\'s true nature'
    ],
    trustLevel: 50,
    knownAssociates: []
  },
  {
    id: 'official',
    name: 'Commissar Ivanov',
    title: 'The Official',
    description: 'A government representative with impeccable credentials and a cold demeanor.',
    background: 'Their presence on the train raises questions about who\'s really in control. Carries documents that could change the fate of everyone aboard.',
    artifacts: [
      {
        id: 'credentials',
        name: 'Official Credentials',
        description: 'Impeccably forged government documents.',
        type: 'document',
        content: 'Authorization Level: Alpha, Department: Special Operations',
        discovered: false,
        discoveryChance: 10
      },
      {
        id: 'sealed_orders',
        name: 'Sealed Orders',
        description: 'A sealed envelope containing classified instructions.',
        type: 'document',
        content: 'To be opened only at the final station...',
        discovered: false,
        discoveryChance: 10
      }
    ],
    initialDialogue: 'I trust you understand the importance of my mission, Inspector. Some questions are better left unasked.',
    secrets: [
      'They\'re not who they claim to be',
      'The orders contain a list of passengers to be detained',
      'They know about the train\'s true purpose'
    ],
    trustLevel: 50,
    knownAssociates: []
  }
]; 