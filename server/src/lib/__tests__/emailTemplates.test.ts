jest.mock('../../modules/emailTemplate/emailTemplate.services', () => ({
  getEmailTemplateBySlug: jest.fn(),
  renderTemplate: jest.fn(),
}));

jest.mock('../logger', () => ({
  __esModule: true,
  default: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
}));

import {
  emailOtpTemplate,
  profileUpdateTemplate,
  emailVerifiedTemplate,
  meetingConfirmationTemplate,
  meetingAdminNotificationTemplate,
  meetingInviteTemplate,
  meetingRescheduleTemplate,
} from '../emailTemplates';
import {
  getEmailTemplateBySlug,
  renderTemplate,
} from '../../modules/emailTemplate/emailTemplate.services';

const mockGetBySlug = getEmailTemplateBySlug as jest.Mock;
const mockRender = renderTemplate as jest.Mock;

describe('emailTemplates - DB-first with hardcoded fallback', () => {
  describe('emailOtpTemplate', () => {
    it('uses hardcoded template when no DB template exists', async () => {
      mockGetBySlug.mockResolvedValue(null);

      const result = await emailOtpTemplate('123456');

      expect(result.subject).toContain('123456');
      expect(result.html).toBeDefined();
      expect(result.text).toContain('123456');
    });

    it('uses DB template when available and active', async () => {
      mockGetBySlug.mockResolvedValue({
        slug: 'email-otp',
        subject: 'Your code is {{otp}}',
        mjmlBody: '<mj-section><mj-column><mj-text>Code: {{otp}}</mj-text></mj-column></mj-section>',
        isActive: true,
      });
      mockRender.mockReturnValue({ html: '<html>DB</html>', text: 'DB text' });

      const result = await emailOtpTemplate('999999');

      expect(result.subject).toBe('Your code is 999999');
      expect(result.html).toBe('<html>DB</html>');
    });

    it('falls back to hardcoded when DB template is inactive', async () => {
      mockGetBySlug.mockResolvedValue({
        slug: 'email-otp',
        subject: 'DB subject',
        isActive: false,
      });

      const result = await emailOtpTemplate('555555');

      expect(result.subject).toContain('555555');
      expect(mockRender).not.toHaveBeenCalled();
    });

    it('falls back to hardcoded when DB lookup fails', async () => {
      mockGetBySlug.mockRejectedValue(new Error('DB error'));

      const result = await emailOtpTemplate('111111');

      expect(result.subject).toContain('111111');
      expect(result.html).toBeDefined();
    });
  });

  describe('profileUpdateTemplate', () => {
    it('uses hardcoded template when no DB template', async () => {
      mockGetBySlug.mockResolvedValue(null);

      const result = await profileUpdateTemplate('John');

      expect(result.text).toContain('John');
      expect(result.subject).toBeDefined();
    });
  });

  describe('emailVerifiedTemplate', () => {
    it('uses hardcoded template when no DB template', async () => {
      mockGetBySlug.mockResolvedValue(null);

      const result = await emailVerifiedTemplate('Alice');

      expect(result.text).toContain('Alice');
      expect(result.subject).toBeDefined();
    });
  });

  describe('meetingConfirmationTemplate', () => {
    it('uses hardcoded template when no DB template', async () => {
      mockGetBySlug.mockResolvedValue(null);

      const result = await meetingConfirmationTemplate('Bob', '2024-12-25', '14:00');

      expect(result.text).toContain('Bob');
      expect(result.text).toContain('2024-12-25');
      expect(result.text).toContain('14:00');
    });
  });

  describe('meetingAdminNotificationTemplate', () => {
    it('uses hardcoded template when no DB template', async () => {
      mockGetBySlug.mockResolvedValue(null);

      const result = await meetingAdminNotificationTemplate(
        'Carol',
        'carol@test.com',
        '2024-12-25',
        '14:00',
      );

      expect(result.text).toContain('Carol');
      expect(result.text).toContain('carol@test.com');
    });
  });

  describe('meetingInviteTemplate', () => {
    it('uses hardcoded template when no DB template', async () => {
      mockGetBySlug.mockResolvedValue(null);

      const result = await meetingInviteTemplate(
        'Dave',
        '2024-12-25',
        '14:00',
        'https://meet.example.com/abc',
      );

      expect(result.text).toContain('Dave');
      expect(result.text).toContain('https://meet.example.com/abc');
    });
  });

  describe('meetingRescheduleTemplate', () => {
    it('uses hardcoded template when no DB template', async () => {
      mockGetBySlug.mockResolvedValue(null);

      const result = await meetingRescheduleTemplate(
        'Eve',
        '2024-12-20 10:00',
        '2024-12-25',
        '14:00',
        'https://meet.example.com/xyz',
      );

      expect(result.text).toContain('Eve');
      expect(result.text).toContain('2024-12-25');
    });

    it('handles empty meeting link', async () => {
      mockGetBySlug.mockResolvedValue(null);

      const result = await meetingRescheduleTemplate(
        'Frank',
        '2024-12-20 10:00',
        '2024-12-25',
        '14:00',
        '',
      );

      expect(result.text).toContain('Frank');
      expect(result.subject).toBeDefined();
    });
  });
});
