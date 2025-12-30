import { test, expect } from '@playwright/test';

// Test credentials
const SUPER_ADMIN = {
  email: 'admin@test.com',
  password: 'admin123',
};

test.describe('Super Admin - Authentication Flow', () => {
  test('should login successfully as Super Admin', async ({ page }) => {
    await page.goto('/auth/signin');

    // Fill login form
    await page.fill('input[name="email"]', SUPER_ADMIN.email);
    await page.fill('input[name="password"]', SUPER_ADMIN.password);

    // Submit form
    await page.click('button[type="submit"]');

    // Wait for redirect to dashboard
    await page.waitForURL('/dashboard');

    // Verify dashboard loaded
    await expect(page.locator('h1')).toContainText(/dashboard|beranda/i);
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/auth/signin');

    await page.fill('input[name="email"]', 'wrong@test.com');
    await page.fill('input[name="password"]', 'wrongpassword');

    await page.click('button[type="submit"]');

    // Should show error message
    await expect(page.locator('text=/invalid|gagal|error/i')).toBeVisible();
  });

  test('should logout successfully', async ({ page }) => {
    // Login first
    await page.goto('/auth/signin');
    await page.fill('input[name="email"]', SUPER_ADMIN.email);
    await page.fill('input[name="password"]', SUPER_ADMIN.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');

    // Logout
    await page.click('button:has-text("Logout"), button:has-text("Keluar")');

    // Should redirect to login
    await page.waitForURL('/auth/signin');
  });
});

test.describe('Super Admin - COA Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/auth/signin');
    await page.fill('input[name="email"]', SUPER_ADMIN.email);
    await page.fill('input[name="password"]', SUPER_ADMIN.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
  });

  test('should navigate to COA page', async ({ page }) => {
    // Click COA menu in sidebar
    await page.click('a[href="/dashboard/coa"], text=/Chart of Accounts|COA/i');

    // Wait for COA page to load
    await page.waitForURL('/dashboard/coa');

    // Verify page title
    await expect(page.locator('h1, h2')).toContainText(/Chart of Accounts|COA/i);
  });

  test('should display COA list', async ({ page }) => {
    await page.goto('/dashboard/coa');

    // Wait for data to load
    await page.waitForSelector('table', { timeout: 5000 });

    // Verify table headers
    await expect(page.locator('th')).toContainText(/kode|nama|tipe/i);
  });

  test('should filter COA by type', async ({ page }) => {
    await page.goto('/dashboard/coa');

    // Click Pemasukan filter
    await page.click('button:has-text("Pemasukan")');

    // Wait for filtered results
    await page.waitForTimeout(1000);

    // Verify only INCOME types are shown
    const badges = await page.locator('td >> text=/pemasukan/i').count();
    expect(badges).toBeGreaterThan(0);
  });

  test('should create new COA', async ({ page }) => {
    await page.goto('/dashboard/coa');

    // Click add button
    await page.click('button:has-text("Tambah"), button:has-text("Add")');

    // Fill form
    await page.fill('input[name="code"]', '1-9999');
    await page.fill('input[name="name"]', 'Test COA E2E');
    await page.selectOption('select[name="category"]', { index: 0 });
    await page.selectOption('select[name="type"]', 'INCOME');
    await page.fill('input[name="accountType"]', 'Test Type');

    // Submit
    await page.click('button[type="submit"]');

    // Wait for success message
    await expect(page.locator('text=/berhasil|success/i')).toBeVisible({ timeout: 5000 });
  });

  test('should edit existing COA', async ({ page }) => {
    await page.goto('/dashboard/coa');

    // Click first edit button
    await page.click('button[aria-label="Edit"], svg.lucide-pencil', { timeout: 5000 });

    // Wait for edit form
    await page.waitForSelector('input[name="name"]');

    // Modify name
    await page.fill('input[name="name"]', 'Updated Name E2E');

    // Save
    await page.click('button[type="submit"]:has-text("Simpan"), button[type="submit"]:has-text("Save")');

    // Verify success
    await expect(page.locator('text=/berhasil|success/i')).toBeVisible({ timeout: 5000 });
  });

  test('should toggle COA active status', async ({ page }) => {
    await page.goto('/dashboard/coa');

    // Get initial status
    const statusBadge = page.locator('td >> text=/aktif|active/i').first();
    const initialText = await statusBadge.textContent();

    // Click status toggle
    await statusBadge.click();

    // Wait for update
    await page.waitForTimeout(1000);

    // Verify status changed
    const newText = await statusBadge.textContent();
    expect(newText).not.toBe(initialText);
  });

  test('should delete COA with confirmation', async ({ page }) => {
    await page.goto('/dashboard/coa');

    // Setup dialog handler
    page.on('dialog', dialog => dialog.accept());

    // Click delete button
    await page.click('button[aria-label="Delete"], svg.lucide-trash', { timeout: 5000 });

    // Wait for success message
    await expect(page.locator('text=/berhasil|success|deleted/i')).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Super Admin - School Settings', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/auth/signin');
    await page.fill('input[name="email"]', SUPER_ADMIN.email);
    await page.fill('input[name="password"]', SUPER_ADMIN.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
  });

  test('should navigate to school settings', async ({ page }) => {
    await page.click('a[href="/dashboard/school-settings"], text=/pengaturan sekolah|school settings/i');

    await page.waitForURL('/dashboard/school-settings');

    await expect(page.locator('h1')).toContainText(/pengaturan sekolah|school settings/i);
  });

  test('should display school list', async ({ page }) => {
    await page.goto('/dashboard/school-settings');

    // Wait for schools to load
    await page.waitForSelector('text=/nama|name/i', { timeout: 5000 });

    // Verify school data is displayed
    await expect(page.locator('input[name="name"], p >> text=/SMK|SMA|SD/i')).toBeVisible();
  });

  test('should edit school information', async ({ page }) => {
    await page.goto('/dashboard/school-settings');

    // Click edit button
    await page.click('button:has-text("Edit"), svg.lucide-pencil');

    // Fill form
    await page.fill('input[name="name"]', 'Updated School Name E2E');
    await page.fill('input[name="address"]', 'Test Address 123');
    await page.fill('input[name="phone"]', '08123456789');
    await page.fill('input[name="email"]', 'school@test.com');

    // Save
    await page.click('button[type="submit"]:has-text("Simpan"), button:has-text("Save")');

    // Verify success
    await expect(page.locator('text=/berhasil|success/i')).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Super Admin - Transaction Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/signin');
    await page.fill('input[name="email"]', SUPER_ADMIN.email);
    await page.fill('input[name="password"]', SUPER_ADMIN.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
  });

  test('should create income transaction', async ({ page }) => {
    await page.goto('/dashboard/transactions');

    await page.click('button:has-text("Tambah"), button:has-text("Add")');

    // Fill transaction form
    await page.selectOption('select[name="type"]', 'INCOME');
    await page.fill('input[name="amount"]', '500000');
    await page.fill('input[name="description"]', 'Test Income E2E');

    await page.click('button[type="submit"]');

    await expect(page.locator('text=/berhasil|success/i')).toBeVisible({ timeout: 5000 });
  });

  test('should create expense transaction', async ({ page }) => {
    await page.goto('/dashboard/transactions');

    await page.click('button:has-text("Tambah")');

    // Fill transaction form
    await page.selectOption('select[name="type"]', 'EXPENSE');
    await page.fill('input[name="amount"]', '250000');
    await page.fill('input[name="description"]', 'Test Expense E2E');

    await page.click('button[type="submit"]');

    await expect(page.locator('text=/berhasil|success/i')).toBeVisible({ timeout: 5000 });
  });

  test('should display transaction list', async ({ page }) => {
    await page.goto('/dashboard/transactions');

    // Wait for table
    await page.waitForSelector('table', { timeout: 5000 });

    // Verify columns
    await expect(page.locator('th')).toContainText(/tanggal|jumlah|tipe/i);
  });

  test('should filter transactions', async ({ page }) => {
    await page.goto('/dashboard/transactions');

    // Apply filter
    await page.click('button:has-text("Pemasukan"), button:has-text("Income")');

    await page.waitForTimeout(1000);

    // Verify filtered results
    const rows = await page.locator('tbody tr').count();
    expect(rows).toBeGreaterThan(0);
  });
});

