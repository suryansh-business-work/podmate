import {
  getGlobalConfig,
  upsertGlobalFee,
  getOverrides,
  upsertOverride,
  deleteOverride,
  getEntityFeeOverrides,
  getEntityFeeOverride,
  upsertEntityFeeOverride,
  deleteEntityFeeOverride,
  getEffectiveFee,
} from '../platformFee.services';
import {
  PlatformFeeConfigModel,
  PlatformFeeOverrideModel,
  EntityFeeOverrideModel,
} from '../platformFee.models';

/* ── Mock all three Mongoose models ── */
jest.mock('../platformFee.models', () => ({
  PlatformFeeConfigModel: {
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
  },
  PlatformFeeOverrideModel: {
    countDocuments: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    create: jest.fn(),
    deleteOne: jest.fn(),
  },
  EntityFeeOverrideModel: {
    countDocuments: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    findOneAndUpdate: jest.fn(),
    deleteOne: jest.fn(),
  },
}));

/* ── Mock logger to avoid console noise ── */
jest.mock('../../../lib/logger', () => ({
  __esModule: true,
  default: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
}));

const mockConfigModel = PlatformFeeConfigModel as unknown as {
  findById: jest.Mock;
  findByIdAndUpdate: jest.Mock;
};

const mockOverrideModel = PlatformFeeOverrideModel as unknown as {
  countDocuments: jest.Mock;
  find: jest.Mock;
  findOne: jest.Mock;
  findByIdAndUpdate: jest.Mock;
  create: jest.Mock;
  deleteOne: jest.Mock;
};

const mockEntityModel = EntityFeeOverrideModel as unknown as {
  countDocuments: jest.Mock;
  find: jest.Mock;
  findOne: jest.Mock;
  findOneAndUpdate: jest.Mock;
  deleteOne: jest.Mock;
};

/* ── Helper to build chainable query mocks ── */
function chainableMock(result: unknown) {
  const chain: Record<string, jest.Mock> = {};
  chain.sort = jest.fn().mockReturnValue(chain);
  chain.skip = jest.fn().mockReturnValue(chain);
  chain.limit = jest.fn().mockReturnValue(chain);
  chain.lean = jest.fn().mockReturnValue(result);
  return chain;
}

