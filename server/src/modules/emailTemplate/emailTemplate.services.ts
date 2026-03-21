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
    const textContent = processed
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
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

interface DefaultTemplateDefinition {
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

const DEFAULT_TEMPLATES: DefaultTemplateDefinition[] = [
  {
    slug: 'email-otp',
    name: 'Email OTP Verification',
    subject: '{{otp}} is your PartyWings email verification code',
    category: 'authentication',
    variables: [
      {
        key: 'otp',
        description: 'One-time verification code',
        defaultValue: '123456',
        required: true,
      },
    ],
    mjmlBody: `<mj-section background-color="#ffffff" padding="30px 20px">
  <mj-column>
    <mj-text font-size="22px" font-weight="bold" color="#333333">
      Verify Your Email
    </mj-text>
    <mj-text padding-top="10px">
      Use the code below to verify your email address on PartyWings.
    </mj-text>
    <mj-text align="center" font-size="36px" font-weight="bold" color="#F50247"
      padding="20px 0" letter-spacing="8px">
      {{otp}}
    </mj-text>
    <mj-text>
      This code is valid for <strong>5 minutes</strong>. Do not share it with anyone.
    </mj-text>
    <mj-divider border-color="#eeeeee" padding="20px 0" />
    <mj-text color="#999999" font-size="12px">
      If you didn't request this, you can safely ignore this email.
    </mj-text>
  </mj-column>
</mj-section>`,
  },
  {
    slug: 'profile-update',
    name: 'Profile Updated Notification',
    subject: 'Your PartyWings profile has been updated',
    category: 'account',
    variables: [
      { key: 'userName', description: 'User display name', defaultValue: 'User', required: true },
    ],
    mjmlBody: `<mj-section background-color="#ffffff" padding="30px 20px">
  <mj-column>
    <mj-text font-size="22px" font-weight="bold" color="#333333">
      Profile Updated
    </mj-text>
    <mj-text padding-top="10px">
      Hi {{userName}},
    </mj-text>
    <mj-text>
      Your PartyWings profile has been successfully updated.
    </mj-text>
    <mj-text>
      If you didn't make this change, please contact our support team immediately.
    </mj-text>
    <mj-button background-color="#F50247" color="#ffffff" href="mailto:support@partywings.com"
      border-radius="8px" padding="20px 0">
      Contact Support
    </mj-button>
    <mj-divider border-color="#eeeeee" padding="10px 0" />
    <mj-text color="#999999" font-size="12px">
      This is an automated notification from PartyWings.
    </mj-text>
  </mj-column>
</mj-section>`,
  },
  {
    slug: 'email-verified',
    name: 'Email Verified Confirmation',
    subject: 'Email verified on PartyWings',
    category: 'account',
    variables: [
      { key: 'userName', description: 'User display name', defaultValue: 'User', required: true },
    ],
    mjmlBody: `<mj-section background-color="#ffffff" padding="30px 20px">
  <mj-column>
    <mj-text font-size="22px" font-weight="bold" color="#333333">
      Email Verified ✓
    </mj-text>
    <mj-text padding-top="10px">
      Hi {{userName}},
    </mj-text>
    <mj-text>
      Your email address has been successfully verified on PartyWings. You'll now receive
      important updates and notifications at this address.
    </mj-text>
    <mj-divider border-color="#eeeeee" padding="20px 0" />
    <mj-text color="#999999" font-size="12px">
      This is an automated notification from PartyWings.
    </mj-text>
  </mj-column>
</mj-section>`,
  },
  {
    slug: 'meeting-confirmation',
    name: 'Meeting Request Confirmation',
    subject: 'Meeting Request Received - PartyWings',
    category: 'meeting',
    variables: [
      { key: 'userName', description: 'User display name', defaultValue: 'User', required: true },
      {
        key: 'meetingDate',
        description: 'Meeting date',
        defaultValue: '2025-01-01',
        required: true,
      },
      { key: 'meetingTime', description: 'Meeting time', defaultValue: '10:00 AM', required: true },
    ],
    mjmlBody: `<mj-section background-color="#ffffff" padding="30px 20px">
  <mj-column>
    <mj-text font-size="22px" font-weight="bold" color="#333333">
      Meeting Request Received
    </mj-text>
    <mj-text padding-top="10px">
      Hi {{userName}},
    </mj-text>
    <mj-text>
      Your 1:1 meeting request has been received. Here are the details:
    </mj-text>
    <mj-table>
      <tr>
        <td style="padding: 8px 16px; font-weight: bold; color: #333;">Date</td>
        <td style="padding: 8px 16px; color: #555;">{{meetingDate}}</td>
      </tr>
      <tr>
        <td style="padding: 8px 16px; font-weight: bold; color: #333;">Time</td>
        <td style="padding: 8px 16px; color: #555;">{{meetingTime}}</td>
      </tr>
      <tr>
        <td style="padding: 8px 16px; font-weight: bold; color: #333;">Status</td>
        <td style="padding: 8px 16px; color: #F50247;">Pending Confirmation</td>
      </tr>
    </mj-table>
    <mj-text padding-top="16px">
      Our team will review your request and send you a meeting invite shortly.
    </mj-text>
    <mj-divider border-color="#eeeeee" padding="20px 0" />
    <mj-text color="#999999" font-size="12px">
      This is an automated notification from PartyWings.
    </mj-text>
  </mj-column>
</mj-section>`,
  },
  {
    slug: 'meeting-admin-notification',
    name: 'Meeting Admin Notification',
    subject: 'New Meeting Request from {{userName}} - PartyWings',
    category: 'meeting',
    variables: [
      { key: 'userName', description: 'User display name', defaultValue: 'User', required: true },
      {
        key: 'userEmail',
        description: 'User email address',
        defaultValue: 'user@example.com',
        required: true,
      },
      {
        key: 'meetingDate',
        description: 'Meeting date',
        defaultValue: '2025-01-01',
        required: true,
      },
      { key: 'meetingTime', description: 'Meeting time', defaultValue: '10:00 AM', required: true },
    ],
    mjmlBody: `<mj-section background-color="#ffffff" padding="30px 20px">
  <mj-column>
    <mj-text font-size="22px" font-weight="bold" color="#333333">
      New Meeting Request
    </mj-text>
    <mj-text padding-top="10px">
      A new 1:1 meeting request has been submitted.
    </mj-text>
    <mj-table>
      <tr>
        <td style="padding: 8px 16px; font-weight: bold; color: #333;">User</td>
        <td style="padding: 8px 16px; color: #555;">{{userName}}</td>
      </tr>
      <tr>
        <td style="padding: 8px 16px; font-weight: bold; color: #333;">Email</td>
        <td style="padding: 8px 16px; color: #555;">{{userEmail}}</td>
      </tr>
      <tr>
        <td style="padding: 8px 16px; font-weight: bold; color: #333;">Date</td>
        <td style="padding: 8px 16px; color: #555;">{{meetingDate}}</td>
      </tr>
      <tr>
        <td style="padding: 8px 16px; font-weight: bold; color: #333;">Time</td>
        <td style="padding: 8px 16px; color: #555;">{{meetingTime}}</td>
      </tr>
    </mj-table>
    <mj-text padding-top="16px">
      Please review and confirm this meeting request in the admin panel.
    </mj-text>
    <mj-divider border-color="#eeeeee" padding="20px 0" />
    <mj-text color="#999999" font-size="12px">
      This is an automated admin notification from PartyWings.
    </mj-text>
  </mj-column>
</mj-section>`,
  },
  {
    slug: 'meeting-invite',
    name: 'Meeting Confirmed Invite',
    subject: 'Meeting Confirmed - PartyWings',
    category: 'meeting',
    variables: [
      { key: 'userName', description: 'User display name', defaultValue: 'User', required: true },
      {
        key: 'meetingDate',
        description: 'Meeting date',
        defaultValue: '2025-01-01',
        required: true,
      },
      { key: 'meetingTime', description: 'Meeting time', defaultValue: '10:00 AM', required: true },
      {
        key: 'meetingLink',
        description: 'Meeting join URL',
        defaultValue: 'https://meet.example.com',
        required: true,
      },
    ],
    mjmlBody: `<mj-section background-color="#ffffff" padding="30px 20px">
  <mj-column>
    <mj-text font-size="22px" font-weight="bold" color="#333333">
      Meeting Confirmed ✓
    </mj-text>
    <mj-text padding-top="10px">
      Hi {{userName}},
    </mj-text>
    <mj-text>
      Your 1:1 meeting has been confirmed! Here are the details:
    </mj-text>
    <mj-table>
      <tr>
        <td style="padding: 8px 16px; font-weight: bold; color: #333;">Date</td>
        <td style="padding: 8px 16px; color: #555;">{{meetingDate}}</td>
      </tr>
      <tr>
        <td style="padding: 8px 16px; font-weight: bold; color: #333;">Time</td>
        <td style="padding: 8px 16px; color: #555;">{{meetingTime}}</td>
      </tr>
    </mj-table>
    <mj-button background-color="#F50247" color="#ffffff" href="{{meetingLink}}"
      border-radius="8px" padding="20px 0" font-size="16px">
      Join Meeting
    </mj-button>
    <mj-text padding-top="10px" font-size="13px" color="#666666">
      Meeting Link: {{meetingLink}}
    </mj-text>
    <mj-divider border-color="#eeeeee" padding="20px 0" />
    <mj-text color="#999999" font-size="12px">
      This is an automated notification from PartyWings.
    </mj-text>
  </mj-column>
</mj-section>`,
  },
  {
    slug: 'meeting-reschedule',
    name: 'Meeting Rescheduled Notification',
    subject: 'Meeting Rescheduled - PartyWings',
    category: 'meeting',
    variables: [
      { key: 'userName', description: 'User display name', defaultValue: 'User', required: true },
      {
        key: 'previousDateTime',
        description: 'Previous date and time',
        defaultValue: '2025-01-01 10:00 AM',
        required: true,
      },
      {
        key: 'newDate',
        description: 'New meeting date',
        defaultValue: '2025-01-02',
        required: true,
      },
      { key: 'newTime', description: 'New meeting time', defaultValue: '11:00 AM', required: true },
      {
        key: 'meetingLink',
        description: 'Meeting join URL',
        defaultValue: 'https://meet.example.com',
        required: false,
      },
    ],
    mjmlBody: `<mj-section background-color="#ffffff" padding="30px 20px">
  <mj-column>
    <mj-text font-size="22px" font-weight="bold" color="#333333">
      Meeting Rescheduled
    </mj-text>
    <mj-text padding-top="10px">
      Hi {{userName}},
    </mj-text>
    <mj-text>
      Your 1:1 meeting has been rescheduled. Here are the updated details:
    </mj-text>
    <mj-table>
      <tr>
        <td style="padding: 8px 16px; font-weight: bold; color: #333;">Previous</td>
        <td style="padding: 8px 16px; color: #999; text-decoration: line-through;">{{previousDateTime}}</td>
      </tr>
      <tr>
        <td style="padding: 8px 16px; font-weight: bold; color: #333;">New Date</td>
        <td style="padding: 8px 16px; color: #555;">{{newDate}}</td>
      </tr>
      <tr>
        <td style="padding: 8px 16px; font-weight: bold; color: #333;">New Time</td>
        <td style="padding: 8px 16px; color: #555;">{{newTime}}</td>
      </tr>
    </mj-table>
    <mj-divider border-color="#eeeeee" padding="20px 0" />
    <mj-text color="#999999" font-size="12px">
      This is an automated notification from PartyWings.
    </mj-text>
  </mj-column>
</mj-section>`,
  },
];

export interface SeedResult {
  created: string[];
  skipped: string[];
  errors: string[];
}

export async function seedDefaultTemplates(): Promise<SeedResult> {
  const result: SeedResult = { created: [], skipped: [], errors: [] };

  for (const tpl of DEFAULT_TEMPLATES) {
    try {
      const existing = await EmailTemplateModel.findOne({ slug: tpl.slug });
      if (existing) {
        result.skipped.push(tpl.slug);
        continue;
      }
      await EmailTemplateModel.create({
        _id: uuidv4(),
        ...tpl,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      result.created.push(tpl.slug);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      result.errors.push(`${tpl.slug}: ${msg}`);
      logger.error(`Seed template "${tpl.slug}" failed:`, msg);
    }
  }

  logger.info(
    `Seed templates: ${result.created.length} created, ${result.skipped.length} skipped, ${result.errors.length} errors`,
  );
  return result;
}