test.describe('Super Admin - Reports', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/signin');
    await page.fill('input[name="email"]', SUPER_ADMIN.email);
    await page.fill('input[name="password"]', SUPER_ADMIN.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
  });

  test('should generate financial report', async ({ page }) => {
    await page.goto('/dashboard/reports');

    // Select date range
    await page.fill('input[type="date"]', '2025-01-01');

    // Click generate button
    await page.click('button:has-text("Generate"), button:has-text("Buat Laporan")');

    // Wait for report
    await page.waitForSelector('table, canvas', { timeout: 10000 });
  });

  test('should export report to PDF', async ({ page }) => {
    await page.goto('/dashboard/reports');

    // Generate report first
    await page.click('button:has-text("Generate")');
    await page.waitForTimeout(2000);

    // Setup download handler
    const downloadPromise = page.waitForEvent('download');

    // Click export PDF
    await page.click('button:has-text("PDF"), button:has-text("Export PDF")');

    // Wait for download
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain('.pdf');
  });
});

test.describe('Super Admin - User Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/signin');
    await page.fill('input[name="email"]', SUPER_ADMIN.email);
    await page.fill('input[name="password"]', SUPER_ADMIN.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
  });

  test('should display user list', async ({ page }) => {
    await page.goto('/dashboard/users');

    await page.waitForSelector('table', { timeout: 5000 });

    await expect(page.locator('th')).toContainText(/nama|email|role/i);
  });

  test('should create new user', async ({ page }) => {
    await page.goto('/dashboard/users');

    await page.click('button:has-text("Tambah")');

    // Fill user form
    await page.fill('input[name="name"]', 'Test User E2E');
    await page.fill('input[name="email"]', 'testuser@e2e.com');
    await page.fill('input[name="password"]', 'password123');
    await page.selectOption('select[name="role"]', 'BENDAHARA');

    await page.click('button[type="submit"]');

    await expect(page.locator('text=/berhasil|success/i')).toBeVisible({ timeout: 5000 });
  });
});
