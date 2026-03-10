import {
  upsertGlobalFeeSchema,
  upsertOverrideSchema,
  entityOverrideTypeSchema,
  upsertEntityFeeOverrideSchema,
} from '../platformFee.validators';

describe('Platform Fee Validators', () => {
  describe('upsertGlobalFeeSchema', () => {
    it('should accept valid fee within range', () => {
      const result = upsertGlobalFeeSchema.safeParse({ globalFeePercent: 5 });
      expect(result.success).toBe(true);
    });

    it('should accept minimum fee of 2', () => {
      const result = upsertGlobalFeeSchema.safeParse({ globalFeePercent: 2 });
      expect(result.success).toBe(true);
    });

    it('should accept maximum fee of 15', () => {
      const result = upsertGlobalFeeSchema.safeParse({ globalFeePercent: 15 });
      expect(result.success).toBe(true);
    });

    it('should accept decimal fee values', () => {
      const result = upsertGlobalFeeSchema.safeParse({ globalFeePercent: 7.5 });
      expect(result.success).toBe(true);
    });

    it('should reject fee below 2', () => {
      const result = upsertGlobalFeeSchema.safeParse({ globalFeePercent: 1 });
      expect(result.success).toBe(false);
    });

    it('should reject fee above 15', () => {
      const result = upsertGlobalFeeSchema.safeParse({ globalFeePercent: 16 });
      expect(result.success).toBe(false);
    });

    it('should reject zero fee', () => {
      const result = upsertGlobalFeeSchema.safeParse({ globalFeePercent: 0 });
      expect(result.success).toBe(false);
    });

    it('should reject negative fee', () => {
      const result = upsertGlobalFeeSchema.safeParse({ globalFeePercent: -5 });
      expect(result.success).toBe(false);
    });

    it('should reject non-number fee', () => {
      const result = upsertGlobalFeeSchema.safeParse({ globalFeePercent: 'five' });
      expect(result.success).toBe(false);
    });

    it('should reject missing globalFeePercent', () => {
      const result = upsertGlobalFeeSchema.safeParse({});
      expect(result.success).toBe(false);
    });
  });

  describe('upsertOverrideSchema', () => {
    const validInput = {
      pincode: '110001',
      feePercent: 8,
      label: 'Delhi',
    };

    it('should accept valid override input', () => {
      const result = upsertOverrideSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it('should accept input with optional id', () => {
      const result = upsertOverrideSchema.safeParse({
        ...validInput,
        id: 'override-123',
      });
      expect(result.success).toBe(true);
    });

    it('should accept input without optional label', () => {
      const result = upsertOverrideSchema.safeParse({
        pincode: '110001',
        feePercent: 8,
      });
      expect(result.success).toBe(true);
    });

    it('should reject pincode shorter than 4 characters', () => {
      const result = upsertOverrideSchema.safeParse({
        ...validInput,
        pincode: '123',
      });
      expect(result.success).toBe(false);
    });

    it('should reject pincode longer than 10 characters', () => {
      const result = upsertOverrideSchema.safeParse({
        ...validInput,
        pincode: '12345678901',
      });
      expect(result.success).toBe(false);
    });

    it('should reject fee below 2', () => {
      const result = upsertOverrideSchema.safeParse({
        ...validInput,
        feePercent: 1,
      });
      expect(result.success).toBe(false);
    });

    it('should reject fee above 15', () => {
      const result = upsertOverrideSchema.safeParse({
        ...validInput,
        feePercent: 16,
      });
      expect(result.success).toBe(false);
    });

    it('should reject label longer than 100 characters', () => {
      const result = upsertOverrideSchema.safeParse({
        ...validInput,
        label: 'x'.repeat(101),
      });
      expect(result.success).toBe(false);
    });

    it('should reject missing pincode', () => {
      const result = upsertOverrideSchema.safeParse({ feePercent: 8 });
      expect(result.success).toBe(false);
    });

    it('should reject missing feePercent', () => {
      const result = upsertOverrideSchema.safeParse({ pincode: '110001' });
      expect(result.success).toBe(false);
    });
  });

  describe('entityOverrideTypeSchema', () => {
    it('should accept USER type', () => {
      const result = entityOverrideTypeSchema.safeParse('USER');
      expect(result.success).toBe(true);
    });

    it('should accept POD type', () => {
      const result = entityOverrideTypeSchema.safeParse('POD');
      expect(result.success).toBe(true);
    });

    it('should accept PLACE type', () => {
      const result = entityOverrideTypeSchema.safeParse('PLACE');
      expect(result.success).toBe(true);
    });

    it('should reject lowercase type', () => {
      const result = entityOverrideTypeSchema.safeParse('user');
      expect(result.success).toBe(false);
    });

    it('should reject invalid type', () => {
      const result = entityOverrideTypeSchema.safeParse('VENUE');
      expect(result.success).toBe(false);
    });

    it('should reject empty string', () => {
      const result = entityOverrideTypeSchema.safeParse('');
      expect(result.success).toBe(false);
    });

    it('should reject non-string values', () => {
      const result = entityOverrideTypeSchema.safeParse(123);
      expect(result.success).toBe(false);
    });
  });

  describe('upsertEntityFeeOverrideSchema', () => {
    const validInput = {
      entityType: 'USER' as const,
      entityId: 'user-123',
      feePercent: 7,
      enabled: true,
    };

    it('should accept valid entity override input', () => {
      const result = upsertEntityFeeOverrideSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it('should accept disabled override', () => {
      const result = upsertEntityFeeOverrideSchema.safeParse({
        ...validInput,
        enabled: false,
      });
      expect(result.success).toBe(true);
    });

    it('should accept POD entity type', () => {
      const result = upsertEntityFeeOverrideSchema.safeParse({
        ...validInput,
        entityType: 'POD',
      });
      expect(result.success).toBe(true);
    });

    it('should accept PLACE entity type', () => {
      const result = upsertEntityFeeOverrideSchema.safeParse({
        ...validInput,
        entityType: 'PLACE',
      });
      expect(result.success).toBe(true);
    });

    it('should reject empty entityId', () => {
      const result = upsertEntityFeeOverrideSchema.safeParse({
        ...validInput,
        entityId: '',
      });
      expect(result.success).toBe(false);
    });

    it('should reject fee below minimum', () => {
      const result = upsertEntityFeeOverrideSchema.safeParse({
        ...validInput,
        feePercent: 1.5,
      });
      expect(result.success).toBe(false);
    });

    it('should reject fee above maximum', () => {
      const result = upsertEntityFeeOverrideSchema.safeParse({
        ...validInput,
        feePercent: 15.1,
      });
      expect(result.success).toBe(false);
    });

    it('should reject missing entityType', () => {
      const result = upsertEntityFeeOverrideSchema.safeParse({
        entityId: 'user-123',
        feePercent: 7,
        enabled: true,
      });
      expect(result.success).toBe(false);
    });

    it('should reject missing feePercent', () => {
      const result = upsertEntityFeeOverrideSchema.safeParse({
        entityType: 'USER',
        entityId: 'user-123',
        enabled: true,
      });
      expect(result.success).toBe(false);
    });

    it('should reject missing enabled flag', () => {
      const result = upsertEntityFeeOverrideSchema.safeParse({
        entityType: 'USER',
        entityId: 'user-123',
        feePercent: 7,
      });
      expect(result.success).toBe(false);
    });

    it('should reject invalid entity type', () => {
      const result = upsertEntityFeeOverrideSchema.safeParse({
        ...validInput,
        entityType: 'INVALID',
      });
      expect(result.success).toBe(false);
    });
  });
});
