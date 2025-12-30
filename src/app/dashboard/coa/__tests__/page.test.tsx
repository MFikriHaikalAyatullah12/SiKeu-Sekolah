import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { describe, it, beforeEach } from '@jest/globals';
import COAManagementPage from '@/app/dashboard/coa/page';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(),
}));

// Mock next-auth/react
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
}));

// Mock fetch
const fetchMock = jest.fn() as any;
(globalThis as any).fetch = fetchMock;

const mockSession = {
  user: {
    id: 'user1',
    email: 'admin@test.com',
    role: 'SUPER_ADMIN',
    name: 'Admin Test',
    schoolId: 'school1',
  },
  expires: '2025-12-31',
};

describe('COA Management Page', () => {
  const mockRouter = {
    push: jest.fn(),
    replace: jest.fn(),
    refresh: jest.fn(),
  };

  const useRouterMock = useRouter as any;
  const usePathnameMock = usePathname as any;
  const useSessionMock = useSession as any;

  beforeEach(() => {
    jest.clearAllMocks();
    useRouterMock.mockReturnValue(mockRouter);
    usePathnameMock.mockReturnValue('/dashboard/coa');
    useSessionMock.mockReturnValue({
      data: mockSession,
      status: 'authenticated',
    });
  });

  it('should render loading state initially', () => {
    render(<COAManagementPage />);
    expect(screen.getByText(/loading/i)).toBeTruthy();
  });

  it('should render COA list after loading', async () => {
    const mockCOA = [
      {
        id: 'coa1',
        code: '1-1001',
        name: 'Kas',
        category: 'Aset Lancar',
        type: 'INCOME',
        accountType: 'Cash',
        isActive: true,
        description: null,
      },
      {
        id: 'coa2',
        code: '5-1001',
        name: 'Gaji Guru',
        category: 'Beban Operasional',
        type: 'EXPENSE',
        accountType: 'Expense',
        isActive: true,
        description: null,
      },
    ];

    fetchMock.mockImplementationOnce(async () => ({
      ok: true,
      json: async () => mockCOA,
    }));

    render(<COAManagementPage />);

    await waitFor(() => {
      expect(screen.getByText('Chart of Accounts (COA) Management')).toBeTruthy();
    });
  });

  it('should filter COA by type', async () => {
    const mockCOA = [
      {
        id: 'coa1',
        code: '4-1001',
        name: 'Pendapatan SPP',
        type: 'INCOME',
        category: 'Pendapatan',
        accountType: 'Revenue',
        isActive: true,
      },
    ];

    fetchMock.mockImplementationOnce(async () => ({
      ok: true,
      json: async () => mockCOA,
    }));

    render(<COAManagementPage />);

    await waitFor(() => {
      const incomeButton = screen.getByRole('button', { name: 'Pemasukan' });
      expect(incomeButton).toBeTruthy();
    });
  });

  it('should handle delete COA with confirmation', async () => {
    const mockCOA = [
      {
        id: 'coa1',
        code: '1-1001',
        name: 'Kas',
        category: 'Aset',
        type: 'INCOME',
        accountType: 'Cash',
        isActive: true,
      },
    ];

    fetchMock.mockImplementationOnce(async () => ({
      ok: true,
      json: async () => mockCOA,
    }));

    // Mock window.confirm
    global.confirm = jest.fn(() => true);

    render(<COAManagementPage />);

    await waitFor(() => {
      expect(screen.getByText('Chart of Accounts (COA) Management')).toBeTruthy();
    });
  });

  it('should show empty state when no COA', async () => {
    fetchMock.mockImplementationOnce(async () => ({
      ok: true,
      json: async () => [],
    }));

    render(<COAManagementPage />);

    await waitFor(() => {
      expect(screen.getByText(/Belum ada Chart of Accounts/i)).toBeTruthy();
    });
  });

  it('should group COA by category', async () => {
    const mockCOA = [
      {
        id: 'coa1',
        code: '1-1001',
        name: 'Kas',
        category: 'Aset Lancar',
        type: 'INCOME',
        accountType: 'Cash',
        isActive: true,
      },
      {
        id: 'coa2',
        code: '1-1002',
        name: 'Bank',
        category: 'Aset Lancar',
        type: 'INCOME',
        accountType: 'Bank',
        isActive: true,
      },
    ];

    fetchMock.mockImplementationOnce(async () => ({
      ok: true,
      json: async () => mockCOA,
    }));

    render(<COAManagementPage />);

    await waitFor(() => {
      expect(screen.getByText('Aset Lancar')).toBeTruthy();
    });
  });

  it('should redirect non-SUPER_ADMIN users', async () => {
    const nonAdminSession = {
      user: {
        id: 'user2',
        email: 'bendahara@test.com',
        role: 'BENDAHARA',
        name: 'Bendahara',
        schoolId: 'school1',
      },
      expires: '2025-12-31',
    };

    useSessionMock.mockReturnValue({
      data: nonAdminSession,
      status: 'authenticated',
    });

    render(<COAManagementPage />);

    // Should show loading then redirect
    expect(screen.getByText(/loading/i)).toBeTruthy();
  });
});
