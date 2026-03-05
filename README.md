# Project Republica: Portugal (MVP)

## 📌 Overview
Project Republica is a web-based, heavily UI-driven political simulation game inspired by *Democracy 4*. The goal is to create a more realistic, hardcore political simulator with a focus on cabinet management, multi-party politicking, and realistic policy consequences. 

For the MVP, the game is strictly scoped to a **single-country simulation (Portugal)** to establish the core gameplay loop, the System Dynamics engine, and a clean, modern user interface.

## 🛠 Tech Stack
This project is built entirely with web technologies to maximize UI potential and ensure smooth, AI-driven development.
* **Frontend UI:** HTML5, CSS3 (using CSS Variables for theming / dark mode), and Vanilla JavaScript (ES6+). *(Note: Can be migrated to React/Vue later if state management gets too complex, but MVP will keep dependencies zero/low).*
* **Backend Logic:** Pure JavaScript. The math and simulation engine run locally in the browser. No external database or server is required for the MVP.
* **Charting/Graphs:** Chart.js or Recharts (to be implemented for node data visualization).

## 🏗 Architecture & Separation of Concerns
To ensure the game remains fun and easy to balance, the codebase strictly separates the mathematical simulation (The Engine) from the visual dashboard (The UI).

### 1. The System Dynamics Engine (`/engine`)
The core of the game is a node-based graph. 
* **Nodes:** Represent metrics (e.g., `GDP`, `Healthcare_Quality`, `Socialist_Voter_Happiness`).
* **Policies:** Player-controlled levers (e.g., `Income_Tax_Rate`, `Public_Transport_Subsidies`).
* **Edges/Multipliers:** The mathematical relationships defining how changes in one node affect others.
* **The Tick Loop:** A function that processes all equations and advances the game by one quarter (3 months) per turn.

### 2. The User Interface (`/ui`)
A clean, modern, dashboard-style interface. 
* Visually inspired by *Democracy 4* (dark themes, glassmorphism, clear typography).
* Relies on event listeners to update DOM elements when the Engine state changes.

## 📂 Current Folder Structure
```text
/project-republica
│
├── index.html          # Main game dashboard layout 
├── style.css           # Global styles, UI layout, and themes 
├── main.js             # Application entry point and core events 
│
├── /engine             # NO UI CODE HERE. PURE MATH. 
│   ├── state.js        # The initial variables for Portugal (GDP, population, etc.) 
│   ├── rules.js        # The mathematical relationships between nodes 
│   └── gameLoop.js     # The function that calculates the next turn 
│
└── /ui                 # NO MATH HERE. PURE VISUALS. 
    ├── render.js       # Updates the HTML DOM based on the current engine state 
    └── inputs.js       # Handles button clicks, sliders, and passing data to the engine 
```

## 🎯 Current Implementation Status

### Phase 1: Dev Environment & Boilerplate - COMPLETED
* [x] Initialize the Git repository.
* [x] Set up the basic file structure (`index.html`, `style.css`, `main.js`).
* [x] Configure a local development server (Python HTTP server on port 8000).
* [x] Establish global CSS variables for the *Democracy 4* color palette.

### Phase 2: Basic Navigation & Scaffolding - COMPLETED
* [x] Create a static `Start Screen` div with a title ("Project Republica: Portugal") and a "Start Game" button.
* [x] Create the `Main Game View` div, initially hidden.
* [x] Write the JavaScript logic to hide the Start Screen and display the Main Game View when the button is clicked.

### Phase 3: "Dumb" Core Nodes (Text-Based Prototype) - COMPLETED
* [x] Define a basic JavaScript object containing core metrics (GDP, Debt, Income, Expenditure, Healthcare, etc.).
* [x] Render these nodes as interactive circular nodes in the radial canvas.
* [x] Ensure the JavaScript can successfully read from the object and display values in the HTML DOM.

### Phase 4: D4 UI Replication (Static Layout) - COMPLETED
*Note: The left-side popularity/voter panel from D4 is strictly omitted for this MVP.*

* [x] **The Top Bar:** Build the fixed top navigation bar.
* [x] Add formatted text blocks for Income, Expenditure, Deficit, and Debt.
* [x] Add the Turn/Time progress indicator.
* [x] Add the central "Action Points" icon.
* [x] Add placeholder icon buttons on the top right (Charts, Finances, Policies, Settings, Next Turn).
* [x] **The Radial Canvas:** Create the main central area where nodes will live.
* [x] Use CSS to create the radial dividers that separate categories (Economy, Welfare, Law & Order, Infrastructure, Environment).
* [x] Convert nodes into the circular icon style seen in D4 (white circle, colored border based on node type, central icon).

### Phase 5: Building out the UI Interactions - COMPLETED
* [x] **Hover States:** Add CSS effects so nodes slightly enlarge and highlight when the mouse hovers over them.
* [x] **Node Modals (The Sliders):** Create a generic popup/modal that appears when a policy node is clicked.
* [x] Include a title, a description, and an HTML range slider to adjust the policy's intensity.
* [x] Add "Apply" and "Cancel" buttons to the modal.
* [x] **Data Binding:** Connect the sliders in the modals so that adjusting them updates the game state.

### Phase 6: The Core Engine Loop (MVP Mechanics) - COMPLETED
* [x] Write the `nextTurn()` function triggered by the Next Turn button.
* [x] Create the basic math logic: calculate `Income` based on tax nodes, `Expenditure` based on policy nodes, and update the `Deficit/Debt` accordingly.
* [x] Ensure the Top Bar UI updates with the new math after every turn.
* [x] Implement game over conditions and victory conditions.
* [x] Add score calculation and performance indicators.

