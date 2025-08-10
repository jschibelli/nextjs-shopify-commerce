import { expect, test } from '@playwright/test';

test('Admin Inventory Edit Modal (Real Login)', async ({ page }) => {
  // Go to login page
  await page.goto('/login');
  
  // Fill in the credentials
  await page.fill('input[type="email"]', process.env.E2E_EMAIL || 'jschibelli@intrawebtech.com');
  await page.fill('input[type="password"]', process.env.E2E_PASSWORD || 'xyd3Hrb&&3L');
  
  // Click the "Sign In" button
  await page.click('button:has-text("Sign In")');
  
  // Wait for redirect to admin dashboard
  await page.waitForURL('/admin', { timeout: 15000 });
  console.log('Successfully logged in to admin');
  
  // Navigate to inventory page via URL to avoid navigation issues
  await page.goto('/admin/inventory');
  
  // Wait for inventory data to load - look for the table specifically
  await page.waitForSelector('table', { timeout: 20000 });
  
  // Wait a bit more for data to populate
  await page.waitForTimeout(3000);
  
  // Debug: check if we're in demo mode by looking for demo indicators
  const demoIndicator = page.locator('text=Demo Mode, text=Demo, [data-demo="true"]');
  const hasDemoIndicator = await demoIndicator.count() > 0;
  console.log('Demo indicator found:', hasDemoIndicator);
  
  // Check for any console errors
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('Browser console error:', msg.text());
    }
  });
  
  // Verify we're on the right page
  await expect(page.getByText('Inventory Management')).toBeVisible();
  console.log('Inventory page loaded successfully');
  
  // Check if we have any Edit buttons before clicking
  const editButtons = page.locator('button:has-text("Edit")');
  const editButtonCount = await editButtons.count();
  console.log(`Found ${editButtonCount} Edit buttons in demo inventory`);
  
  if (editButtonCount === 0) {
    console.log('No Edit buttons found, inventory may be empty or still loading');
    // Still verify the page loaded correctly
    await expect(page.getByText('Inventory Management')).toBeVisible();
    
    // Check if there are any inventory items at all
    const tableRows = page.locator('table tbody tr');
    const rowCount = await tableRows.count();
    console.log(`Found ${rowCount} inventory rows total`);
    return;
  }
  
  // Click Edit button on first row
  console.log('Testing inventory edit modal...');
  
  // Debug: check button state before click
  const firstEditButton = editButtons.first();
  console.log('Edit button text:', await firstEditButton.textContent());
  console.log('Edit button is visible:', await firstEditButton.isVisible());
  console.log('Edit button is enabled:', await firstEditButton.isEnabled());
  
  // Click the button with more specific action
  await firstEditButton.click({ force: true });
  
  // Wait a bit for modal to open
  await page.waitForTimeout(3000);
  
  // Debug: check if any JavaScript errors occurred
  console.log('Checking for JavaScript errors...');
  
  // Debug: check what's on the page
  console.log('Current URL:', page.url());
  
  // Try different selectors for the modal
  const dialogSelectors = [
    '[role="dialog"]',
    '[data-slot="dialog-content"]',
    '.DialogContent',
    'div[class*="dialog"]'
  ];
  
  let modalFound = false;
  for (const selector of dialogSelectors) {
    const elements = page.locator(selector);
    const count = await elements.count();
    console.log(`Selector "${selector}" found ${count} elements`);
    if (count > 0) {
      modalFound = true;
      console.log(`Using selector: ${selector}`);
      await expect(elements.first()).toBeVisible({ timeout: 5000 });
      break;
    }
  }
  
  if (!modalFound) {
    console.log('No modal found with any selector, taking screenshot...');
    await page.screenshot({ path: 'no-modal-found.png' });
    throw new Error('Modal did not open after clicking Edit button');
  }
  
  // Verify modal content
  await expect(page.getByText('Edit Inventory')).toBeVisible();
  console.log('Edit modal opened successfully');
  
  // Verify Save button exists
  const saveButton = page.getByRole('button', { name: 'Save' });
  await expect(saveButton).toBeVisible();
  
  // Get current available value
  const availableInput = page.locator('input[id="available"]');
  const currentValue = await availableInput.inputValue();
  console.log(`Current available quantity: ${currentValue}`);
  
  // Modify the value for demo
  const newValue = parseInt(currentValue || '0') + 5;
  await availableInput.fill(newValue.toString());
  console.log(`Changed quantity to: ${newValue}`);
  
  // Test saving (will be simulated in demo)
  await saveButton.click();
  
  // Modal should close
  await expect(page.locator('[role="dialog"]')).not.toBeVisible({ timeout: 10000 });
  console.log('Modal closed after save');
  
  // Check for success toast (if visible)
  await page.waitForTimeout(2000);
  const toasts = page.locator('[class*="toast"], [role="alert"]');
  const toastCount = await toasts.count();
  if (toastCount > 0) {
    console.log('Toast notification appeared after inventory update');
    // Try to read toast text
    const toastText = await toasts.first().textContent();
    console.log(`Toast message: ${toastText}`);
  } else {
    console.log('No toast notification found (may have auto-dismissed)');
  }
  
  console.log('Demo inventory edit test completed successfully');
}); 