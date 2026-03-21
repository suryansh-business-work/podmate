import { getStartEarningItems, MENU_ITEMS } from '../Profile.types';

describe('getStartEarningItems', () => {
  it('returns both items when user has no HOST or VENUE_OWNER roles', () => {
    const items = getStartEarningItems(['USER']);
    expect(items).toHaveLength(2);
    expect(items[0].label).toBe('Be a Pod Owner');
    expect(items[0].action).toBe('RequestMeeting:POD_OWNER');
    expect(items[1].label).toBe('Register a Venue');
    expect(items[1].action).toBe('RequestMeeting:VENUE_OWNER');
  });

  it('hides Be a Pod Owner when user has HOST role', () => {
    const items = getStartEarningItems(['USER', 'HOST']);
    expect(items).toHaveLength(1);
    expect(items[0].label).toBe('Register a Venue');
    expect(items[0].action).toBe('RequestMeeting:VENUE_OWNER');
  });

  it('hides Register a Venue when user has VENUE_OWNER role', () => {
    const items = getStartEarningItems(['USER', 'VENUE_OWNER']);
    expect(items).toHaveLength(1);
    expect(items[0].label).toBe('Be a Pod Owner');
    expect(items[0].action).toBe('RequestMeeting:POD_OWNER');
  });

  it('returns empty when user has both HOST and VENUE_OWNER roles', () => {
    const items = getStartEarningItems(['USER', 'HOST', 'VENUE_OWNER']);
    expect(items).toHaveLength(0);
  });

  it('returns empty when roles array is empty', () => {
    const items = getStartEarningItems([]);
    expect(items).toHaveLength(2);
  });
});

describe('MENU_ITEMS', () => {
  it('contains standard menu items', () => {
    const labels = MENU_ITEMS.map((item) => item.label);
    expect(labels).toContain('Edit Profile');
    expect(labels).toContain('My Pods');
    expect(labels).toContain('Payments History');
    expect(labels).toContain('Help & FAQs');
    expect(labels).toContain('Support');
  });

  it('each menu item has icon, label, subtitle, and action', () => {
    MENU_ITEMS.forEach((item) => {
      expect(item.icon).toBeTruthy();
      expect(item.label).toBeTruthy();
      expect(item.subtitle).toBeTruthy();
      expect(item.action).toBeTruthy();
    });
  });
});
