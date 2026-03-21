import * as service from '../emailTemplate.services';
import { EmailTemplateModel, toEmailTemplate } from '../emailTemplate.models';

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

const mockModel = EmailTemplateModel as unknown as Record<string, jest.Mock>;
const mockToTemplate = toEmailTemplate as jest.Mock;

function chainableMock(result: unknown) {
  const chain: Record<string, jest.Mock> = {};
  chain.sort = jest.fn().mockReturnValue(chain);
  chain.skip = jest.fn().mockReturnValue(chain);
  chain.limit = jest.fn().mockReturnValue(chain);
  chain.lean = jest.fn().mockReturnValue(result);
  return chain;
}

const sampleDoc = {
  _id: 'tmpl-1',
  slug: 'test-template',
  name: 'Test',
  subject: 'Subject',
  mjmlBody: '<mj-section><mj-column><mj-text>test</mj-text></mj-column></mj-section>',
  variables: [],
  category: 'general',
  isActive: true,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};
const sampleTemplate = { ...sampleDoc, id: 'tmpl-1' };

describe('emailTemplate.services - CRUD', () => {
  describe('getEmailTemplates', () => {
    it('returns paginated results', async () => {
      mockModel.find.mockReturnValue(chainableMock([sampleDoc]));
      mockModel.countDocuments.mockResolvedValue(1);
      mockToTemplate.mockReturnValue(sampleTemplate);

      const result = await service.getEmailTemplates(1, 20);

      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
      expect(result.items).toHaveLength(1);
    });

    it('applies search filter with $or', async () => {
      mockModel.find.mockReturnValue(chainableMock([]));
      mockModel.countDocuments.mockResolvedValue(0);

      await service.getEmailTemplates(1, 20, 'test');

      const findFilter = mockModel.find.mock.calls[0][0];
      expect(findFilter.$or).toBeDefined();
      expect(findFilter.$or).toHaveLength(2);
    });

    it('applies category filter', async () => {
      mockModel.find.mockReturnValue(chainableMock([]));
      mockModel.countDocuments.mockResolvedValue(0);

      await service.getEmailTemplates(1, 20, undefined, 'meeting');

      const findFilter = mockModel.find.mock.calls[0][0];
      expect(findFilter.category).toBe('meeting');
    });

    it('uses default pagination values', async () => {
      mockModel.find.mockReturnValue(chainableMock([]));
      mockModel.countDocuments.mockResolvedValue(0);

      const result = await service.getEmailTemplates();

      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
    });

    it('filters out null results from toEmailTemplate', async () => {
      mockModel.find.mockReturnValue(chainableMock([sampleDoc, null]));
      mockModel.countDocuments.mockResolvedValue(2);
      mockToTemplate.mockReturnValueOnce(sampleTemplate).mockReturnValueOnce(null);

      const result = await service.getEmailTemplates(1, 20);

      expect(result.items).toHaveLength(1);
    });

    it('applies correct skip for pagination', async () => {
      const chain = chainableMock([]);
      mockModel.find.mockReturnValue(chain);
      mockModel.countDocuments.mockResolvedValue(0);

      await service.getEmailTemplates(3, 10);

      expect(chain.skip).toHaveBeenCalledWith(20);
    });
  });

  describe('getEmailTemplateById', () => {
    it('returns template when found', async () => {
      mockModel.findById.mockReturnValue({ lean: jest.fn().mockReturnValue(sampleDoc) });
      mockToTemplate.mockReturnValue(sampleTemplate);

      const result = await service.getEmailTemplateById('tmpl-1');

      expect(result).toEqual(sampleTemplate);
    });

    it('returns null when not found', async () => {
      mockModel.findById.mockReturnValue({ lean: jest.fn().mockReturnValue(null) });
      mockToTemplate.mockReturnValue(null);

      const result = await service.getEmailTemplateById('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('getEmailTemplateBySlug', () => {
    it('returns template when found', async () => {
      mockModel.findOne.mockReturnValue({ lean: jest.fn().mockReturnValue(sampleDoc) });
      mockToTemplate.mockReturnValue(sampleTemplate);

      const result = await service.getEmailTemplateBySlug('test-template');

      expect(result).toEqual(sampleTemplate);
    });

    it('returns null when not found', async () => {
      mockModel.findOne.mockReturnValue({ lean: jest.fn().mockReturnValue(null) });
      mockToTemplate.mockReturnValue(null);

      const result = await service.getEmailTemplateBySlug('missing');

      expect(result).toBeNull();
    });
  });

  describe('createEmailTemplate', () => {
    it('creates template successfully', async () => {
      mockModel.findOne.mockResolvedValue(null);
      mockModel.create.mockResolvedValue({ _id: 'new-id' });
      mockModel.findById.mockReturnValue({ lean: jest.fn().mockReturnValue(sampleDoc) });
      mockToTemplate.mockReturnValue(sampleTemplate);

      const result = await service.createEmailTemplate({
        slug: 'new-template',
        name: 'New Template',
        subject: 'Subject',
        mjmlBody: '<mj-section><mj-column><mj-text>body</mj-text></mj-column></mj-section>',
        variables: [],
        category: 'general',
      });

      expect(result).toEqual(sampleTemplate);
      expect(mockModel.create).toHaveBeenCalled();
    });

    it('throws for duplicate slug', async () => {
      mockModel.findOne.mockResolvedValue(sampleDoc);

      await expect(
        service.createEmailTemplate({
          slug: 'test-template',
          name: 'Duplicate',
          subject: 'Subject',
          mjmlBody: '<mj-section><mj-column><mj-text>body</mj-text></mj-column></mj-section>',
          variables: [],
          category: 'general',
        }),
      ).rejects.toThrow('Template with slug "test-template" already exists');
    });
  });

  describe('updateEmailTemplate', () => {
    it('updates template successfully', async () => {
      mockModel.findByIdAndUpdate.mockReturnValue({
        lean: jest.fn().mockReturnValue(sampleDoc),
      });
      mockToTemplate.mockReturnValue(sampleTemplate);

      const result = await service.updateEmailTemplate('tmpl-1', { name: 'Updated' });

      expect(result).toEqual(sampleTemplate);
    });

    it('returns null when template not found', async () => {
      mockModel.findByIdAndUpdate.mockReturnValue({
        lean: jest.fn().mockReturnValue(null),
      });
      mockToTemplate.mockReturnValue(null);

      const result = await service.updateEmailTemplate('missing', { name: 'Updated' });

      expect(result).toBeNull();
    });
  });

  describe('deleteEmailTemplate', () => {
    it('returns true when deleted', async () => {
      mockModel.deleteOne.mockResolvedValue({ deletedCount: 1 });

      const result = await service.deleteEmailTemplate('tmpl-1');

      expect(result).toBe(true);
    });

    it('returns false when not found', async () => {
      mockModel.deleteOne.mockResolvedValue({ deletedCount: 0 });

      const result = await service.deleteEmailTemplate('missing');

      expect(result).toBe(false);
    });
  });
});
