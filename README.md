# Project Republica: Portugal (MVP)

## 📌 Overview
Project Republica is a web-based, heavily UI-driven political simulation game inspired by *Democracy 4*. The goal is to create a more realistic, hardcore political simulator with a focus on cabinet management, multi-party politicking, and realistic policy consequences. 

For the MVP, the game is strictly scoped to a **single-country simulation (Portugal)** to establish the core gameplay loop, the System Dynamics engine, and a clean, modern user interface.

## 🛠 Tech Stack
This project is built entirely with web technologies to maximize UI potential and ensure smooth, AI-driven development.
* **Frontend UI:** HTML5, CSS3 (using CSS Variables for theming / dark mode), and Vanilla JavaScript (ES6+). *(Note: Can be migrated to React/Vue later if state management gets too complex, but MVP will keep dependencies zero/low).*
* **Backend Logic:** Pure JavaScript. The math and simulation engine run locally in the browser. No external database or server is required for the MVP.
* **Visualization:** D3.js v7.9.0 for force-directed graph physics simulation
* **Charting/Graphs:** D3.js for node relationships, potential Chart.js integration for data charts

## Architecture & Separation of Concerns
To ensure the game remains fun and easy to balance, the codebase strictly separates the mathematical simulation (The Engine) from the visual dashboard (The UI).

### 1. The System Dynamics Engine (`/engine`)
The core of the game is a node-based graph with CSV-driven relationships. 
* **Nodes:** Represent metrics (e.g., `GDP`, `Healthcare_Quality`, `Socialist_Voter_Happiness`).
* **Policies:** Player-controlled levers (e.g., `Income_Tax_Rate`, `Public_Transport_Subsidies`).
* **Relationships:** CSV-defined mathematical relationships with weights and inertia values
* **The Tick Loop:** A function that processes all equations and advances the game by one month per turn.
* **Relationship Simulation:** Base-anchored target + inertia drift system for realistic metric evolution

### 2. The User Interface (`/ui`)
A clean, modern, dashboard-style interface. 
* Visually inspired by *Democracy 4* (dark themes, glassmorphism, clear typography).
* Relies on event listeners to update DOM elements when the Engine state changes.

## 📂 Project Structure
```text
/project-republica
│
├── index.html          # Main game dashboard layout with D3.js CDN
├── style.css           # Global styles, UI layout, and themes 
├── main.js             # Application entry point and event coordination
│
├── /engine             # NO UI CODE HERE. PURE MATHEMATICS
│   ├── state.js        # Portugal's initial conditions and policy management
│   ├── rules.js        # Economic formulas, policy multipliers, and relationship simulation
│   ├── gameLoop.js     # Turn processing and game state transitions
│   └── relationships.csv # CSV file defining node relationships with weights and inertia
│
└── /ui                 # NO MATH HERE. PURE VISUALS
    ├── render.js       # DOM updates and visual rendering logic
    ├── inputs.js       # User interaction handling and accessibility
    └── forceGraph.js   # D3.js physics simulation and force-directed graph rendering
```

## 🚀 Ready to Play
The MVP is now fully functional with advanced physics simulation! You can:
1. Start the game from the start screen
2. **Interact with force-directed nodes** that self-organize based on relationships
3. **Drag and reposition nodes** to customize your view
4. Adjust policies through the modal interface
5. **Tune physics parameters** with the settings panel
6. Advance turns and see the consequences
7. Monitor economic, social, and political indicators
8. Experience game over or victory conditions

## 🎮 How to Run
1. Start the local development server: `python -m http.server 8000`
2. Open your browser and navigate to `http://localhost:8000`
3. Click "Start Game" to begin your political simulation

## 📊 Game Mechanics & Features

### 🏛️ **Policy System**
The game features **22 adjustable policies** across 8 categories:

#### **Economic Policies**
- **Income Tax** (23% default): Affects personal income and government revenue
- **Corporate Tax** (19% default): Impacts business investment and economic growth
- **VAT** (23% default): Value-added tax affecting cost of living

#### **Social Policies** 
- **Healthcare Spending** (55% default): Public health system funding
- **Education Spending** (50% default): Educational system investment
- **Welfare Spending** (48% default): Social safety net programs

