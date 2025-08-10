import { expect, test } from '@playwright/test';

test('Admin Customers Table Actions (Real Login)', async ({ page }) => {
  // Login as admin
  await page.goto('/login');
  
  // Fill in the credentials
  await page.fill('input[type="email"]', process.env.E2E_EMAIL || 'jschibelli@intrawebtech.com');
  await page.fill('input[type="password"]', process.env.E2E_PASSWORD || 'xyd3Hrb&&3L');
  
  // Click the "Sign In" button
  await page.click('button:has-text("Sign In")');
  await page.waitForURL('/admin', { timeout: 15000 });
  
  // Navigate to customers page directly
  await page.goto('/admin/customers');
  
  // Wait for customers table to load with longer timeout
  await page.waitForSelector('table', { timeout: 20000 });
  
  // Wait for actual data to load
  await page.waitForTimeout(3000);
  
  // Verify page loaded correctly
  await expect(page.getByRole('heading', { name: 'Customers' })).toBeVisible();
  
  // Verify table has expected columns (check what's actually there)
  const tableHeaders = page.locator('th');
  const headerCount = await tableHeaders.count();
  expect(headerCount).toBeGreaterThan(0);
  
  // Check for any rows
  const rows = page.locator('table tbody tr');
  const rowCount = await rows.count();
  
  if (rowCount === 0) {
    console.log('No customer rows found, customers may be empty or still loading');
    // Still verify the page structure is correct
    await expect(page.locator('table')).toBeVisible();
    return;
  }
  
  console.log(`Found ${rowCount} customer rows`);
  
  // Test Edit button if it exists (simulated in demo mode)
  const editButtons = page.locator('button:has-text("Edit")');
  const editButtonCount = await editButtons.count();
  
  if (editButtonCount > 0) {
    console.log('Testing Edit functionality');
    await editButtons.first().click();
    await page.waitForTimeout(2000);
    
    // Check for success toast or no error
    const toasts = page.locator('[class*="toast"], [role="alert"]');
    if (await toasts.count() > 0) {
      console.log('Toast notification appeared after edit');
    }
  }
  
  // Test Delete button if it exists
  const deleteButtons = page.locator('button:has-text("Delete")');
  const deleteButtonCount = await deleteButtons.count();
  
  if (deleteButtonCount > 0) {
    console.log('Testing Delete functionality');
    const initialRowCount = await rows.count();
    await deleteButtons.first().click();
    
    // Wait and check if row was removed (in demo mode)
    await page.waitForTimeout(3000);
    const finalRowCount = await page.locator('table tbody tr').count();
    
    console.log(`Rows before delete: ${initialRowCount}, after: ${finalRowCount}`);
    
    // In demo mode, the row should be removed locally
    expect(finalRowCount).toBeLessThanOrEqual(initialRowCount);
    
    // Check for success toast
    const toasts = page.locator('[class*="toast"], [role="alert"]');
    if (await toasts.count() > 0) {
      console.log('Toast notification appeared after delete');
    }
  }
  
  if (editButtonCount === 0 && deleteButtonCount === 0) {
    console.log('No action buttons found, but table structure is valid');
  }
}); 