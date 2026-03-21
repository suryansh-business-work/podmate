import resolvers from '../emailTemplate.resolvers';
import * as service from '../emailTemplate.services';
import type { GraphQLContext } from '../../auth/auth.models';
import { UserRole } from '../../user/user.models';

jest.mock('../emailTemplate.services');

const adminContext: GraphQLContext = {
  user: { userId: 'admin-1', phone: '+911234567890', roles: [UserRole.ADMIN] },
};

const userContext: GraphQLContext = {
  user: { userId: 'user-1', phone: '+911234567890', roles: [UserRole.USER] },
};

const unauthContext: GraphQLContext = { user: null };

describe('emailTemplate.resolvers', () => {
  describe('Query.emailTemplates', () => {
    it('returns templates for admin', async () => {
      const mockResult = { items: [], total: 0, page: 1, limit: 20 };
      (service.getEmailTemplates as jest.Mock).mockResolvedValue(mockResult);

      const result = await resolvers.Query.emailTemplates(
        undefined,
        { page: 1, limit: 20 },
        adminContext,
      );

      expect(result).toEqual(mockResult);
      expect(service.getEmailTemplates).toHaveBeenCalledWith(1, 20, undefined, undefined);
    });

    it('throws for non-admin user', async () => {
      await expect(resolvers.Query.emailTemplates(undefined, {}, userContext)).rejects.toThrow();
    });

    it('throws for unauthenticated user', async () => {
      await expect(resolvers.Query.emailTemplates(undefined, {}, unauthContext)).rejects.toThrow();
    });
  });

  describe('Query.emailTemplate', () => {
    it('returns template by id for admin', async () => {
      const mockTemplate = { id: 'tmpl-1', slug: 'test' };
      (service.getEmailTemplateById as jest.Mock).mockResolvedValue(mockTemplate);

      const result = await resolvers.Query.emailTemplate(undefined, { id: 'tmpl-1' }, adminContext);

      expect(result).toEqual(mockTemplate);
    });

    it('throws for non-admin', async () => {
      await expect(
        resolvers.Query.emailTemplate(undefined, { id: 'tmpl-1' }, userContext),
      ).rejects.toThrow();
    });
  });

  describe('Query.emailTemplateBySlug', () => {
    it('returns template by slug for admin', async () => {
      const mockTemplate = { id: 'tmpl-1', slug: 'test-template' };
      (service.getEmailTemplateBySlug as jest.Mock).mockResolvedValue(mockTemplate);

      const result = await resolvers.Query.emailTemplateBySlug(
        undefined,
        { slug: 'test-template' },
        adminContext,
      );

      expect(result).toEqual(mockTemplate);
    });

    it('throws for non-admin', async () => {
      await expect(
        resolvers.Query.emailTemplateBySlug(undefined, { slug: 'test' }, userContext),
      ).rejects.toThrow();
    });
  });

  describe('Mutation.createEmailTemplate', () => {
    const validInput = {
      slug: 'new-template',
      name: 'New Template',
      subject: 'Subject',
      mjmlBody: '<mj-section><mj-column><mj-text>Body</mj-text></mj-column></mj-section>',
      variables: [],
      category: 'general',
    };

    it('creates template for admin', async () => {
      const mockTemplate = { id: 'new-id', ...validInput };
      (service.createEmailTemplate as jest.Mock).mockResolvedValue(mockTemplate);

      const result = await resolvers.Mutation.createEmailTemplate(
        undefined,
        { input: validInput },
        adminContext,
      );

      expect(result).toEqual(mockTemplate);
      expect(service.createEmailTemplate).toHaveBeenCalledWith(validInput);
    });

    it('throws for non-admin', async () => {
      await expect(
        resolvers.Mutation.createEmailTemplate(undefined, { input: validInput }, userContext),
      ).rejects.toThrow();
    });
  });

  describe('Mutation.updateEmailTemplate', () => {
    it('updates template for admin', async () => {
      const mockTemplate = { id: 'tmpl-1', name: 'Updated' };
      (service.updateEmailTemplate as jest.Mock).mockResolvedValue(mockTemplate);

      const result = await resolvers.Mutation.updateEmailTemplate(
        undefined,
        { id: 'tmpl-1', input: { name: 'Updated' } },
        adminContext,
      );

      expect(result).toEqual(mockTemplate);
    });

    it('throws for non-admin', async () => {
      await expect(
        resolvers.Mutation.updateEmailTemplate(
          undefined,
          { id: 'tmpl-1', input: { name: 'X' } },
          userContext,
        ),
      ).rejects.toThrow();
    });
  });

  describe('Mutation.deleteEmailTemplate', () => {
    it('deletes template for admin', async () => {
      (service.deleteEmailTemplate as jest.Mock).mockResolvedValue(true);

      const result = await resolvers.Mutation.deleteEmailTemplate(
        undefined,
        { id: 'tmpl-1' },
        adminContext,
      );

      expect(result).toBe(true);
    });

    it('throws for non-admin', async () => {
      await expect(
        resolvers.Mutation.deleteEmailTemplate(undefined, { id: 'tmpl-1' }, userContext),
      ).rejects.toThrow();
    });
  });

  describe('Mutation.validateMjml', () => {
    it('validates MJML for admin', async () => {
      const mockResult = { valid: true, html: '<html>...</html>', errors: [] };
      (service.validateMjml as jest.Mock).mockReturnValue(mockResult);

      const result = await resolvers.Mutation.validateMjml(
        undefined,
        { mjmlBody: '<mj-section>content</mj-section>' },
        adminContext,
      );

      expect(result).toEqual(mockResult);
    });
  });

  describe('Mutation.previewEmailTemplate', () => {
    it('previews template for admin with parsed variables', async () => {
      const mockResult = { html: '<html>preview</html>', errors: [] };
      (service.previewTemplate as jest.Mock).mockReturnValue(mockResult);

      const result = await resolvers.Mutation.previewEmailTemplate(
        undefined,
        { mjmlBody: '<mj-section>content</mj-section>', variables: '{"userName":"Test"}' },
        adminContext,
      );

      expect(result).toEqual(mockResult);
      expect(service.previewTemplate).toHaveBeenCalledWith('<mj-section>content</mj-section>', {
        userName: 'Test',
      });
    });
  });

  describe('Mutation.renderEmailTemplate', () => {
    it('renders template for admin', async () => {
      const mockTemplate = {
        id: 'tmpl-1',
        slug: 'test',
        mjmlBody: '<mj-section>body</mj-section>',
      };
      (service.getEmailTemplateBySlug as jest.Mock).mockResolvedValue(mockTemplate);
      (service.renderTemplate as jest.Mock).mockReturnValue({
        html: '<html>rendered</html>',
        text: 'rendered',
      });

      const result = await resolvers.Mutation.renderEmailTemplate(
        undefined,
        { slug: 'test', variables: '{"userName":"Test"}' },
        adminContext,
      );

      expect(result).toEqual({ html: '<html>rendered</html>', text: 'rendered' });
    });

    it('throws when template not found', async () => {
      (service.getEmailTemplateBySlug as jest.Mock).mockResolvedValue(null);

      await expect(
        resolvers.Mutation.renderEmailTemplate(
          undefined,
          { slug: 'missing', variables: '{}' },
          adminContext,
        ),
      ).rejects.toThrow('Template "missing" not found');
    });
  });
});
