# Trial Implementation Checklist

- [ ] **Phone Number Management:**
  - [ ] New number purchase should be assigned to agent's guided_setup table column. 
  - [X] Number purchase should be based on the user's country. 
  - [ ] Record acquisition date when a trial user gets a number
  - [ ] Implement daily job to check if numbers held > 14 days for trial users
  - [ ] Create automated system to release numbers that exceed 14-day limit
  - [ ] Add warning notifications before number release

@gabriel
- [ ] **Call Duration Tracking:**
  - [ ] For trial users, increment `trial_minutes_used` after each call
  - [ ] Block further calls if `trial_minutes_used >= trial_minutes_total`
  - [ ] Add warning when approaching minute limit (80% usage)

@gabriel
- [ ] **Trial Expiration Handling:**
  - [ ] Create scheduled job to check for expired trials daily
  - [ ] When trial expires:
    - [ ] Check if payment method on file for automatic conversion
    - [ ] Convert to paid if payment method exists
    - [ ] Downgrade to free plan if no payment method
    - [ ] Release numbers associated with expired trials
    - [ ] Send final notification that trial has ended

## User Interface Updates

- [ ] **Dashboard Modifications:**
  - [ ] Add trial status indicator in the side panel at the bottom
  - [ ] Display remaining trial days counter
  - [ ] Show minutes used/remaining visualization
  - [ ] Provide clear CTA for upgrading to paid plan

- [ ] **Plan Selection Page:**
  - [ ] Update to clearly indicate trial options
  - [ ] Add explanation of trial limitations (14 days, 25 minutes)

## API Endpoint Modifications

- [ ] **Create/modify endpoints:**
  - [ ] Add endpoint to return trial status information
  - [ ] Update call endpoints to track usage during trial
  - [ ] Add endpoint for handling trial expiration
  - [ ] Create endpoint for manual trial extension (admin only)

@gabriel
## Notifications System

- [ ] **Email notifications:**
  - [ ] Welcome to trial email with details
  - [ ] Trial usage updates (50%, 80%, 100% of minutes used)
  - [ ] Trial expiration warnings (7 days, 3 days, 1 day before)
  - [ ] Trial expired notification with upgrade options


## Testing Plan

- [ ] **Test user registration and trial activation:**
  - [ ] Verify correct trial parameters set
  - [ ] Check all trial plans (Pro, Scale, etc.)

- [ ] **Test number acquisition and limits:**
  - [ ] Verify 14-day tracking works correctly
  - [ ] Test number release process
  - [ ] Verify notifications sent

- [ ] **Test minutes usage tracking:**
  - [ ] Ensure 25-minute limit enforced
  - [ ] Verify usage calculation accuracy
  - [ ] Test warning thresholds

- [ ] **Test trial expiration:**
  - [ ] Verify proper handling at 14 days
  - [ ] Test auto-conversion to paid
  - [ ] Test downgrade to free
  - [ ] Verify number release on expiration

- [ ] **Test upgrade paths:**
  - [ ] Mid-trial upgrade to paid
  - [ ] Upgrade at trial expiration
  - [ ] Upgrade after trial expiration

## Documentation

- [ ] **Update internal documentation:**
  - [ ] Document database schema changes
  - [ ] Document API changes
  - [ ] Create admin guide for trial management

- [ ] **Update user documentation:**
  - [ ] Explain trial limitations
  - [ ] Add FAQ section for trial users
  - [ ] Document upgrade process 