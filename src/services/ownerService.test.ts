import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ownerService } from './ownerService';
import pb from '../lib/pocketbase';

// Mock the pocketbase client with collection-specific mocks
vi.mock('../lib/pocketbase', () => {
  const mocks = new Map();
  
  const getCollectionMock = (name: string) => {
    if (!mocks.has(name)) {
      mocks.set(name, {
        getList: vi.fn().mockResolvedValue({ items: [], totalItems: 0, page: 1, perPage: 10, totalPages: 0 }),
        getFullList: vi.fn().mockResolvedValue([]),
        update: vi.fn(),
        create: vi.fn(),
      });
    }
    return mocks.get(name);
  };

  return {
    default: {
      collection: vi.fn((name) => getCollectionMock(name)),
    },
  };
});

describe('OwnerService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getTopVisitedPages', () => {
    it('should fetch top visited pages with correct parameters', async () => {
      const mockPages = [
        { id: '1', path: '/home', visitors: 100, category: 'Public' },
        { id: '2', path: '/dashboard', visitors: 50, category: 'Internal' },
      ];
      
      const mockResult = {
        items: mockPages,
        totalItems: 2,
        page: 1,
        perPage: 10,
        totalPages: 1,
      };

      // Get the specific mock for this collection
      const collectionMock = pb.collection('analytics_pages');
      (collectionMock.getList as any).mockResolvedValue(mockResult);

      const result = await ownerService.getTopVisitedPages();

      expect(pb.collection).toHaveBeenCalledWith('analytics_pages');
      expect(collectionMock.getList).toHaveBeenCalledWith(1, 10, { sort: '-visitors' });
      expect(result).toEqual(mockPages);
    });
  });

  describe('getDashboardData', () => {
    it('should aggregate data from multiple collections', async () => {
      // Setup mocks for specific collections
      const tenantsMock = pb.collection('tenants');
      const invoicesMock = pb.collection('invoices');
      const analyticsPagesMock = pb.collection('analytics_pages');

      // Mock tenant growth (getList called in loop)
      (tenantsMock.getList as any).mockResolvedValue({ totalItems: 5, items: [] });
      
      // Mock activity feed (getFullList)
      (tenantsMock.getFullList as any).mockResolvedValue([
        { id: 't1', created: '2023-01-01', name: 'Tenant 1' }
      ]);
      (invoicesMock.getFullList as any).mockResolvedValue([
        { id: 'i1', created: '2023-01-02', amount: 100, status: 'paid' }
      ]);

      // Mock analytics
      (analyticsPagesMock.getList as any).mockResolvedValue({ 
        items: [{ path: '/home', visitors: 100, category: 'Public' }] 
      });

      const result = await ownerService.getDashboardData();
      
      expect(result).toBeDefined();
      expect(result.kpis).toBeDefined();
      expect(result.recentActivity).toHaveLength(2); // 1 tenant + 1 invoice
      
      // Verify calls
      expect(pb.collection).toHaveBeenCalledWith('tenants');
      expect(pb.collection).toHaveBeenCalledWith('invoices');
      expect(pb.collection).toHaveBeenCalledWith('analytics_pages');
    });
  });
});
