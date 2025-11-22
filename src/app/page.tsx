import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <h1 className="text-5xl font-bold text-center mb-6">
          AI Fitness Coach 🤖💪
        </h1>
        <p className="text-xl text-center mb-8">
          Your personal AI trainer that coaches you through every rep
        </p>
        <div className="flex justify-center gap-4">
          <Link href="/signup" className="bg-purple-600 text-white px-6 py-3 rounded-lg">
            Get Started Free
          </Link>
          <Link href="/login" className="bg-white px-6 py-3 rounded-lg border">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  )
}