## 🚀 Ready to Play
The MVP is now fully functional! You can:
1. Start the game from the start screen
2. Adjust policies through the modal interface
3. Advance turns and see the consequences
4. Monitor economic, social, and political indicators
5. Experience game over or victory conditions

## 🎮 How to Run
1. Start the local development server: `python -m http.server 8000`
2. Open your browser and navigate to `http://localhost:8000`
3. Click "Start Game" to begin your political simulation

## 📊 Game Mechanics & Features

### 🏛️ **Policy System**
The game features **13 adjustable policies** across 5 categories:

#### **Economic Policies**
- **Income Tax** (25% default): Affects personal income and government revenue
- **Corporate Tax** (21% default): Impacts business investment and economic growth
- **VAT** (23% default): Value-added tax affecting cost of living

#### **Social Policies** 
- **Healthcare Spending** (60% default): Public health system funding
- **Education Spending** (55% default): Educational system investment
- **Welfare Spending** (45% default): Social safety net programs

#### **Infrastructure**
- **Transport Spending** (40% default): Transportation infrastructure
- **Digital Infrastructure** (50% default): Digital connectivity and technology

#### **Law & Order**
- **Police Spending** (65% default): Law enforcement funding
- **Justice Spending** (50% default): Judicial system support

#### **Environmental**
- **Green Energy** (35% default): Renewable energy investment
- **Carbon Tax** (20% default): Environmental carbon pricing

### 📈 **Economic Simulation**
- **GDP Growth**: Dynamic calculation based on policy decisions (target ~2% annually)
- **Unemployment**: Responds to tax rates and economic conditions
- **Inflation**: Influenced by deficit spending and carbon tax
- **Budget Calculation**: 
  - Income: GDP × tax_rates × multipliers
  - Expenditure: GDP × 0.4 × policy_multipliers
  - Deficit: Expenditure - Income
  - Debt: Cumulative deficits

### 👥 **Population Metrics**
- **Happiness** (65% default): Affected by welfare, healthcare, and tax burden
- **Health** (72% default): Impacted by healthcare spending and environmental policies
- **Education** (68% default): Influenced by education and digital infrastructure spending
- **Safety** (78% default): Determined by police and justice spending

### 🗳️ **Political System**
- **Approval Rating** (45% default): Based on population happiness and economic performance
- **Stability** (70% default): Reflects social cohesion and institutional strength
- **Corruption** (35% default): Lower values indicate better governance
- **Action Points**: 3 points per turn for policy adjustments

### 🎯 **Game Conditions**

#### **Victory Conditions**
- Approval > 80%
- GDP growth > 3%
- Happiness > 75%
- Minimum 20 turns played

#### **Game Over Conditions**
- Economic collapse: Debt > 200% of GDP
- Political instability: Stability < 20%
- Population revolt: Happiness < 20%
- Hyperinflation: Inflation > 15%
- Mass unemployment: Unemployment > 20%

### 🔄 **Turn System**
- **Turn Duration**: 3 months (quarterly)
- **Action Points**: 3 per turn (reset each turn)
- **Progression**: Q1 2024 → Q2 2024 → Q3 2024 → Q4 2024 → Q1 2025...

### 🎨 **User Interface**
- **Start Screen**: Clean introduction with game title and start button
- **Top Navigation Bar**: Real-time budget display, turn counter, action points
- **Radial Policy Canvas**: Circular node layout with category dividers
- **Interactive Modals**: Policy adjustment sliders with real-time preview
- **Visual Feedback**: Hover states, color-coded indicators, smooth transitions

### 📊 **Real-time Preview System**
When adjusting policies in the modal:
- **Live Budget Preview**: Shows projected income, expenditure, deficit changes
- **Population Impact Preview**: Displays expected happiness changes
- **Immediate Visual Feedback**: Numbers update as you move the slider
- **Apply/Cancel System**: Confirm changes before committing to game state

### 🏗️ **Technical Architecture**

#### **Engine (`/engine`) - Pure Mathematics**
- **state.js**: Portugal's initial conditions and policy management
- **rules.js**: Economic formulas and policy multipliers
- **gameLoop.js**: Turn processing and game state transitions

#### **UI (`/ui`) - Pure Visuals**
- **render.js**: DOM updates and visual rendering logic
- **inputs.js**: User interaction handling and accessibility

#### **Core Application**
- **main.js**: Application entry point and event coordination
- **index.html**: Semantic HTML structure
- **style.css**: Democracy 4 inspired styling with CSS variables

### 🎮 **Gameplay Flow**
1. **Start Game**: Click "Start Game" from main menu
2. **Assess Situation**: Review economic indicators and population metrics
3. **Adjust Policies**: Click policy nodes, adjust sliders, preview changes
4. **Apply Changes**: Confirm policy adjustments (consumes action points)
5. **Advance Turn**: Click "Next Turn" to process quarterly results
6. **Monitor Progress**: Watch indicators change based on policy decisions
7. **Achieve Goals**: Work toward victory conditions or avoid game over

### 🔧 **Advanced Features**
- **Score Calculation**: Comprehensive performance scoring system
- **Performance Indicators**: Detailed breakdown of all metrics
- **Responsive Design**: Adapts to different screen sizes
- **Keyboard Shortcuts**: ESC for modal, Enter to apply, Ctrl+N for next turn
- **Accessibility**: ARIA labels, focus management, keyboard navigation

### 🌍 **Portugal-Specific Data**
- **Initial GDP**: €250 billion
- **Population**: 10.3 million
- **Starting Debt**: €350 billion
- **Economic Profile**: Service-based economy with tourism focus
- **Political Context**: Parliamentary republic with multi-party system