#### **Infrastructure**
- **Transport Spending** (42% default): Transportation infrastructure
- **Digital Infrastructure** (52% default): Digital connectivity and technology

#### **Law & Order**
- **Police Spending** (63% default): Law enforcement funding
- **Justice Spending** (51% default): Judicial system support

#### **Environmental**
- **Green Energy** (38% default): Renewable energy investment
- **Carbon Tax** (18% default): Environmental carbon pricing

#### **Housing Policies** (Portugal-Specific)
- **Mais Habitação** (35% default): "More Housing" program to increase supply
- **Golden Visa** (25% default): Controls foreign investment through residency
- **AL Taxes** (40% default): Local accommodation taxes for short-term rentals

#### **Labor Policies** (Portugal-Specific)
- **Minimum Wage** (45% default): Minimum wage adjustments
- **4-Day Week** (20% default): Experimental work-week reduction trials
- **Youth Jobs** (38% default): Youth employment programs

#### **Tax Policies** (Portugal-Specific)
- **IRS Brackets** (35% default): Progressive income tax rate adjustments
- **NHR Regime** (40% default): Non-Habitual resident tax benefits
- **Wealth Tax** (25% default): Tax on high-net-worth individuals

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
- **Happiness** (58% default): Affected by welfare, healthcare, housing crisis, and tax burden
- **Health** (65% default): Impacted by healthcare spending, SNS strain, and environmental policies
- **Education** (62% default): Influenced by education spending and teacher strikes
- **Safety** (78% default): Determined by police and justice spending
- **Youth Independence** (35% default): Affected by housing crisis and youth job programs
- **Rent Burden** (45% default): Housing cost pressure on households

### Political System
- **Approval Rating** (42% default): Based on population happiness and economic performance
- **Stability** (68% default): Reflects social cohesion and institutional strength
- **Corruption** (38% default): Lower values indicate better governance
- **Action Points**: 3 points per turn for policy adjustments

### Game Conditions

#### Victory Conditions
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
- **Turn Duration**: 1 month (monthly progression)
- **Action Points**: 3 per turn (reset each turn)
- **Progression**: January 2024 → February 2024 → March 2024... (12 turns = 1 year)
- **Relationship Processing**: Each turn processes CSV-defined relationships with inertia-based evolution

### 🗂️ **CSV-Based Relationship System**
The game uses a data-driven approach for defining policy and metric relationships:

#### **Relationship Data Structure** (`relationships.csv`)
- **Source**: Policy or metric node that influences others
- **Target**: Metric node that receives the influence
- **Weight**: Strength of relationship (-1.0 to +1.0, negative = inverse relationship)
- **Inertia**: Resistance to change (1-10, higher = slower evolution)

#### **Key Features**
- **49 Defined Relationships**: Covering all major policy-to-metric interactions
- **Inertia-Based Evolution**: Metrics change gradually based on historical inertia
- **Base-Anchored Targets**: Policies create target values that metrics drift toward
- **Async Loading**: CSV data loads asynchronously with start button state management
- **Error Handling**: Graceful fallback if relationship data fails to load

#### **Example Relationships**
```
incomeTax,gdp,-0.80,4        # Higher tax reduces GDP with medium inertia
healthcareSpending,health,0.70,3  # More spending improves health
unemployment,happiness,-0.50,3     # High unemployment hurts happiness
carbonTax,inflation,0.25,2         # Carbon tax causes inflation
```

#### **Simulation Process**
1. **Policy Changes** create target values for affected metrics
2. **Inertia System** gradually moves current values toward targets
3. **Monthly Processing** applies all relationships simultaneously
4. **Feedback Loops** allow metrics to influence other metrics over time

### 🎨 **User Interface**
- **Start Screen**: Clean introduction with game title and start button
- **Top Navigation Bar**: Real-time budget display, turn counter, action points
- **Force-Directed Canvas**: Dynamic D3.js physics-based node layout
- **Interactive Modals**: Policy adjustment sliders with real-time preview
- **Visual Feedback**: Hover states, color-coded indicators, smooth transitions
- **Physics Controls**: Settings panel for adjusting graph simulation parameters

