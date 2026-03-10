export interface PlatformFeeConfig {
  id: string;
  globalFeePercent: number;
  updatedAt: string;
}

export interface PlatformFeeConfigData {
  platformFees: PlatformFeeConfig;
}

export interface PlatformFeeOverride {
  id: string;
  pincode: string;
  feePercent: number;
  label: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedPlatformFeeOverridesData {
  platformFeeOverrides: {
    items: PlatformFeeOverride[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface OverrideFormValues {
  pincode: string;
  feePercent: number;
  label: string;
}

export type EntityOverrideType = 'USER' | 'POD' | 'PLACE';

export interface EntityFeeOverride {
  id: string;
  entityType: EntityOverrideType;
  entityId: string;
  feePercent: number;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedEntityFeeOverridesData {
  entityFeeOverrides: {
    items: EntityFeeOverride[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface EntityFeeOverrideFormValues {
  entityType: EntityOverrideType;
  entityId: string;
  feePercent: number;
  enabled: boolean;
}
