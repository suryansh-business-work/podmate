export interface CreateEmailTemplateInput {
  slug: string;
  name: string;
  subject: string;
  mjmlBody: string;
  variables: Array<{
    key: string;
    description: string;
    defaultValue: string;
    required: boolean;
  }>;
  category: string;
}

export interface UpdateEmailTemplateInput {
  name?: string;
  subject?: string;
  mjmlBody?: string;
  variables?: Array<{
    key: string;
    description: string;
    defaultValue: string;
    required: boolean;
  }>;
  category?: string;
  isActive?: boolean;
}

export function validateCreateEmailTemplate(input: CreateEmailTemplateInput): void {
  if (!input.slug || !/^[a-z0-9_-]+$/.test(input.slug)) {
    throw new Error('Slug must be a non-empty lowercase string (a-z, 0-9, _, -)');
  }
  if (input.slug.length > 100) {
    throw new Error('Slug must be at most 100 characters');
  }
  if (!input.name || input.name.length < 1 || input.name.length > 200) {
    throw new Error('Name must be between 1 and 200 characters');
  }
  if (!input.subject || input.subject.length < 1 || input.subject.length > 500) {
    throw new Error('Subject must be between 1 and 500 characters');
  }
  if (!input.mjmlBody || input.mjmlBody.length < 10) {
    throw new Error('MJML body must be at least 10 characters');
  }
  if (input.mjmlBody.length > 100000) {
    throw new Error('MJML body must be at most 100000 characters');
  }
  if (!input.category || input.category.length < 1 || input.category.length > 50) {
    throw new Error('Category must be between 1 and 50 characters');
  }
  validateVariables(input.variables);
}

export function validateUpdateEmailTemplate(input: UpdateEmailTemplateInput): void {
  if (input.name !== undefined && (input.name.length < 1 || input.name.length > 200)) {
    throw new Error('Name must be between 1 and 200 characters');
  }
  if (input.subject !== undefined && (input.subject.length < 1 || input.subject.length > 500)) {
    throw new Error('Subject must be between 1 and 500 characters');
  }
  if (input.mjmlBody !== undefined && input.mjmlBody.length < 10) {
    throw new Error('MJML body must be at least 10 characters');
  }
  if (input.mjmlBody !== undefined && input.mjmlBody.length > 100000) {
    throw new Error('MJML body must be at most 100000 characters');
  }
  if (input.category !== undefined && (input.category.length < 1 || input.category.length > 50)) {
    throw new Error('Category must be between 1 and 50 characters');
  }
  if (input.variables !== undefined) {
    validateVariables(input.variables);
  }
}

function validateVariables(
  variables: Array<{ key: string; description: string; defaultValue: string; required: boolean }>,
): void {
  if (!Array.isArray(variables)) return;
  const keys = new Set<string>();
  for (const v of variables) {
    if (!v.key || !/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(v.key)) {
      throw new Error(`Invalid variable key: "${v.key}". Must be a valid identifier.`);
    }
    if (keys.has(v.key)) {
      throw new Error(`Duplicate variable key: "${v.key}"`);
    }
    keys.add(v.key);
  }
}
