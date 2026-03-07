import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useDeviceContacts } from '../useDeviceContacts';

const mockRequestPermissions = jest.fn();
const mockGetContacts = jest.fn();

jest.mock('expo-contacts', () => ({
  requestPermissionsAsync: () => mockRequestPermissions(),
  getContactsAsync: (opts: unknown) => mockGetContacts(opts),
  Fields: { PhoneNumbers: 'phoneNumbers', Name: 'name' },
  SortTypes: { FirstName: 'firstName' },
}));

describe('useDeviceContacts', () => {
  beforeEach(() => {
    jest.useRealTimers();
    mockRequestPermissions.mockReset();
    mockGetContacts.mockReset();
  });

  it('returns loading=true initially', () => {
    mockRequestPermissions.mockReturnValue(new Promise(() => {}));

    const { result } = renderHook(() => useDeviceContacts());

    expect(result.current.loading).toBe(true);
    expect(result.current.contacts).toEqual([]);
  });

  it('loads contacts when permission is granted', async () => {
    mockRequestPermissions.mockResolvedValue({ status: 'granted' });
    mockGetContacts.mockResolvedValue({
      data: [
        {
          id: '1',
          name: 'Alice',
          phoneNumbers: [{ number: '+91 9876 543 210' }],
        },
        {
          id: '2',
          name: 'Bob',
          phoneNumbers: [{ number: '(098) 765-43211' }],
        },
      ],
    });

    const { result } = renderHook(() => useDeviceContacts());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.contacts).toHaveLength(2);
    expect(result.current.contacts[0].name).toBe('Alice');
    expect(result.current.contacts[0].phone).toBe('+919876543210');
    expect(result.current.contacts[1].phone).toBe('(098)76543211');
  });

  it('sets permissionDenied when permission is not granted', async () => {
    mockRequestPermissions.mockResolvedValue({ status: 'denied' });

    const { result } = renderHook(() => useDeviceContacts());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.permissionDenied).toBe(true);
    expect(result.current.contacts).toEqual([]);
  });

  it('skips contacts without phone numbers', async () => {
    mockRequestPermissions.mockResolvedValue({ status: 'granted' });
    mockGetContacts.mockResolvedValue({
      data: [
        { id: '1', name: 'Alice', phoneNumbers: [{ number: '1234567890' }] },
        { id: '2', name: 'No Phone', phoneNumbers: [] },
        { id: '3', name: 'Null Phone', phoneNumbers: null },
      ],
    });

    const { result } = renderHook(() => useDeviceContacts());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.contacts).toHaveLength(1);
    expect(result.current.contacts[0].name).toBe('Alice');
  });

  it('normalizes phone numbers by removing spaces, dashes, parentheses', async () => {
    mockRequestPermissions.mockResolvedValue({ status: 'granted' });
    mockGetContacts.mockResolvedValue({
      data: [
        {
          id: '1',
          name: 'Test User',
          phoneNumbers: [{ number: '(+91) 987-654 3210' }],
        },
      ],
    });

    const { result } = renderHook(() => useDeviceContacts());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.contacts[0].phone).toBe('(+91)9876543210');
  });

  it('handles contacts API error gracefully', async () => {
    mockRequestPermissions.mockRejectedValue(new Error('API error'));

    const { result } = renderHook(() => useDeviceContacts());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.permissionDenied).toBe(true);
    expect(result.current.contacts).toEqual([]);
  });

  it('uses fallback id when contact has no id', async () => {
    mockRequestPermissions.mockResolvedValue({ status: 'granted' });
    mockGetContacts.mockResolvedValue({
      data: [
        {
          id: undefined,
          name: 'NoId User',
          phoneNumbers: [{ number: '1234567890' }],
        },
      ],
    });

    const { result } = renderHook(() => useDeviceContacts());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.contacts[0].id).toBe('NoId User-1234567890');
  });

  it('uses Unknown for contacts without a name', async () => {
    mockRequestPermissions.mockResolvedValue({ status: 'granted' });
    mockGetContacts.mockResolvedValue({
      data: [
        {
          id: '1',
          name: undefined,
          phoneNumbers: [{ number: '9999999999' }],
        },
      ],
    });

    const { result } = renderHook(() => useDeviceContacts());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.contacts[0].name).toBe('Unknown');
  });

  it('refresh reloads contacts', async () => {
    mockRequestPermissions.mockResolvedValue({ status: 'granted' });
    mockGetContacts.mockResolvedValue({ data: [] });

    const { result } = renderHook(() => useDeviceContacts());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    mockGetContacts.mockResolvedValue({
      data: [{ id: '1', name: 'New', phoneNumbers: [{ number: '111' }] }],
    });

    await act(async () => {
      await result.current.refresh();
    });

    expect(result.current.contacts).toHaveLength(1);
    expect(result.current.contacts[0].name).toBe('New');
  });
});
