export interface Artifact {
  id: string;
  name: string;
  description: string;
  type: 'document' | 'photograph' | 'object' | 'letter';
  content?: string;
  imageUrl?: string;
  isRevealed: boolean;
}

export interface Passenger {
  id: string;
  name: string;
  title: string;
  description: string;
  background: string;
  artifacts: Artifact[];
  initialDialogue: string;
  secrets: string[];
  trustLevel: number;
  isInspected: boolean;
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
        isRevealed: false
      },
      {
        id: 'academy_badge',
        name: 'Imperial Academy Badge',
        description: 'A tarnished brass badge showing his former position.',
        type: 'object',
        imageUrl: '/assets/artifacts/academy_badge.png',
        isRevealed: false
      }
    ],
    initialDialogue: "I assure you, Inspector, these are merely theoretical exercises. The Academy's concerns were... exaggerated.",
    secrets: [
      'The equations could potentially allow time travel',
      'He was forced to leave the Academy after a failed experiment',
      'His destination is not a university but a secret research facility'
    ],
    trustLevel: 0,
    isInspected: false
  },
  {
    id: 'widow',
    name: 'Madame Elena Petrovna',
    title: 'The Widow',
    description: 'A woman in black, clutching a worn photograph.',
    background: 'Claims to be visiting her husband\'s grave in the next town. Her luggage contains items that suggest a different journey entirely.',
    artifacts: [
      {
        id: 'husband_photo',
        name: 'Worn Photograph',
        description: 'A faded photograph of a man in military uniform.',
        type: 'photograph',
        imageUrl: '/assets/artifacts/husband_photo.png',
        isRevealed: false
      },
      {
        id: 'train_ticket',
        name: 'One-Way Ticket',
        description: 'A ticket to a destination far beyond the claimed grave site.',
        type: 'document',
        content: 'Destination: Northern Research Outpost',
        isRevealed: false
      }
    ],
    initialDialogue: 'My husband... he was a good man. The war took him from me, but his memory lives on.',
    secrets: [
      'Her husband might still be alive',
      'She\'s carrying classified military documents',
      'The photograph is not of her husband'
    ],
    trustLevel: 0,
    isInspected: false
  },
  {
    id: 'mechanic',
    name: 'Boris "The Fixer"',
    title: 'The Mechanic',
    description: 'A gruff individual with oil-stained hands and a mysterious toolbox.',
    background: 'Claims to be a simple repairman, but their knowledge of the train\'s inner workings seems too detailed for a simple mechanic.',
    artifacts: [
      {
        id: 'toolbox',
        name: 'Mysterious Toolbox',
        description: 'Contains tools that seem too advanced for simple repairs.',
        type: 'object',
        imageUrl: '/assets/artifacts/toolbox.png',
        isRevealed: false
      },
      {
        id: 'blueprints',
        name: 'Train Blueprints',
        description: 'Detailed schematics of the train\'s mechanical systems.',
        type: 'document',
        content: 'The blueprints show modifications to the train\'s power systems...',
        isRevealed: false
      }
    ],
    initialDialogue: 'Just doing my job, Inspector. This old train needs constant attention, you know how it is.',
    secrets: [
      'They were once the train\'s chief engineer',
      'The toolbox contains sabotage tools',
      'They know about the train\'s secret compartments'
    ],
    trustLevel: 0,
    isInspected: false
  },
  {
    id: 'child',
    name: 'Anya',
    title: 'The Child',
    description: 'Traveling alone with a music box that plays a haunting melody.',
    background: 'Claims to be traveling to meet relatives, but their innocence might be a facade. Their connection to the train\'s past is deeper than it appears.',
    artifacts: [
      {
        id: 'music_box',
        name: 'Haunting Music Box',
        description: 'Plays a melody that seems to affect the train\'s systems.',
        type: 'object',
        imageUrl: '/assets/artifacts/music_box.png',
        isRevealed: false
      },
      {
        id: 'old_ticket',
        name: 'Vintage Ticket',
        description: 'A ticket from 20 years ago, somehow still valid.',
        type: 'document',
        content: 'Issued to: Anya Volkov, Date: 1945',
        isRevealed: false
      }
    ],
    initialDialogue: 'The music box was my mother\'s. She said it would keep me safe on my journey.',
    secrets: [
      'The child might be much older than they appear',
      'The music box contains a hidden message',
      'They\'re related to the Professor'
    ],
    trustLevel: 0,
    isInspected: false
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
        isRevealed: false
      },
      {
        id: 'sealed_orders',
        name: 'Sealed Orders',
        description: 'A sealed envelope containing classified instructions.',
        type: 'document',
        content: 'To be opened only at the final station...',
        isRevealed: false
      }
    ],
    initialDialogue: 'I trust you understand the importance of my mission, Inspector. Some questions are better left unasked.',
    secrets: [
      'They\'re not who they claim to be',
      'The orders contain a list of passengers to be detained',
      'They know about the train\'s true purpose'
    ],
    trustLevel: 0,
    isInspected: false
  }
]; 