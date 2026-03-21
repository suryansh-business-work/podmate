import { PURPOSE_CONFIG } from '../RequestMeeting.types';
import type { MeetingPurpose } from '../RequestMeeting.types';

describe('PURPOSE_CONFIG', () => {
  const purposes: MeetingPurpose[] = ['POD_OWNER', 'VENUE_OWNER', 'GENERAL'];

  it.each(purposes)('has complete config for %s', (purpose) => {
    const config = PURPOSE_CONFIG[purpose];
    expect(config).toBeDefined();
    expect(config.headerTitle).toBeTruthy();
    expect(config.subtitle).toBeTruthy();
    expect(config.emailHelperText).toBeTruthy();
    expect(config.successTitle).toBeTruthy();
    expect(config.successSubtitle).toContain('{email}');
  });

  it('has correct header title for POD_OWNER', () => {
    expect(PURPOSE_CONFIG.POD_OWNER.headerTitle).toBe('Become a Pod Owner');
  });

  it('has correct header title for VENUE_OWNER', () => {
    expect(PURPOSE_CONFIG.VENUE_OWNER.headerTitle).toBe('Register a Venue');
  });

  it('has correct header title for GENERAL', () => {
    expect(PURPOSE_CONFIG.GENERAL.headerTitle).toBe('Request Meeting');
  });

  it('POD_OWNER success subtitle mentions Pod Owner', () => {
    expect(PURPOSE_CONFIG.POD_OWNER.successSubtitle).toContain('Pod Owner');
  });

  it('VENUE_OWNER success subtitle mentions venue', () => {
    expect(PURPOSE_CONFIG.VENUE_OWNER.successSubtitle).toContain('venue');
  });
});
