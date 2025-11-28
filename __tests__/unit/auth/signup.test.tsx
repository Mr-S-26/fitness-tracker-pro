import '@testing-library/jest-dom'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import SignupPage from '@/app/(auth)/signup/page'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}))

jest.mock('@/lib/supabase/client', () => ({
  createClient: jest.fn(),
}))

describe('Signup Page', () => {
  const mockPush = jest.fn()
  const mockRefresh = jest.fn()
  const mockSignUp = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
      refresh: mockRefresh,
    })
    ;(createClient as jest.Mock).mockReturnValue({
      auth: {
        signUp: mockSignUp,
      },
    })
  })

  describe('Rendering', () => {
    it('should render signup form', () => {
      render(<SignupPage />)
      // ✅ FIX: Match actual UI text
      expect(screen.getByText('Create your account')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument()
      expect(screen.getAllByPlaceholderText('••••••••')).toHaveLength(2)
      expect(screen.getByRole('button', { name: 'Sign up' })).toBeInTheDocument()
    })

    it('should have link to login page', () => {
      render(<SignupPage />)
      const link = screen.getByRole('link', { name: 'Sign in' })
      expect(link).toBeInTheDocument()
      expect(link).toHaveAttribute('href', '/login')
    })
  })

  describe('Form Validation', () => {
    it('should show error when passwords do not match', async () => {
      render(<SignupPage />)

      fireEvent.change(screen.getByLabelText(/^Password$/), {
        target: { value: 'password123' },
      })
      fireEvent.change(screen.getByLabelText(/Confirm Password/i), {
        target: { value: 'password456' },
      })

      fireEvent.click(screen.getByRole('button', { name: 'Sign up' }))

      await waitFor(() => {
        expect(screen.getByText("Passwords don't match")).toBeInTheDocument()
      })
    })

    it('should show error when password is too short', async () => {
      render(<SignupPage />)

      fireEvent.change(screen.getByLabelText(/^Password$/), {
        target: { value: '123' },
      })
      fireEvent.change(screen.getByLabelText(/Confirm Password/i), {
        target: { value: '123' },
      })

      fireEvent.click(screen.getByRole('button', { name: 'Sign up' }))

      await waitFor(() => {
        expect(screen.getByText('Password must be at least 6 characters')).toBeInTheDocument()
      })
    })
  })

  describe('Form Submission', () => {
    it('should call signUp with correct data', async () => {
      mockSignUp.mockResolvedValue({ 
        data: { user: { id: '1' }, session: null }, 
        error: null 
      })
      render(<SignupPage />)

      fireEvent.change(screen.getByLabelText(/Email Address/i), {
        target: { value: 'test@example.com' },
      })
      fireEvent.change(screen.getByLabelText(/^Password$/), {
        target: { value: 'password123' },
      })
      fireEvent.change(screen.getByLabelText(/Confirm Password/i), {
        target: { value: 'password123' },
      })

      fireEvent.click(screen.getByRole('button', { name: 'Sign up' }))

      await waitFor(() => {
        expect(mockSignUp).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password123',
          options: {
            emailRedirectTo: expect.stringContaining('/auth/callback'),
          },
        })
      })
    })

    it('should show success message after signup', async () => {
      mockSignUp.mockResolvedValue({ 
        data: { user: { id: '1' }, session: null }, 
        error: null 
      })
      render(<SignupPage />)

      fireEvent.change(screen.getByLabelText(/Email Address/i), {
        target: { value: 'test@example.com' },
      })
      fireEvent.change(screen.getByLabelText(/^Password$/), {
        target: { value: 'password123' },
      })
      fireEvent.change(screen.getByLabelText(/Confirm Password/i), {
        target: { value: 'password123' },
      })

      fireEvent.click(screen.getByRole('button', { name: 'Sign up' }))

      await waitFor(() => {
        expect(screen.getByText(/check your email/i)).toBeInTheDocument()
      })
    })
  })
})