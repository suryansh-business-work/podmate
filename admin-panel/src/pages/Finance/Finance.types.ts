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
