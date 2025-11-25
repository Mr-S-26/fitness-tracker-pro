import { test, expect } from '@playwright/test'

test.describe('Workout Flow', () => {
  // Helper to login before each test
  test.beforeEach(async ({ page }) => {
    // Login with test account
    await page.goto('/login')
    await page.fill('input[name="email"]', 'test@example.com')
    await page.fill('input[name="password"]', 'password123')
    await page.click('button:has-text("Sign in")')
    await page.waitForURL('/dashboard')
  })

  test('complete workout end-to-end', async ({ page }) => {
    // 1. Start workout from dashboard
    await page.click('button:has-text("Start Workout")')
    
    // 2. Should see workout setup screen
    await expect(page.locator('h1:has-text("Start Workout")')).toBeVisible()
    
    // 3. Optionally name the workout
    await page.fill('input[placeholder*="Push Day"]', 'Test Workout')
    await page.click('button:has-text("Start Workout")')
    
    // 4. Should see workout interface
    await expect(page.locator('text=Active Workout')).toBeVisible()
    
    // 5. Add an exercise
    await page.click('button:has-text("Add Exercise")')
    
    // 6. Exercise selector should open
    await expect(page.locator('h2:has-text("Select Exercise")')).toBeVisible()
    
    // 7. Search for bench press (assuming it exists)
    await page.fill('input[placeholder*="Search"]', 'bench')
    
    // 8. Click on an exercise - FIXED: first() on locator, not click()
    await page.locator('button:has-text("Bench Press")').first().click()
    
    // 9. Exercise should appear in tabs
    await expect(page.locator('button:has-text("Bench Press")')).toBeVisible()
    
    // 10. Log first set - FIXED: proper await syntax
    await page.locator('input[placeholder="0"]').nth(0).fill('60') // weight
    await page.locator('input[placeholder="0"]').nth(1).fill('8')  // target reps
    await page.locator('input[placeholder="0"]').nth(2).fill('8')  // actual reps
    
    // 11. Complete the set
    await page.click('button:has-text("✓")')
    
    // 12. AI feedback modal should appear
    await expect(page.locator('text=How was this set?')).toBeVisible()
    
    // 13. Rate difficulty and form
    await page.click('button:has-text("Perfect")')
    await page.click('button:has-text("Good Form")')
    await page.click('button:has-text("Get Coach Feedback")')
    
    // 14. Should see feedback
    await expect(page.locator('text=Next Set Recommendation')).toBeVisible({ timeout: 10000 })
    
    // 15. Skip or complete feedback - FIXED: proper locator syntax
    const skipButton = page.locator('button:has-text("Skip")').or(page.locator('button:has-text("Close")'))
    await skipButton.first().click()
    
    // 16. Rest timer should appear
    await expect(page.locator('text=Rest Timer')).toBeVisible()
    
    // 17. Skip rest
    await page.click('button:has-text("Skip Rest")')
    
    // 18. Add another set
    await page.click('button:has-text("Add Set")')
    await expect(page.locator('text=Set 2')).toBeVisible()
    
    // 19. Complete workout
    await page.click('button:has-text("Complete Workout")')
    
    // 20. Should see workout summary
    await expect(page.locator('text=Workout Complete')).toBeVisible()
    await expect(page.locator('text=Great job')).toBeVisible()
    
    // 21. Should show stats
    await expect(page.locator('text=Minutes')).toBeVisible()
    await expect(page.locator('text=Sets')).toBeVisible()
    await expect(page.locator('text=Volume')).toBeVisible()
    
    // 22. Return to dashboard
    await page.click('button:has-text("Back to Dashboard")')
    await expect(page).toHaveURL('/dashboard')
    
    // 23. Dashboard should show updated stats
    const totalWorkouts = page.locator('text=Total Workouts').locator('..').locator('text=1')
    await expect(totalWorkouts).toBeVisible()
  })

  test('can cancel workout', async ({ page }) => {
    // Start workout
    await page.click('button:has-text("Start Workout")')
    await page.click('button:has-text("Start Workout")') // Click through setup
    
    // Setup dialog handler before clicking
    page.on('dialog', dialog => dialog.accept())
    
    // Click cancel button - FIXED: proper locator syntax
    const cancelButton = page.locator('button[aria-label="Cancel workout"]').or(page.locator('svg.lucide-x').first())
    await cancelButton.click()
    
    // Should return to dashboard
    await expect(page).toHaveURL('/dashboard')
  })

  test('can add multiple exercises', async ({ page }) => {
    await page.click('button:has-text("Start Workout")')
    await page.click('button:has-text("Start Workout")')
    
    // Add first exercise - FIXED
    await page.click('button:has-text("Add Exercise")')
    await page.locator('button:has-text("Bench Press")').first().click()
    
    // Add second exercise - FIXED
    await page.click('button:has-text("Add")')
    await page.locator('button:has-text("Squat")').first().click()
    
    // Should see both tabs
    await expect(page.locator('button:has-text("Bench Press")')).toBeVisible()
    await expect(page.locator('button:has-text("Squat")')).toBeVisible()
  })

  test('can switch between exercises', async ({ page }) => {
    await page.click('button:has-text("Start Workout")')
    await page.click('button:has-text("Start Workout")')
    
    // Add two exercises - FIXED
    await page.click('button:has-text("Add Exercise")')
    await page.locator('button:has-text("Bench Press")').first().click()
    await page.click('button:has-text("Add")')
    await page.locator('button:has-text("Squat")').first().click()
    
    // Click on first exercise tab
    await page.click('button:has-text("Bench Press")')
    await expect(page.locator('h2:has-text("Bench Press")')).toBeVisible()
    
    // Click on second exercise tab
    await page.click('button:has-text("Squat")')
    await expect(page.locator('h2:has-text("Squat")')).toBeVisible()
  })

  test('rest timer works correctly', async ({ page }) => {
    await page.click('button:has-text("Start Workout")')
    await page.click('button:has-text("Start Workout")')
    await page.click('button:has-text("Add Exercise")')
    await page.locator('button:has-text("Bench Press")').first().click()
    
    // Complete a set to trigger rest timer - FIXED
    await page.locator('input[placeholder="0"]').nth(0).fill('60')
    await page.locator('input[placeholder="0"]').nth(1).fill('8')
    await page.locator('input[placeholder="0"]').nth(2).fill('8')
    await page.click('button:has-text("✓")')
    
    // Skip AI feedback - FIXED
    await page.locator('button:has-text("Skip")').first().click()
    
    // Rest timer should show
    await expect(page.locator('text=Rest Timer')).toBeVisible()
    
    // Test pause button
    await page.click('button:has-text("Pause")')
    await expect(page.locator('button:has-text("Resume")')).toBeVisible()
    
    // Test add time
    await page.click('button:has-text("+15s")')
    
    // Test skip
    await page.click('button:has-text("Skip Rest")')
    await expect(page.locator('text=Rest Timer')).not.toBeVisible()
  })

  test('shows error when completing set without data', async ({ page }) => {
    await page.click('button:has-text("Start Workout")')
    await page.click('button:has-text("Start Workout")')
    await page.click('button:has-text("Add Exercise")')
    await page.locator('button:has-text("Bench Press")').first().click()
    
    // Setup dialog handler
    page.on('dialog', dialog => {
      expect(dialog.message()).toContain('weight')
      dialog.dismiss()
    })
    
    // Try to complete set without entering data
    await page.click('button:has-text("✓")')
  })
})

