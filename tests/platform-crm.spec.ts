import { test, expect } from '@playwright/test';

test.describe('Platform CRM', () => {
  test.setTimeout(60000);
  
  test.beforeEach(async ({ page }) => {
    // Capture console logs
    page.on('console', msg => console.log(`BROWSER LOG: ${msg.text()}`));

    // Login as Owner
    await page.goto('/#/login');
    await page.fill('input[type="email"]', 'owner@growyourneed.com');
    await page.fill('input[type="password"]', 'Darnag123456789@');
    await page.click('button:has-text("Sign In")');
    await page.waitForURL(/.*\/admin/);
    await expect(page.locator('.animate-spin')).not.toBeVisible();
  });

  test('should load Platform CRM and display Deals', async ({ page }) => {
    await page.click('text=Platform CRM');
    
    await expect(page.getByText('Sales Pipeline')).toBeVisible();
    
    // Create a new Deal
    await page.click('button:has-text("Add Deal")');
    await expect(page.getByText('Create New Deal')).toBeVisible();
    
    const dealName = `Test Deal ${Date.now()}`;
    await page.fill('input[placeholder="e.g. Enterprise License"]', dealName);
    await page.fill('input[type="number"]', '5000');
    await page.fill('input[placeholder="Primary contact person"]', 'John Doe');
    await page.click('button:has-text("Create Deal")');
    
    // Verify it appears
    await expect(page.getByText(dealName)).toBeVisible();
  });

  test('should display Forecast data', async ({ page }) => {
    await page.click('text=Platform CRM');
    
    // Wait for subnav to appear
    const forecastBtn = page.locator('button[title="Forecast"]');
    await expect(forecastBtn).toBeVisible();

    // Click Forecast subnav
    await forecastBtn.click();
    
    // Verify Forecast data
    // Check if the header appears
    await expect(page.getByRole('heading', { name: 'Revenue Forecast' })).toBeVisible({ timeout: 10000 });
    
    // Check for seeded data (e.g. Jan, Feb)
    await expect(page.getByText('Jan')).toBeVisible();
    await expect(page.getByText('Feb')).toBeVisible();
  });
});
