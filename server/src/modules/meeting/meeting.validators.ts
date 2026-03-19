export function validateMeetingInput(
  email: string,
  meetingDate: string,
  meetingTime: string,
): void {
  const emailTrimmed = email.trim();
  if (!emailTrimmed) {
    throw new Error('Email is required');
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(emailTrimmed)) {
    throw new Error('Invalid email format');
  }

  if (!meetingDate.trim()) {
    throw new Error('Meeting date is required');
  }

  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(meetingDate.trim())) {
    throw new Error('Meeting date must be in YYYY-MM-DD format');
  }

  const selectedDate = new Date(meetingDate.trim());
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (selectedDate < today) {
    throw new Error('Cannot select a past date');
  }

  if (!meetingTime.trim()) {
    throw new Error('Meeting time is required');
  }

  const timeRegex = /^\d{2}:\d{2}$/;
  if (!timeRegex.test(meetingTime.trim())) {
    throw new Error('Meeting time must be in HH:mm format');
  }
}
