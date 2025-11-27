# 🏋️ FitTracker Pro

> **AI-Powered Fitness Coaching Platform** - Your personal trainer powered by AI, completely free.

A modern, full-stack fitness tracking application with real-time AI coaching that replaces expensive personal trainers with cutting-edge AI technology.

[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-green)](https://supabase.com/)
[![Groq](https://img.shields.io/badge/AI-Groq-purple)](https://groq.com/)

---

## ✨ Features

### 🤖 AI Coaching System
- **Real-time workout feedback** - Get instant suggestions after each set
- **Conversational AI coach** - Chat naturally about training, nutrition, and recovery
- **Form analysis** - AI-powered technique correction
- **Program design** - Custom workout plans based on your goals
- **Voice input/output** - Hands-free coaching during workouts
- **Smart progression** - AI adjusts weights and reps based on performance

### 📊 Workout Tracking
- Log exercises, sets, reps, and weight
- Rate difficulty and form quality after each set
- Track RPE (Rate of Perceived Exertion)
- View workout history and progress
- Calculate total volume and performance metrics

### 🎯 Smart Features
- **Progressive overload tracking** - Never guess your next weight
- **Injury prevention** - AI warns about overtraining
- **Recovery management** - Get rest day recommendations
- **Nutrition guidance** - Meal planning and macro calculations
- **Weekly check-ins** - Program adjustments based on progress

---

## 🛠️ Tech Stack

### Frontend
- **Next.js 16** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations
- **Lucide Icons** - Beautiful icon system
- **date-fns** - Date formatting and manipulation

### Backend
- **Supabase** - PostgreSQL database, authentication, real-time
- **Supabase Auth** - User authentication and sessions

### AI Integration
- **Groq** - Lightning-fast AI inference (Llama 3.2)
- **Google Gemini** - Fallback AI provider
- **Ollama** - Optional local AI (offline mode)

### Key Libraries
- **@supabase/ssr** - Server-side Supabase client
- **React Hook Form** - Form management
- **Zod** - Schema validation
- **Recharts** - Data visualization

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account (free tier works!)
- Groq API key (free tier: 14,400 requests/day)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/fitness-tracker-pro.git
   cd fitness-tracker-pro
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create `.env.local` in the root directory:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   NEXT_PUBLIC_GROQ_API_KEY=your_groq_api_key
   ```

4. **Set up Supabase database**
   
   Run the SQL schema in your Supabase SQL editor:
   ```bash
   # The schema file is in: database-schema.sql
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   ```
   http://localhost:3000
   ```

---

## 📁 Project Structure

```
fitness-tracker-pro/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── page.tsx             # Home page
│   │   └── layout.tsx           # Root layout
│   ├── components/              # React components
│   │   └── AICoach/
│   │       └── AICoachInterface.tsx
│   ├── lib/                     # Utilities and configs
│   │   ├── ai/                  # AI coaching system
│   │   │   ├── ai-coach.ts
│   │   │   └── fitness-coach-system.ts
│   │   └── supabase/            # Supabase clients
│   │       ├── client.ts
│   │       └── server.ts
│   ├── types/                   # TypeScript types
│   │   └── database.ts
│   └── middleware.ts            # Auth middleware
├── database-schema.sql          # Database setup
├── .env.local                   # Environment variables (not in git)
└── package.json
```

---

## 🔑 Getting API Keys (All Free!)

### Groq API Key
1. Go to [console.groq.com](https://console.groq.com)
2. Sign up (free)
3. Create an API key
4. Free tier: 14,400 requests/day (more than enough!)

### Supabase Setup
1. Go to [supabase.com](https://supabase.com)
2. Create a new project (free)
3. Get your project URL and anon key from Settings > API
4. Free tier: 500MB database, 2GB bandwidth/month

### Optional: Ollama (Local AI)
```bash
# Install Ollama for offline AI
curl -fsSL https://ollama.com/install.sh | sh

# Pull a model
ollama pull llama3.2

# Run Ollama server
ollama serve
```

---

## 💡 Key Features Explained

### Real-Time Set Feedback
After each set, rate the difficulty and form quality. The AI instantly suggests:
- Next set's weight and reps
- Rest time needed
- Form corrections
- Motivation based on performance

### AI Coach Chat
Natural conversation with your AI coach:
- "Should I work out today?" (considers fatigue, soreness)
- "How's my squat form?" (technique analysis)
- "Design a 4-day program for me" (custom programs)
- "What should I eat to build muscle?" (nutrition advice)

### Voice Coaching
- Speak your questions (hands-free during workouts)
- Coach responds with voice
- Works in Chrome/Edge browsers

---

## 📊 Database Schema

Key tables:
- `users` - User profiles and preferences
- `workout_sessions` - Workout logs
- `exercises` - Exercise library
- `sets` - Individual set data with AI suggestions
- `ai_coaching_history` - Chat history and feedback

---

## 🎨 Design Philosophy

- **Mobile-first** - Optimized for phone use in the gym
- **Real-time** - Instant AI feedback, no waiting
- **Zero cost** - All services on free tiers
- **Offline capable** - Optional local AI with Ollama
- **Type-safe** - Full TypeScript coverage
- **Modern UI** - Beautiful gradients and animations

---

## 🔒 Security

- Authentication via Supabase Auth
- Row Level Security (RLS) on all tables
- Environment variables for sensitive keys
- Server-side API calls (keys never exposed)
- HTTPS only in production

---

## 🚀 Deployment

### Deploy to Vercel (Recommended)

1. Push to GitHub
2. Import project on [vercel.com](https://vercel.com)
3. Add environment variables
4. Deploy!

### Deploy to Other Platforms

Works on any Next.js hosting:
- Netlify
- Railway
- Render
- AWS Amplify

---

## 📈 Roadmap

- [ ] Mobile app (React Native)
- [ ] Progress photos with AI analysis
- [ ] Social features (share workouts)
- [ ] Wearable integration (watch data)
- [ ] Meal photo analysis
- [ ] Community workout programs
- [ ] Detailed analytics dashboard

---

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Groq** - For lightning-fast AI inference
- **Supabase** - For awesome backend-as-a-service
- **Next.js team** - For the amazing framework
- **Vercel** - For easy deployment

---

## 💬 Contact & Support

- **Issues**: [GitHub Issues](https://github.com/YOUR_USERNAME/fitness-tracker-pro/issues)
- **Discussions**: [GitHub Discussions](https://github.com/YOUR_USERNAME/fitness-tracker-pro/discussions)

---

## ⭐ Show Your Support

If this project helped you, give it a ⭐️!

---

**Built with ❤️ by Michael**

*Making AI-powered fitness coaching accessible to everyone, completely free.*