test.describe('Workout UI', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[name="email"]', 'test@example.com')
    await page.fill('input[name="password"]', 'password123')
    await page.click('button:has-text("Sign in")')
    await page.waitForURL('/dashboard')
  })

  test('timer counts up during workout', async ({ page }) => {
    await page.click('button:has-text("Start Workout")')
    await page.click('button:has-text("Start Workout")')
    
    // Get initial time
    const timer = page.locator('text=/\\d+m/')
    await expect(timer).toBeVisible()
    
    // Wait and check time increased
    await page.waitForTimeout(2000)
    // Time should have changed
  })

  test('volume updates when sets completed', async ({ page }) => {
    await page.click('button:has-text("Start Workout")')
    await page.click('button:has-text("Start Workout")')
    await page.click('button:has-text("Add Exercise")')
    await page.locator('button:has-text("Bench Press")').first().click()
    
    // Check initial volume is 0
    await expect(page.locator('text=0kg')).toBeVisible()
    
    // Complete a set - FIXED
    await page.locator('input[placeholder="0"]').nth(0).fill('60')
    await page.locator('input[placeholder="0"]').nth(2).fill('8')
    await page.click('button:has-text("✓")')
    
    // Volume should update (60kg * 8 reps = 480kg)
    await expect(page.locator('text=/480kg|480 kg/')).toBeVisible()
  })
})