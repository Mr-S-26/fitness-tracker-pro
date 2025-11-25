import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useRouter } from 'next/navigation'
import LoginPage from '@/app/(auth)/login/page'
import { createClient } from '@/lib/supabase/client'

// Mock modules
jest.mock('@/lib/supabase/client')
jest.mock('next/navigation')

describe('Login Page', () => {
  let mockPush: jest.Mock
  let mockRefresh: jest.Mock
  let mockSupabase: any

  beforeEach(() => {
    // Reset mocks before each test
    mockPush = jest.fn()
    mockRefresh = jest.fn()
    
    ;(useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
      refresh: mockRefresh,
    })

    mockSupabase = {
      auth: {
        signInWithPassword: jest.fn(),
      },
    }
    
    ;(createClient as jest.Mock).mockReturnValue(mockSupabase)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render login form', () => {
      render(<LoginPage />)
      
      expect(screen.getByText('🏋️ FitTracker Pro')).toBeInTheDocument()
      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
    })

    it('should have link to signup page', () => {
      render(<LoginPage />)
      
      const signupLink = screen.getByRole('link', { name: /sign up/i })
      expect(signupLink).toHaveAttribute('href', '/signup')
    })

    it('should disable submit button when fields are empty', () => {
      render(<LoginPage />)
      
      const submitButton = screen.getByRole('button', { name: /sign in/i })
      expect(submitButton).toBeDisabled()
    })
  })

  describe('Form Validation', () => {
    it('should require email input', () => {
      render(<LoginPage />)
      
      const emailInput = screen.getByLabelText(/email address/i)
      expect(emailInput).toHaveAttribute('required')
      expect(emailInput).toHaveAttribute('type', 'email')
    })

    it('should require password input', () => {
      render(<LoginPage />)
      
      const passwordInput = screen.getByLabelText(/password/i)
      expect(passwordInput).toHaveAttribute('required')
      expect(passwordInput).toHaveAttribute('type', 'password')
    })

    it('should mask password input', () => {
      render(<LoginPage />)
      
      const passwordInput = screen.getByLabelText(/password/i)
      expect(passwordInput).toHaveAttribute('type', 'password')
    })
  })

  describe('Form Submission', () => {
    it('should call signInWithPassword with correct credentials', async () => {
      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: { id: '123', email: 'test@example.com' } },
        error: null,
      })

      render(<LoginPage />)
      
      const emailInput = screen.getByLabelText(/email address/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /sign in/i })

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
      fireEvent.change(passwordInput, { target: { value: 'password123' } })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password123',
        })
      })
    })

    it('should redirect to dashboard on successful login', async () => {
      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: { id: '123', email: 'test@example.com' } },
        error: null,
      })

      render(<LoginPage />)
      
      const emailInput = screen.getByLabelText(/email address/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /sign in/i })

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
      fireEvent.change(passwordInput, { target: { value: 'password123' } })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/dashboard')
        expect(mockRefresh).toHaveBeenCalled()
      })
    })

    it('should show error message on failed login', async () => {
      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: null },
        error: { message: 'Invalid login credentials' },
      })

      render(<LoginPage />)
      
      const emailInput = screen.getByLabelText(/email address/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /sign in/i })

      fireEvent.change(emailInput, { target: { value: 'wrong@example.com' } })
      fireEvent.change(passwordInput, { target: { value: 'wrongpass' } })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/invalid login credentials/i)).toBeInTheDocument()
      })
    })

    it('should show loading state during submission', async () => {
      mockSupabase.auth.signInWithPassword.mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 100))
      )

      render(<LoginPage />)
      
      const emailInput = screen.getByLabelText(/email address/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /sign in/i })

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
      fireEvent.change(passwordInput, { target: { value: 'password123' } })
      fireEvent.click(submitButton)

      expect(screen.getByText(/signing in/i)).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have proper labels for screen readers', () => {
      render(<LoginPage />)
      
      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    })

    it('should be keyboard navigable', () => {
      render(<LoginPage />)
      
      const emailInput = screen.getByLabelText(/email address/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /sign in/i })

      emailInput.focus()
      expect(document.activeElement).toBe(emailInput)
      
      // Tab to password
      passwordInput.focus()
      expect(document.activeElement).toBe(passwordInput)
      
      // Tab to submit button
      submitButton.focus()
      expect(document.activeElement).toBe(submitButton)
    })
  })
})