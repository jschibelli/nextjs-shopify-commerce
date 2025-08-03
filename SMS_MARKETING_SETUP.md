# SMS Marketing Setup Guide

## Overview

The SMS messaging preferences feature has been implemented in your Shopify commerce application. However, to fully utilize SMS marketing capabilities, you need to enable SMS marketing in your Shopify store.

## Current Implementation

### What's Working
- ✅ SMS preferences checkbox in signup form
- ✅ SMS preferences management in account dashboard
- ✅ Email marketing preferences (fully functional)
- ✅ Phone number validation when SMS is selected
- ✅ User interface for managing preferences

### What Requires Shopify Setup
- ⚠️ SMS marketing consent updates (currently disabled to avoid 406 errors)
- ⚠️ SMS marketing consent during customer creation

## Shopify SMS Marketing Setup

### 1. Enable SMS Marketing in Shopify
1. Go to your Shopify admin
2. Navigate to **Settings** > **Notifications**
3. Look for **SMS marketing** or **SMS notifications**
4. Enable SMS marketing for your store

### 2. Configure SMS Marketing
1. Set up your SMS marketing provider (if required)
2. Configure SMS templates
3. Set up opt-in/opt-out flows
4. Configure consent management

### 3. Update the Code (Once SMS Marketing is Enabled)

Once SMS marketing is enabled in your Shopify store, you can uncomment the SMS consent code:

#### In `lib/shopify/index.ts` - Customer Creation:
```typescript
// Uncomment this section in createCustomerWithAdminAPI
sms_marketing_consent: acceptsSMS ? {
  state: "subscribed",
  opt_in_level: "single_opt_in",
  consent_updated_at: new Date().toISOString(),
  consent_collected_from: "SHOPIFY"
} : undefined,
```

#### In `lib/shopify/index.ts` - Customer Updates:
```typescript
// Uncomment this section in updateCustomerWithAdminAPI
if (preferences.acceptsSMS !== undefined) {
  updateData.customer.sms_marketing_consent = preferences.acceptsSMS ? {
    state: "subscribed",
    opt_in_level: "single_opt_in",
    consent_updated_at: new Date().toISOString(),
    consent_collected_from: "SHOPIFY"
  } : {
    state: "not_subscribed",
    opt_in_level: "single_opt_in",
    consent_updated_at: new Date().toISOString(),
    consent_collected_from: "SHOPIFY"
  };
}
```

## Testing the Feature

### 1. Test Signup with SMS Preferences
1. Go to `/signup`
2. Fill out the form
3. Check the SMS notifications checkbox
4. Verify phone number is required when SMS is selected
5. Complete signup

### 2. Test Preferences Management
1. Go to `/account/preferences`
2. Toggle email and SMS preferences
3. Save changes
4. Verify success message

### 3. Test Account Settings Display
1. Go to `/account/settings`
2. Verify SMS preferences status is displayed
3. Click "Manage Notifications" to go to preferences page

## Error Handling

The current implementation includes graceful error handling:

- **406 Errors**: Handled gracefully with user-friendly messages
- **SMS Marketing Not Enabled**: Shows appropriate message to users
- **Fallback**: Local preference storage if Shopify sync fails

## User Experience

### Signup Flow
- Users can opt into SMS notifications during signup
- Phone number is required when SMS is selected
- Clear messaging about SMS marketing requirements

### Account Management
- Users can update preferences anytime
- Clear visual indicators for enabled/disabled preferences
- Helpful error messages and guidance

## Next Steps

1. **Enable SMS Marketing in Shopify**: Follow the setup guide above
2. **Uncomment SMS Code**: Once SMS marketing is enabled
3. **Test End-to-End**: Verify SMS consent flows work correctly
4. **Configure SMS Templates**: Set up actual SMS messaging
5. **Monitor Usage**: Track SMS opt-ins and engagement

## Troubleshooting

### Common Issues

1. **406 Error**: SMS marketing not enabled in Shopify
   - Solution: Enable SMS marketing in Shopify admin

2. **SMS Consent Not Saving**: API errors
   - Solution: Check Shopify SMS marketing configuration

3. **Phone Validation**: Phone number required for SMS
   - Solution: Ensure phone number is provided when SMS is selected

### Debug Information

Check the console logs for:
- `SMS consent update skipped - requires SMS marketing setup in Shopify`
- `Failed to update preferences in Shopify: Error: Failed to update customer: 406`

These messages indicate that SMS marketing needs to be enabled in your Shopify store. 