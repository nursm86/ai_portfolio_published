/* eslint-disable no-console */
/**
 * Capture screenshots for a project into public/projects/<slug>/.
 *
 * Usage:
 *   npx tsx scripts/capture-project.ts <slug> <url> [<more-urls...>]
 *
 * Environment variables (all optional):
 *   PROJECT_LOGIN_URL    — login page URL; if set, script logs in first
 *   PROJECT_LOGIN_EMAIL  — email / username for login form
 *   PROJECT_LOGIN_PASS   — password for login form
 *   PROJECT_AUTH_STATE   — path to existing Playwright storage state to reuse
 *
 * If PROJECT_LOGIN_URL + EMAIL + PASS are all set, the script:
 *   1. Opens the login URL
 *   2. Fills the first input[type=email] / input[type=password] it finds
 *   3. Clicks the first button:has-text('Sign In') / submit button
 *   4. Waits for URL to change (logged in)
 *   5. Saves the resulting storage state to data/auth/<slug>.json
 *      and reuses it for subsequent captures
 *
 * Each URL is captured at:
 *   - desktop 1440x900 full page     -> <slug>/<n>-desktop.png
 *   - mobile  iPhone 14 Pro full page -> <slug>/<n>-mobile.png
 *
 * Credentials are NEVER logged. The storage state file is gitignored
 * (/data/auth in .gitignore). Delete data/auth/<slug>.json manually
 * after the session if you don't plan to re-capture.
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium, devices, type BrowserContext } from 'playwright';

type Args = {
  slug: string;
  urls: string[];
};

function parseArgs(argv: string[]): Args {
  const args = argv.slice(2);
  if (args.length < 2) {
    console.error(
      'Usage: npx tsx scripts/capture-project.ts <slug> <url> [<more-urls...>]',
    );
    process.exit(1);
  }
  return { slug: args[0], urls: args.slice(1) };
}

async function signIn(ctx: BrowserContext, loginUrl: string, email: string, password: string) {
  const page = await ctx.newPage();
  console.log(`  [auth] visiting login page`);
  await page.goto(loginUrl, { waitUntil: 'networkidle', timeout: 30000 });

  const emailInput = page.locator('input[type="email"]').first();
  const passwordInput = page.locator('input[type="password"]').first();

  await emailInput.fill(email);
  await passwordInput.fill(password);

  console.log(`  [auth] submitting form`);
  // Try the most common submit patterns in order.
  const submitBtn = page
    .locator(
      'button[type="submit"]:has-text("Sign In"), button[type="submit"]:has-text("Log in"), button[type="submit"]:has-text("Login")',
    )
    .first();
  if (await submitBtn.count()) {
    await submitBtn.click();
  } else {
    await passwordInput.press('Enter');
  }

  // Wait for navigation away from the login page OR for a dashboard marker.
  try {
    await page.waitForURL((url) => !/\/login/i.test(url.toString()), {
      timeout: 15000,
    });
    console.log(`  [auth] logged in, current URL: ${page.url()}`);
  } catch {
    console.log(`  [auth] URL did not change after 15s — may still be logged in`);
  }

  await page.close();
}

async function captureUrl(
  ctx: BrowserContext,
  url: string,
  outDir: string,
  index: number,
) {
  const page = await ctx.newPage();
  console.log(`  [${index}] ${url}`);
  await page.goto(url, { waitUntil: 'networkidle', timeout: 45000 }).catch((e) => {
    console.error(`    navigation error: ${e.message}`);
  });
  // Give dynamic content a beat to settle.
  await page.waitForTimeout(1500);

  const desktopPath = path.join(outDir, `${index}-desktop.png`);
  await page.screenshot({ path: desktopPath, fullPage: true });
  console.log(`    desktop -> ${desktopPath}`);

  await page.close();
}

async function captureMobileUrl(
  ctx: BrowserContext,
  url: string,
  outDir: string,
  index: number,
) {
  const page = await ctx.newPage();
  console.log(`  [${index}] ${url} (mobile)`);
  await page.goto(url, { waitUntil: 'networkidle', timeout: 45000 }).catch((e) => {
    console.error(`    navigation error: ${e.message}`);
  });
  await page.waitForTimeout(1500);

  const mobilePath = path.join(outDir, `${index}-mobile.png`);
  await page.screenshot({ path: mobilePath, fullPage: true });
  console.log(`    mobile  -> ${mobilePath}`);

  await page.close();
}

async function main() {
  const { slug, urls } = parseArgs(process.argv);

  const loginUrl = process.env.PROJECT_LOGIN_URL;
  const loginEmail = process.env.PROJECT_LOGIN_EMAIL;
  const loginPass = process.env.PROJECT_LOGIN_PASS;
  const existingAuthState = process.env.PROJECT_AUTH_STATE;

  const outDir = path.resolve(process.cwd(), 'public', 'projects', slug);
  await fs.mkdir(outDir, { recursive: true });

  const authDir = path.resolve(process.cwd(), 'data', 'auth');
  await fs.mkdir(authDir, { recursive: true });
  const authPath = path.join(authDir, `${slug}.json`);

  console.log(`capturing ${urls.length} url(s) for ${slug}`);
  console.log(`output: ${outDir}`);

  const browser = await chromium.launch({ headless: true });

  // --- Desktop pass ---
  const desktopCtxOpts: Parameters<typeof browser.newContext>[0] = {
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  };

  // Reuse auth state if provided and exists, else fall back to live login.
  let storagePath: string | undefined;
  if (existingAuthState) {
    try {
      await fs.access(existingAuthState);
      storagePath = existingAuthState;
      console.log(`using auth state: ${existingAuthState}`);
    } catch {
      console.log(`auth state not found at ${existingAuthState}, ignoring`);
    }
  } else {
    try {
      await fs.access(authPath);
      storagePath = authPath;
      console.log(`reusing saved auth state: ${authPath}`);
    } catch {
      /* none yet */
    }
  }

  if (storagePath) desktopCtxOpts.storageState = storagePath;

  const desktopCtx = await browser.newContext(desktopCtxOpts);

  // If login creds provided and no saved state, log in once and save.
  if (!storagePath && loginUrl && loginEmail && loginPass) {
    await signIn(desktopCtx, loginUrl, loginEmail, loginPass);
    await desktopCtx.storageState({ path: authPath });
    console.log(`saved auth state -> ${authPath}`);
  }

  for (let i = 0; i < urls.length; i++) {
    await captureUrl(desktopCtx, urls[i], outDir, i + 1);
  }

  await desktopCtx.close();

  // --- Mobile pass ---
  const mobileDevice = devices['iPhone 14 Pro'] ?? devices['iPhone 13 Pro'];
  const mobileCtx = await browser.newContext({
    ...mobileDevice,
    storageState: storagePath ?? authPath,
  });

  for (let i = 0; i < urls.length; i++) {
    await captureMobileUrl(mobileCtx, urls[i], outDir, i + 1);
  }

  await mobileCtx.close();
  await browser.close();

  console.log(`\ndone. saved ${urls.length * 2} screenshots to ${outDir}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
