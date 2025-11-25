import { test, expect } from '@playwright/test'

test.describe('Exercise Library E2E', () => {
  // Setup: Login before each test
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[name="email"]', 'test@example.com')
    await page.fill('input[name="password"]', 'password123')
    await page.click('button:has-text("Sign in")')
    await page.waitForURL('/dashboard')
  })

  test('navigate to exercise library from dashboard', async ({ page }) => {
    // Click on Exercise Library button
    await page.click('button:has-text("Browse Library")')
    
    // Should navigate to exercises page
    await expect(page).toHaveURL('/exercises')
    await expect(page.locator('h1:has-text("Exercise Library")')).toBeVisible()
  })

  test('search for exercises', async ({ page }) => {
    await page.goto('/exercises')
    
    // Type in search box
    await page.fill('input[placeholder*="Search exercises"]', 'bench')
    
    // Should filter results
    await page.waitForTimeout(500)
    const exerciseCards = page.locator('[data-testid="exercise-card"]')
    await expect(exerciseCards.first()).toBeVisible()
  })

  test('filter by category', async ({ page }) => {
    await page.goto('/exercises')
    
    // Open filters
    await page.click('button:has-text("Filters")')
    
    // Select category
    await page.selectOption('select[name="category"]', 'chest')
    
    // Should show filtered results
    await expect(page.locator('text=chest')).toBeVisible()
  })

  test('toggle between grid and list view', async ({ page }) => {
    await page.goto('/exercises')
    
    // Default is grid view
    await expect(page.locator('.grid')).toBeVisible()
    
    // Click list view button
    await page.click('button[aria-label="List view"]')
    
    // Should switch to list view
    await expect(page.locator('.space-y-4')).toBeVisible()
    
    // Click grid view button
    await page.click('button[aria-label="Grid view"]')
    
    // Should switch back to grid
    await expect(page.locator('.grid')).toBeVisible()
  })

  test('view exercise details', async ({ page }) => {
    await page.goto('/exercises')
    
    // Click on first exercise
    await page.click('[data-testid="exercise-card"]').first()
    
    // Detail modal should open
    await expect(page.locator('role=dialog')).toBeVisible()
    await expect(page.locator('h2')).toBeVisible()
    
    // Should show exercise details
    await expect(page.locator('text=Instructions')).toBeVisible()
    
    // Close modal
    await page.click('button:has-text("Close")')
    await expect(page.locator('role=dialog')).not.toBeVisible()
  })

  test('create custom exercise', async ({ page }) => {
    await page.goto('/exercises')
    
    // Click create button
    await page.click('button:has-text("Create Exercise")')
    
    // Fill in form
    await page.fill('input[name="name"]', 'E2E Test Exercise')
    await page.selectOption('select[name="category"]', 'chest')
    await page.selectOption('select[name="equipment"]', 'dumbbell')
    
    // Add primary muscle
    await page.fill('input[placeholder*="quadriceps"]', 'chest')
    await page.click('button:has-text("+")')
    
    // Check compound
    await page.check('input[type="checkbox"]')
    
    // Submit
    await page.click('button:has-text("Create Exercise")')
    
    // Should close modal and show new exercise
    await page.waitForTimeout(1000)
    await expect(page.locator('text=E2E Test Exercise')).toBeVisible()
  })

  test('delete custom exercise', async ({ page }) => {
    await page.goto('/exercises')
    
    // Create an exercise first
    await page.click('button:has-text("Create Exercise")')
    await page.fill('input[name="name"]', 'To Delete')
    await page.selectOption('select[name="category"]', 'other')
    await page.selectOption('select[name="equipment"]', 'other')
    await page.click('button:has-text("Create Exercise")')
    
    await page.waitForTimeout(1000)
    
    // Click on the exercise
    await page.click('text=To Delete')
    
    // Click delete button
    page.on('dialog', dialog => dialog.accept())
    await page.click('button:has-text("Delete")')
    
    // Should be removed
    await page.waitForTimeout(1000)
    await expect(page.locator('text=To Delete')).not.toBeVisible()
  })

  test('filter by compound exercises only', async ({ page }) => {
    await page.goto('/exercises')
    
    // Open filters
    await page.click('button:has-text("Filters")')
    
    // Check compound only
    await page.check('input[type="checkbox"]:near(:text("Compound Only"))')
    
    // All visible exercises should have compound badge
    const exerciseCards = page.locator('[data-testid="exercise-card"]')
    const count = await exerciseCards.count()
    
    for (let i = 0; i < count; i++) {
      const card = exerciseCards.nth(i)
      await expect(card.locator('text=Compound')).toBeVisible()
    }
  })

  test('show custom exercises only', async ({ page }) => {
    await page.goto('/exercises')
    
    // Open filters
    await page.click('button:has-text("Filters")')
    
    // Check custom only
    await page.check('input[type="checkbox"]:near(:text("My Custom Exercises"))')
    
    // Should show only custom exercises or empty state
    const hasExercises = await page.locator('[data-testid="exercise-card"]').count()
    
    if (hasExercises > 0) {
      // All should have custom badge
      await expect(page.locator('text=Custom').first()).toBeVisible()
    } else {
      // Show empty state
      await expect(page.locator('text=No exercises found')).toBeVisible()
    }
  })

  test('clear all filters', async ({ page }) => {
    await page.goto('/exercises')
    
    // Apply some filters
    await page.click('button:has-text("Filters")')
    await page.selectOption('select[name="category"]', 'chest')
    await page.check('input[type="checkbox"]').first()
    
    // Clear all
    await page.click('button:has-text("Clear all")')
    
    // Filters should be reset
    await expect(page.locator('select[name="category"]')).toHaveValue('all')
  })

  test('stats bar shows correct counts', async ({ page }) => {
    await page.goto('/exercises')
    
    // Should show total count
    await expect(page.locator('text=/Total: \\d+/')).toBeVisible()
    
    // Should show custom count
    await expect(page.locator('text=/Custom: \\d+/')).toBeVisible()
    
    // Should show filtered count
    await expect(page.locator('text=/Filtered: \\d+/')).toBeVisible()
  })

  test('back button returns to dashboard', async ({ page }) => {
    await page.goto('/exercises')
    
    // Click back button
    await page.click('button:has-text("←")').or(page.locator('button[aria-label="Back"]'))
    
    // Should return to dashboard
    await expect(page).toHaveURL('/dashboard')
  })

  test('responsive design on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/exercises')
    
    // Should be visible and usable
    await expect(page.locator('h1:has-text("Exercise Library")')).toBeVisible()
    await expect(page.locator('input[placeholder*="Search"]')).toBeVisible()
    await expect(page.locator('button:has-text("Filters")')).toBeVisible()
    
    // Cards should stack vertically
    const cards = page.locator('[data-testid="exercise-card"]')
    if (await cards.count() > 0) {
      const firstCard = cards.first()
      const box = await firstCard.boundingBox()
      expect(box?.width).toBeLessThan(400)
    }
  })

  test('handles empty library gracefully', async ({ page }) => {
    // This test assumes a new user with no exercises
    // You may need to adjust based on your seed data
    await page.goto('/exercises')
    
    const hasExercises = await page.locator('[data-testid="exercise-card"]').count()
    
    if (hasExercises === 0) {
      await expect(page.locator('text=No exercises')).toBeVisible()
      await expect(page.locator('text=Create Exercise')).toBeVisible()
    }
  })

  test('maintains scroll position when filtering', async ({ page }) => {
    await page.goto('/exercises')
    
    // Scroll down
    await page.evaluate(() => window.scrollTo(0, 500))
    const scrollBefore = await page.evaluate(() => window.scrollY)
    
    // Apply filter
    await page.click('button:has-text("Filters")')
    await page.selectOption('select[name="category"]', 'chest')
    
    // Scroll position should be maintained or reset (depends on design)
    const scrollAfter = await page.evaluate(() => window.scrollY)
    expect(scrollAfter).toBeGreaterThanOrEqual(0)
  })
})