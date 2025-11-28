'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Sparkles, ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function AICoachInterface({ userName }: { userName: string }) {
  const router = useRouter();
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: `Hey ${userName}! I've analyzed your recent workouts. How can I help you train smarter today?` }
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = { role: 'user' as const, content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input, history: messages })
      });
      
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setMessages(prev => [...prev, { role: 'assistant', content: data.content }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'assistant', content: "I'm having trouble connecting to the server right now. Try again?" }]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickPrompt = (text: string) => {
    setInput(text);
    // Optional: Auto-send
    // handleSend(); 
  };

  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto bg-white shadow-xl border-x border-gray-100">
      
      {/* Header */}
      <div className="bg-white border-b border-gray-100 p-4 flex items-center gap-3 sticky top-0 z-10">
        <button onClick={() => router.push('/dashboard')} className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="p-2 bg-purple-100 rounded-full">
          <Bot className="w-5 h-5 text-purple-600" />
        </div>
        <div>
          <h1 className="font-bold text-gray-900">AI Coach</h1>
          <p className="text-xs text-green-500 flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
            Online
          </p>
        </div>
      </div>

      {/* Chat Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-6 scroll-smooth">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
              msg.role === 'user' ? 'bg-gray-200' : 'bg-purple-600 text-white'
            }`}>
              {msg.role === 'user' ? <User className="w-4 h-4 text-gray-600" /> : <Bot className="w-4 h-4" />}
            </div>
            <div className={`p-4 rounded-2xl max-w-[80%] text-sm leading-relaxed ${
              msg.role === 'user' 
                ? 'bg-gray-100 text-gray-900 rounded-tr-none' 
                : 'bg-purple-50 text-purple-900 rounded-tl-none border border-purple-100'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        
        {loading && (
          <div className="flex gap-3">
             <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
             </div>
             <div className="bg-purple-50 p-4 rounded-2xl rounded-tl-none flex gap-1">
                <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" />
                <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-100" />
                <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-200" />
             </div>
          </div>
        )}
      </div>

      {/* Quick Prompts */}
      <div className="p-4 border-t border-gray-50 bg-white">
        <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-hide">
          {['Why is my squat stuck?', 'Suggest a substitute for Deadlifts', 'I have knee pain', 'Analyze my last week'].map((prompt, i) => (
            <button 
              key={i}
              onClick={() => handleQuickPrompt(prompt)}
              className="whitespace-nowrap px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-full text-xs font-medium text-gray-600 hover:bg-purple-50 hover:text-purple-700 hover:border-purple-200 transition-all"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input */}
        <div className="flex gap-2">
          <input 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask your coach..."
            className="flex-1 bg-gray-50 border-0 rounded-xl px-4 py-3 text-gray-900 focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all outline-none"
          />
          <button 
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="bg-purple-600 text-white p-3 rounded-xl hover:bg-purple-700 disabled:opacity-50 disabled:hover:bg-purple-600 transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>

    </div>
  );
}