describe('Platform Fee Services', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  /* ─────────────── Global Config ─────────────── */
  describe('getGlobalConfig', () => {
    it('should return stored global config when present', async () => {
      mockConfigModel.findById.mockReturnValue({
        lean: jest.fn().mockReturnValue({
          _id: 'global',
          id: 'global',
          globalFeePercent: 8,
          updatedAt: '2025-01-01T00:00:00Z',
        }),
      });

      const config = await getGlobalConfig();
      expect(config.id).toBe('global');
      expect(config.globalFeePercent).toBe(8);
      expect(mockConfigModel.findById).toHaveBeenCalledWith('global');
    });

    it('should return default 5% when no config exists', async () => {
      mockConfigModel.findById.mockReturnValue({
        lean: jest.fn().mockReturnValue(null),
      });

      const config = await getGlobalConfig();
      expect(config.globalFeePercent).toBe(5);
      expect(config.id).toBe('global');
    });
  });

  describe('upsertGlobalFee', () => {
    it('should update global fee and return result', async () => {
      mockConfigModel.findByIdAndUpdate.mockResolvedValue({
        _id: 'global',
        globalFeePercent: 10,
        updatedAt: '2025-01-01T00:00:00Z',
      });

      const result = await upsertGlobalFee(10);
      expect(result.globalFeePercent).toBe(10);
      expect(mockConfigModel.findByIdAndUpdate).toHaveBeenCalledWith(
        'global',
        expect.objectContaining({
          $set: expect.objectContaining({ globalFeePercent: 10 }),
        }),
        expect.objectContaining({ upsert: true }),
      );
    });

    it('should throw for fee below 2%', async () => {
      await expect(upsertGlobalFee(1)).rejects.toThrow('Platform fee must be between 2% and 15%');
    });

    it('should throw for fee above 15%', async () => {
      await expect(upsertGlobalFee(16)).rejects.toThrow('Platform fee must be between 2% and 15%');
    });
  });

  /* ─────────────── Pincode Overrides ─────────────── */
  describe('getOverrides', () => {
    it('should return paginated overrides', async () => {
      mockOverrideModel.countDocuments.mockResolvedValue(2);
      mockOverrideModel.find.mockReturnValue(
        chainableMock([
          {
            _id: 'o1',
            id: 'o1',
            pincode: '110001',
            feePercent: 8,
            label: 'Delhi',
            createdAt: 'c',
            updatedAt: 'u',
          },
          {
            _id: 'o2',
            id: 'o2',
            pincode: '400001',
            feePercent: 6,
            label: 'Mumbai',
            createdAt: 'c',
            updatedAt: 'u',
          },
        ]),
      );

      const result = await getOverrides(1, 10);
      expect(result.total).toBe(2);
      expect(result.items).toHaveLength(2);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
      expect(result.totalPages).toBe(1);
    });

    it('should calculate totalPages correctly', async () => {
      mockOverrideModel.countDocuments.mockResolvedValue(25);
      mockOverrideModel.find.mockReturnValue(chainableMock([]));

      const result = await getOverrides(1, 10);
      expect(result.totalPages).toBe(3);
    });

    it('should apply correct skip for pagination', async () => {
      mockOverrideModel.countDocuments.mockResolvedValue(0);
      const chain = chainableMock([]);
      mockOverrideModel.find.mockReturnValue(chain);

      await getOverrides(3, 10);
      expect(chain.skip).toHaveBeenCalledWith(20);
      expect(chain.limit).toHaveBeenCalledWith(10);
    });
  });

  describe('upsertOverride', () => {
    it('should create new override when no id provided', async () => {
      mockOverrideModel.findOne.mockReturnValue({
        lean: jest.fn().mockReturnValue(null),
      });
      mockOverrideModel.create.mockResolvedValue({
        toObject: () => ({
          _id: 'new-id',
          id: 'new-id',
          pincode: '110001',
          feePercent: 8,
          label: 'Delhi',
          createdAt: 'c',
          updatedAt: 'u',
        }),
      });

      const result = await upsertOverride({ pincode: '110001', feePercent: 8, label: 'Delhi' });
      expect(result.pincode).toBe('110001');
      expect(result.feePercent).toBe(8);
    });

    it('should update existing override when id provided', async () => {
      mockOverrideModel.findByIdAndUpdate.mockResolvedValue({
        _id: 'o1',
        id: 'o1',
        pincode: '110001',
        feePercent: 10,
        label: 'Updated',
        createdAt: 'c',
        updatedAt: 'u',
      });

      const result = await upsertOverride({
        id: 'o1',
        pincode: '110001',
        feePercent: 10,
        label: 'Updated',
      });
      expect(result.feePercent).toBe(10);
      expect(mockOverrideModel.findByIdAndUpdate).toHaveBeenCalledWith(
        'o1',
        expect.any(Object),
        expect.any(Object),
      );
    });

    it('should throw when updating non-existent override', async () => {
      mockOverrideModel.findByIdAndUpdate.mockResolvedValue(null);
      await expect(
        upsertOverride({ id: 'missing', pincode: '110001', feePercent: 8 }),
      ).rejects.toThrow('Override not found');
    });

    it('should throw when pincode already exists without id', async () => {
      mockOverrideModel.findOne.mockReturnValue({
        lean: jest.fn().mockReturnValue({ _id: 'existing' }),
      });
      await expect(upsertOverride({ pincode: '110001', feePercent: 8 })).rejects.toThrow(
        'Override for pincode 110001 already exists',
      );
    });

    it('should throw for fee below 2%', async () => {
      await expect(upsertOverride({ pincode: '110001', feePercent: 1 })).rejects.toThrow(
        'Platform fee must be between 2% and 15%',
      );
    });

    it('should throw for fee above 15%', async () => {
      await expect(upsertOverride({ pincode: '110001', feePercent: 16 })).rejects.toThrow(
        'Platform fee must be between 2% and 15%',
      );
    });
  });

  describe('deleteOverride', () => {
    it('should return true when override deleted', async () => {
      mockOverrideModel.deleteOne.mockResolvedValue({ deletedCount: 1 });
      const result = await deleteOverride('o1');
      expect(result).toBe(true);
    });

    it('should return false when override not found', async () => {
      mockOverrideModel.deleteOne.mockResolvedValue({ deletedCount: 0 });
      const result = await deleteOverride('missing');
      expect(result).toBe(false);
    });
  });

  /* ─────────────── Entity Fee Overrides ─────────────── */
  describe('getEntityFeeOverrides', () => {
    it('should return paginated entity overrides without filter', async () => {
      mockEntityModel.countDocuments.mockResolvedValue(3);
      mockEntityModel.find.mockReturnValue(
        chainableMock([
          {
            _id: 'e1',
            id: 'e1',
            entityType: 'USER',
            entityId: 'u1',
            feePercent: 7,
            enabled: true,
            createdAt: 'c',
            updatedAt: 'u',
          },
          {
            _id: 'e2',
            id: 'e2',
            entityType: 'POD',
            entityId: 'p1',
            feePercent: 6,
            enabled: true,
            createdAt: 'c',
            updatedAt: 'u',
          },
        ]),
      );

      const result = await getEntityFeeOverrides(undefined, 1, 10);
      expect(result.total).toBe(3);
      expect(result.items).toHaveLength(2);
      expect(mockEntityModel.countDocuments).toHaveBeenCalledWith({});
    });

    it('should filter by entityType when provided', async () => {
      mockEntityModel.countDocuments.mockResolvedValue(1);
      mockEntityModel.find.mockReturnValue(
        chainableMock([
          {
            _id: 'e1',
            id: 'e1',
            entityType: 'USER',
            entityId: 'u1',
            feePercent: 7,
            enabled: true,
            createdAt: 'c',
            updatedAt: 'u',
          },
        ]),
      );

      await getEntityFeeOverrides('USER', 1, 10);
      expect(mockEntityModel.countDocuments).toHaveBeenCalledWith({ entityType: 'USER' });
      expect(mockEntityModel.find).toHaveBeenCalledWith({ entityType: 'USER' });
    });

    it('should calculate pagination correctly', async () => {
      mockEntityModel.countDocuments.mockResolvedValue(15);
      mockEntityModel.find.mockReturnValue(chainableMock([]));

      const result = await getEntityFeeOverrides(undefined, 2, 5);
      expect(result.totalPages).toBe(3);
      expect(result.page).toBe(2);
    });
  });

  describe('getEntityFeeOverride', () => {
    it('should return override when found', async () => {
      mockEntityModel.findOne.mockReturnValue({
        lean: jest.fn().mockReturnValue({
          _id: 'e1',
          id: 'e1',
          entityType: 'USER',
          entityId: 'u1',
          feePercent: 7,
          enabled: true,
          createdAt: 'c',
          updatedAt: 'u',
        }),
      });

      const result = await getEntityFeeOverride('USER', 'u1');
      expect(result).not.toBeNull();
      expect(result?.entityType).toBe('USER');
      expect(result?.entityId).toBe('u1');
    });

    it('should return null when not found', async () => {
      mockEntityModel.findOne.mockReturnValue({
        lean: jest.fn().mockReturnValue(null),
      });

      const result = await getEntityFeeOverride('USER', 'non-existent');
      expect(result).toBeNull();
    });
  });

  describe('upsertEntityFeeOverride', () => {
    const validInput = {
      entityType: 'USER' as const,
      entityId: 'user-123',
      feePercent: 7,
      enabled: true,
    };

    it('should upsert entity fee override', async () => {
      mockEntityModel.findOneAndUpdate.mockResolvedValue({
        _id: 'e1',
        id: 'e1',
        entityType: 'USER',
        entityId: 'user-123',
        feePercent: 7,
        enabled: true,
        createdAt: 'c',
        updatedAt: 'u',
      });

      const result = await upsertEntityFeeOverride(validInput);
      expect(result.entityType).toBe('USER');
      expect(result.feePercent).toBe(7);
      expect(mockEntityModel.findOneAndUpdate).toHaveBeenCalledWith(
        { entityType: 'USER', entityId: 'user-123' },
        expect.objectContaining({
          $set: expect.objectContaining({ feePercent: 7, enabled: true }),
        }),
        expect.objectContaining({ upsert: true, returnDocument: 'after' }),
      );
    });

    it('should throw when findOneAndUpdate returns null', async () => {
      mockEntityModel.findOneAndUpdate.mockResolvedValue(null);
      await expect(upsertEntityFeeOverride(validInput)).rejects.toThrow(
        'Failed to upsert entity fee override',
      );
    });

    it('should throw for fee below 2%', async () => {
      await expect(upsertEntityFeeOverride({ ...validInput, feePercent: 1 })).rejects.toThrow(
        'Platform fee must be between 2% and 15%',
      );
    });

    it('should throw for fee above 15%', async () => {
      await expect(upsertEntityFeeOverride({ ...validInput, feePercent: 16 })).rejects.toThrow(
        'Platform fee must be between 2% and 15%',
      );
    });

    it('should accept boundary value of 2%', async () => {
      mockEntityModel.findOneAndUpdate.mockResolvedValue({
        _id: 'e1',
        id: 'e1',
        entityType: 'USER',
        entityId: 'user-123',
        feePercent: 2,
        enabled: true,
        createdAt: 'c',
        updatedAt: 'u',
      });

      const result = await upsertEntityFeeOverride({ ...validInput, feePercent: 2 });
      expect(result.feePercent).toBe(2);
    });

    it('should accept boundary value of 15%', async () => {
      mockEntityModel.findOneAndUpdate.mockResolvedValue({
        _id: 'e1',
        id: 'e1',
        entityType: 'USER',
        entityId: 'user-123',
        feePercent: 15,
        enabled: true,
        createdAt: 'c',
        updatedAt: 'u',
      });

      const result = await upsertEntityFeeOverride({ ...validInput, feePercent: 15 });
      expect(result.feePercent).toBe(15);
    });
  });

  describe('deleteEntityFeeOverride', () => {
    it('should return true when override deleted', async () => {
      mockEntityModel.deleteOne.mockResolvedValue({ deletedCount: 1 });
      const result = await deleteEntityFeeOverride('USER', 'user-123');
      expect(result).toBe(true);
      expect(mockEntityModel.deleteOne).toHaveBeenCalledWith({
        entityType: 'USER',
        entityId: 'user-123',
      });
    });

    it('should return false when not found', async () => {
      mockEntityModel.deleteOne.mockResolvedValue({ deletedCount: 0 });
      const result = await deleteEntityFeeOverride('POD', 'missing');
      expect(result).toBe(false);
    });
  });

  /* ─────────────── Effective Fee Cascade ─────────────── */
  describe('getEffectiveFee', () => {
    it('should return entity override when enabled', async () => {
      mockEntityModel.findOne.mockReturnValue({
        lean: jest.fn().mockReturnValue({
          _id: 'e1',
          entityType: 'USER',
          entityId: 'u1',
          feePercent: 7,
          enabled: true,
        }),
      });

      const result = await getEffectiveFee('USER', 'u1');
      expect(result.feePercent).toBe(7);
      expect(result.source).toBe('USER_OVERRIDE');
    });

    it('should return POD_OVERRIDE source for pod overrides', async () => {
      mockEntityModel.findOne.mockReturnValue({
        lean: jest.fn().mockReturnValue({
          entityType: 'POD',
          entityId: 'p1',
          feePercent: 6,
          enabled: true,
        }),
      });

      const result = await getEffectiveFee('POD', 'p1');
      expect(result.source).toBe('POD_OVERRIDE');
    });

    it('should return PLACE_OVERRIDE source for place overrides', async () => {
      mockEntityModel.findOne.mockReturnValue({
        lean: jest.fn().mockReturnValue({
          entityType: 'PLACE',
          entityId: 'v1',
          feePercent: 10,
          enabled: true,
        }),
      });

      const result = await getEffectiveFee('PLACE', 'v1');
      expect(result.source).toBe('PLACE_OVERRIDE');
    });

    it('should fall back to global config when no entity override', async () => {
      mockEntityModel.findOne.mockReturnValue({
        lean: jest.fn().mockReturnValue(null),
      });
      mockConfigModel.findById.mockReturnValue({
        lean: jest.fn().mockReturnValue({
          _id: 'global',
          id: 'global',
          globalFeePercent: 8,
          updatedAt: '2025-01-01T00:00:00Z',
        }),
      });

      const result = await getEffectiveFee('USER', 'u-no-override');
      expect(result.feePercent).toBe(8);
      expect(result.source).toBe('GLOBAL');
    });

    it('should fall back to default 5% when no config and no override', async () => {
      mockEntityModel.findOne.mockReturnValue({
        lean: jest.fn().mockReturnValue(null),
      });
      mockConfigModel.findById.mockReturnValue({
        lean: jest.fn().mockReturnValue(null),
      });

      const result = await getEffectiveFee('USER', 'u-nothing');
      expect(result.feePercent).toBe(5);
      expect(result.source).toBe('GLOBAL');
    });

    it('should only match enabled entity overrides', async () => {
      mockEntityModel.findOne.mockReturnValue({
        lean: jest.fn().mockReturnValue(null),
      });
      mockConfigModel.findById.mockReturnValue({
        lean: jest.fn().mockReturnValue({
          _id: 'global',
          id: 'global',
          globalFeePercent: 5,
          updatedAt: 'u',
        }),
      });

      const result = await getEffectiveFee('USER', 'u1');
      expect(result.source).toBe('GLOBAL');
      // Verify the query filters for enabled: true
      expect(mockEntityModel.findOne).toHaveBeenCalledWith(
        expect.objectContaining({ enabled: true }),
      );
    });
  });
});
