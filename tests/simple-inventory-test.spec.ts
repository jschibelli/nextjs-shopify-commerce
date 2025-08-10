import { expect, test } from '@playwright/test';

test('Simple Inventory Page Test', async ({ page }) => {
  console.log('Starting simple inventory test...');
  
  // Go to login page
  await page.goto('/login');
  console.log('Navigated to /login');
  
  // Fill credentials and sign in
  await page.fill('input[type="email"]', process.env.E2E_EMAIL || 'jschibelli@intrawebtech.com');
  await page.fill('input[type="password"]', process.env.E2E_PASSWORD || 'xyd3Hrb&&3L');
  await page.click('button:has-text("Sign In")');
  await page.waitForURL('/admin', { timeout: 15000 });
  console.log('Successfully logged in to admin');
  
  // Navigate to inventory page
  await page.goto('/admin/inventory');
  console.log('Navigated to /admin/inventory');
  
  // Wait for page to load
  await page.waitForLoadState('networkidle');
  console.log('Page loaded');
  
  // Take a screenshot
  await page.screenshot({ path: 'inventory-page.png' });
  
  // Check if the page title is visible
  await expect(page.getByText('Inventory Management')).toBeVisible();
  console.log('Inventory Management title found');
  
  // Check if table exists
  const table = page.locator('table');
  await expect(table).toBeVisible();
  console.log('Table found');
  
  // Check if there are any rows
  const rows = page.locator('table tbody tr');
  const rowCount = await rows.count();
  console.log(`Found ${rowCount} inventory rows`);
  
  // Check if there are Edit buttons
  const editButtons = page.locator('button:has-text("Edit")');
  const editButtonCount = await editButtons.count();
  console.log(`Found ${editButtonCount} Edit buttons`);
  
  // If there are Edit buttons, try clicking one
  if (editButtonCount > 0) {
    console.log('Attempting to click first Edit button...');
    const firstEditButton = editButtons.first();
    
    // Check button state
    console.log('Button text:', await firstEditButton.textContent());
    console.log('Button visible:', await firstEditButton.isVisible());
    console.log('Button enabled:', await firstEditButton.isEnabled());
    
    // Try clicking
    await firstEditButton.click();
    console.log('Clicked Edit button');
    
    // Wait a moment
    await page.waitForTimeout(2000);
    
    // Check if any dialog appeared
    const dialogs = page.locator('[role="dialog"], [data-slot="dialog-content"], .DialogContent');
    const dialogCount = await dialogs.count();
    console.log(`Found ${dialogCount} dialogs after click`);
    
    if (dialogCount > 0) {
      console.log('Dialog appeared!');
      await page.screenshot({ path: 'dialog-appeared.png' });
    } else {
      console.log('No dialog appeared');
      await page.screenshot({ path: 'no-dialog.png' });
    }
  }
  
  console.log('Simple inventory test completed');
}); 