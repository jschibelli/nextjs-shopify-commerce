# E2E Testing Guide

This project includes comprehensive end-to-end (E2E) testing using Playwright to verify admin functionality for both demo mode and real user authentication.

## Test Setup

### Environment Variables Required

Create a `.env.local` file in your project root with the following variables:

```bash
# Demo Mode Testing
DEMO_MODE=true
DEMO_PASSWORD=demo123

# Real Admin Testing  
E2E_EMAIL=jschibelli@intrawebtech.com
E2E_PASSWORD=xyd3Hrb&&3L

# Shopify Configuration (for real API calls)
SHOPIFY_STORE_DOMAIN=schibelli-acme-dev.myshopify.com
SHOPIFY_ADMIN_ACCESS_TOKEN=your-admin-access-token
SHOPIFY_STOREFRONT_ACCESS_TOKEN=your-storefront-access-token
```

## Test Suites

### 1. Demo Mode Tests (`test:e2e:demo`)

These tests use the demo login system that simulates admin operations without affecting live data:

- **`tests/admin-inventory.spec.ts`**: Tests inventory edit modal functionality in demo mode
- **`tests/admin-customers.spec.ts`**: Tests customer table Edit/Delete actions in demo mode  
- **`tests/admin-collections.spec.ts`**: Tests collections table and creation in demo mode

**How Demo Tests Work:**
- Use "Try Demo Admin" button with `DEMO_PASSWORD`
- All operations are simulated (no real API calls to Shopify)
- Changes persist locally using localStorage during the session
- Safe to run repeatedly without side effects

### 2. Real Admin Tests (`test:e2e:real`)

These tests use actual admin credentials and interact with the live Shopify API:

- **`tests/admin-real-login.spec.ts`**: Tests real admin login and actual inventory management
- Includes both inventory updates and customer management verification
- Tests actual API calls and real data manipulation

**How Real Tests Work:**
- Use regular login form with `E2E_EMAIL` and `E2E_PASSWORD`
- Make actual API calls to Shopify Admin API
- Modify real inventory data (be cautious!)
- Verify real customer data and table functionality

## Running Tests

### Install Dependencies
```bash
pnpm install
npx playwright install chromium
```

### Test Commands

```bash
# Run all E2E tests
npm run test:e2e

# Run only demo mode tests (safe, no real API calls)
npm run test:e2e:demo

# Run only real admin tests (uses live API)
npm run test:e2e:real

# Run tests with visual UI
npm run test:e2e:ui

# Run tests in headed mode (see browser)
npm run test:e2e:headed

# Debug tests step by step
npm run test:e2e:debug
```

### With Environment Variables

```bash
# Demo mode tests
$env:DEMO_PASSWORD="demo123"; npm run test:e2e:demo

# Real admin tests  
$env:E2E_EMAIL="jschibelli@intrawebtech.com"; $env:E2E_PASSWORD="xyd3Hrb&&3L"; npm run test:e2e:real
```

## Test Coverage

### Inventory Management
- ✅ Edit modal opens and closes
- ✅ Available quantity can be modified
- ✅ Save functionality works (demo simulated, real API calls)
- ✅ Toast notifications appear
- ✅ Demo mode vs real mode behavior

### Customer Management  
- ✅ Table loads with correct columns
- ✅ Search functionality
- ✅ Edit/Delete buttons work
- ✅ Row removal in demo mode
- ✅ Real data verification

### Collections Management
- ✅ Collection creation dialog
- ✅ Table display and actions
- ✅ Demo localStorage persistence
- ✅ API error handling fallbacks
- ✅ Edit/Delete functionality

### Authentication
- ✅ Demo admin login flow
- ✅ Real admin credential login
- ✅ Proper redirection to /admin
- ✅ Session persistence during navigation

## Demo Mode vs Real Mode

| Feature | Demo Mode | Real Mode |
|---------|-----------|-----------|
| **Login** | "Try Demo Admin" button | Email + Password form |
| **API Calls** | Simulated responses | Actual Shopify API |
| **Data Changes** | localStorage only | Live database |
| **Safety** | 100% safe | ⚠️ Modifies real data |
| **Reset** | On logout/refresh | Permanent changes |
| **Use Case** | Development/Demo | Production verification |

## Test Architecture

### Page Object Pattern
Tests use direct selectors and Playwright's built-in locators for maintainability:

```typescript
// Good practices used in tests
await page.fill('input[type="password"]', process.env.DEMO_PASSWORD || 'demo123');
await page.click('button:has-text("Try Demo Admin")');
await page.waitForURL('/admin', { timeout: 15000 });
```

### Error Handling
- Tests gracefully handle missing data
- Fallback behavior for API errors
- Detailed console logging for debugging
- Proper timeouts and waits

### Environment Detection
Tests automatically skip when required environment variables are missing:

```typescript
if (!process.env.E2E_EMAIL || !process.env.E2E_PASSWORD) {
  test.skip(true, 'E2E credentials required for real login test');
}
```

## Best Practices

1. **Run Demo Tests First**: Always test demo mode before real mode
2. **Environment Variables**: Use `.env.local` for local development
3. **CI/CD**: Use environment secrets for automated testing
4. **Data Safety**: Be cautious with real mode tests in production
5. **Debugging**: Use `--headed` or `--debug` flags for development

## Troubleshooting

### Common Issues

1. **Tests Timeout**: Increase timeouts in `playwright.config.ts`
2. **Login Fails**: Verify credentials in `.env.local`
3. **API Errors**: Check Shopify API tokens and permissions
4. **Demo Mode Not Working**: Ensure `DEMO_MODE=true` is set

### Debugging Steps

1. Run with headed mode: `npm run test:e2e:headed`
2. Check console logs in the test output
3. Verify environment variables are loaded
4. Test login manually in browser first
5. Use `page.pause()` in tests for interactive debugging

## Future Enhancements

- [ ] Visual regression testing
- [ ] Mobile responsive testing
- [ ] Performance testing
- [ ] Cross-browser testing (Firefox, Safari)
- [ ] Accessibility testing integration
- [ ] Test data seeding/cleanup utilities 