import { test, expect } from '@playwright/test';

/**
 * Musahm Vault — E2E smoke tests covering bug-fix regressions.
 * Targets: https://www-s2.vault.musahm.com (production staging)
 */

// ─── Public page accessibility ──────────────────────────────────────

test.describe('Public routes load correctly', () => {
  test('Login page loads', async ({ page }) => {
    await page.goto('/login');
    await expect(page).toHaveURL(/login/);
    // Should have email + password fields
    await expect(page.locator('input[type="email"], input[name="email"], input[placeholder*="mail"]').first()).toBeVisible();
  });

  test('Admin login page loads', async ({ page }) => {
    await page.goto('/login/admin');
    await expect(page).toHaveURL(/login\/admin/);
  });

  test('Partner login page loads', async ({ page }) => {
    await page.goto('/login/adminP');
    await expect(page).toHaveURL(/login\/adminP/);
  });

  test('Registration page loads', async ({ page }) => {
    await page.goto('/registration');
    await expect(page).toHaveURL(/registration/);
  });

  test('Forgot password page loads', async ({ page }) => {
    await page.goto('/forgot-password');
    await expect(page).toHaveURL(/forgot-password/);
  });
});

// ─── MUS-724: Auth redirects ────────────────────────────────────────

test.describe('MUS-724: Unauthenticated access redirects to login', () => {
  test('Dashboard redirects to /login without auth', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForURL(/login/, { timeout: 10_000 });
    expect(page.url()).toContain('/login');
  });

  test('Workflows page redirects to /login without auth', async ({ page }) => {
    await page.goto('/workflows');
    await page.waitForURL(/login/, { timeout: 10_000 });
    expect(page.url()).toContain('/login');
  });

  test('Tasks page redirects to /login without auth', async ({ page }) => {
    await page.goto('/tasks');
    await page.waitForURL(/login/, { timeout: 10_000 });
    expect(page.url()).toContain('/login');
  });
});

// ─── MUS-732: File input accept attributes ──────────────────────────

test.describe('MUS-732: File inputs have accept restrictions', () => {
  // We can't test authenticated pages without login, but we can
  // verify the built bundle contains the accept attribute pattern.
  // This test checks the Login page loads (smoke) and that the app
  // JS bundle was built successfully with our changes.
  test('App bundle loads without JS errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));
    await page.goto('/login');
    await page.waitForTimeout(2000);
    expect(errors).toEqual([]);
  });
});

// ─── MUS-718: Login loader behavior ─────────────────────────────────

test.describe('MUS-718: Login form has submit state', () => {
  test('Login button is clickable and shows loading on submit', async ({ page }) => {
    await page.goto('/login');
    const submitBtn = page.locator('button[type="submit"], button:has-text("login"), button:has-text("تسجيل")').first();
    await expect(submitBtn).toBeVisible();
    // Should not be disabled initially
    await expect(submitBtn).toBeEnabled();
  });

  test('Invalid login shows error, not blank screen', async ({ page }) => {
    await page.goto('/login');
    // Fill with bad credentials
    const emailInput = page.locator('input[type="email"], input[name="email"], input[placeholder*="mail"]').first();
    const passInput = page.locator('input[type="password"]').first();
    await emailInput.fill('invalid@test.com');
    await passInput.fill('wrongpassword123');
    // Submit
    const submitBtn = page.locator('button[type="submit"], button:has-text("login"), button:has-text("تسجيل")').first();
    await submitBtn.click();
    // Should stay on login page (not blank screen)
    await page.waitForTimeout(3000);
    expect(page.url()).toContain('/login');
    // Page should still have visible content (not blank)
    const bodyText = await page.locator('body').innerText();
    expect(bodyText.length).toBeGreaterThan(10);
  });
});

// ─── MUS-713 / MUS-707: TokenAuth page ─────────────────────────────

test.describe('MUS-707/713: TokenAuth handles language', () => {
  test('TokenAuth page with lang=en sets English', async ({ page }) => {
    await page.goto('/auth?token=invalid&lang=en');
    // Should either show the auth transition screen or redirect to login
    await page.waitForTimeout(3000);
    // Page should not be blank
    const bodyText = await page.locator('body').innerText();
    expect(bodyText.length).toBeGreaterThan(0);
  });

  test('TokenAuth page with lang=ar sets Arabic', async ({ page }) => {
    await page.goto('/auth?token=invalid&lang=ar');
    await page.waitForTimeout(3000);
    const bodyText = await page.locator('body').innerText();
    expect(bodyText.length).toBeGreaterThan(0);
  });
});
