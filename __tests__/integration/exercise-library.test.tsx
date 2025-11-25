import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { createMockExercise, mockSupabaseQuery } from '../test-utils'
import ExerciseLibraryClient from '@/app/exercises/ExerciseLibraryClient'
import { createClient } from '@/lib/supabase/client'

jest.mock('@/lib/supabase/client')

describe('Exercise Library Integration', () => {
  const mockExercises = [
    createMockExercise({ id: '1', name: 'Bench Press', category: 'chest' }),
    createMockExercise({ id: '2', name: 'Squat', category: 'legs', equipment: 'barbell' }),
    createMockExercise({ id: '3', name: 'Pull-up', category: 'back', equipment: 'bodyweight' }),
  ]

  const mockUserId = 'test-user-id'

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Search and Filter Integration', () => {
    it('should filter exercises by search term', async () => {
      render(
        <ExerciseLibraryClient
          exercises={mockExercises}
          userId={mockUserId}
          customExercisesCount={0}
        />
      )

      // Type in search
      const searchInput = screen.getByPlaceholderText(/search exercises/i)
      fireEvent.change(searchInput, { target: { value: 'bench' } })

      // Should show only Bench Press
      await waitFor(() => {
        expect(screen.getByText('Bench Press')).toBeInTheDocument()
        expect(screen.queryByText('Squat')).not.toBeInTheDocument()
        expect(screen.queryByText('Pull-up')).not.toBeInTheDocument()
      })
    })

    it('should filter by category', async () => {
      render(
        <ExerciseLibraryClient
          exercises={mockExercises}
          userId={mockUserId}
          customExercisesCount={0}
        />
      )

      // Open filters
      fireEvent.click(screen.getByText(/filters/i))

      // Select category
      const categorySelect = screen.getByLabelText(/category/i)
      fireEvent.change(categorySelect, { target: { value: 'legs' } })

      // Should show only Squat
      await waitFor(() => {
        expect(screen.getByText('Squat')).toBeInTheDocument()
        expect(screen.queryByText('Bench Press')).not.toBeInTheDocument()
      })
    })

    it('should filter by equipment', async () => {
      render(
        <ExerciseLibraryClient
          exercises={mockExercises}
          userId={mockUserId}
          customExercisesCount={0}
        />
      )

      fireEvent.click(screen.getByText(/filters/i))

      const equipmentSelect = screen.getByLabelText(/equipment/i)
      fireEvent.change(equipmentSelect, { target: { value: 'bodyweight' } })

      await waitFor(() => {
        expect(screen.getByText('Pull-up')).toBeInTheDocument()
        expect(screen.queryByText('Bench Press')).not.toBeInTheDocument()
      })
    })

    it('should combine search and filter', async () => {
      render(
        <ExerciseLibraryClient
          exercises={mockExercises}
          userId={mockUserId}
          customExercisesCount={0}
        />
      )

      // Search for 'press'
      const searchInput = screen.getByPlaceholderText(/search exercises/i)
      fireEvent.change(searchInput, { target: { value: 'press' } })

      // Filter by category 'chest'
      fireEvent.click(screen.getByText(/filters/i))
      const categorySelect = screen.getByLabelText(/category/i)
      fireEvent.change(categorySelect, { target: { value: 'chest' } })

      // Should show only Bench Press
      await waitFor(() => {
        expect(screen.getByText('Bench Press')).toBeInTheDocument()
        expect(screen.queryByText('Squat')).not.toBeInTheDocument()
      })
    })
  })

  describe('View Mode Toggle', () => {
    it('should switch between grid and list views', () => {
      const { container } = render(
        <ExerciseLibraryClient
          exercises={mockExercises}
          userId={mockUserId}
          customExercisesCount={0}
        />
      )

      // Default is grid
      let exerciseContainer = container.querySelector('.grid')
      expect(exerciseContainer).toBeInTheDocument()

      // Switch to list
      const listButton = screen.getByRole('button', { name: /list view/i })
      fireEvent.click(listButton)

      // Should now be in list mode
      exerciseContainer = container.querySelector('.space-y-4')
      expect(exerciseContainer).toBeInTheDocument()
    })
  })

  describe('Exercise Detail Modal', () => {
    it('should open detail modal when exercise clicked', async () => {
      render(
        <ExerciseLibraryClient
          exercises={mockExercises}
          userId={mockUserId}
          customExercisesCount={0}
        />
      )

      // Click on exercise
      fireEvent.click(screen.getByText('Bench Press'))

      // Modal should open
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument()
      })
    })

    it('should close modal when X clicked', async () => {
      render(
        <ExerciseLibraryClient
          exercises={mockExercises}
          userId={mockUserId}
          customExercisesCount={0}
        />
      )

      // Open modal
      fireEvent.click(screen.getByText('Bench Press'))

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument()
      })

      // Close modal
      const closeButton = screen.getByRole('button', { name: /close/i })
      fireEvent.click(closeButton)

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
      })
    })
  })

  describe('Create Exercise Flow', () => {
    it('should open create modal when button clicked', () => {
      render(
        <ExerciseLibraryClient
          exercises={mockExercises}
          userId={mockUserId}
          customExercisesCount={0}
        />
      )

      fireEvent.click(screen.getByText(/create exercise/i))

      expect(screen.getByText(/create custom exercise/i)).toBeInTheDocument()
    })

    it('should close create modal', () => {
      render(
        <ExerciseLibraryClient
          exercises={mockExercises}
          userId={mockUserId}
          customExercisesCount={0}
        />
      )

      // Open modal
      fireEvent.click(screen.getByText(/create exercise/i))
      
      // Close modal
      const closeButton = screen.getByRole('button', { name: /close/i })
      fireEvent.click(closeButton)

      expect(screen.queryByText(/create custom exercise/i)).not.toBeInTheDocument()
    })
  })

  describe('Empty States', () => {
    it('should show empty state when no exercises', () => {
      render(
        <ExerciseLibraryClient
          exercises={[]}
          userId={mockUserId}
          customExercisesCount={0}
        />
      )

      expect(screen.getByText(/no exercises found/i)).toBeInTheDocument()
    })

    it('should show empty state when no search results', () => {
      render(
        <ExerciseLibraryClient
          exercises={mockExercises}
          userId={mockUserId}
          customExercisesCount={0}
        />
      )

      const searchInput = screen.getByPlaceholderText(/search exercises/i)
      fireEvent.change(searchInput, { target: { value: 'nonexistent' } })

      expect(screen.getByText(/no exercises found/i)).toBeInTheDocument()
    })
  })

  describe('Stats Display', () => {
    it('should show correct exercise counts', () => {
      render(
        <ExerciseLibraryClient
          exercises={mockExercises}
          userId={mockUserId}
          customExercisesCount={2}
        />
      )

      expect(screen.getByText(/3 exercises available/i)).toBeInTheDocument()
      expect(screen.getByText(/custom: 2/i)).toBeInTheDocument()
    })

    it('should update filtered count when filtering', () => {
      render(
        <ExerciseLibraryClient
          exercises={mockExercises}
          userId={mockUserId}
          customExercisesCount={0}
        />
      )

      // Filter by legs
      fireEvent.click(screen.getByText(/filters/i))
      const categorySelect = screen.getByLabelText(/category/i)
      fireEvent.change(categorySelect, { target: { value: 'legs' } })

      expect(screen.getByText(/filtered: 1/i)).toBeInTheDocument()
    })
  })
})