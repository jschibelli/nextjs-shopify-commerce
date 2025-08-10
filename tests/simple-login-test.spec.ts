import { expect, test } from '@playwright/test';

test('Simple Demo Login Test', async ({ page }) => {
  console.log('Starting simple login test...');
  
  // Go to login page
  await page.goto('/login');
  console.log('Navigated to /login');
  
  // Wait for page to load
  await page.waitForLoadState('networkidle');
  console.log('Page loaded');
  
  // Take a screenshot for debugging
  await page.screenshot({ path: 'login-page.png' });
  
  // Check if login form exists
  const emailInput = page.locator('input[type="email"]');
  const passwordInput = page.locator('input[type="password"]');
  const demoButton = page.locator('button:has-text("Try Demo Admin")');
  
  console.log('Email input count:', await emailInput.count());
  console.log('Password input count:', await passwordInput.count());
  console.log('Demo button count:', await demoButton.count());
  
  // Fill password (required for demo button)
  if (await passwordInput.count() > 0) {
    await passwordInput.fill('demo123');
    console.log('Filled password field');
  }
  
  // Click demo button if it exists
  if (await demoButton.count() > 0) {
    console.log('Clicking demo admin button...');
    await demoButton.click();
    
    // Wait for navigation or error
    try {
      await page.waitForURL('**/admin**', { timeout: 10000 });
      console.log('Successfully navigated to admin page');
      
      // Take screenshot of admin page
      await page.screenshot({ path: 'admin-page.png' });
      
      // Verify admin page loaded
      await expect(page.getByRole('link', { name: 'Admin Dashboard' })).toBeVisible();
      console.log('Admin page verified');
      
    } catch (error) {
      console.log('Navigation failed:', error);
      
      // Check current URL
      console.log('Current URL:', page.url());
      
      // Check for any error messages
      const errorElements = page.locator('[role="alert"], .error, .alert-error');
      const errorCount = await errorElements.count();
      console.log('Error elements found:', errorCount);
      
      if (errorCount > 0) {
        const errorText = await errorElements.first().textContent();
        console.log('Error text:', errorText);
      }
      
      // Take screenshot of current state
      await page.screenshot({ path: 'error-state.png' });
      
      throw error;
    }
  } else {
    console.log('Demo button not found');
    throw new Error('Demo button not available');
  }
}); 