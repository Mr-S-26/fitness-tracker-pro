import { test, expect } from '@playwright/test';

test.describe('Progress & Metrics Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.getByPlaceholder(/email/i).fill('test@example.com');
    await page.getByPlaceholder(/password/i).fill('password123');
    await page.getByRole('button', { name: /sign in/i }).click();
    await page.waitForURL('/dashboard');
  });

  test('should log body weight and verify update', async ({ page }) => {
    // 1. Navigate to Metrics via Quick Action
    await page.getByText(/Log Body Weight/i).click();
    await expect(page).toHaveURL('/measurements');

    // 2. Open Log Modal
    await page.getByRole('button', { name: /Log Today/i }).click();
    await expect(page.getByText(/Log Measurement/i)).toBeVisible();

    // 3. Enter Data
    const weightInput = page.getByPlaceholder(/e.g. 75.5/i).first();
    await weightInput.fill('80.5');
    
    // 4. Save
    await page.getByRole('button', { name: /Save/i }).click();

    // 5. Verify Modal Closes
    await expect(page.getByText(/Log Measurement/i)).not.toBeVisible();

    // 6. Verify Stats Updated
    // We check for the text "80.5 kg" in the stats card
    await expect(page.getByText('80.5 kg')).toBeVisible();
  });
});