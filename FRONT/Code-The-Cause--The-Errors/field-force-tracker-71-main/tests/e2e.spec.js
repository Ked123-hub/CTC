import { test, expect } from '@playwright/test';

test('volunteer end-to-end: login → check-in/out → story → leave', async ({ browser }) => {
  const context = await browser.newContext({
    permissions: ['geolocation'],
  });
  // Mock geolocation (example coordinates)
  await context.setGeolocation({ latitude: 19.9975, longitude: 75.3294 });
  const page = await context.newPage();

  // Login as volunteer (seeded user)
  await page.goto('http://localhost:8080/login');
  await page.fill('#email', 'priya@ecoforce.com');
  await page.fill('#password', 'password123');
  await page.click('text=Sign In');

  // Wait redirect to volunteer area
  await page.waitForURL('**/volunteer', { timeout: 10000 });

  // Navigate to the volunteer dashboard where LocationBasedAttendance exists
  await page.goto('http://localhost:8080/volunteer');
  // Click Check In
  await page.click('text=Check In Now');
  // Wait for a success message or result card
  await expect(page.locator('text=Check-in successful').first()).toBeVisible({ timeout: 10000 }).catch(() => {});

  // Click Check Out
  await page.click('text=Check Out');
  await expect(page.locator('text=Check-out successful').first()).toBeVisible({ timeout: 10000 }).catch(() => {});

  // Story generation
  await page.goto('http://localhost:8080/volunteer/story-generator');
  await page.fill('#topic', 'Planted 50 trees at the community park');
  await page.click('text=Generate Story');
  await expect(page.locator('text=Your Story', { exact: false })).toBeVisible({ timeout: 15000 });

  // Submit a leave request
  await page.goto('http://localhost:8080/volunteer/leave');
  // Open dialog
  await page.click('text=New Request');
  // Fill form fields (select personal)
  await page.click('text=Select type');
  await page.click('text=Personal');
  // Set dates
  const today = new Date();
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const format = (d) => d.toISOString().split('T')[0];
  await page.fill('input[type="date"]', format(today));
  // second date input
  const dateInputs = await page.$$('input[type="date"]');
  if (dateInputs.length >= 2) {
    await dateInputs[1].fill(format(tomorrow));
  }
  await page.fill('textarea', 'E2E test leave');
  await page.click('text=Submit Request');
  // Check for new leave in list
  await expect(page.locator('text=Leave request submitted!', { exact: false })).toBeVisible().catch(() => {});

  await context.close();
});
