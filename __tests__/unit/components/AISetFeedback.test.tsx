import '@testing-library/jest-dom'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import AISetFeedback from '@/components/coaching/AISetFeedback'

// Mock the server action
jest.mock('@/app/actions/workout', () => ({
  logSetResult: jest.fn().mockResolvedValue({ success: true }),
}))

describe('AISetFeedback', () => {
  const defaultProps = {
    exerciseName: 'Bench Press',
    setNumber: 1,
    targetWeight: 60,
    targetReps: '8',
    onSave: jest.fn(),
    onCancel: jest.fn(),
  }

  describe('Rendering', () => {
    it('should render correct title and set info', () => {
      render(<AISetFeedback {...defaultProps} />)
      expect(screen.getByText('Bench Press')).toBeInTheDocument()
      expect(screen.getByText(/Set 1/i)).toBeInTheDocument()
    })

    it('should render difficulty options', () => {
      render(<AISetFeedback {...defaultProps} />)
      // ✅ FIX: Match actual UI buttons
      expect(screen.getByText('Easy')).toBeInTheDocument()
      expect(screen.getByText('Good')).toBeInTheDocument()
      expect(screen.getByText('Hard')).toBeInTheDocument()
      expect(screen.getByText('Fail')).toBeInTheDocument()
    })

    it('should display set information in inputs', () => {
      render(<AISetFeedback {...defaultProps} />)
      // ✅ FIX: Select by label to distinguish between Reps and RPE
      const weightInput = screen.getByLabelText(/Weight/i)
      const repsInput = screen.getByLabelText(/Reps/i)
      
      expect(weightInput).toHaveValue(60)
      expect(repsInput).toHaveValue(8)
    })

    it('should have disabled feedback button initially', () => {
      render(<AISetFeedback {...defaultProps} />)
      const button = screen.getByRole('button', { name: /Log Set & Rest/i })
      expect(button).toBeDisabled()
    })
  })

  describe('User Interactions', () => {
    it('should enable feedback button when difficulty is selected', () => {
      render(<AISetFeedback {...defaultProps} />)
      
      // Select difficulty
      const goodButton = screen.getByText('Good').closest('button')
      fireEvent.click(goodButton!)
      
      const submitButton = screen.getByRole('button', { name: /Log Set & Rest/i })
      expect(submitButton).not.toBeDisabled()
    })

    it('should highlight selected difficulty', () => {
      render(<AISetFeedback {...defaultProps} />)
      
      const goodButton = screen.getByText('Good').closest('button')
      fireEvent.click(goodButton!)
      
      // Check for active class styling (Purple bg)
      expect(goodButton).toHaveClass('bg-purple-50')
    })

    it('should call onSave with correct data', async () => {
      render(<AISetFeedback {...defaultProps} />)
      
      // Select options
      fireEvent.click(screen.getByText('Good'))
      
      // Submit
      const submitButton = screen.getByRole('button', { name: /Log Set & Rest/i })
      fireEvent.click(submitButton)

      expect(defaultProps.onSave).toHaveBeenCalledWith(expect.objectContaining({
        difficulty: 'perfect', // 'Good' maps to 'perfect' internally
        weight: 60,
        reps: 8
      }))
    })
  })
})