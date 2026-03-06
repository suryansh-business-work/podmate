import { validatePhone, validateOtp } from '../auth.validators';

describe('Auth Validators', () => {
  describe('validatePhone', () => {
    it('should throw for empty phone number', () => {
      expect(() => validatePhone('')).toThrow('Phone number must be at least 10 digits');
    });

    it('should throw for phone number shorter than 10 digits', () => {
      expect(() => validatePhone('12345')).toThrow('Phone number must be at least 10 digits');
    });

    it('should throw for phone with invalid characters', () => {
      expect(() => validatePhone('123abc7890')).toThrow('Invalid phone number format');
    });

    it('should accept valid 10-digit phone number', () => {
      expect(() => validatePhone('+919876543210')).not.toThrow();
    });

    it('should accept phone number with country code', () => {
      expect(() => validatePhone('+14155551234')).not.toThrow();
    });

    it('should accept phone number without plus sign', () => {
      expect(() => validatePhone('919876543210')).not.toThrow();
    });

    it('should reject phone with spaces in middle after normalization', () => {
      expect(() => validatePhone('+91 987 654 3210')).not.toThrow();
    });
  });

  describe('validateOtp', () => {
    it('should throw for empty OTP', () => {
      expect(() => validateOtp('')).toThrow('OTP must be exactly 6 digits');
    });

    it('should throw for OTP shorter than 6 digits', () => {
      expect(() => validateOtp('123')).toThrow('OTP must be exactly 6 digits');
    });

    it('should throw for OTP longer than 6 digits', () => {
      expect(() => validateOtp('1234567')).toThrow('OTP must be exactly 6 digits');
    });

    it('should throw for OTP with non-digit characters', () => {
      expect(() => validateOtp('12345a')).toThrow('OTP must contain only digits');
    });

    it('should accept valid 6-digit OTP', () => {
      expect(() => validateOtp('123456')).not.toThrow();
    });

    it('should accept OTP with all zeros', () => {
      expect(() => validateOtp('000000')).not.toThrow();
    });

    it('should accept OTP with all nines', () => {
      expect(() => validateOtp('999999')).not.toThrow();
    });
  });
});
