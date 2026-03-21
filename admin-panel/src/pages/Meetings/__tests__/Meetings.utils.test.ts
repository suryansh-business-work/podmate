import { describe, it, expect } from 'vitest';
import { formatTimeDisplay, MEETING_TIME_SLOTS } from '../Meetings.utils';

describe('formatTimeDisplay', () => {
  it('formats morning time correctly', () => {
    expect(formatTimeDisplay('09:00')).toBe('9:00 AM');
  });

  it('formats afternoon time correctly', () => {
    expect(formatTimeDisplay('14:00')).toBe('2:00 PM');
  });

  it('formats 12:00 as 12:00 PM', () => {
    expect(formatTimeDisplay('12:00')).toBe('12:00 PM');
  });

  it('formats midnight (00:00) as 12:00 AM', () => {
    expect(formatTimeDisplay('00:00')).toBe('12:00 AM');
  });

  it('formats 12:30 as 12:30 PM', () => {
    expect(formatTimeDisplay('12:30')).toBe('12:30 PM');
  });

  it('formats 17:30 as 5:30 PM', () => {
    expect(formatTimeDisplay('17:30')).toBe('5:30 PM');
  });

  it('formats 11:00 as 11:00 AM', () => {
    expect(formatTimeDisplay('11:00')).toBe('11:00 AM');
  });

  it('formats single-digit minutes with padding', () => {
    expect(formatTimeDisplay('09:05')).toBe('9:05 AM');
  });
});

describe('MEETING_TIME_SLOTS', () => {
  it('contains 16 slots', () => {
    expect(MEETING_TIME_SLOTS).toHaveLength(16);
  });

  it('starts with 09:00', () => {
    expect(MEETING_TIME_SLOTS[0]).toBe('09:00');
  });

  it('ends with 17:30', () => {
    expect(MEETING_TIME_SLOTS[MEETING_TIME_SLOTS.length - 1]).toBe('17:30');
  });

  it('skips lunch hour 13:00-13:30', () => {
    expect(MEETING_TIME_SLOTS).not.toContain('13:00');
    expect(MEETING_TIME_SLOTS).not.toContain('13:30');
  });

  it('includes 12:00 and 12:30', () => {
    expect(MEETING_TIME_SLOTS).toContain('12:00');
    expect(MEETING_TIME_SLOTS).toContain('12:30');
  });

  it('resumes at 14:00 after lunch', () => {
    expect(MEETING_TIME_SLOTS).toContain('14:00');
  });
});
