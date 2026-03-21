import { v4 as uuidv4 } from 'uuid';
import mjml2html from 'mjml';
import { EmailTemplateModel, toEmailTemplate } from './emailTemplate.models';
import type { EmailTemplate } from './emailTemplate.models';
import logger from '../../lib/logger';

const BRAND_COLOR = '#F50247';
const LOGO_TEXT = 'PartyWings';

export interface PaginatedEmailTemplates {
  items: EmailTemplate[];
  total: number;
  page: number;
  limit: number;
}

export async function getEmailTemplates(
  page = 1,
  limit = 20,
  search?: string,
  category?: string,
): Promise<PaginatedEmailTemplates> {
  const filter: Record<string, unknown> = {};
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { slug: { $regex: search, $options: 'i' } },
    ];
  }
  if (category) filter.category = category;

  const [docs, total] = await Promise.all([
    EmailTemplateModel.find(filter)
      .sort({ updatedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean({ virtuals: true }),
    EmailTemplateModel.countDocuments(filter),
  ]);

  return {
    items: docs.map(toEmailTemplate).filter(Boolean) as EmailTemplate[],
    total,
    page,
    limit,
  };
}

export async function getEmailTemplateById(id: string): Promise<EmailTemplate | null> {
  const doc = await EmailTemplateModel.findById(id).lean({ virtuals: true });
  return toEmailTemplate(doc);
}

export async function getEmailTemplateBySlug(slug: string): Promise<EmailTemplate | null> {
  const doc = await EmailTemplateModel.findOne({ slug }).lean({ virtuals: true });
  return toEmailTemplate(doc);
}

export async function createEmailTemplate(input: {
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
}): Promise<EmailTemplate> {
  const existing = await EmailTemplateModel.findOne({ slug: input.slug });
  if (existing) {
    throw new Error(`Template with slug "${input.slug}" already exists`);
  }

  const doc = await EmailTemplateModel.create({
    _id: uuidv4(),
    ...input,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  const lean = await EmailTemplateModel.findById(doc._id).lean({ virtuals: true });
  return toEmailTemplate(lean) as EmailTemplate;
}

export async function updateEmailTemplate(
  id: string,
  input: {
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
  },
): Promise<EmailTemplate | null> {
  const doc = await EmailTemplateModel.findByIdAndUpdate(
    id,
    { $set: { ...input, updatedAt: new Date().toISOString() } },
    { returnDocument: 'after' },
  ).lean({ virtuals: true });
  return toEmailTemplate(doc);
}

export async function deleteEmailTemplate(id: string): Promise<boolean> {
  const result = await EmailTemplateModel.deleteOne({ _id: id });
  return result.deletedCount > 0;
}

/** Validate MJML syntax and return errors/preview HTML */
export function validateMjml(mjmlContent: string): {
  valid: boolean;
  html: string;
  errors: Array<{ line: number; message: string; tagName: string }>;
} {
  try {
    const fullMjml = wrapWithLayout(mjmlContent);
    const result = mjml2html(fullMjml, { validationLevel: 'strict' });
    return {
      valid: result.errors.length === 0,
      html: result.html,
      errors: result.errors.map((e) => ({
        line: e.line,
        message: e.message,
        tagName: e.tagName,
      })),
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown MJML error';
    return {
      valid: false,
      html: '',
      errors: [{ line: 0, message: msg, tagName: '' }],
    };
  }
}

/** Render MJML body with variable substitution */
export function renderTemplate(
  mjmlBody: string,
  variables: Record<string, string>,
): { subject?: string; html: string; text: string } {
  let processed = mjmlBody;
  for (const [key, value] of Object.entries(variables)) {
    const pattern = new RegExp(`\\{\\{\\s*${escapeRegex(key)}\\s*\\}\\}`, 'g');
    processed = processed.replace(pattern, value);
  }

  const fullMjml = wrapWithLayout(processed);
  try {
    const { html, errors } = mjml2html(fullMjml, { validationLevel: 'soft' });
    if (errors.length > 0) {
      errors.forEach((e) => logger.warn('MJML render warning:', e.message));
    }
    const textContent = processed.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    return { html, text: textContent };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'MJML render failed';
    logger.error('Template render error:', msg);
    throw new Error(`Template render failed: ${msg}`);
  }
}

/** Preview a template with sample variable values */
export function previewTemplate(
  mjmlBody: string,
  sampleVariables: Record<string, string>,
): { html: string; errors: Array<{ line: number; message: string; tagName: string }> } {
  let processed = mjmlBody;
  for (const [key, value] of Object.entries(sampleVariables)) {
    const pattern = new RegExp(`\\{\\{\\s*${escapeRegex(key)}\\s*\\}\\}`, 'g');
    processed = processed.replace(pattern, value);
  }

  // Replace any remaining unresolved variables with placeholder
  processed = processed.replace(/\{\{\s*(\w+)\s*\}\}/g, '[$1]');

  const fullMjml = wrapWithLayout(processed);
  try {
    const result = mjml2html(fullMjml, { validationLevel: 'soft' });
    return {
      html: result.html,
      errors: result.errors.map((e) => ({
        line: e.line,
        message: e.message,
        tagName: e.tagName,
      })),
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Preview failed';
    return { html: '', errors: [{ line: 0, message: msg, tagName: '' }] };
  }
}

function wrapWithLayout(bodyContent: string): string {
  return `
    <mjml>
      <mj-head>
        <mj-attributes>
          <mj-all font-family="Arial, sans-serif" />
          <mj-text font-size="14px" color="#333333" line-height="1.6" />
        </mj-attributes>
      </mj-head>
      <mj-body background-color="#f4f4f4">
        <mj-section background-color="${BRAND_COLOR}" padding="20px 0">
          <mj-column>
            <mj-text align="center" color="#ffffff" font-size="28px" font-weight="bold">
              ${LOGO_TEXT}
            </mj-text>
          </mj-column>
        </mj-section>
        ${bodyContent}
        <mj-section padding="20px 0">
          <mj-column>
            <mj-text align="center" color="#999999" font-size="12px">
              © ${new Date().getFullYear()} PartyWings. All rights reserved.
            </mj-text>
            <mj-text align="center" color="#999999" font-size="11px">
              You received this email because you are a PartyWings member.
            </mj-text>
          </mj-column>
        </mj-section>
      </mj-body>
    </mjml>
  `;
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
