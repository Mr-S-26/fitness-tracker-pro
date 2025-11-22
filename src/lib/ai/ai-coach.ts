// src/lib/ai/ai-coach.ts
// Core AI coaching service with proper TypeScript types

// =====================================================
// TYPE DEFINITIONS
// =====================================================

export interface Exercise {
  id: string;
  name: string;
  category: string;
  equipment: string;
  muscle_groups: string[];
  difficulty_level?: string;
}

export interface WorkoutSet {
  id?: string;
  set_number: number;
  target_reps: number;
  actual_reps: number;
  weight: number;
  rpe?: number; // Rate of Perceived Exertion (1-10)
  difficulty?: 'too_easy' | 'easy' | 'perfect' | 'hard' | 'too_hard';
  form_quality?: 'poor' | 'fair' | 'good' | 'excellent';
  rest_seconds?: number;
  notes?: string;
  completed_at?: string;
}

export interface UserProfile {
  id: string;
  name?: string;
  age?: number;
  weight?: number;
  height?: number;
  experience_level?: 'beginner' | 'intermediate' | 'advanced' | 'elite';
  goals?: string[];
  injuries?: string[];
  preferences?: Record<string, unknown>;
}

export interface SetFeedbackParams {
  exercise: Exercise;
  currentSet: WorkoutSet;
  previousSets: WorkoutSet[];
  userProfile: UserProfile;
}

export interface SetFeedbackResponse {
  analysis: string;
  nextSetSuggestion: {
    weight: number;
    reps: number;
    rest_seconds: number;
    reasoning: string;
  };
  formTips?: string[];
  warnings?: string[];
}

export interface ChatContext {
  during_workout?: boolean;
  current_exercise?: string;
  conversation_history?: Array<{
    role: 'user' | 'assistant' | 'system';
    content: string;
  }>;
}

// =====================================================
// AI FITNESS COACH CLASS
// =====================================================

export class AIFitnessCoach {
  private conversationHistory: Array<{
    role: 'user' | 'assistant' | 'system';
    content: string;
  }> = [];

  /**
   * Provides real-time coaching feedback after completing a set
   */
  async getSetFeedback(params: SetFeedbackParams): Promise<SetFeedbackResponse> {
    const { exercise, currentSet, previousSets, userProfile } = params;

    // Build context for AI
    const context = this.buildSetContext(exercise, currentSet, previousSets, userProfile);
    
    // Call AI service
    const aiResponse = await this.callAI(context);
    
    // Parse and return structured response
    return this.parseSetFeedback(aiResponse);
  }

  /**
   * Chat with the AI coach
   */
  async chat(message: string, context?: ChatContext): Promise<string> {
    // Add message to conversation history
    this.conversationHistory.push({
      role: 'user',
      content: message
    });

    // Build prompt with context
    const prompt = this.buildChatPrompt(message, context);
    
    // Get AI response
    const response = await this.callAI(prompt);
    
    // Store assistant response
    this.conversationHistory.push({
      role: 'assistant',
      content: response
    });

    return response;
  }

  /**
   * Clear conversation history
   */
  clearHistory(): void {
    this.conversationHistory = [];
  }

  // =====================================================
  // PRIVATE HELPER METHODS
  // =====================================================

  private buildSetContext(
    exercise: Exercise,
    currentSet: WorkoutSet,
    previousSets: WorkoutSet[],
    userProfile: UserProfile
  ): string {
    const previousSetsInfo = previousSets.map((set, index) => 
      `Set ${index + 1}: ${set.actual_reps}/${set.target_reps} reps @ ${set.weight}kg - ${set.difficulty || 'N/A'}`
    ).join('\n');

    return `
Exercise: ${exercise.name}
Current Set: ${currentSet.set_number}
Target: ${currentSet.target_reps} reps @ ${currentSet.weight}kg
User Experience: ${userProfile.experience_level || 'intermediate'}

Previous Sets Today:
${previousSetsInfo || 'First set'}

Analyze this performance and suggest:
1. What the performance indicates about the athlete's capacity
2. Recommended weight, reps, and rest for the next set
3. Any form tips or warnings
4. Brief motivational feedback

Respond in JSON format.
    `;
  }

  private buildChatPrompt(message: string, context?: ChatContext): string {
    let prompt = message;

    if (context?.during_workout && context?.current_exercise) {
      prompt = `During workout (${context.current_exercise}): ${message}`;
    }

    // Include recent conversation history (last 5 messages)
    if (this.conversationHistory.length > 0) {
      const recentHistory = this.conversationHistory
        .slice(-5)
        .map(msg => `${msg.role}: ${msg.content}`)
        .join('\n');
      
      prompt = `${recentHistory}\n\nuser: ${prompt}`;
    }

    return prompt;
  }

  private async callAI(prompt: string): Promise<string> {
    // Try Groq first (fastest and free)
    try {
      return await this.callGroq(prompt);
    } catch (error) {
      console.warn('Groq failed, trying Gemini...', error);
    }

    // Fallback to Gemini
    try {
      return await this.callGemini(prompt);
    } catch (error) {
      console.warn('Gemini failed, trying Ollama...', error);
    }

    // Fallback to local Ollama
    try {
      return await this.callOllama(prompt);
    } catch (error) {
      console.error('All AI providers failed', error);
      throw new Error('AI coaching temporarily unavailable. Please check your API keys.');
    }
  }

  private async callGroq(prompt: string): Promise<string> {
    const apiKey = process.env.NEXT_PUBLIC_GROQ_API_KEY;
    if (!apiKey) {
      throw new Error('Groq API key not configured');
    }

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.2-90b-text-preview',
        messages: [
          {
            role: 'system',
            content: 'You are an expert fitness coach. Provide actionable, evidence-based advice.'
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  private async callGemini(prompt: string): Promise<string> {
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('Gemini API key not configured');
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1000
          }
        })
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  }

  private async callOllama(prompt: string): Promise<string> {
    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama3.2',
        prompt: prompt,
        stream: false
      })
    });

    if (!response.ok) {
      throw new Error('Ollama not running. Start with: ollama serve');
    }

    const data = await response.json();
    return data.response;
  }

  private parseSetFeedback(aiResponse: string): SetFeedbackResponse {
    try {
      // Try to parse as JSON first
      const parsed = JSON.parse(aiResponse);
      return parsed;
    } catch {
      // If not JSON, create structured response from text
      return {
        analysis: aiResponse,
        nextSetSuggestion: {
          weight: 0,
          reps: 0,
          rest_seconds: 90,
          reasoning: 'Continue with planned progression'
        }
      };
    }
  }
}

// =====================================================
// SINGLETON INSTANCE
// =====================================================

let coachInstance: AIFitnessCoach | null = null;

export function getAICoach(): AIFitnessCoach {
  if (!coachInstance) {
    coachInstance = new AIFitnessCoach();
  }
  return coachInstance;
}