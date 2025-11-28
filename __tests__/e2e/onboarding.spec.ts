import { test, expect } from '@playwright/test';

test.describe('Onboarding Flow', () => {
  test('should complete full onboarding and generate program', async ({ page }) => {
    // 1. Start at Onboarding (Assume Auth or Mock it)
    // For E2E, it's best to create a fresh user, but for speed we'll assume logged in or just hit the page
    // Note: You might need to mock auth bypass or login first depending on your setup
    await page.goto('/onboarding');

    // 2. Step 1: Welcome
    await expect(page.getByText(/Welcome to your new/i)).toBeVisible();
    await page.getByRole('button', { name: /Let's Go/i }).click();

    // 3. Step 2: Goals
    await page.getByText('Muscle Gain').click();
    await page.getByPlaceholder(/e.g., I want to look good/i).fill('Get stronger for summer');
    await page.getByRole('button', { name: /Next/i }).click();

    // 4. Step 3: Experience
    await page.getByText('Intermediate').click();
    // Drag slider (optional/complex) or just skip inputs that have defaults
    await page.getByRole('button', { name: /Next/i }).click();

    // 5. Step 4: Schedule (3 days default)
    await page.getByRole('button', { name: /Next/i }).click();

    // 6. Step 5: Equipment
    await page.getByText('Commercial Gym').click();
    // Ensure at least one equipment is selected if needed, usually "Commercial Gym" selects all
    await page.getByRole('button', { name: /Next/i }).click();

    // 7. Fast forward remaining optional steps
    await page.getByRole('button', { name: /Next/i }).click(); // Limitations
    await page.getByRole('button', { name: /Next/i }).click(); // Biometrics
    await page.getByRole('button', { name: /Next/i }).click(); // Lifestyle
    await page.getByRole('button', { name: /Next/i }).click(); // Preferences

    // 8. Generation Screen
    await expect(page.getByText(/Building Your Personal Plan/i)).toBeVisible();
    
    // Wait for generation (Timeout increased for AI latency)
    await expect(page.getByText(/Your Program is Ready/i)).toBeVisible({ timeout: 15000 });

    // 9. Review & Finish
    await expect(page.getByText(/Week 1/i)).toBeVisible();
    await page.getByRole('button', { name: /Start Training/i }).click();

    // 10. Verify Redirect to Dashboard
    await expect(page).toHaveURL('/dashboard');
    await expect(page.getByText(/Welcome back/i)).toBeVisible();
  });
});