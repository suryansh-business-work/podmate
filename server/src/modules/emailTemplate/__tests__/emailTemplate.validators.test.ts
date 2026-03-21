import {
  validateCreateEmailTemplate,
  validateUpdateEmailTemplate,
} from '../emailTemplate.validators';
import type { CreateEmailTemplateInput } from '../emailTemplate.validators';

const validCreateInput: CreateEmailTemplateInput = {
  slug: 'test-template',
  name: 'Test Template',
  subject: 'Test Subject',
  mjmlBody: '<mj-section><mj-column><mj-text>Hello</mj-text></mj-column></mj-section>',
  variables: [{ key: 'userName', description: 'User name', defaultValue: 'User', required: true }],
  category: 'general',
};

describe('validateCreateEmailTemplate', () => {
  it('passes for valid input', () => {
    expect(() => validateCreateEmailTemplate(validCreateInput)).not.toThrow();
  });

  it('throws for empty slug', () => {
    expect(() => validateCreateEmailTemplate({ ...validCreateInput, slug: '' })).toThrow(
      'Slug must be a non-empty lowercase string',
    );
  });

  it('throws for slug with uppercase characters', () => {
    expect(() => validateCreateEmailTemplate({ ...validCreateInput, slug: 'TestSlug' })).toThrow(
      'Slug must be a non-empty lowercase string',
    );
  });

  it('throws for slug with spaces', () => {
    expect(() => validateCreateEmailTemplate({ ...validCreateInput, slug: 'test slug' })).toThrow(
      'Slug must be a non-empty lowercase string',
    );
  });

  it('throws for slug exceeding 100 characters', () => {
    expect(() =>
      validateCreateEmailTemplate({ ...validCreateInput, slug: 'a'.repeat(101) }),
    ).toThrow('Slug must be at most 100 characters');
  });

  it('allows slug with hyphens and underscores', () => {
    expect(() =>
      validateCreateEmailTemplate({ ...validCreateInput, slug: 'test_slug-123' }),
    ).not.toThrow();
  });

  it('throws for empty name', () => {
    expect(() => validateCreateEmailTemplate({ ...validCreateInput, name: '' })).toThrow(
      'Name must be between 1 and 200 characters',
    );
  });

  it('throws for name exceeding 200 characters', () => {
    expect(() =>
      validateCreateEmailTemplate({ ...validCreateInput, name: 'a'.repeat(201) }),
    ).toThrow('Name must be between 1 and 200 characters');
  });

  it('throws for empty subject', () => {
    expect(() => validateCreateEmailTemplate({ ...validCreateInput, subject: '' })).toThrow(
      'Subject must be between 1 and 500 characters',
    );
  });

  it('throws for subject exceeding 500 characters', () => {
    expect(() =>
      validateCreateEmailTemplate({ ...validCreateInput, subject: 'a'.repeat(501) }),
    ).toThrow('Subject must be between 1 and 500 characters');
  });

  it('throws for mjmlBody shorter than 10 characters', () => {
    expect(() => validateCreateEmailTemplate({ ...validCreateInput, mjmlBody: 'short' })).toThrow(
      'MJML body must be at least 10 characters',
    );
  });

  it('throws for mjmlBody exceeding 100000 characters', () => {
    expect(() =>
      validateCreateEmailTemplate({ ...validCreateInput, mjmlBody: 'a'.repeat(100001) }),
    ).toThrow('MJML body must be at most 100000 characters');
  });

  it('throws for empty category', () => {
    expect(() => validateCreateEmailTemplate({ ...validCreateInput, category: '' })).toThrow(
      'Category must be between 1 and 50 characters',
    );
  });

  it('throws for category exceeding 50 characters', () => {
    expect(() =>
      validateCreateEmailTemplate({ ...validCreateInput, category: 'a'.repeat(51) }),
    ).toThrow('Category must be between 1 and 50 characters');
  });

  it('throws for invalid variable key starting with number', () => {
    expect(() =>
      validateCreateEmailTemplate({
        ...validCreateInput,
        variables: [{ key: '123invalid', description: '', defaultValue: '', required: false }],
      }),
    ).toThrow('Invalid variable key: "123invalid"');
  });

  it('throws for variable key with spaces', () => {
    expect(() =>
      validateCreateEmailTemplate({
        ...validCreateInput,
        variables: [{ key: 'user name', description: '', defaultValue: '', required: false }],
      }),
    ).toThrow('Invalid variable key: "user name"');
  });

  it('throws for duplicate variable keys', () => {
    expect(() =>
      validateCreateEmailTemplate({
        ...validCreateInput,
        variables: [
          { key: 'userName', description: '', defaultValue: '', required: false },
          { key: 'userName', description: 'dup', defaultValue: '', required: false },
        ],
      }),
    ).toThrow('Duplicate variable key: "userName"');
  });

  it('allows variables with underscores', () => {
    expect(() =>
      validateCreateEmailTemplate({
        ...validCreateInput,
        variables: [{ key: '_private_var', description: '', defaultValue: '', required: false }],
      }),
    ).not.toThrow();
  });

  it('allows empty variables array', () => {
    expect(() => validateCreateEmailTemplate({ ...validCreateInput, variables: [] })).not.toThrow();
  });
});

describe('validateUpdateEmailTemplate', () => {
  it('passes for empty input', () => {
    expect(() => validateUpdateEmailTemplate({})).not.toThrow();
  });

  it('passes for valid partial update', () => {
    expect(() => validateUpdateEmailTemplate({ name: 'Updated Name' })).not.toThrow();
  });

  it('throws for name exceeding 200 characters', () => {
    expect(() => validateUpdateEmailTemplate({ name: 'a'.repeat(201) })).toThrow(
      'Name must be between 1 and 200 characters',
    );
  });

  it('throws for empty name', () => {
    expect(() => validateUpdateEmailTemplate({ name: '' })).toThrow(
      'Name must be between 1 and 200 characters',
    );
  });

  it('throws for subject exceeding 500 characters', () => {
    expect(() => validateUpdateEmailTemplate({ subject: 'a'.repeat(501) })).toThrow(
      'Subject must be between 1 and 500 characters',
    );
  });

  it('throws for mjmlBody too short', () => {
    expect(() => validateUpdateEmailTemplate({ mjmlBody: 'short' })).toThrow(
      'MJML body must be at least 10 characters',
    );
  });

  it('throws for mjmlBody too long', () => {
    expect(() => validateUpdateEmailTemplate({ mjmlBody: 'a'.repeat(100001) })).toThrow(
      'MJML body must be at most 100000 characters',
    );
  });

  it('throws for category exceeding 50 characters', () => {
    expect(() => validateUpdateEmailTemplate({ category: 'a'.repeat(51) })).toThrow(
      'Category must be between 1 and 50 characters',
    );
  });

  it('validates variables when provided', () => {
    expect(() =>
      validateUpdateEmailTemplate({
        variables: [{ key: '123bad', description: '', defaultValue: '', required: false }],
      }),
    ).toThrow('Invalid variable key: "123bad"');
  });

  it('skips variables validation when not provided', () => {
    expect(() => validateUpdateEmailTemplate({ name: 'Test' })).not.toThrow();
  });

  it('allows valid isActive update', () => {
    expect(() => validateUpdateEmailTemplate({ isActive: false })).not.toThrow();
  });
});
