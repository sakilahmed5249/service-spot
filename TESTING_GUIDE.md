# Testing Guide: Availability System Fix

## Prerequisites
- Backend running on `http://localhost:8080`
- Frontend running on `http://localhost:3000`
- MySQL database with test data
- At least one provider account and one customer account

## Test Scenarios

### Test 1: Provider Has No Availability Set
**Objective:** Verify customers cannot book when provider has no availability configured

**Steps:**
1. Log in as a **Customer**
2. Navigate to "Browse Services"
3. Select any service from a provider who hasn't set availability
4. Click "Book Now"
5. Observe the calendar

**Expected Result:**
- Calendar shows message: "This provider has not set any availability for this month yet..."
- No dates are highlighted/clickable
- No time slots appear

**Status:** □ Pass □ Fail

---

### Test 2: Provider Sets Specific Availability
**Objective:** Verify that only provider-configured dates appear to customers

**Steps:**
1. Log in as a **Provider**
2. Go to "Provider Dashboard" → "Services"
3. Click "Add Service" (or edit existing)
4. Fill in service details:
   - Title: "Test Service"
   - Price: ₹500
   - Duration: 60 minutes
   - **Available Date:** December 5, 2025
   - **Start Time:** 10:00
   - **End Time:** 11:00
   - **Max Bookings:** 2
5. Click "Create"
6. Log out and log in as a **Customer**
7. Navigate to this provider's service
8. Click "Book Now"
9. View the calendar

**Expected Result:**
- December 5, 2025 appears as available (highlighted)
- December 3, 4, 6, 7... do NOT appear as available
- Clicking Dec 5 shows time slot: 10:00 AM

**Status:** □ Pass □ Fail

---

### Test 3: Past Dates Are Hidden
**Objective:** Verify that past dates never appear as available

**Steps:**
1. Log in as a **Provider**
2. Manually insert a past date availability in database:
   ```sql
   INSERT INTO specific_availability 
   (provider_id, available_date, start_time, end_time, is_available, max_bookings, current_bookings, created_at)
   VALUES 
   (3, '2025-11-28', '09:00:00', '10:00:00', 1, 1, 0, NOW());
   ```
3. Log in as a **Customer**
4. View provider's booking calendar

**Expected Result:**
- November 28 does NOT appear in calendar
- Only future dates (Dec 1 onwards) can be selected
- System automatically filters past dates

**Status:** □ Pass □ Fail

---

### Test 4: Fully Booked Slots Disappear
**Objective:** Verify that slots disappear when capacity is reached

**Steps:**
1. Provider sets availability:
   - Date: December 10, 2025
   - Time: 2:00 PM - 3:00 PM
   - Max Bookings: **1** (only one customer allowed)
2. **First Customer** books this slot successfully
3. **Second Customer** views the same provider's calendar

**Expected Result:**
- December 10 should NOT appear as available anymore
- Or if it appears, the 2:00 PM slot should not show
- System correctly tracks: currentBookings (1) >= maxBookings (1)

**Status:** □ Pass □ Fail

---

### Test 5: Multiple Slots Same Day
**Objective:** Verify that one slot getting booked doesn't hide other slots

**Steps:**
1. Provider sets TWO time slots for December 12:
   - Slot 1: 9:00 AM - 10:00 AM (max: 1)
   - Slot 2: 2:00 PM - 3:00 PM (max: 1)
2. Customer books the 9:00 AM slot
3. Another customer views the calendar

**Expected Result:**
- December 12 still appears as available
- 9:00 AM slot is gone/disabled
- 2:00 PM slot is still available and bookable

**Status:** □ Pass □ Fail

---

### Test 6: Provider Updates Availability
**Objective:** Verify that changes to availability reflect immediately

**Steps:**
1. Provider sets availability for December 15
2. Customer views calendar - sees December 15
3. Provider deletes/disables December 15 availability
4. Customer refreshes the booking page

**Expected Result:**
- December 15 disappears from calendar immediately
- Customer cannot book that date
- No stale/cached availability data

**Status:** □ Pass □ Fail

---

### Test 7: API Response Validation
**Objective:** Verify backend APIs return correct filtered data

**Test API 1:** Get Available Dates
```bash
curl http://localhost:8080/api/specific-availability/provider/3/dates?startDate=2025-12-01&endDate=2025-12-31
```

**Expected Response:**
```json
{
  "success": true,
  "data": ["2025-12-05", "2025-12-10", "2025-12-12"],
  "message": "Available dates retrieved successfully"
}
```
- Only dates with availability
- No past dates
- No dates where all slots are fully booked

**Test API 2:** Get Time Slots for Date
```bash
curl http://localhost:8080/api/specific-availability/provider/3/slots?date=2025-12-05
```

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "availableDate": "2025-12-05",
      "startTime": "10:00:00",
      "endTime": "11:00:00",
      "isAvailable": true,
      "maxBookings": 2,
      "currentBookings": 0,
      "availableSlots": 2
    }
  ]
}
```
- Only slots with `isAvailable = true`
- Only slots with `availableSlots > 0`

**Status:** □ Pass □ Fail

---

## Database Verification

### Check Current Availability Data
```sql
-- View all future availability for provider ID 3
SELECT 
    id,
    available_date,
    start_time,
    end_time,
    is_available,
    max_bookings,
    current_bookings,
    (max_bookings - current_bookings) as available_slots
FROM specific_availability
WHERE provider_id = 3
AND available_date >= CURDATE()
ORDER BY available_date, start_time;
```

### Check Booking Records
```sql
-- View bookings for a provider
SELECT 
    b.id,
    b.booking_date,
    b.start_time,
    b.status,
    u.name as customer_name
FROM bookings b
JOIN users u ON b.customer_id = u.id
WHERE b.provider_id = 3
ORDER BY b.booking_date DESC;
```

---

## Common Issues & Fixes

### Issue: Dates still showing when they shouldn't
**Check:**
1. Is backend restarted after code changes?
2. Run: `mvn clean install` and restart
3. Clear browser cache

### Issue: Calendar shows no dates at all
**Check:**
1. Does provider have availability set?
2. Query database: `SELECT * FROM specific_availability WHERE provider_id = ?`
3. Are dates in the future?

### Issue: Past dates appearing
**Check:**
1. System date/time is correct
2. Database timezone settings
3. Backend query includes `>= CURRENT_DATE`

---

## Success Criteria

✅ All test scenarios pass  
✅ No past dates appear in calendar  
✅ Only provider-configured slots are visible  
✅ Fully booked slots disappear  
✅ API responses match expected format  
✅ Clear error messages when no availability

---

## Regression Testing

After confirming the fix works, test these to ensure nothing broke:

- [ ] Provider can still create new services
- [ ] Provider can edit existing services
- [ ] Customer can browse all services
- [ ] Customer can view service details
- [ ] Customer can complete booking flow (with valid availability)
- [ ] Booking confirmation emails work
- [ ] Provider dashboard shows bookings correctly
- [ ] Customer dashboard shows bookings correctly

---

**Testing Date:** _____________  
**Tester Name:** _____________  
**Overall Result:** □ All Pass □ Some Failures  
**Notes:** _____________________________________________

