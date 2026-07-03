# IFRS 17 Master: Regulatory Training Game

A comprehensive, gamified training platform for IFRS 17 (International Financial Reporting Standard 17) - Insurance Contracts. This interactive web application helps professionals learn and master IFRS 17 concepts through an engaging quiz-based game experience.

## 🎯 Overview

The IFRS 17 Master Training Game transforms complex regulatory learning into an engaging, competitive experience. Users progress through structured modules, earn achievements, compete on leaderboards, and track their mastery of IFRS 17 concepts in real-time.

## ✨ Key Features

### 🎮 Core Gameplay
- **Progressive Module System**: 15 comprehensive training modules covering all aspects of IFRS 17
- **Randomized Questions**: Fisher-Yates shuffle algorithm ensures unique question ordering each session
- **Difficulty Tiers**: Every question is tagged Beginner/Standard/Expert; modules ramp up in difficulty and harder questions earn more XP
- **Scoring System**: Dynamic point calculation with combo multipliers and streak bonuses
- **Power-ups**: Eliminate (remove two wrong options) and Hint (ask the AI assistant), limited per module
- **Real-time Feedback**: Instant explanations and performance tracking

### 🏆 Gamification Elements
- **Achievement System**: 8+ unlockable achievements with gender-adaptive naming
- **Level Progression**: XP-based leveling system with visual progress indicators
- **Streak & Combo Tracking**: Momentum-based scoring multipliers
- **Perfect Module Recognition**: Special rewards for flawless module completion

### 📊 Progress & Analytics
- **Cross-Browser Progress Sync**: Supabase-powered cloud storage with localStorage fallback
- **Comprehensive Leaderboards**: Global and module-specific rankings
- **Module Completion Tracking**: Visual progress indicators and completion statistics
- **Time-based Performance**: Module completion time tracking for competitive analysis

### 👥 User Management
- **Secure Authentication**: Email-based registration with comprehensive user profiles
- **Multi-Profile Support**: Organization, country, and demographic tracking
- **Profile Persistence**: Automatic progress saving and restoration
- **Social Features**: User avatars and organization-based grouping

## 🏗️ Technical Architecture

### Frontend Stack
- **React 19.1.0**: Modern functional components with hooks
- **Lucide React**: Beautiful, consistent iconography
- **Tailwind CSS**: Responsive, utility-first styling
- **Gradient Animations**: Smooth UI transitions and visual effects

### Backend Services
- **Supabase**: PostgreSQL database with real-time capabilities
- **Row Level Security**: Comprehensive data protection
- **RESTful APIs**: Efficient data synchronization

### Key Components

#### Core Game Engine (`IFRS17TrainingGame.js`)
- State management for 15+ game variables
- Question randomization and progress tracking
- Achievement detection and awarding
- Leaderboard integration and scoring

#### Authentication System (`AuthScreen.js`)
- User registration and login
- Country selection (195+ countries)
- Profile customization
- Session management

#### Data Layer
- **Modules**: 15 training modules with 300+ questions, generated from a CSV question bank (see below)
- **Achievements**: Dynamic achievement system with conditions
- **Storage Service**: Dual storage strategy (cloud + local)
- **Leaderboard Service**: Real-time competitive features

## 📚 IFRS 17 Training Modules

