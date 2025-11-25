import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Create a custom render function that includes providers
function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        cacheTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  })
}

interface AllTheProvidersProps {
  children: React.ReactNode
}

function AllTheProviders({ children }: AllTheProvidersProps) {
  const queryClient = createTestQueryClient()

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllTheProviders, ...options })

// Re-export everything
export * from '@testing-library/react'
export { customRender as render }

// Helper to create mock user
export const createMockUser = (overrides = {}) => ({
  id: 'test-user-id',
  email: 'test@example.com',
  created_at: new Date().toISOString(),
  ...overrides,
})

// Helper to create mock exercise
export const createMockExercise = (overrides = {}) => ({
  id: 'test-exercise-id',
  name: 'Bench Press',
  category: 'chest',
  equipment: 'barbell',
  primary_muscles: ['chest', 'triceps'],
  secondary_muscles: ['shoulders'],
  is_compound: true,
  is_public: true,
  instructions: 'Lie on bench, lower bar to chest, press up',
  tips: ['Keep elbows at 45 degrees'],
  common_mistakes: ['Bouncing off chest'],
  video_url: null,
  image_url: null,
  user_id: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
})

// Helper to create mock workout session
export const createMockWorkoutSession = (overrides = {}) => ({
  id: 'test-session-id',
  user_id: 'test-user-id',
  name: 'Test Workout',
  started_at: new Date().toISOString(),
  completed_at: null,
  total_volume: 0,
  ...overrides,
})

// Helper to create mock set
export const createMockSet = (overrides = {}) => ({
  id: 'test-set-id',
  session_id: 'test-session-id',
  exercise_id: 'test-exercise-id',
  set_number: 1,
  weight: 60,
  target_reps: 8,
  actual_reps: 8,
  difficulty: 'perfect',
  form: 'good',
  rpe: 7,
  completed_at: new Date().toISOString(),
  ...overrides,
})

// Helper to wait for async updates
export const waitForLoadingToFinish = () => {
  return new Promise(resolve => setTimeout(resolve, 0))
}

// Helper to mock Supabase responses
export const mockSupabaseQuery = (returnValue: any) => {
  return {
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue({ data: returnValue, error: null }),
    order: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
  }
}

// Helper to mock successful auth
export const mockAuthSuccess = (user = createMockUser()) => ({
  data: { user, session: { access_token: 'test-token' } },
  error: null,
})

// Helper to mock auth error
export const mockAuthError = (message = 'Authentication failed') => ({
  data: { user: null, session: null },
  error: { message },
})