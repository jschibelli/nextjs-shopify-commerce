import { expect, test } from '@playwright/test';

test('Basic Admin Pages Load Test', async ({ page }) => {
  console.log('Starting basic admin pages test...');
  
  // Go to login page
  await page.goto('/login');
  console.log('Navigated to /login');
  
  // Fill credentials and sign in
  await page.fill('input[type="email"]', process.env.E2E_EMAIL || 'jschibelli@intrawebtech.com');
  await page.fill('input[type="password"]', process.env.E2E_PASSWORD || 'xyd3Hrb&&3L');
  await page.click('button:has-text("Sign In")');
  await page.waitForURL('/admin', { timeout: 15000 });
  console.log('Successfully logged in to admin');
  
  // Test admin dashboard
  await expect(page.getByRole('link', { name: 'Admin Dashboard' })).toBeVisible();
  console.log('Admin dashboard loaded');
  
  // Test inventory page
  await page.goto('/admin/inventory');
  await page.waitForLoadState('networkidle');
  await expect(page.getByText('Inventory Management')).toBeVisible();
  console.log('Inventory page loaded');
  
  // Test customers page
  await page.goto('/admin/customers');
  await page.waitForLoadState('networkidle');
  await expect(page.getByRole('heading', { name: 'Customers' })).toBeVisible();
  console.log('Customers page loaded');
  
  // Test collections page
  await page.goto('/admin/collections');
  await page.waitForLoadState('networkidle');
  await expect(page.getByRole('heading', { name: 'Collections' })).toBeVisible();
  console.log('Collections page loaded');
  
  console.log('All basic admin pages loaded successfully');
}); 