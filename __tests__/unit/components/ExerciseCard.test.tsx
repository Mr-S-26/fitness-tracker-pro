import { render, screen, fireEvent } from '@testing-library/react'
import ExerciseCard from '@/components/exercises/ExerciseCard'

describe('ExerciseCard', () => {
  const mockExercise = {
    id: '1',
    name: 'Bench Press',
    category: 'chest',
    equipment: 'barbell',
    primary_muscles: ['chest', 'triceps'],
    is_compound: true,
  }

  const categoryEmoji = {
    chest: '💪',
    back: '🦾',
    legs: '🦵',
  }

  const mockOnClick = jest.fn()

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('Grid View', () => {
    it('should render exercise information in grid view', () => {
      render(
        <ExerciseCard
          exercise={mockExercise}
          viewMode="grid"
          categoryEmoji={categoryEmoji}
          isCustom={false}
          onClick={mockOnClick}
        />
      )

      expect(screen.getByText('Bench Press')).toBeInTheDocument()
      expect(screen.getByText('chest')).toBeInTheDocument()
      expect(screen.getByText('barbell')).toBeInTheDocument()
      expect(screen.getByText('💪')).toBeInTheDocument()
    })

    it('should show compound badge when exercise is compound', () => {
      render(
        <ExerciseCard
          exercise={mockExercise}
          viewMode="grid"
          categoryEmoji={categoryEmoji}
          isCustom={false}
          onClick={mockOnClick}
        />
      )

      expect(screen.getByText('Compound')).toBeInTheDocument()
    })

    it('should show custom badge when exercise is custom', () => {
      render(
        <ExerciseCard
          exercise={mockExercise}
          viewMode="grid"
          categoryEmoji={categoryEmoji}
          isCustom={true}
          onClick={mockOnClick}
        />
      )

      expect(screen.getByText('Custom')).toBeInTheDocument()
    })

    it('should call onClick when card is clicked', () => {
      render(
        <ExerciseCard
          exercise={mockExercise}
          viewMode="grid"
          categoryEmoji={categoryEmoji}
          isCustom={false}
          onClick={mockOnClick}
        />
      )

      const card = screen.getByRole('button')
      fireEvent.click(card)

      expect(mockOnClick).toHaveBeenCalledTimes(1)
    })

    it('should show primary muscles', () => {
      render(
        <ExerciseCard
          exercise={mockExercise}
          viewMode="grid"
          categoryEmoji={categoryEmoji}
          isCustom={false}
          onClick={mockOnClick}
        />
      )

      expect(screen.getByText(/chest, triceps/i)).toBeInTheDocument()
    })
  })

  describe('List View', () => {
    it('should render exercise information in list view', () => {
      render(
        <ExerciseCard
          exercise={mockExercise}
          viewMode="list"
          categoryEmoji={categoryEmoji}
          isCustom={false}
          onClick={mockOnClick}
        />
      )

      expect(screen.getByText('Bench Press')).toBeInTheDocument()
      expect(screen.getByText('chest')).toBeInTheDocument()
    })

    it('should be more compact in list view', () => {
      const { container } = render(
        <ExerciseCard
          exercise={mockExercise}
          viewMode="list"
          categoryEmoji={categoryEmoji}
          isCustom={false}
          onClick={mockOnClick}
        />
      )

      // List view should have flex row layout
      const card = container.firstChild
      expect(card).toHaveClass('flex')
    })
  })

  describe('Accessibility', () => {
    it('should be keyboard accessible', () => {
      render(
        <ExerciseCard
          exercise={mockExercise}
          viewMode="grid"
          categoryEmoji={categoryEmoji}
          isCustom={false}
          onClick={mockOnClick}
        />
      )

      const card = screen.getByRole('button')
      
      // Should be focusable
      card.focus()
      expect(document.activeElement).toBe(card)
    })

    it('should have proper button role', () => {
      render(
        <ExerciseCard
          exercise={mockExercise}
          viewMode="grid"
          categoryEmoji={categoryEmoji}
          isCustom={false}
          onClick={mockOnClick}
        />
      )

      expect(screen.getByRole('button')).toBeInTheDocument()
    })
  })

  describe('Visual States', () => {
    it('should have hover effect', () => {
      const { container } = render(
        <ExerciseCard
          exercise={mockExercise}
          viewMode="grid"
          categoryEmoji={categoryEmoji}
          isCustom={false}
          onClick={mockOnClick}
        />
      )

      const card = container.firstChild as HTMLElement
      expect(card.className).toContain('hover:')
    })

    it('should show different styles for compound exercises', () => {
      const { rerender } = render(
        <ExerciseCard
          exercise={mockExercise}
          viewMode="grid"
          categoryEmoji={categoryEmoji}
          isCustom={false}
          onClick={mockOnClick}
        />
      )

      expect(screen.getByText('Compound')).toBeInTheDocument()

      // Test non-compound exercise
      rerender(
        <ExerciseCard
          exercise={{ ...mockExercise, is_compound: false }}
          viewMode="grid"
          categoryEmoji={categoryEmoji}
          isCustom={false}
          onClick={mockOnClick}
        />
      )

      expect(screen.queryByText('Compound')).not.toBeInTheDocument()
    })
  })
})