1. **📚 IFRS 17 Fundamentals** - Core concepts and objectives
2. **🎯 Combination & Separation of Insurance Contracts** - Contract grouping principles
3. **🔐 Level of Aggregation** - Portfolio and group management
4. **🔒 Measurement on Initial Recognition** - Initial valuation methods
5. **📈 Subsequent Measurement** - Ongoing valuation updates
6. **📊 Presentation** - Financial statement presentation
7. **📋 Disclosure Requirements** - Reporting obligations
8. **🔄 Transition to IFRS 17** - Implementation guidance
9. **🛡️ Reinsurance Contracts Held** - Reinsurance accounting

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn package manager
- Modern web browser

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/robin-ochieng/IFRS-17-Training-Game.git
   cd IFRS-17-Training-Game
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:
   ```env
   REACT_APP_SUPABASE_URL=your_supabase_url
   REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Database Setup**
   Execute the SQL schema found in database setup files to create required tables:
   - `leaderboard` table for overall rankings
   - `module_leaderboard` table for module-specific rankings
   - `user_progress` table for progress tracking

5. **Start the development server**
   ```bash
   npm start
   ```

6. **Build for production**
   ```bash
   npm run build
   ```

## 🎯 Usage Guide

### For Learners
1. **Registration**: Create account with email, organization, and location
2. **Module Progression**: Complete modules sequentially to unlock new content
3. **Question Answering**: Select answers to randomized questions with instant feedback
4. **Power-up Strategy**: Use Hint and Eliminate strategically — allowances reset each module
5. **Achievement Hunting**: Unlock achievements through various accomplishments
6. **Leaderboard Climbing**: Compete globally and within specific modules

### For Administrators
- Monitor user progress through Supabase dashboard
- Analyze completion rates and performance metrics
- Manage user accounts and organizational groupings
- Export progress data for reporting

## 🏛️ Database Schema

### Tables Overview
- **leaderboard**: Overall user rankings and scores
- **module_leaderboard**: Module-specific performance data
- **user_progress**: Individual progress tracking
- **users**: Authentication and profile data

### Key Relationships
- Users have multiple module completions
- Leaderboards aggregate user performance
- Progress tracking enables cross-device continuity

## 🔧 Configuration

### Power-ups System
```javascript
INITIAL_POWER_UPS = {
  eliminate: 2, // Remove two wrong answers
  hint: 3       // Ask the AI assistant for a hint
}
```

### Updating Question Content

The question bank lives in `questions/ifrs17_questions_choices_explanations excel database.csv`
(columns: Module No, Module Name, Complexity, Question, Option 1–4, Correct Answer, Explanation).
`src/data/IFRS17Modules.js` is GENERATED from it — never edit the JS file by hand.

1. Edit the CSV (keep Complexity one of Beginner/Standard/Expert; Correct Answer must exactly match one option).
2. Run `npm run generate:questions` — it validates every row and refuses to write on any error.
3. Commit both the CSV and the regenerated `src/data/IFRS17Modules.js`.

### Achievement Conditions
- Score milestones (10+ points)
- Streak achievements (5+ consecutive correct)
- Perfect module completion
- Level progression targets

### Scoring Algorithm
```javascript
points = basePoints(10) * comboMultiplier * streakBonus
```

## 🎨 UI/UX Features

### Visual Design
- **Dark Theme**: Professional, modern appearance
- **Gradient Backgrounds**: Dynamic visual appeal
- **Responsive Layout**: Optimized for all device sizes
- **Accessibility**: Screen reader compatible, keyboard navigation

### Interactive Elements
- **Progress Bars**: Visual completion tracking
- **Animation Effects**: Smooth transitions and feedback
- **Modal Systems**: Overlay-based interactions
- **Button States**: Clear interaction feedback

## 📱 Cross-Platform Compatibility

### Supported Browsers
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Device Support
- Desktop (Windows, macOS, Linux)
- Tablets (iOS, Android)
- Mobile phones (responsive design)

## 🔒 Security Features

- **Row Level Security**: Database-level access control
- **Input Validation**: Sanitized user inputs
- **Session Management**: Secure authentication tokens
- **Data Encryption**: Protected sensitive information

## 📈 Performance Optimization

### Efficiency Measures
- **Lazy Loading**: On-demand component loading
- **State Optimization**: Minimal re-renders
- **Database Indexing**: Fast query performance
- **Caching Strategy**: Reduced API calls

### Monitoring
- **Error Tracking**: Comprehensive error logging
- **Performance Metrics**: Load time monitoring
- **User Analytics**: Engagement tracking

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

### Code Standards
- ES6+ JavaScript conventions
- React functional components with hooks
- Tailwind CSS for styling
- Comprehensive error handling

## 📄 License

This project is proprietary software owned by IRA - Kenbright. All rights reserved.

## 🏢 About Kenbright

Kenbright AI is a leading provider of financial regulatory training solutions, specializing in innovative, technology-driven educational platforms for professionals in the insurance and financial services sectors.

### Contact Information
- **Website**: [Kenbright AI](https://kenbright.ai)
- **Email**: support@kenbright.ai
- **Organization**: Insurance Regulatory Authority (IRA) - Kenbright Partnership

## 📊 Project Statistics

- **Total Questions**: 300+ across 15 modules
- **Achievement Types**: 8 unique achievements
- **Supported Countries**: 195 countries
- **Power-up Types**: 2 strategic game enhancers (Eliminate, Hint)
- **Component Count**: 15+ React components
- **Database Tables**: 4 primary tables

## 🔄 Version History

### Version 1.0.0 (Current)
- Complete IFRS 17 curriculum implementation
- Full gamification system
- Cloud-based progress synchronization
- Comprehensive leaderboard system
- Cross-browser compatibility
- Mobile-responsive design

## 🎓 Educational Value

This platform serves as a comprehensive training tool for:
- **Insurance Professionals**: Practical IFRS 17 application
- **Accounting Teams**: Technical implementation guidance
- **Regulatory Compliance**: Standards comprehension
- **Financial Analysts**: Reporting requirement understanding
- **Students**: Interactive learning experience

---

**Copyright © 2025 IRA - Kenbright. All rights reserved.**

*Powered by Kenbright AI | Version 1.0.0 | IFRS 17 Training Platform*
