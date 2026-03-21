import * as service from '../emailTemplate.services';
import { EmailTemplateModel } from '../emailTemplate.models';

jest.mock('../emailTemplate.models', () => ({
  EmailTemplateModel: {
    find: jest.fn(),
    findById: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    deleteOne: jest.fn(),
    countDocuments: jest.fn(),
  },
  toEmailTemplate: jest.fn(),
}));

jest.mock('../../../lib/logger', () => ({
  __esModule: true,
  default: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
}));

jest.mock('uuid', () => ({
  v4: jest.fn().mockReturnValue('mock-uuid'),
}));

const mockModel = EmailTemplateModel as unknown as Record<string, jest.Mock>;

describe('emailTemplate.services - seedDefaultTemplates', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates all 7 default templates when none exist', async () => {
    mockModel.findOne.mockResolvedValue(null);
    mockModel.create.mockResolvedValue({ _id: 'mock-uuid' });

    const result = await service.seedDefaultTemplates();

    expect(result.created).toHaveLength(7);
    expect(result.skipped).toHaveLength(0);
    expect(result.errors).toHaveLength(0);
    expect(result.created).toContain('email-otp');
    expect(result.created).toContain('profile-update');
    expect(result.created).toContain('email-verified');
    expect(result.created).toContain('meeting-confirmation');
    expect(result.created).toContain('meeting-admin-notification');
    expect(result.created).toContain('meeting-invite');
    expect(result.created).toContain('meeting-reschedule');
    expect(mockModel.create).toHaveBeenCalledTimes(7);
  });

  it('skips templates that already exist', async () => {
    mockModel.findOne.mockResolvedValue({ _id: 'existing' });

    const result = await service.seedDefaultTemplates();

    expect(result.created).toHaveLength(0);
    expect(result.skipped).toHaveLength(7);
    expect(result.errors).toHaveLength(0);
    expect(mockModel.create).not.toHaveBeenCalled();
  });

  it('handles mixed create and skip', async () => {
    let callCount = 0;
    mockModel.findOne.mockImplementation(() => {
      callCount++;
      return Promise.resolve(callCount <= 3 ? { _id: 'existing' } : null);
    });
    mockModel.create.mockResolvedValue({ _id: 'mock-uuid' });

    const result = await service.seedDefaultTemplates();

    expect(result.skipped).toHaveLength(3);
    expect(result.created).toHaveLength(4);
    expect(result.errors).toHaveLength(0);
  });

  it('reports errors without stopping', async () => {
    let callCount = 0;
    mockModel.findOne.mockResolvedValue(null);
    mockModel.create.mockImplementation(() => {
      callCount++;
      if (callCount === 2) {
        return Promise.reject(new Error('DB write failed'));
      }
      return Promise.resolve({ _id: 'mock-uuid' });
    });

    const result = await service.seedDefaultTemplates();

    expect(result.created).toHaveLength(6);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]).toContain('DB write failed');
  });

  it('creates templates with correct structure', async () => {
    mockModel.findOne.mockResolvedValue(null);
    mockModel.create.mockResolvedValue({ _id: 'mock-uuid' });

    await service.seedDefaultTemplates();

    const firstCall = mockModel.create.mock.calls[0][0];
    expect(firstCall).toHaveProperty('_id');
    expect(firstCall).toHaveProperty('slug', 'email-otp');
    expect(firstCall).toHaveProperty('name');
    expect(firstCall).toHaveProperty('subject');
    expect(firstCall).toHaveProperty('mjmlBody');
    expect(firstCall).toHaveProperty('variables');
    expect(firstCall).toHaveProperty('category');
    expect(firstCall).toHaveProperty('isActive', true);
    expect(firstCall).toHaveProperty('createdAt');
    expect(firstCall).toHaveProperty('updatedAt');
  });

  it('uses {{variable}} syntax in seeded templates', async () => {
    mockModel.findOne.mockResolvedValue(null);
    mockModel.create.mockResolvedValue({ _id: 'mock-uuid' });

    await service.seedDefaultTemplates();

    const otpCall = mockModel.create.mock.calls[0][0];
    expect(otpCall.mjmlBody).toContain('{{otp}}');
    expect(otpCall.subject).toContain('{{otp}}');

    const profileCall = mockModel.create.mock.calls[1][0];
    expect(profileCall.mjmlBody).toContain('{{userName}}');
  });

  it('handles non-Error exceptions in seed', async () => {
    mockModel.findOne.mockResolvedValue(null);
    mockModel.create.mockRejectedValue('string error');

    const result = await service.seedDefaultTemplates();

    expect(result.errors).toHaveLength(7);
    expect(result.created).toHaveLength(0);
  });
});
