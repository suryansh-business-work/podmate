jest.mock('mjml', () => ({
  __esModule: true,
  default: jest.fn(),
}));

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

import mjml2html from 'mjml';
import { validateMjml, renderTemplate, previewTemplate } from '../emailTemplate.services';

const mockMjml = mjml2html as unknown as jest.Mock;

describe('emailTemplate.services - MJML Operations', () => {
  beforeEach(() => {
    mockMjml.mockReturnValue({
      html: '<html><body>Mocked MJML output</body></html>',
      errors: [],
    });
  });

  describe('validateMjml', () => {
    it('returns valid result for proper MJML', () => {
      const result = validateMjml(
        '<mj-section><mj-column><mj-text>Hello</mj-text></mj-column></mj-section>',
      );

      expect(result.valid).toBe(true);
      expect(result.html).toContain('Mocked MJML output');
      expect(result.errors).toHaveLength(0);
    });

    it('returns errors when MJML has validation errors', () => {
      mockMjml.mockReturnValue({
        html: '<html>partial</html>',
        errors: [{ line: 5, message: 'Invalid tag', tagName: 'mj-invalid' }],
      });

      const result = validateMjml('<mj-invalid>broken</mj-invalid>');

      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].message).toBe('Invalid tag');
      expect(result.errors[0].tagName).toBe('mj-invalid');
    });

    it('handles mjml2html throwing an exception', () => {
      mockMjml.mockImplementation(() => {
        throw new Error('MJML crash');
      });

      const result = validateMjml('<broken>');

      expect(result.valid).toBe(false);
      expect(result.html).toBe('');
      expect(result.errors[0].message).toBe('MJML crash');
    });

    it('handles non-Error exceptions', () => {
      mockMjml.mockImplementation(() => {
        throw 'string error';
      });

      const result = validateMjml('<broken>');

      expect(result.valid).toBe(false);
      expect(result.errors[0].message).toBe('Unknown MJML error');
    });
  });

  describe('renderTemplate', () => {
    it('substitutes variables in MJML body', () => {
      const result = renderTemplate(
        '<mj-section><mj-column><mj-text>Hello {{userName}}</mj-text></mj-column></mj-section>',
        { userName: 'John' },
      );

      expect(result.html).toBeDefined();
      expect(result.text).toContain('Hello John');
    });

    it('handles multiple variables', () => {
      const result = renderTemplate(
        '<mj-section><mj-column><mj-text>{{greeting}} {{userName}}, code: {{code}}</mj-text></mj-column></mj-section>',
        { greeting: 'Hi', userName: 'Alice', code: '1234' },
      );

      expect(result.text).toContain('Hi Alice');
      expect(result.text).toContain('1234');
    });

    it('handles variables with whitespace in mustache syntax', () => {
      const result = renderTemplate(
        '<mj-section><mj-column><mj-text>Hello {{ userName }}</mj-text></mj-column></mj-section>',
        { userName: 'Bob' },
      );

      expect(result.text).toContain('Hello Bob');
    });

    it('leaves unmatched variables as-is', () => {
      const result = renderTemplate(
        '<mj-section><mj-column><mj-text>Hello {{userName}} {{missing}}</mj-text></mj-column></mj-section>',
        { userName: 'Carol' },
      );

      expect(result.text).toContain('Hello Carol');
      expect(result.text).toContain('{{missing}}');
    });

    it('returns text without HTML tags', () => {
      const result = renderTemplate(
        '<mj-section><mj-column><mj-text>Plain text content</mj-text></mj-column></mj-section>',
        {},
      );

      expect(result.text).toContain('Plain text content');
      expect(result.text).not.toContain('<mj-text>');
    });

    it('throws when mjml2html throws during render', () => {
      mockMjml.mockImplementation(() => {
        throw new Error('Render failure');
      });

      expect(() =>
        renderTemplate(
          '<mj-section><mj-column><mj-text>Hi</mj-text></mj-column></mj-section>',
          {},
        ),
      ).toThrow('Template render failed: Render failure');
    });
  });

  describe('previewTemplate', () => {
    it('replaces provided variables', () => {
      const result = previewTemplate(
        '<mj-section><mj-column><mj-text>Hi {{userName}}</mj-text></mj-column></mj-section>',
        { userName: 'Dave' },
      );

      expect(result.html).toBeDefined();
      expect(result.errors).toHaveLength(0);
    });

    it('returns html from rendering', () => {
      const result = previewTemplate(
        '<mj-section><mj-column><mj-text>Test</mj-text></mj-column></mj-section>',
        {},
      );

      expect(result.html).toContain('Mocked MJML output');
    });

    it('handles empty variables object', () => {
      const result = previewTemplate(
        '<mj-section><mj-column><mj-text>No vars</mj-text></mj-column></mj-section>',
        {},
      );

      expect(result.html).toBeDefined();
      expect(result.errors).toHaveLength(0);
    });

    it('returns errors when preview rendering fails', () => {
      mockMjml.mockImplementation(() => {
        throw new Error('Preview crash');
      });

      const result = previewTemplate(
        '<mj-section><mj-column><mj-text>Broken</mj-text></mj-column></mj-section>',
        {},
      );

      expect(result.html).toBe('');
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].message).toBe('Preview crash');
    });
  });
});
