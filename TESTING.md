# SiKeu-Sekolah - Test Documentation

## 🧪 Test Suite Overview

Aplikasi ini memiliki 3 jenis test:
1. **Unit Tests** - API routes & business logic
2. **Component Tests** - React components
3. **E2E Tests** - End-to-end user flows

---

## 📦 Installation

Install test dependencies:

```bash
npm install
```

---

## 🚀 Running Tests

### Unit & Component Tests (Jest)

```bash
# Run tests in watch mode
npm test

# Run tests once (CI mode) with coverage
npm run test:ci

# Coverage report will be in /coverage folder
```

### E2E Tests (Playwright)

```bash
# Install Playwright browsers (first time only)
npx playwright install

# Run E2E tests
npm run test:e2e

# Run with UI mode (interactive)
npm run test:e2e:ui

# Debug mode
npm run test:e2e:debug

# Run all tests (unit + e2e)
npm run test:all
```

---

## 📋 Test Coverage

### 1. COA Management Tests

**Unit Tests** (`src/app/api/coa/__tests__/coa.test.ts`):
- ✅ GET /api/coa - List all COA
- ✅ GET /api/coa?type=INCOME - Filter by type
- ✅ POST /api/coa - Create new COA
- ✅ PUT /api/coa/[id] - Update COA
- ✅ DELETE /api/coa/[id] - Delete COA
- ✅ Authorization checks (SUPER_ADMIN only)
- ✅ Validation tests

**Component Tests** (`src/app/dashboard/coa/__tests__/page.test.tsx`):
- ✅ Render COA list
- ✅ Filter by type (Income/Expense)
- ✅ Group by category
- ✅ Toggle active status
- ✅ Delete with confirmation
- ✅ Empty state
- ✅ Role-based access control

**E2E Tests** (`tests/e2e/super-admin.spec.ts`):
- ✅ Navigate to COA page
- ✅ Display COA list
- ✅ Filter COA by type
- ✅ Create new COA
- ✅ Edit existing COA
- ✅ Toggle active/inactive
- ✅ Delete COA

### 2. Authentication Tests

**E2E Tests**:
- ✅ Login as Super Admin
- ✅ Invalid credentials error
- ✅ Logout successfully
- ✅ Session persistence

### 3. School Settings Tests

**E2E Tests**:
- ✅ Navigate to school settings
- ✅ Display school list
- ✅ Edit school information
- ✅ Form validation

### 4. Transaction Management Tests

**E2E Tests**:
- ✅ Create income transaction
- ✅ Create expense transaction
- ✅ Display transaction list
- ✅ Filter transactions

### 5. Reports Tests

**E2E Tests**:
- ✅ Generate financial report
- ✅ Export to PDF

### 6. User Management Tests

**E2E Tests**:
- ✅ Display user list
- ✅ Create new user
- ✅ Assign roles

---

## 🎯 Test Credentials

Super Admin:
- Email: `admin@test.com`
- Password: `admin123`

> ⚠️ **Note**: Pastikan database test sudah ter-seed dengan user ini.

---

## 📊 Coverage Goals

- **Unit Tests**: >80% coverage
- **Component Tests**: >70% coverage
- **E2E Tests**: Critical user flows (Super Admin)

---

## 🐛 Debugging Tests

### Jest (Unit/Component)

```bash
# Run specific test file
npm test -- coa.test.ts

# Run with verbose output
npm test -- --verbose

# Update snapshots
npm test -- -u
```

### Playwright (E2E)

```bash
# Run specific test
npm run test:e2e -- super-admin.spec.ts

# Run in headed mode (see browser)
npm run test:e2e -- --headed

# Run specific test by name
npm run test:e2e -- -g "should login"

# Generate test report
npx playwright show-report
```

---

## 📝 Writing New Tests

### Unit Test Example

```typescript
import { describe, it, expect } from '@jest/globals';

describe('New Feature', () => {
  it('should work correctly', () => {
    expect(1 + 1).toBe(2);
  });
});
```

### Component Test Example

```typescript
import { render, screen } from '@testing-library/react';

test('renders component', () => {
  render(<MyComponent />);
  expect(screen.getByText('Hello')).toBeInTheDocument();
});
```

### E2E Test Example

```typescript
import { test, expect } from '@playwright/test';

test('user can do something', async ({ page }) => {
  await page.goto('/dashboard');
  await page.click('button');
  await expect(page.locator('h1')).toContainText('Success');
});
```

---

## 🔧 CI/CD Integration

### GitHub Actions Example

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test:ci
      - run: npx playwright install
      - run: npm run test:e2e
```

---

## ✅ Test Checklist for Super Admin

- [ ] Login & Authentication
- [ ] Dashboard access
- [ ] COA Management (CRUD)
- [ ] School Settings (Read/Update)
- [ ] Transaction Management
- [ ] User Management
- [ ] Reports Generation
- [ ] Receipt Generation
- [ ] Role-based permissions
- [ ] Data validation
- [ ] Error handling

---

## 🆘 Troubleshooting

**Tests failing?**
1. Make sure dev server is running for E2E tests
2. Check database connection
3. Verify test credentials exist in database
4. Clear cache: `npm test -- --clearCache`

**Playwright issues?**
1. Install browsers: `npx playwright install`
2. Update Playwright: `npm update @playwright/test`
3. Check browser compatibility

---

## 📚 Resources

- [Jest Documentation](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [Playwright Documentation](https://playwright.dev/)
- [Next.js Testing](https://nextjs.org/docs/testing)

---

**Happy Testing! 🎉**
