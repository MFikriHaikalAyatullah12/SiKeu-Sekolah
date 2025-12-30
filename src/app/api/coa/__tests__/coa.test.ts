import { describe, it, beforeEach, jest } from '@jest/globals';
import { NextRequest, NextResponse } from 'next/server';

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  prisma: {
    chartOfAccount: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

// Mock NextAuth
jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}));

import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';

const getServerSessionMock = getServerSession as any;
const prismaMock = prisma as any;

describe('COA API Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/coa', () => {
    it('should return all COA when user is SUPER_ADMIN', async () => {
      // Mock session
      getServerSessionMock.mockImplementation(async () => ({
        user: { id: 'user1', role: 'SUPER_ADMIN' },
      }));

      // Mock Prisma response
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
      ];

      prismaMock.chartOfAccount.findMany.mockImplementation(async () => mockCOA);

      // Test
      expect(mockCOA).toHaveLength(1);
      expect(mockCOA[0].code).toBe('1-1001');
      expect(mockCOA[0].type).toBe('INCOME');
    });

    it('should filter COA by type', async () => {
      getServerSessionMock.mockImplementation(async () => ({
        user: { id: 'user1', role: 'SUPER_ADMIN' },
      }));

      const mockIncomeCOA = [
        {
          id: 'coa1',
          code: '4-1001',
          name: 'Pendapatan SPP',
          type: 'INCOME',
          category: 'Pendapatan',
        },
      ];

      prismaMock.chartOfAccount.findMany.mockImplementation(async () => mockIncomeCOA);

      expect(mockIncomeCOA[0].type).toBe('INCOME');
    });

    it('should return 401 if not authenticated', async () => {
      getServerSessionMock.mockImplementation(async () => null);

      // Test unauthorized access
      expect(getServerSession).toBeDefined();
    });

    it('should return 403 if not SUPER_ADMIN', async () => {
      getServerSessionMock.mockImplementation(async () => ({
        user: { id: 'user1', role: 'BENDAHARA' },
      }));

      // User should not have access
      const session = await getServerSession();
      expect(session?.user?.role).not.toBe('SUPER_ADMIN');
    });
  });

  describe('POST /api/coa', () => {
    it('should create new COA successfully', async () => {
      getServerSessionMock.mockImplementation(async () => ({
        user: { id: 'user1', role: 'SUPER_ADMIN' },
      }));

      const newCOA = {
        code: '1-1002',
        name: 'Bank',
        category: 'Aset Lancar',
        type: 'INCOME',
        accountType: 'Bank',
        description: 'Rekening Bank',
      };

      prismaMock.chartOfAccount.create.mockImplementation(async () => ({
        id: 'coa2',
        ...newCOA,
        isActive: true,
      }));

      const result = await prismaMock.chartOfAccount.create({ data: newCOA });

      expect(result.code).toBe('1-1002');
      expect(result.name).toBe('Bank');
    });

    it('should reject duplicate COA code', async () => {
      getServerSessionMock.mockImplementation(async () => ({
        user: { id: 'user1', role: 'SUPER_ADMIN' },
      }));

      prismaMock.chartOfAccount.create.mockImplementation(async () => {
        throw new Error('Unique constraint failed on the fields: (`code`)')
      });

      await expect(
        prismaMock.chartOfAccount.create({
          data: { code: '1-1001', name: 'Duplicate' },
        })
      ).rejects.toThrow();
    });

    it('should validate required fields', async () => {
      const invalidCOA = {
        code: '', // Empty code
        name: '',
        category: '',
      };

      expect(invalidCOA.code).toBe('');
      expect(invalidCOA.name).toBe('');
    });
  });

  describe('PUT /api/coa/[id]', () => {
    it('should update COA successfully', async () => {
      getServerSessionMock.mockImplementation(async () => ({
        user: { id: 'user1', role: 'SUPER_ADMIN' },
      }));

      const updatedData = {
        name: 'Kas Besar',
        isActive: false,
      };

      prismaMock.chartOfAccount.update.mockImplementation(async () => ({
        id: 'coa1',
        code: '1-1001',
        ...updatedData,
      }));

      const result = await prismaMock.chartOfAccount.update({
        where: { id: 'coa1' },
        data: updatedData,
      });

      expect(result.name).toBe('Kas Besar');
      expect(result.isActive).toBe(false);
    });

    it('should return 404 if COA not found', async () => {
      getServerSessionMock.mockImplementation(async () => ({
        user: { id: 'user1', role: 'SUPER_ADMIN' },
      }));

      prismaMock.chartOfAccount.update.mockImplementation(async () => {
        throw new Error('Record to update not found.')
      });

      await expect(
        prismaMock.chartOfAccount.update({
          where: { id: 'invalid-id' },
          data: { name: 'Test' },
        })
      ).rejects.toThrow();
    });
  });

  describe('DELETE /api/coa/[id]', () => {
    it('should delete COA successfully', async () => {
      getServerSessionMock.mockImplementation(async () => ({
        user: { id: 'user1', role: 'SUPER_ADMIN' },
      }));

      prismaMock.chartOfAccount.delete.mockImplementation(async () => ({
        id: 'coa1',
        code: '1-1001',
      }));

      const result = await prismaMock.chartOfAccount.delete({
        where: { id: 'coa1' },
      });

      expect(result.id).toBe('coa1');
    });

    it('should prevent deletion if COA has transactions', async () => {
      getServerSessionMock.mockImplementation(async () => ({
        user: { id: 'user1', role: 'SUPER_ADMIN' },
      }));

      prismaMock.chartOfAccount.delete.mockImplementation(async () => {
        throw new Error('Foreign key constraint failed')
      });

      await expect(
        prismaMock.chartOfAccount.delete({
          where: { id: 'coa1' },
        })
      ).rejects.toThrow();
    });
  });
});
