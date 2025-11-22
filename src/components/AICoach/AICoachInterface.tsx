'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Brain,
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Sparkles,
  Activity,
  MessageSquare,
  Dumbbell,
  Heart,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Loader2,
  User,
  Bot,
  Camera,
  Image as ImageIcon,
  PlusCircle,
  ChevronDown
} from 'lucide-react'
import { useAIFitnessCoach, QuickCoach } from '@/lib/ai/fitness-coach-system'
import { format } from 'date-fns'

// =====================================================
// UTILITY FUNCTION (replaces @/lib/utils)
// =====================================================
function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ')
}

// =====================================================
// TYPE DEFINITIONS
// =====================================================

interface MessageMetadata {
  exerciseName?: string
  suggestion?: {
    weight?: number
    reps?: number
    rest?: number
  }
  warning?: string
  [key: string]: unknown
}

interface Message {
  id: string
  role: 'user' | 'coach'
  content: string
  timestamp: Date
  type?: 'text' | 'suggestion' | 'warning' | 'success' | 'form-check' | 'program'
  metadata?: MessageMetadata  // ✅ Fixed: was 'any'
}

interface CurrentWorkout {
  id?: string
  currentExercise?: string
  phase?: 'warmup' | 'working' | 'cooldown'
  startedAt?: Date
}

interface UserStats {
  fatigue: number
  motivation: number
  soreness: number
}

// =====================================================
// MAIN COMPONENT
// =====================================================

