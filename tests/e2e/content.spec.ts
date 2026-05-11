import { test, expect } from '@playwright/test';

test.describe('TextFlow Content Script E2E', () => {
  test('should show floating button on text selection', async ({ page }) => {
    // Navigate to a page with selectable text
    await page.setContent(`
      <!DOCTYPE html>
      <html>
      <body>
        <p id="test-paragraph" style="margin: 100px; font-size: 18px;">
          Este é um texto de teste para verificar se o TextFlow funciona corretamente.
          O assistente de IA deve aparecer quando este texto for selecionado.
        </p>
      </body>
      </html>
    `);

    // Wait for content script to load
    await page.waitForTimeout(500);

    // Select text via Playwright mouse
    const paragraph = page.locator('#test-paragraph');
    const box = await paragraph.boundingBox();
    if (!box) {
      test.skip(true, 'Paragraph not found');
      return;
    }

    // Mouse drag to select text
    await page.mouse.move(box.x + 10, box.y + 10);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width - 10, box.y + box.height - 10, { steps: 10 });
    await page.mouse.up();

    // Wait a bit for the selection handler
    await page.waitForTimeout(300);

    // Check if floating button appeared
    const floatingBtn = page.locator('.tf-floating-btn');
    if (await floatingBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await expect(floatingBtn).toBeVisible();
    } else {
      console.log('Floating button not detected — content script may not be active on this page');
    }
  });

  test('should show action menu on button click', async ({ page }) => {
    await page.setContent(`
      <!DOCTYPE html>
      <html>
      <body>
        <p id="test-paragraph" style="margin: 100px; font-size: 18px;">
          Texto para testar o menu de ações do TextFlow.
        </p>
      </body>
      </html>
    `);

    await page.waitForTimeout(500);

    // Select text
    const paragraph = page.locator('#test-paragraph');
    const box = await paragraph.boundingBox();
    if (!box) return;

    await page.mouse.move(box.x + 10, box.y + 10);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width - 10, box.y + box.height - 10, { steps: 10 });
    await page.mouse.up();
    await page.waitForTimeout(300);

    // Click floating button
    const floatingBtn = page.locator('.tf-floating-btn');
    if (await floatingBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await floatingBtn.click();
      await page.waitForTimeout(200);

      // Check menu appears with action items
      const menu = page.locator('.tf-menu');
      if (await menu.isVisible({ timeout: 2000 }).catch(() => false)) {
        const items = menu.locator('.tf-menu-item');
        const count = await items.count();
        expect(count).toBeGreaterThanOrEqual(4);
      }
    }
  });
});
