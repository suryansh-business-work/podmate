import { useQuery } from '@apollo/client';
import { GET_EFFECTIVE_FEE } from '../graphql/queries';
import { GET_ME } from '../graphql/queries';

interface EffectiveFeeData {
  effectiveFee: {
    feePercent: number;
    source: string;
  };
}

interface MeData {
  me: {
    id: string;
  } | null;
}

type EntityType = 'USER' | 'POD' | 'PLACE';

interface UseEffectiveFeeOptions {
  entityType: EntityType;
  entityId?: string;
  skip?: boolean;
}

interface UseEffectiveFeeResult {
  feePercent: number;
  source: string;
  loading: boolean;
}

/**
 * Hook to fetch the effective platform fee for an entity.
 * If entityId is not provided and entityType is 'USER', it auto-fetches the current user's fee.
 */
export function useEffectiveFee(options: UseEffectiveFeeOptions): UseEffectiveFeeResult {
  const { entityType, entityId, skip = false } = options;

  const { data: meData } = useQuery<MeData>(GET_ME, {
    skip: Boolean(entityId) || entityType !== 'USER' || skip,
    fetchPolicy: 'cache-first',
  });

  const resolvedId = entityId || meData?.me?.id || '';

  const { data, loading } = useQuery<EffectiveFeeData>(GET_EFFECTIVE_FEE, {
    variables: { entityType, entityId: resolvedId },
    skip: !resolvedId || skip,
    fetchPolicy: 'cache-and-network',
  });

  return {
    feePercent: data?.effectiveFee?.feePercent ?? 5,
    source: data?.effectiveFee?.source ?? 'GLOBAL',
    loading,
  };
}
