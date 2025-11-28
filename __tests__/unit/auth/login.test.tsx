import '@testing-library/jest-dom'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import LoginPage from '@/app/(auth)/login/page'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}))

jest.mock('@/lib/supabase/client', () => ({
  createClient: jest.fn(),
}))

describe('Login Page', () => {
  const mockPush = jest.fn()
  const mockRefresh = jest.fn()
  const mockSignIn = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
      refresh: mockRefresh,
    })
    ;(createClient as jest.Mock).mockReturnValue({
      auth: {
        signInWithPassword: mockSignIn,
      },
    })
  })

  describe('Rendering', () => {
    it('should render login form', () => {
      render(<LoginPage />)
      // ✅ FIX: Match actual text
      expect(screen.getByText(/Sign in to your account/i)).toBeInTheDocument()
      expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Sign in' })).toBeInTheDocument()
    })

    it('should have link to signup page', () => {
      render(<LoginPage />)
      const link = screen.getByRole('link', { name: /Sign up/i })
      expect(link).toBeInTheDocument()
      expect(link).toHaveAttribute('href', '/signup')
    })
  })

  describe('Form Validation', () => {
    it('should require email input', () => {
      render(<LoginPage />)
      const emailInput = screen.getByPlaceholderText('you@example.com')
      expect(emailInput).toBeRequired()
    })

    it('should require password input', () => {
      render(<LoginPage />)
      const passwordInput = screen.getByPlaceholderText('••••••••')
      expect(passwordInput).toBeRequired()
    })

    it('should mask password input', () => {
      render(<LoginPage />)
      const passwordInput = screen.getByPlaceholderText('••••••••')
      expect(passwordInput).toHaveAttribute('type', 'password')
    })
  })

  describe('Form Submission', () => {
    it('should call signInWithPassword with correct credentials', async () => {
      mockSignIn.mockResolvedValue({ data: { user: { id: '1' } }, error: null })
      render(<LoginPage />)

      fireEvent.change(screen.getByPlaceholderText('you@example.com'), {
        target: { value: 'test@example.com' },
      })
      fireEvent.change(screen.getByPlaceholderText('••••••••'), {
        target: { value: 'password123' },
      })

      const submitButton = screen.getByRole('button', { name: 'Sign in' })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password123',
        })
      })
    })

    it('should redirect to dashboard on successful login', async () => {
      mockSignIn.mockResolvedValue({ data: { user: { id: '1' } }, error: null })
      render(<LoginPage />)

      fireEvent.change(screen.getByPlaceholderText('you@example.com'), {
        target: { value: 'test@example.com' },
      })
      fireEvent.change(screen.getByPlaceholderText('••••••••'), {
        target: { value: 'password123' },
      })

      fireEvent.click(screen.getByRole('button', { name: 'Sign in' }))

      await waitFor(() => {
        expect(mockRefresh).toHaveBeenCalled()
        expect(mockPush).toHaveBeenCalledWith('/dashboard')
      })
    })

    it('should show error message on failed login', async () => {
      mockSignIn.mockResolvedValue({ 
        data: { user: null }, 
        error: { message: 'Invalid credentials' } 
      })
      render(<LoginPage />)

      fireEvent.change(screen.getByPlaceholderText('you@example.com'), {
        target: { value: 'test@example.com' },
      })
      fireEvent.change(screen.getByPlaceholderText('••••••••'), {
        target: { value: 'wrongpassword' },
      })

      fireEvent.click(screen.getByRole('button', { name: 'Sign in' }))

      await waitFor(() => {
        expect(screen.getByText('Invalid credentials')).toBeInTheDocument()
      })
    })
  })
})