export default function AICoachInterface() {
  const coach = useAIFitnessCoach()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [voiceEnabled, setVoiceEnabled] = useState(true)
  const [showQuickActions, setShowQuickActions] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [currentWorkout, setCurrentWorkout] = useState<CurrentWorkout | null>(null)  // ✅ Fixed: was 'any'
  const [userStats, setUserStats] = useState<UserStats>({
    fatigue: 5,
    motivation: 7,
    soreness: 3
  })

  // Initialize with welcome message
  useEffect(() => {
    const welcomeMessage: Message = {
      id: '1',
      role: 'coach',
      content: "Hey! I'm your AI fitness coach. I'm here to help you train smarter, safer, and more effectively. What would you like to work on today?",
      timestamp: new Date(),
      type: 'text'
    }
    setMessages([welcomeMessage])
    
    // Speak welcome if voice enabled
    if (voiceEnabled) {
      speak(welcomeMessage.content)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Text-to-speech
  const speak = (text: string) => {
    if (!voiceEnabled || !('speechSynthesis' in window)) return
    
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 1.1
    utterance.pitch = 0.95
    utterance.volume = 0.9
    
    // Select a good voice if available
    const voices = speechSynthesis.getVoices()
    const preferredVoice = voices.find(v => v.name.includes('Google') || v.name.includes('Microsoft'))
    if (preferredVoice) utterance.voice = preferredVoice
    
    speechSynthesis.speak(utterance)
  }

  // Speech recognition
  const startListening = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert('Speech recognition not supported in your browser')
      return
    }

    // ✅ Fixed: Proper typing for speech recognition
    interface SpeechRecognitionEvent extends Event {
      results: {
        [index: number]: {
          [index: number]: {
            transcript: string
          }
        }
      }
    }

    const SpeechRecognition = (window as typeof window & { 
      webkitSpeechRecognition: new () => {
        continuous: boolean
        interimResults: boolean
        lang: string
        onstart: () => void
        onresult: (event: SpeechRecognitionEvent) => void
        onerror: () => void
        onend: () => void
        start: () => void
      }
    }).webkitSpeechRecognition

    const recognition = new SpeechRecognition()
    recognition.continuous = false
    recognition.interimResults = false
    recognition.lang = 'en-US'

    recognition.onstart = () => setIsListening(true)
    
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript
      setInput(transcript)
      setIsListening(false)
    }

    recognition.onerror = () => setIsListening(false)
    recognition.onend = () => setIsListening(false)

    recognition.start()
  }

  // Send message to AI coach
  const sendMessage = async (messageText?: string) => {
    const text = messageText || input
    if (!text.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date(),
      type: 'text'
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      // Determine context
      const context = {
        during_workout: currentWorkout !== null,
        current_exercise: currentWorkout?.currentExercise,
      }

      // Get AI response
      const response = await coach.chat(text, context)
      
      // Parse response for special types
      let responseType: Message['type'] = 'text'
      const processedResponse = response  // ✅ Fixed: Changed from 'let' to 'const'

      // Check for special response types
      if (response.includes('⚠️')) responseType = 'warning'
      if (response.includes('✅')) responseType = 'success'
      if (response.includes('FORM:')) responseType = 'form-check'
      if (response.includes('PROGRAM:')) responseType = 'program'

      const coachMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'coach',
        content: processedResponse,
        timestamp: new Date(),
        type: responseType
      }

      setMessages(prev => [...prev, coachMessage])
      
      // Speak response if enabled
      if (voiceEnabled) {
        speak(processedResponse)
      }
    } catch (error) {
      console.error('Coach error:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'coach',
        content: "I'm having trouble connecting right now. Let's continue with your workout and I'll help when I'm back online!",
        timestamp: new Date(),
        type: 'warning'
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  // Quick action buttons
  const quickActions = [
    {
      label: "Start Workout",
      icon: Dumbbell,
      action: () => sendMessage("Let's start a workout. What should I focus on today?"),
      color: "text-green-600 bg-green-50"
    },
    {
      label: "Check Form",
      icon: Activity,
      action: () => sendMessage("I need a form check. Can you help?"),
      color: "text-blue-600 bg-blue-50"
    },
    {
      label: "Get Program",
      icon: TrendingUp,
      action: () => sendMessage("Design a training program for me"),
      color: "text-purple-600 bg-purple-50"
    },
    {
      label: "Nutrition Help",
      icon: Heart,
      action: () => sendMessage("I need nutrition advice for my training"),
      color: "text-red-600 bg-red-50"
    }
  ]

  // Quick stats update
  const updateStat = (stat: keyof UserStats, value: number) => {
    setUserStats(prev => ({ ...prev, [stat]: value }))
  }

  return (
    <div className="flex flex-col h-[600px] bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-2xl shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-4 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Brain className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-bold text-lg">AI Fitness Coach</h2>
              <p className="text-xs text-purple-100">Your personal training expert</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={startListening}
              className={cn(
                "p-2 rounded-lg transition-colors",
                isListening 
                  ? "bg-red-500 animate-pulse" 
                  : "bg-white/20 hover:bg-white/30"
              )}
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>
            
            <button
              onClick={() => setVoiceEnabled(!voiceEnabled)}
              className={cn(
                "p-2 rounded-lg transition-colors",
                voiceEnabled 
                  ? "bg-white/20 hover:bg-white/30" 
                  : "bg-red-500/50"
              )}
            >
              {voiceEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* User Stats - Quick adjusters */}
        <div className="grid grid-cols-3 gap-2 mt-3 text-xs">
          <div className="bg-white/20 rounded-lg p-2">
            <div className="flex items-center justify-between">
              <span className="text-xs">Fatigue</span>
              <span className="text-sm font-bold">{userStats.fatigue}/10</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={userStats.fatigue}
              onChange={(e) => updateStat('fatigue', Number(e.target.value))}
              className="w-full h-1 mt-1"
            />
          </div>
          <div className="bg-white/20 rounded-lg p-2">
            <div className="flex items-center justify-between">
              <span className="text-xs">Motivation</span>
              <span className="text-sm font-bold">{userStats.motivation}/10</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={userStats.motivation}
              onChange={(e) => updateStat('motivation', Number(e.target.value))}
              className="w-full h-1 mt-1"
            />
          </div>
          <div className="bg-white/20 rounded-lg p-2">
            <div className="flex items-center justify-between">
              <span className="text-xs">Soreness</span>
              <span className="text-sm font-bold">{userStats.soreness}/10</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={userStats.soreness}
              onChange={(e) => updateStat('soreness', Number(e.target.value))}
              className="w-full h-1 mt-1"
            />
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={cn(
                "flex gap-3",
                message.role === 'user' ? "justify-end" : "justify-start"
              )}
            >
              {message.role === 'coach' && (
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                </div>
              )}
              
              <div
                className={cn(
                  "max-w-[70%] rounded-xl p-3",
                  message.role === 'user' 
                    ? "bg-blue-600 text-white" 
                    : message.type === 'warning'
                    ? "bg-orange-50 dark:bg-orange-900/20 border border-orange-200"
                    : message.type === 'success'
                    ? "bg-green-50 dark:bg-green-900/20 border border-green-200"
                    : message.type === 'form-check'
                    ? "bg-purple-50 dark:bg-purple-900/20 border border-purple-200"
                    : "bg-white dark:bg-gray-800 shadow-md"
                )}
              >
                {message.type === 'warning' && (
                  <AlertCircle className="w-4 h-4 text-orange-600 mb-2" />
                )}
                {message.type === 'success' && (
                  <CheckCircle className="w-4 h-4 text-green-600 mb-2" />
                )}
                
                <p className={cn(
                  "text-sm whitespace-pre-wrap",
                  message.role === 'user' ? "text-white" : "text-gray-800 dark:text-gray-200"
                )}>
                  {message.content}
                </p>
                
                <p className={cn(
                  "text-xs mt-1",
                  message.role === 'user' ? "text-blue-100" : "text-gray-500"
                )}>
                  {format(message.timestamp, 'HH:mm')}
                </p>
              </div>

              {message.role === 'user' && (
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-gray-300 dark:bg-gray-700 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-3"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-3 shadow-md">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Coach is thinking...</span>
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions */}
      <AnimatePresence>
        {showQuickActions && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
          >
            <div className="p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-gray-500">Quick Actions</span>
                <button
                  onClick={() => setShowQuickActions(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    onClick={action.action}
                    className={cn(
                      "flex items-center gap-2 p-2 rounded-lg transition-colors",
                      action.color,
                      "hover:opacity-80"
                    )}
                  >
                    <action.icon className="w-4 h-4" />
                    <span className="text-xs font-medium">{action.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input Area */}
      <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
        <div className="flex gap-2">
          <button
            onClick={() => setShowQuickActions(!showQuickActions)}
            className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <PlusCircle className="w-5 h-5" />
          </button>
          
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder={isListening ? "Listening..." : "Ask your coach anything..."}
            className={cn(
              "flex-1 px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-purple-500",
              "bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-600",
              isListening && "animate-pulse"
            )}
            disabled={isListening}
          />
          
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || isLoading}
            className={cn(
              "p-2 rounded-lg transition-colors",
              input.trim() && !isLoading
                ? "bg-purple-600 text-white hover:bg-purple-700"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            )}
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Context Tags */}
        <div className="flex gap-2 mt-2">
          {currentWorkout && (
            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
              Workout Active
            </span>
          )}
          {isListening && (
            <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full animate-pulse">
              Listening...
            </span>
          )}
          {voiceEnabled && (
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
              Voice On
            </span>
          )}
        </div>
      </div>
    </div>
  )
}