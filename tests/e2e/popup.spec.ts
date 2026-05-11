import { test, expect } from '@playwright/test';

const EXTENSION_ID = 'textflow'; // will be found dynamically

test.describe('TextFlow Popup E2E', () => {
  test('should show login screen on popup open', async ({ page }) => {
    // Navigate to a regular page first (extension popup URL requires a browsing context)
    await page.goto('about:blank');

    // Get extension ID from background page
    const backgroundWorker = page.context().backgroundPages()[0];
    const extensionId = backgroundWorker?.url().split('/')[2];

    if (!extensionId) {
      test.skip(true, 'Extension not loaded');
      return;
    }

    // Open popup
    await page.goto(`chrome-extension://${extensionId}/popup/popup.html`);

    // Verify login form is visible
    await expect(page.locator('#tf-login')).toBeVisible();

    // Verify email and password inputs exist
    await expect(page.locator('#tf-login input[type="email"]')).toBeVisible();
    await expect(page.locator('#tf-login input[type="password"]')).toBeVisible();
  });

  test('should login and show dashboard', async ({ page }) => {
    const backgroundWorker = page.context().backgroundPages()[0];
    const extensionId = backgroundWorker?.url().split('/')[2];

    if (!extensionId) {
      test.skip(true, 'Extension not loaded');
      return;
    }

    await page.goto(`chrome-extension://${extensionId}/popup/popup.html`);

    // Fill login form
    await page.fill('#tf-login input[type="email"]', 'teste@textflow.app');
    await page.fill('#tf-login input[type="password"]', '123456');

    // Submit
    await page.click('#tf-login button[type="submit"]');

    // Wait for dashboard view
    await page.waitForSelector('#tf-dashboard', { timeout: 10000 });

    // Verify dashboard elements
    await expect(page.locator('#tf-dashboard')).toBeVisible();
    await expect(page.locator('.tf-plan-badge')).toBeVisible();
  });
});
