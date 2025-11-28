import { test, expect } from '@playwright/test';

test.describe('Workout Execution Flow', () => {
  // Create a unique email for this test run to avoid conflicts
  const uniqueEmail = `test-athlete-${Date.now()}@example.com`;

  test.beforeEach(async ({ page }) => {
    // ---------------------------------------------------------
    // 1. REGISTER (Start from scratch)
    // ---------------------------------------------------------
    await page.goto('/signup');
    await page.getByLabel(/Email address/i).fill(uniqueEmail);
    await page.getByLabel(/^Password$/).fill('password123');
    await page.getByLabel(/Confirm Password/i).fill('password123');
    await page.getByRole('button', { name: /Sign up/i }).click();

    // ---------------------------------------------------------
    // 2. COMPLETE ONBOARDING (Generate Data)
    // ---------------------------------------------------------
    // Wait for redirect to Onboarding
    await page.waitForURL('/onboarding', { timeout: 10000 });

    // Step 1: Welcome
    await page.getByRole('button', { name: /Let's Go/i }).click();

    // Step 2: Goals (Select 'Muscle Gain')
    await page.getByText('Muscle Gain').click();
    
    // ✅ ADDED: Fill optional fields as requested
    await page.getByPlaceholder("e.g., 'Bench press 100kg by June' or 'Lose 10kg while maintaining strength'").fill('Build 5kg of muscle');
    
    // Calculate a valid future date
    const futureDate = new Date();
    futureDate.setMonth(futureDate.getMonth() + 3);
    const dateString = futureDate.toISOString().split('T')[0];
    await page.locator('input[type="date"]').fill(dateString);

    await page.getByRole('button', { name: /Next/i }).click();

    // Step 3: Experience
    await page.getByText('Intermediate').click();
    await page.getByRole('button', { name: /Next/i }).click();

    // Step 4: Schedule
    await page.getByRole('button', { name: /Next/i }).click();

    // Step 5: Equipment (Select Gym)
    await page.getByText('Commercial Gym').click();
    await page.getByRole('button', { name: /Next/i }).click();

    // Fast-forward optional steps
    await page.getByRole('button', { name: /Next/i }).click(); // Limitations
    await page.getByRole('button', { name: /Next/i }).click(); // Biometrics
    await page.getByRole('button', { name: /Next/i }).click(); // Lifestyle
    await page.getByRole('button', { name: /Next/i }).click(); // Preferences

    // Wait for AI Generation (This can take a few seconds)
    await expect(page.getByText(/Your Program is Ready/i)).toBeVisible({ timeout: 15000 });

    // Finish Onboarding
    await page.getByRole('button', { name: /Start Training/i }).click();

    // ---------------------------------------------------------
    // 3. ARRIVE AT DASHBOARD
    // ---------------------------------------------------------
    await expect(page).toHaveURL('/dashboard');
    await expect(page.getByText(/Welcome back/i)).toBeVisible();
  });

  test('should complete a set, provide feedback, and run timer', async ({ page }) => {
    // 1. Start Workout from Dashboard
    // Find the "Start Workout" button (using the dumbbell icon or text)
    await page.getByRole('link', { name: /Start Workout/i }).first().click();
    
    // Wait for workout page to load and verify exercises are present
    await expect(page.getByText(/Exercise 1/i)).toBeVisible();

    // 2. Complete the First Set
    // We need to find a specific "Check" button. 
    // Strategy: Find the first exercise card, then find the first check button inside it.
    const firstCheckButton = page.locator('button:has(.lucide-check-circle-2)').first();
    await firstCheckButton.click();

    // 3. Verify Feedback Modal Opens
    await expect(page.getByText(/Feedback/i)).toBeVisible();
    await expect(page.getByText(/How did it feel/i)).toBeVisible();

    // 4. Fill Feedback (Rate it "Good")
    await page.getByText('Good').click();
    
    // 5. Submit Log
    await page.getByRole('button', { name: /Log Set & Rest/i }).click();

    // 6. Verify Timer Appears
    // The timer should slide up from the bottom
    await expect(page.getByText(/Rest Timer/i)).toBeVisible();
    
    // 7. Test Timer Controls (Skip Rest)
    await page.getByRole('button', { name: /Skip/i }).click();
    
    // 8. Verify Timer Closes and Set is marked visually complete
    await expect(page.getByText(/Rest Timer/i)).not.toBeVisible();
    
    // Verify the button turned green (indicating completion)
    await expect(firstCheckButton).toHaveClass(/bg-green-500/);
  });
});