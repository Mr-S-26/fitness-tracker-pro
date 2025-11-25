import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import AISetFeedback from '@/components/coaching/AISetFeedback'

// Mock fetch globally
global.fetch = jest.fn()

describe('AISetFeedback', () => {
  const mockOnSuggestionReceived = jest.fn()

  const defaultProps = {
    exerciseName: 'Bench Press',
    setNumber: 1,
    weight: 60,
    targetReps: 8,
    actualReps: 8,
    onSuggestionReceived: mockOnSuggestionReceived,
  }

  beforeEach(() => {
    jest.clearAllMocks()
    // Set up default Groq API key
    process.env.NEXT_PUBLIC_GROQ_API_KEY = 'test-key'
  })

  describe('Rendering', () => {
    it('should render difficulty and form quality options', () => {
      render(<AISetFeedback {...defaultProps} />)

      // Difficulty options
      expect(screen.getByText('Too Easy')).toBeInTheDocument()
      expect(screen.getByText('Easy')).toBeInTheDocument()
      expect(screen.getByText('Perfect')).toBeInTheDocument()
      expect(screen.getByText('Hard')).toBeInTheDocument()
      expect(screen.getByText('Failed')).toBeInTheDocument()

      // Form quality options
      expect(screen.getByText('Poor Form')).toBeInTheDocument()
      expect(screen.getByText('Good Form')).toBeInTheDocument()
      expect(screen.getByText('Perfect Form')).toBeInTheDocument()
    })

    it('should display set information', () => {
      render(<AISetFeedback {...defaultProps} />)

      expect(screen.getByText(/set 1/i)).toBeInTheDocument()
      expect(screen.getByText(/8\/8 reps @ 60kg/i)).toBeInTheDocument()
    })

    it('should have disabled feedback button initially', () => {
      render(<AISetFeedback {...defaultProps} />)

      const button = screen.getByText(/get coach feedback/i)
      expect(button.closest('button')).toBeDisabled()
    })
  })

  describe('User Interactions', () => {
    it('should enable feedback button when both difficulty and form are selected', () => {
      render(<AISetFeedback {...defaultProps} />)

      // Select difficulty
      fireEvent.click(screen.getByText('Perfect'))
      
      // Select form quality
      fireEvent.click(screen.getByText('Good Form'))

      // Button should now be enabled
      const button = screen.getByText(/get coach feedback/i)
      expect(button.closest('button')).not.toBeDisabled()
    })

    it('should highlight selected difficulty', () => {
      render(<AISetFeedback {...defaultProps} />)

      const perfectButton = screen.getByText('Perfect').closest('button')
      fireEvent.click(perfectButton!)

      expect(perfectButton).toHaveClass('border-indigo-600')
    })

    it('should highlight selected form quality', () => {
      render(<AISetFeedback {...defaultProps} />)

      const goodFormButton = screen.getByText('Good Form').closest('button')
      fireEvent.click(goodFormButton!)

      expect(goodFormButton).toHaveClass('border-indigo-600')
    })
  })

  describe('AI Feedback - Groq API Success', () => {
    it('should call Groq API and display feedback', async () => {
      const mockResponse = {
        choices: [{
          message: {
            content: 'Great job! That was a solid set with perfect execution.'
          }
        }]
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      render(<AISetFeedback {...defaultProps} />)

      // Select options
      fireEvent.click(screen.getByText('Perfect'))
      fireEvent.click(screen.getByText('Good Form'))

      // Get feedback
      const button = screen.getByText(/get coach feedback/i)
      fireEvent.click(button)

      // Should show loading state
      await waitFor(() => {
        expect(screen.getByText(/getting feedback/i)).toBeInTheDocument()
      })

      // Should show AI response
      await waitFor(() => {
        expect(screen.getByText(/great job/i)).toBeInTheDocument()
      }, { timeout: 3000 })
    })

    it('should show API key status indicator', async () => {
      const mockResponse = {
        choices: [{
          message: {
            content: 'Good set!'
          }
        }]
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      render(<AISetFeedback {...defaultProps} />)

      fireEvent.click(screen.getByText('Perfect'))
      fireEvent.click(screen.getByText('Good Form'))
      fireEvent.click(screen.getByText(/get coach feedback/i))

      await waitFor(() => {
        expect(screen.getByText(/api key ok/i)).toBeInTheDocument()
      })
    })
  })

  describe('AI Feedback - Fallback to Rules', () => {
    it('should use rule-based fallback when API key is missing', async () => {
      delete process.env.NEXT_PUBLIC_GROQ_API_KEY

      render(<AISetFeedback {...defaultProps} />)

      fireEvent.click(screen.getByText('Perfect'))
      fireEvent.click(screen.getByText('Good Form'))
      fireEvent.click(screen.getByText(/get coach feedback/i))

      await waitFor(() => {
        expect(screen.getByText(/smart coach/i)).toBeInTheDocument()
        expect(screen.getByText(/no api key/i)).toBeInTheDocument()
      })
    })

    it('should use rule-based fallback when API call fails', async () => {
      ;(global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error('Network error')
      )

      render(<AISetFeedback {...defaultProps} />)

      fireEvent.click(screen.getByText('Perfect'))
      fireEvent.click(screen.getByText('Good Form'))
      fireEvent.click(screen.getByText(/get coach feedback/i))

      await waitFor(() => {
        expect(screen.getByText(/rule-based/i)).toBeInTheDocument()
      })
    })
  })

  describe('Suggestions Display', () => {
    it('should display next set suggestions', async () => {
      const mockResponse = {
        choices: [{
          message: {
            content: 'Good work!'
          }
        }]
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      render(<AISetFeedback {...defaultProps} />)

      fireEvent.click(screen.getByText('Perfect'))
      fireEvent.click(screen.getByText('Good Form'))
      fireEvent.click(screen.getByText(/get coach feedback/i))

      await waitFor(() => {
        expect(screen.getByText(/next set recommendation/i)).toBeInTheDocument()
      })

      // Should show weight, reps, rest
      expect(screen.getByText(/weight/i)).toBeInTheDocument()
      expect(screen.getByText(/reps/i)).toBeInTheDocument()
      expect(screen.getByText(/rest/i)).toBeInTheDocument()
    })

    it('should show form tips when provided', async () => {
      // Test will check for form tips in suggestion
      render(<AISetFeedback {...defaultProps} />)

      fireEvent.click(screen.getByText('Perfect'))
      fireEvent.click(screen.getByText('Poor Form'))
      fireEvent.click(screen.getByText(/get coach feedback/i))

      await waitFor(() => {
        expect(screen.getByText(/form tips/i)).toBeInTheDocument()
      })
    })

    it('should show warnings when needed', async () => {
      render(<AISetFeedback {...defaultProps} actualReps={3} />)

      fireEvent.click(screen.getByText('Failed'))
      fireEvent.click(screen.getByText('Poor Form'))
      fireEvent.click(screen.getByText(/get coach feedback/i))

      await waitFor(() => {
        expect(screen.getByText(/warnings/i)).toBeInTheDocument()
      })
    })
  })

  describe('Callback Functionality', () => {
    it('should call onSuggestionReceived with correct data', async () => {
      const mockResponse = {
        choices: [{
          message: {
            content: 'Good!'
          }
        }]
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      render(<AISetFeedback {...defaultProps} />)

      fireEvent.click(screen.getByText('Perfect'))
      fireEvent.click(screen.getByText('Good Form'))
      fireEvent.click(screen.getByText(/get coach feedback/i))

      await waitFor(() => {
        expect(mockOnSuggestionReceived).toHaveBeenCalledWith(
          expect.objectContaining({
            weight: expect.any(Number),
            reps: expect.any(Number),
            rest: expect.any(Number),
            reasoning: expect.any(String),
          })
        )
      })
    })
  })
})