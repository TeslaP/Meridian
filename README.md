# Meredian

**Meredian** is a retro-futuristic narrative simulation game that blends elements of **Orwellian dystopia**, **steampunk aesthetics**, and **mystery storytelling**. Inspired by games like *Lifeline*, films like *Dogville*, and books such as *The Castle* by Kafka, *Meredian* takes place aboard a traveling inspection train in a post-war, crumbling empire. As an inspector tasked with evaluating passengers at a secret border checkpoint, your job is to question their stories, investigate their belongings, and ultimately determine if they are lying, hiding something, or if their past can be uncovered.

---

### 🎮 **Core Mechanics**
- **Dialogue System**: Use natural language processing (GPT-based) to interrogate passengers. Their responses are influenced by your journal and the clues you've found. Conversations can lead to reveals, mistrust, or completely new avenues for investigation.
- **Item Inspection**: Investigate personal belongings, photographs, letters, and documents for hidden clues. Each item found could be an essential piece of the puzzle or just another false lead.
- **Lie Detection**: Use mechanical devices (like an old-fashioned lie detector) to get closer to the truth. The more you upgrade this tool, the more you can unveil.
- **Journal System**: Keep track of inconsistencies, theories, and clues discovered. Your journal isn't just a log — it's a reflection of your ability to piece together the truth, offering you upgrades as you make progress in the game.

---

### 🗺️ **Game Setting & Narrative**
- **Time Period**: Late 1940s–early 1950s, set in a fictional Eastern European-inspired country. The train itself is an anachronism — a mix of steam and early mechanical technology, lost in time but still clinging to life amidst a decaying empire.
- **Tone & Themes**: The world of *Meredian* is morally ambiguous. There are no clear heroes or villains. Everything is obscured in fog, and players must peel away layers of truth by talking to passengers, examining items, and digging into the personal stories they uncover. You'll wrestle with themes like **truth vs. deception**, **identity**, **freedom**, and **the control of information**.
- **Visual Style**: Steampunk and dieselpunk elements blend seamlessly with retro-futuristic designs. Expect rusted brass, worn leather, and cold metallic surfaces. The stations, train cars, and characters have an aged look, bathed in flickering light from steam-powered lamps and holographic interfaces. The design should feel like an alternative history where old-world aesthetics meet early 20th-century technologies.
- **Narrative Influence**: The gameplay will unfold like an **interactive noir** thriller, where every character hides a secret and every detail can become part of the larger mystery. The plot itself is layered and full of reveals, shifting as you interact with the world. The ultimate goal is to uncover the mystery of the Meredian train and its passengers — but whether you find redemption or ruin is up to the choices you make.

### 👥 **Passengers & Characters**
- **The Inspector**: A silent observer, armed with a mechanical lie detector and a journal. Your role is to maintain order in a world where truth is fluid and everyone has something to hide. Your decisions shape not just the fate of the passengers, but the very nature of the train itself.

- **The Passengers**:
  - **The Professor**: A disgraced academic carrying forbidden research papers. Claims to be traveling to a new teaching position, but his briefcase contains equations that could change the world.
  - **The Widow**: A woman in black, clutching a worn photograph. Her story of visiting her husband's grave doesn't quite add up, and her luggage contains items that suggest a different journey entirely.
  - **The Mechanic**: A gruff individual with oil-stained hands and a mysterious toolbox. Their knowledge of the train's inner workings seems too detailed for a simple repairman.
  - **The Child**: Traveling alone with a music box that plays a haunting melody. Their innocence might be a facade, and their connection to the train's past is deeper than it appears.
  - **The Official**: A government representative with impeccable credentials and a cold demeanor. Their presence on the train raises questions about who's really in control.

Each passenger's story is layered with:
- **Personal Artifacts**: Letters, photographs, and objects that reveal hidden truths
- **Dynamic Responses**: Their reactions to your questions change based on your approach and discoveries
- **Interconnected Histories**: Their stories are subtly linked, creating a web of intrigue
- **Multiple Endings**: Each passenger's fate can be determined in various ways, affecting the overall narrative

---

### ⚙️ **Tech Stack**
- **Frontend**: React + Vite for quick development and modular design
- **AI**: OpenAI GPT API for dialogue generation, with custom prompt engineering to fit the game's atmosphere
- **Data Storage**: JSON-driven narrative structure for passengers, dialogues, clues, and journal entries
- **Styling**: Custom CSS based on retro-futuristic and steampunk aesthetic references, combined with animations and interactions

### 🚧 **MVP Goal**
Build a playable vertical slice with:
- One full passenger interaction, including initial dialogue, item inspection, and lie detection
- Journal system for logging clues and inconsistencies
- Basic train car navigation and environment design
- Prototype UI that reflects the gritty, cold atmosphere of the world (e.g., vintage typewriter-style font, mechanical interface designs)

---

### **Vibe & Atmosphere**
The **vibe** of *Meredian* is tense, mysterious, and introspective. The train feels like a **moving prison**, where the passengers are more than they seem, and the inspector is both judge and prisoner. It's a world where **nothing is straightforward**, and **truth is elusive**. Characters are all deeply flawed, and the sense of paranoia is pervasive — no one can be trusted, but everyone has a story to tell. This creates an atmosphere where the player constantly feels both immersed and on edge, making every interaction meaningful and every discovery profound.

### **Visual Inspirations**
- **Steampunk**: Rusted brass, antique clocks, steam-driven technology
- **Orwellian Dystopia**: Cold, clinical government-controlled environments
- **Retro Futuristic**: Dark, mysterious train cars, with a mix of old-world technology and sci-fi elements
- **Gritty Noir**: Shadowy, dimly lit settings with high-contrast lighting and a constant air of mystery

## 🛠️ Development Setup

### Prerequisites
- Node.js (v18 or higher)
- npm (comes with Node.js)
- OpenAI API key

### Installation

1. Clone the repository:
```bash
git clone https://github.com/TeslaP/Meridian.git
cd meridian
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```bash
VITE_OPENAI_API_KEY=your_openai_api_key_here
```

4. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000` (or the next available port if 3000 is in use)

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 📁 Project Structure

```
meridian/
├── public/              # Static assets
├── src/
│   ├── components/      # React components
│   ├── pages/          # Page components
│   ├── assets/         # Images, fonts, etc.
│   ├── lib/            # Utility functions
│   ├── services/       # API services
│   ├── content/        # JSON/Markdown content
│   └── styles/         # Global styles
├── index.html          # Entry HTML
└── main.ts            # Application entry point
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by *Lifeline*, *The Castle* by Kafka, *Orwell*, and *Syberia*
- Built with React, Vite, and OpenAI's GPT API
- Special thanks to all contributors and supporters 