export function validatePhone(phone: string): void {
  if (!phone || phone.length < 10) {
    throw new Error('Phone number must be at least 10 digits');
  }
  const phoneRegex = /^\+?[1-9]\d{6,14}$/;
  if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
    throw new Error('Invalid phone number format');
  }
}

export function validateOtp(otp: string): void {
  if (!otp || otp.length !== 6) {
    throw new Error('OTP must be exactly 6 digits');
  }
  if (!/^\d{6}$/.test(otp)) {
    throw new Error('OTP must contain only digits');
  }
}
