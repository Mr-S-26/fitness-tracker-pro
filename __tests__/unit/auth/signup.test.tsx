import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useRouter } from 'next/navigation'
import SignupPage from '@/app/(auth)/signup/page'
import { createClient } from '@/lib/supabase/client'

jest.mock('@/lib/supabase/client')
jest.mock('next/navigation')

describe('Signup Page', () => {
  let mockPush: jest.Mock
  let mockRefresh: jest.Mock
  let mockSupabase: any

  beforeEach(() => {
    mockPush = jest.fn()
    mockRefresh = jest.fn()
    
    ;(useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
      refresh: mockRefresh,
    })

    mockSupabase = {
      auth: {
        signUp: jest.fn(),
      },
    }
    
    ;(createClient as jest.Mock).mockReturnValue(mockSupabase)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render signup form', () => {
      render(<SignupPage />)
      
      expect(screen.getByText('🏋️ FitTracker Pro')).toBeInTheDocument()
      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument()
      expect(screen.getByLabelText('Password')).toBeInTheDocument()
      expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument()
    })

    it('should have link to login page', () => {
      render(<SignupPage />)
      
      const loginLink = screen.getByRole('link', { name: /sign in/i })
      expect(loginLink).toHaveAttribute('href', '/login')
    })
  })

  describe('Form Validation', () => {
    it('should show error when passwords do not match', async () => {
      render(<SignupPage />)
      
      const emailInput = screen.getByLabelText(/email address/i)
      const passwordInput = screen.getByLabelText('Password')
      const confirmInput = screen.getByLabelText(/confirm password/i)
      const submitButton = screen.getByRole('button', { name: /sign up/i })

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
      fireEvent.change(passwordInput, { target: { value: 'password123' } })
      fireEvent.change(confirmInput, { target: { value: 'differentpass' } })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument()
      })
    })

    it('should show error when password is too short', async () => {
      render(<SignupPage />)
      
      const emailInput = screen.getByLabelText(/email address/i)
      const passwordInput = screen.getByLabelText('Password')
      const confirmInput = screen.getByLabelText(/confirm password/i)
      const submitButton = screen.getByRole('button', { name: /sign up/i })

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
      fireEvent.change(passwordInput, { target: { value: '12345' } })
      fireEvent.change(confirmInput, { target: { value: '12345' } })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/password must be at least 6 characters/i)).toBeInTheDocument()
      })
    })

    it('should show password length hint', () => {
      render(<SignupPage />)
      
      expect(screen.getByText(/must be at least 6 characters/i)).toBeInTheDocument()
    })
  })

  describe('Form Submission', () => {
    it('should call signUp with correct data', async () => {
      mockSupabase.auth.signUp.mockResolvedValue({
        data: { 
          user: { id: '123', email: 'test@example.com' },
          session: { access_token: 'token123' }
        },
        error: null,
      })

      render(<SignupPage />)
      
      const emailInput = screen.getByLabelText(/email address/i)
      const passwordInput = screen.getByLabelText('Password')
      const confirmInput = screen.getByLabelText(/confirm password/i)
      const submitButton = screen.getByRole('button', { name: /sign up/i })

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
      fireEvent.change(passwordInput, { target: { value: 'password123' } })
      fireEvent.change(confirmInput, { target: { value: 'password123' } })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(mockSupabase.auth.signUp).toHaveBeenCalledWith(
          expect.objectContaining({
            email: 'test@example.com',
            password: 'password123',
          })
        )
      })
    })

    it('should show success message after signup', async () => {
      mockSupabase.auth.signUp.mockResolvedValue({
        data: { 
          user: { id: '123', email: 'test@example.com' },
          session: null // No session = email confirmation required
        },
        error: null,
      })

      render(<SignupPage />)
      
      const emailInput = screen.getByLabelText(/email address/i)
      const passwordInput = screen.getByLabelText('Password')
      const confirmInput = screen.getByLabelText(/confirm password/i)
      const submitButton = screen.getByRole('button', { name: /sign up/i })

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
      fireEvent.change(passwordInput, { target: { value: 'password123' } })
      fireEvent.change(confirmInput, { target: { value: 'password123' } })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/account created/i)).toBeInTheDocument()
      })
    })

    it('should redirect to dashboard if session exists (no email confirmation)', async () => {
      mockSupabase.auth.signUp.mockResolvedValue({
        data: { 
          user: { id: '123', email: 'test@example.com' },
          session: { access_token: 'token123' }
        },
        error: null,
      })

      render(<SignupPage />)
      
      const emailInput = screen.getByLabelText(/email address/i)
      const passwordInput = screen.getByLabelText('Password')
      const confirmInput = screen.getByLabelText(/confirm password/i)
      const submitButton = screen.getByRole('button', { name: /sign up/i })

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
      fireEvent.change(passwordInput, { target: { value: 'password123' } })
      fireEvent.change(confirmInput, { target: { value: 'password123' } })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/dashboard')
      }, { timeout: 3000 })
    })

    it('should show error on signup failure', async () => {
      mockSupabase.auth.signUp.mockResolvedValue({
        data: { user: null },
        error: { message: 'Email already registered' },
      })

      render(<SignupPage />)
      
      const emailInput = screen.getByLabelText(/email address/i)
      const passwordInput = screen.getByLabelText('Password')
      const confirmInput = screen.getByLabelText(/confirm password/i)
      const submitButton = screen.getByRole('button', { name: /sign up/i })

      fireEvent.change(emailInput, { target: { value: 'existing@example.com' } })
      fireEvent.change(passwordInput, { target: { value: 'password123' } })
      fireEvent.change(confirmInput, { target: { value: 'password123' } })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/email already registered/i)).toBeInTheDocument()
      })
    })
  })
})