### 🌐 **Force-Directed Graph System**
- **D3.js Integration**: Industry-standard physics simulation library
- **Dynamic Node Positioning**: Nodes self-organize based on CSV-defined relationships
- **Visual Relationship Links**: Color-coded arrows showing positive/negative impacts from CSV data
- **Interactive Dragging**: Click and drag nodes to reposition them
- **Physics Simulation**: Repulsion, gravity, collision, and link forces
- **Real-time Adjustments**: Settings panel to tune physics parameters
- **Link Strength Visualization**: Thicker lines = stronger policy impacts (based on CSV weights)
- **Relationship Data Loading**: Async CSV loading with start button state management

### ⚙️ **Physics Controls Panel**
- **Repulsion Force**: Controls how strongly nodes push apart (-80 to -420)
- **Gravity Strength**: Pulls nodes toward center (0.005 to 0.12)
- **Link Pull**: Controls attraction between connected nodes (0.05 to 0.5)
- **Link Distance**: Preferred distance between connected nodes (120px to 320px)
- **Reset Defaults**: Restore original physics parameters

### 📊 **Real-time Preview System**
When adjusting policies in the modal:
- **Live Budget Preview**: Shows projected income, expenditure, deficit changes
- **Population Impact Preview**: Displays expected happiness changes
- **Immediate Visual Feedback**: Numbers update as you move the slider
- **Apply/Cancel System**: Confirm changes before committing to game state

### 🏗️ **Technical Architecture**

#### **Engine (`/engine`) - Pure Mathematics**
- **state.js**: Portugal's initial conditions and policy management
- **rules.js**: Economic formulas, policy multipliers, and CSV-driven relationship simulation
- **gameLoop.js**: Turn processing with relationship-based metric evolution
- **relationships.csv**: Data-driven relationship definitions with weights and inertia

#### **UI (`/ui`) - Pure Visuals**
- **render.js**: DOM updates and visual rendering logic
- **inputs.js**: User interaction handling and accessibility
- **forceGraph.js**: D3.js physics simulation and force-directed graph rendering

#### **Core Application**
- **main.js**: Application entry point and event coordination
- **index.html**: Semantic HTML structure with D3.js CDN
- **style.css**: Democracy 4 inspired styling with CSS variables

### 🎮 **Gameplay Flow**
1. **Start Game**: Click "Start Game" from main menu
2. **Assess Situation**: Review economic indicators and population metrics
3. **Adjust Policies**: Click policy nodes, adjust sliders, preview changes
4. **Apply Changes**: Confirm policy adjustments (consumes action points)
5. **Advance Turn**: Click "Next Turn" to process monthly results
6. **Monitor Progress**: Watch indicators change based on policy decisions
7. **Achieve Goals**: Work toward victory conditions or avoid game over

### 🔧 **Advanced Features**
- **Score Calculation**: Comprehensive performance scoring system
- **Performance Indicators**: Detailed breakdown of all metrics
- **Responsive Design**: Adapts to different screen sizes
- **Keyboard Shortcuts**: ESC for modal, Enter to apply, Ctrl+N for next turn
- **Accessibility**: ARIA labels, focus management, keyboard navigation

### 🌍 **Portugal-Specific Data**
- **Initial GDP**: €267 billion (2023 actual)
- **Population**: 10.3 million
- **Starting Debt**: €264 billion (99% debt-to-GDP ratio)
- **Inflation**: 2.3% (January 2024 actual)
- **Unemployment**: 6.5% (January 2024 actual)
- **Economic Profile**: Service-based economy with tourism focus
- **Political Context**: Parliamentary republic with multi-party system
- **Current Events**: Housing crisis, SNS strain, education strikes (January 2024)

### 🎯 **Outcome Nodes on Canvas**
- **7 outcome nodes** displayed in center: GDP, Health, Happiness, Education, Safety, Unemployment, Inflation
- **Interactive tooltips** showing detailed metrics and context
- **Real-time updates** as policies change and turns progress
- **Visual hierarchy** with smaller nodes (70px) vs policy nodes (80px)

### 📊 **Current Events Integration**
- **Housing Crisis**: High rent prices (0.9 severity), low youth independence (0.7)
- **SNS Strain**: Long wait times (0.8), doctor strikes (0.6), funding gaps (0.5)
- **Education Strikes**: Teacher strikes (0.7), quality impact (0.5), student impact (0.6)
- **Dynamic impacts** on population metrics based on policy choices