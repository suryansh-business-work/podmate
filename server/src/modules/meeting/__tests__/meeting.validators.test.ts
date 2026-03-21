import { validateMeetingInput } from '../meeting.validators';

describe('validateMeetingInput', () => {
  const validEmail = 'test@example.com';
  const validDate = '2027-06-15';
  const validTime = '10:00';
  const validPurpose = 'POD_OWNER' as const;

  it('accepts valid input with POD_OWNER purpose', () => {
    expect(() => validateMeetingInput(validEmail, validDate, validTime, 'POD_OWNER')).not.toThrow();
  });

  it('accepts valid input with VENUE_OWNER purpose', () => {
    expect(() =>
      validateMeetingInput(validEmail, validDate, validTime, 'VENUE_OWNER'),
    ).not.toThrow();
  });

  it('accepts valid input with GENERAL purpose', () => {
    expect(() => validateMeetingInput(validEmail, validDate, validTime, 'GENERAL')).not.toThrow();
  });

  it('throws when email is empty', () => {
    expect(() => validateMeetingInput('', validDate, validTime, validPurpose)).toThrow(
      'Email is required',
    );
  });

  it('throws when email is whitespace only', () => {
    expect(() => validateMeetingInput('   ', validDate, validTime, validPurpose)).toThrow(
      'Email is required',
    );
  });

  it('throws when email format is invalid', () => {
    expect(() => validateMeetingInput('invalid', validDate, validTime, validPurpose)).toThrow(
      'Invalid email format',
    );
  });

  it('throws when email has no domain', () => {
    expect(() => validateMeetingInput('test@', validDate, validTime, validPurpose)).toThrow(
      'Invalid email format',
    );
  });

  it('throws when meeting date is empty', () => {
    expect(() => validateMeetingInput(validEmail, '', validTime, validPurpose)).toThrow(
      'Meeting date is required',
    );
  });

  it('throws when meeting date format is invalid', () => {
    expect(() => validateMeetingInput(validEmail, '15-06-2027', validTime, validPurpose)).toThrow(
      'Meeting date must be in YYYY-MM-DD format',
    );
  });

  it('throws when meeting date is in the past', () => {
    expect(() => validateMeetingInput(validEmail, '2020-01-01', validTime, validPurpose)).toThrow(
      'Cannot select a past date',
    );
  });

  it('throws when meeting time is empty', () => {
    expect(() => validateMeetingInput(validEmail, validDate, '', validPurpose)).toThrow(
      'Meeting time is required',
    );
  });

  it('throws when meeting time format is invalid', () => {
    expect(() => validateMeetingInput(validEmail, validDate, '10:00:00', validPurpose)).toThrow(
      'Meeting time must be in HH:mm format',
    );
  });

  it('throws when purpose is invalid', () => {
    expect(() =>
      validateMeetingInput(validEmail, validDate, validTime, 'INVALID' as 'POD_OWNER'),
    ).toThrow('Invalid meeting purpose');
  });
});
