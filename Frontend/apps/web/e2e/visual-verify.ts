#!/usr/bin/env npx tsx
/**
 * visual-verify.ts — Take screenshots of Vault pages for visual QA.
 * Captures key pages that need visual verification for bug fix tickets.
 * Screenshots are fed to Gemini vision for automated analysis.
 */

import { chromium } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

const BASE_URL = 'http://localhost:5173';
const OUTPUT_DIR = path.resolve('screenshots');

async function main() {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });

  // ─── MUS-713: TokenAuth branding ─────────────────────────────────
  console.log('[1/7] MUS-713: TokenAuth EN...');
  const p1 = await context.newPage();
  await p1.goto(`${BASE_URL}/auth?token=invalid&lang=en`);
  await p1.waitForTimeout(3000);
  await p1.screenshot({ path: path.join(OUTPUT_DIR, '01-tokenauth-en.png'), fullPage: true });
  await p1.close();

  console.log('[2/7] MUS-713: TokenAuth AR...');
  const p2 = await context.newPage();
  await p2.goto(`${BASE_URL}/auth?token=invalid&lang=ar`);
  await p2.waitForTimeout(3000);
  await p2.screenshot({ path: path.join(OUTPUT_DIR, '02-tokenauth-ar.png'), fullPage: true });
  await p2.close();

  // ─── MUS-724: Login page loads ───────────────────────────────────
  console.log('[3/7] MUS-724: Login page...');
  const p3 = await context.newPage();
  await p3.goto(`${BASE_URL}/login`);
  await p3.waitForTimeout(2000);
  await p3.screenshot({ path: path.join(OUTPUT_DIR, '03-login-page.png'), fullPage: true });
  await p3.close();

  // ─── MUS-718: Login with bad creds ───────────────────────────────
  console.log('[4/7] MUS-718: Login error state...');
  const p4 = await context.newPage();
  await p4.goto(`${BASE_URL}/login`);
  await p4.waitForTimeout(1500);
  const emailInput = p4.locator('input[type="email"], input[name="email"], input[placeholder*="mail"]').first();
  const passInput = p4.locator('input[type="password"]').first();
  await emailInput.fill('test@invalid.com');
  await passInput.fill('wrongpassword123');
  const submitBtn = p4.locator('button[type="submit"], button:has-text("login"), button:has-text("تسجيل")').first();
  await submitBtn.click();
  await p4.waitForTimeout(4000);
  await p4.screenshot({ path: path.join(OUTPUT_DIR, '04-login-error.png'), fullPage: true });
  await p4.close();

  // ─── MUS-724: Dashboard redirect ─────────────────────────────────
  console.log('[5/7] MUS-724: Dashboard redirect...');
  const p5 = await context.newPage();
  await p5.goto(`${BASE_URL}/dashboard`);
  await p5.waitForTimeout(3000);
  await p5.screenshot({ path: path.join(OUTPUT_DIR, '05-dashboard-redirect.png'), fullPage: true });
  console.log(`  → Redirected to: ${p5.url()}`);
  await p5.close();

  // ─── MUS-724: Admin login page ───────────────────────────────────
  console.log('[6/7] MUS-724: Admin login...');
  const p6 = await context.newPage();
  await p6.goto(`${BASE_URL}/login/admin`);
  await p6.waitForTimeout(2000);
  await p6.screenshot({ path: path.join(OUTPUT_DIR, '06-admin-login.png'), fullPage: true });
  await p6.close();

  // ─── Registration page ──────────────────────────────────────────
  console.log('[7/7] Registration page...');
  const p7 = await context.newPage();
  await p7.goto(`${BASE_URL}/registration`);
  await p7.waitForTimeout(2000);
  await p7.screenshot({ path: path.join(OUTPUT_DIR, '07-registration.png'), fullPage: true });
  await p7.close();

  await browser.close();
  console.log(`\nDone! ${fs.readdirSync(OUTPUT_DIR).length} screenshots saved to ${OUTPUT_DIR}`);
}

main().catch(console.error);
