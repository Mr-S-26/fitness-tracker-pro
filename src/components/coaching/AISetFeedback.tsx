'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ThumbsUp, ThumbsDown, Zap, AlertTriangle, CheckCircle, TrendingUp, Key } from 'lucide-react';
import { getSuggestionEngine } from '@/lib/coaching/suggestion-engine';
import type { SetDifficulty, FormQuality } from '@/types/database';

interface AISetFeedbackProps {
  exerciseName: string;
  setNumber: number;
  weight: number;
  targetReps: number;
  actualReps: number;
  onSuggestionReceived?: (suggestion: {
    weight: number;
    reps: number;
    rest: number;
    reasoning: string;
  }) => void;
}

export default function AISetFeedback({
  exerciseName,
  setNumber,
  weight,
  targetReps,
  actualReps,
  onSuggestionReceived,
}: AISetFeedbackProps) {
  const [difficulty, setDifficulty] = useState<SetDifficulty | null>(null);
  const [formQuality, setFormQuality] = useState<FormQuality | null>(null);
  const [loading, setLoading] = useState(false);
  const [suggestion, setSuggestion] = useState<{
    analysis: string;
    nextSetSuggestion: {
      weight: number;
      reps: number;
      rest_seconds: number;
      reasoning: string;
    };
    formTips?: string[];
    warnings?: string[];
    usingAI?: boolean;
    apiKeyStatus?: string;
  } | null>(null);

  const difficultyOptions: { value: SetDifficulty; label: string; icon: React.ComponentType<{ className?: string }>; color: string }[] = [
    { value: 'too_easy', label: 'Too Easy', icon: ThumbsDown, color: 'text-blue-600' },
    { value: 'easy', label: 'Easy', icon: ThumbsUp, color: 'text-green-600' },
    { value: 'perfect', label: 'Perfect', icon: CheckCircle, color: 'text-emerald-600' },
    { value: 'challenging', label: 'Hard', icon: Zap, color: 'text-orange-600' },
    { value: 'failure', label: 'Failed', icon: AlertTriangle, color: 'text-red-600' },
  ];

  const formOptions: { value: FormQuality; label: string; color: string }[] = [
    { value: 'poor', label: 'Poor Form', color: 'text-red-600' },
    { value: 'good', label: 'Good Form', color: 'text-yellow-600' },
    { value: 'perfect', label: 'Perfect Form', color: 'text-green-600' },
  ];

  const handleGetFeedback = async () => {
    if (!difficulty || !formQuality) return;

    setLoading(true);
    
    // Diagnostic: Check API key
    const groqKey = process.env.NEXT_PUBLIC_GROQ_API_KEY;
    
    console.log('🔍 Diagnostic Info:');
    console.log('- API Key exists:', !!groqKey);
    console.log('- API Key length:', groqKey?.length || 0);
    console.log('- API Key starts with:', groqKey?.substring(0, 10) + '...' || 'N/A');
    
    if (!groqKey) {
      console.error('❌ No Groq API key found in environment variables');
      console.log('💡 Add NEXT_PUBLIC_GROQ_API_KEY to .env.local');
      
      // Use rule-based immediately
      const engine = getSuggestionEngine();
      const ruleSuggestion = engine.generateSuggestion({
        difficulty,
        formQuality,
        currentWeight: weight,
        currentReps: actualReps,
        targetReps,
        isCompound: true,
        exerciseCategory: 'strength',
      });

      setSuggestion({
        analysis: `Using smart rule-based coaching. Add your Groq API key to .env.local to enable AI features.`,
        nextSetSuggestion: {
          weight: ruleSuggestion.nextWeight,
          reps: ruleSuggestion.nextReps,
          rest_seconds: ruleSuggestion.restSeconds,
          reasoning: ruleSuggestion.reasoning,
        },
        formTips: ruleSuggestion.formTips,
        warnings: ruleSuggestion.warnings,
        usingAI: false,
        apiKeyStatus: 'missing',
      });
      
      if (onSuggestionReceived) {
        onSuggestionReceived({
          weight: ruleSuggestion.nextWeight,
          reps: ruleSuggestion.nextReps,
          rest: ruleSuggestion.restSeconds,
          reasoning: ruleSuggestion.reasoning,
        });
      }
      
      setLoading(false);
      return;
    }
    
    // Try Groq AI
    try {
      console.log('📡 Calling Groq API...');
      
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${groqKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile', // ✅ FIXED: Updated to current model
          messages: [
            {
              role: 'system',
              content: 'You are a professional fitness coach. Provide brief, encouraging feedback.'
            },
            {
              role: 'user',
              content: `A person completed ${actualReps} reps of ${exerciseName} at ${weight}kg (target: ${targetReps} reps). They rated it as "${difficulty}" with "${formQuality}" form. Give them brief motivational feedback (2 sentences).`
            }
          ],
          temperature: 0.7,
          max_tokens: 150
        })
      });

      console.log('📊 Response status:', response.status);
      console.log('📊 Response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Groq API Error Response:', errorText);
        throw new Error(`Groq API returned ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Groq API Success!');
      
      const aiText = data.choices[0].message.content;
      
      // Use rule-based for numbers
      const engine = getSuggestionEngine();
      const ruleSuggestion = engine.generateSuggestion({
        difficulty,
        formQuality,
        currentWeight: weight,
        currentReps: actualReps,
        targetReps,
        isCompound: true,
        exerciseCategory: 'strength',
      });

      setSuggestion({
        analysis: aiText,
        nextSetSuggestion: {
          weight: ruleSuggestion.nextWeight,
          reps: ruleSuggestion.nextReps,
          rest_seconds: ruleSuggestion.restSeconds,
          reasoning: ruleSuggestion.reasoning,
        },
        formTips: ruleSuggestion.formTips,
        warnings: ruleSuggestion.warnings,
        usingAI: true,
        apiKeyStatus: 'valid',
      });
      
      if (onSuggestionReceived) {
        onSuggestionReceived({
          weight: ruleSuggestion.nextWeight,
          reps: ruleSuggestion.nextReps,
          rest: ruleSuggestion.restSeconds,
          reasoning: ruleSuggestion.reasoning,
        });
      }
      
      setLoading(false);
      return;
      
    } catch (error) {
      console.error('❌ Groq API Failed:', error);
    }
    
    // Fallback to rule-based
    console.log('🔄 Using rule-based fallback');
    
    const engine = getSuggestionEngine();
    const ruleSuggestion = engine.generateSuggestion({
      difficulty,
      formQuality,
      currentWeight: weight,
      currentReps: actualReps,
      targetReps,
      isCompound: true,
      exerciseCategory: 'strength',
    });

    setSuggestion({
      analysis: `Based on your ${difficulty} rating and ${formQuality} form, here's your next step.`,
      nextSetSuggestion: {
        weight: ruleSuggestion.nextWeight,
        reps: ruleSuggestion.nextReps,
        rest_seconds: ruleSuggestion.restSeconds,
        reasoning: ruleSuggestion.reasoning,
      },
      formTips: ruleSuggestion.formTips,
      warnings: ruleSuggestion.warnings,
      usingAI: false,
      apiKeyStatus: groqKey ? 'invalid' : 'missing',
    });
    
    if (onSuggestionReceived) {
      onSuggestionReceived({
        weight: ruleSuggestion.nextWeight,
        reps: ruleSuggestion.nextReps,
        rest: ruleSuggestion.restSeconds,
        reasoning: ruleSuggestion.reasoning,
      });
    }
    
    setLoading(false);
  };

  return (
    <div className="space-y-4 p-4 bg-white rounded-lg shadow-md">
      <div>
        <h3 className="text-lg font-semibold mb-2">How was this set?</h3>
        <p className="text-sm text-gray-600 mb-4">
          Set {setNumber}: {actualReps}/{targetReps} reps @ {weight}kg
        </p>

        {/* Difficulty Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Difficulty
          </label>
          <div className="grid grid-cols-5 gap-2">
            {difficultyOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setDifficulty(option.value)}
                className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all ${
                  difficulty === option.value
                    ? 'border-indigo-600 bg-indigo-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <option.icon className={`w-6 h-6 mb-1 ${option.color}`} />
                <span className="text-xs font-medium">{option.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Form Quality Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Form Quality
          </label>
          <div className="grid grid-cols-3 gap-2">
            {formOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setFormQuality(option.value)}
                className={`p-3 rounded-lg border-2 transition-all ${
                  formQuality === option.value
                    ? 'border-indigo-600 bg-indigo-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <span className={`text-sm font-medium ${option.color}`}>
                  {option.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Get Feedback Button */}
        <button
          onClick={handleGetFeedback}
          disabled={!difficulty || !formQuality || loading}
          className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
              Getting Feedback...
            </>
          ) : (
            <>
              <TrendingUp className="w-5 h-5" />
              Get Coach Feedback
            </>
          )}
        </button>
      </div>

      {/* Suggestion Display */}
      {suggestion && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200"
        >
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-purple-900">
              {suggestion.usingAI ? '🤖 AI Coach (Groq):' : '💪 Smart Coach:'}
            </h4>
            <div className="flex items-center gap-2">
              {suggestion.apiKeyStatus && (
                <span className={`text-xs px-2 py-1 rounded-full ${
                  suggestion.apiKeyStatus === 'valid' ? 'bg-green-100 text-green-800' :
                  suggestion.apiKeyStatus === 'invalid' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {suggestion.apiKeyStatus === 'valid' ? '🔑 API Key OK' :
                   suggestion.apiKeyStatus === 'invalid' ? '🔑 API Key Invalid' :
                   '🔑 No API Key'}
                </span>
              )}
              {!suggestion.usingAI && (
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                  Rule-based
                </span>
              )}
            </div>
          </div>
          
          <p className="text-sm text-gray-700 mb-3">{suggestion.analysis}</p>

          <div className="bg-white p-3 rounded-lg mb-3">
            <h5 className="font-semibold text-sm mb-2">Next Set Recommendation:</h5>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-xs text-gray-600">Weight</p>
                <p className="text-lg font-bold text-indigo-600">
                  {suggestion.nextSetSuggestion.weight}kg
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Reps</p>
                <p className="text-lg font-bold text-indigo-600">
                  {suggestion.nextSetSuggestion.reps}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Rest</p>
                <p className="text-lg font-bold text-indigo-600">
                  {Math.floor(suggestion.nextSetSuggestion.rest_seconds / 60)}m
                </p>
              </div>
            </div>
            <p className="text-xs text-gray-600 mt-2 italic">
              {suggestion.nextSetSuggestion.reasoning}
            </p>
          </div>

          {suggestion.formTips && suggestion.formTips.length > 0 && (
            <div className="bg-yellow-50 p-3 rounded-lg mb-2">
              <h5 className="font-semibold text-sm text-yellow-900 mb-1">💡 Form Tips:</h5>
              <ul className="list-disc list-inside text-xs text-yellow-800">
                {suggestion.formTips.map((tip, index) => (
                  <li key={index}>{tip}</li>
                ))}
              </ul>
            </div>
          )}

          {suggestion.warnings && suggestion.warnings.length > 0 && (
            <div className="bg-red-50 p-3 rounded-lg">
              <h5 className="font-semibold text-sm text-red-900 mb-1">⚠️ Warnings:</h5>
              <ul className="list-disc list-inside text-xs text-red-800">
                {suggestion.warnings.map((warning, index) => (
                  <li key={index}>{warning}</li>
                ))}
              </ul>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}