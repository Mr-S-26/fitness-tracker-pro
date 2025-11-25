import { test, expect } from '@playwright/test'

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Start from the home page
    await page.goto('/')
  })

  test('complete signup and login flow', async ({ page }) => {
    // Generate unique email for this test
    const testEmail = `test-${Date.now()}@example.com`
    const testPassword = 'TestPass123!'

    // 1. Navigate to signup
    await page.click('text=Sign up')
    await expect(page).toHaveURL('/signup')

    // 2. Fill signup form
    await page.fill('input[name="email"]', testEmail)
    await page.fill('input[name="password"]', testPassword)
    await page.fill('input[name="confirmPassword"]', testPassword)

    // 3. Submit signup
    await page.click('button:has-text("Sign up")')

    // 4. Should see success message or redirect
    await page.waitForTimeout(2000)
    
    // Check for either success message or dashboard
    const hasSuccessMessage = await page.locator('text=Account Created').isVisible()
    const isDashboard = page.url().includes('/dashboard')
    
    expect(hasSuccessMessage || isDashboard).toBeTruthy()

    // 5. If success message, go to login
    if (hasSuccessMessage) {
      await page.click('text=Go to Login')
      await expect(page).toHaveURL('/login')

      // 6. Login with created account
      await page.fill('input[name="email"]', testEmail)
      await page.fill('input[name="password"]', testPassword)
      await page.click('button:has-text("Sign in")')
    }

    // 7. Should be on dashboard
    await expect(page).toHaveURL('/dashboard')
    await expect(page.locator('text=Welcome back')).toBeVisible()

    // 8. Logout
    await page.click('button:has-text("Logout")')
    await expect(page).toHaveURL('/login')
  })

  test('show error for invalid login', async ({ page }) => {
    await page.goto('/login')

    await page.fill('input[name="email"]', 'nonexistent@example.com')
    await page.fill('input[name="password"]', 'wrongpassword')
    await page.click('button:has-text("Sign in")')

    // Should show error message
    await expect(page.locator('.bg-red-50')).toBeVisible()
  })

  test('validate password matching on signup', async ({ page }) => {
    await page.goto('/signup')

    await page.fill('input[name="email"]', 'test@example.com')
    await page.fill('input[name="password"]', 'password123')
    await page.fill('input[name="confirmPassword"]', 'different')
    await page.click('button:has-text("Sign up")')

    // Should show passwords don't match error
    await expect(page.locator('text=Passwords do not match')).toBeVisible()
  })

  test('redirect to login when accessing protected route', async ({ page }) => {
    // Try to access dashboard without login
    await page.goto('/dashboard')

    // Should redirect to login
    await expect(page).toHaveURL('/login')
  })

  test('remember me functionality', async ({ page, context }) => {
    // This test would check if session persists
    // Implementation depends on your auth setup
    await page.goto('/login')
    
    const testEmail = 'test@example.com'
    const testPassword = 'password123'
    
    await page.fill('input[name="email"]', testEmail)
    await page.fill('input[name="password"]', testPassword)
    await page.click('button:has-text("Sign in")')
    
    // Wait for dashboard
    await page.waitForURL('/dashboard')
    
    // Create new page in same context (simulates new tab)
    const newPage = await context.newPage()
    await newPage.goto('/dashboard')
    
    // Should still be logged in
    await expect(newPage).toHaveURL('/dashboard')
  })
})

test.describe('Authentication UI', () => {
  test('login page is accessible', async ({ page }) => {
    await page.goto('/login')

    // Check all form elements
    await expect(page.locator('input[name="email"]')).toBeVisible()
    await expect(page.locator('input[name="password"]')).toBeVisible()
    await expect(page.locator('button:has-text("Sign in")')).toBeVisible()
    await expect(page.locator('a:has-text("Sign up")')).toBeVisible()
  })

  test('signup page is accessible', async ({ page }) => {
    await page.goto('/signup')

    // Check all form elements
    await expect(page.locator('input[name="email"]')).toBeVisible()
    await expect(page.locator('input[name="password"]')).toBeVisible()
    await expect(page.locator('input[name="confirmPassword"]')).toBeVisible()
    await expect(page.locator('button:has-text("Sign up")')).toBeVisible()
    await expect(page.locator('a:has-text("Sign in")')).toBeVisible()
  })

  test('can navigate between login and signup', async ({ page }) => {
    await page.goto('/login')
    
    await page.click('a:has-text("Sign up")')
    await expect(page).toHaveURL('/signup')
    
    await page.click('a:has-text("Sign in")')
    await expect(page).toHaveURL('/login')
  })
})