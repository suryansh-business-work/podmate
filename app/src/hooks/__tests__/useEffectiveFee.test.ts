import { useQuery } from '@apollo/client';
import { renderHook } from '@testing-library/react-native';
import { useEffectiveFee } from '../useEffectiveFee';

describe('useEffectiveFee', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useQuery as jest.Mock).mockReturnValue({
      data: null,
      loading: false,
      error: null,
    });
  });

  it('should return default 5% fee when no data', () => {
    const { result } = renderHook(() =>
      useEffectiveFee({ entityType: 'USER', entityId: 'user-1' }),
    );
    expect(result.current.feePercent).toBe(5);
    expect(result.current.source).toBe('GLOBAL');
  });

  it('should return loading state', () => {
    (useQuery as jest.Mock).mockReturnValue({
      data: null,
      loading: true,
      error: null,
    });
    const { result } = renderHook(() =>
      useEffectiveFee({ entityType: 'USER', entityId: 'user-1' }),
    );
    expect(result.current.loading).toBe(true);
  });

  it('should return effective fee from server data', () => {
    (useQuery as jest.Mock)
      // First call: GET_ME (skipped since entityId provided)
      .mockReturnValueOnce({ data: null, loading: false, error: null })
      // Second call: GET_EFFECTIVE_FEE
      .mockReturnValueOnce({
        data: { effectiveFee: { feePercent: 8, source: 'USER_OVERRIDE' } },
        loading: false,
        error: null,
      });

    const { result } = renderHook(() =>
      useEffectiveFee({ entityType: 'USER', entityId: 'user-1' }),
    );
    expect(result.current.feePercent).toBe(8);
    expect(result.current.source).toBe('USER_OVERRIDE');
  });

  it('should skip queries when skip is true', () => {
    const { result } = renderHook(() =>
      useEffectiveFee({ entityType: 'USER', entityId: 'user-1', skip: true }),
    );
    expect(result.current.feePercent).toBe(5);
    expect(result.current.source).toBe('GLOBAL');
    expect(useQuery).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ skip: true }),
    );
  });

  it('should auto-resolve user ID from GET_ME for USER type without entityId', () => {
    (useQuery as jest.Mock)
      // First call: GET_ME — returns user data
      .mockReturnValueOnce({
        data: { me: { id: 'resolved-user-id' } },
        loading: false,
        error: null,
      })
      // Second call: GET_EFFECTIVE_FEE — uses resolved ID
      .mockReturnValueOnce({
        data: { effectiveFee: { feePercent: 7, source: 'USER_OVERRIDE' } },
        loading: false,
        error: null,
      });

    const { result } = renderHook(() =>
      useEffectiveFee({ entityType: 'USER' }),
    );
    expect(result.current.feePercent).toBe(7);
  });

  it('should skip GET_ME when entityId is provided', () => {
    (useQuery as jest.Mock)
      .mockReturnValueOnce({ data: null, loading: false, error: null })
      .mockReturnValueOnce({ data: null, loading: false, error: null });

    renderHook(() =>
      useEffectiveFee({ entityType: 'USER', entityId: 'user-1' }),
    );
    // First call to useQuery (GET_ME) should have skip: true
    expect((useQuery as jest.Mock).mock.calls[0][1]).toEqual(
      expect.objectContaining({ skip: true }),
    );
  });

  it('should skip GET_ME for POD entity type', () => {
    (useQuery as jest.Mock)
      .mockReturnValueOnce({ data: null, loading: false, error: null })
      .mockReturnValueOnce({ data: null, loading: false, error: null });

    renderHook(() =>
      useEffectiveFee({ entityType: 'POD', entityId: 'pod-1' }),
    );
    // GET_ME should be skipped for non-USER entity types
    expect((useQuery as jest.Mock).mock.calls[0][1]).toEqual(
      expect.objectContaining({ skip: true }),
    );
  });

  it('should return GLOBAL source when no override found', () => {
    (useQuery as jest.Mock)
      .mockReturnValueOnce({ data: null, loading: false, error: null })
      .mockReturnValueOnce({
        data: { effectiveFee: { feePercent: 5, source: 'GLOBAL' } },
        loading: false,
        error: null,
      });

    const { result } = renderHook(() =>
      useEffectiveFee({ entityType: 'POD', entityId: 'pod-1' }),
    );
    expect(result.current.source).toBe('GLOBAL');
  });

  it('should handle PLACE entity type', () => {
    (useQuery as jest.Mock)
      .mockReturnValueOnce({ data: null, loading: false, error: null })
      .mockReturnValueOnce({
        data: { effectiveFee: { feePercent: 10, source: 'PLACE_OVERRIDE' } },
        loading: false,
        error: null,
      });

    const { result } = renderHook(() =>
      useEffectiveFee({ entityType: 'PLACE', entityId: 'place-1' }),
    );
    expect(result.current.feePercent).toBe(10);
    expect(result.current.source).toBe('PLACE_OVERRIDE');
  });
});
