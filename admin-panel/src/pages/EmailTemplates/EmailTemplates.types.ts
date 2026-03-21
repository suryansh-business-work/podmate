export interface TemplateVariable {
  key: string;
  description: string;
  defaultValue: string;
  required: boolean;
}

export interface EmailTemplate {
  id: string;
  slug: string;
  name: string;
  subject: string;
  mjmlBody: string;
  variables: TemplateVariable[];
  category: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedEmailTemplates {
  items: EmailTemplate[];
  total: number;
  page: number;
  limit: number;
}

export interface MjmlValidationError {
  line: number;
  message: string;
  tagName: string;
}

export interface MjmlValidationResult {
  valid: boolean;
  html: string;
  errors: MjmlValidationError[];
}

export interface TemplatePreviewResult {
  html: string;
  errors: MjmlValidationError[];
}

export const TEMPLATE_CATEGORIES = [
  'authentication',
  'meeting',
  'notification',
  'account',
  'general',
] as const;

export const DEFAULT_MJML_BODY = `<mj-section background-color="#ffffff" padding="30px 20px">
  <mj-column>
    <mj-text font-size="22px" font-weight="bold" color="#333333">
      Your Title Here
    </mj-text>
    <mj-text padding-top="10px">
      Hi {{userName}},
    </mj-text>
    <mj-text>
      Your email content goes here. Use {{variableName}} for dynamic values.
    </mj-text>
    <mj-divider border-color="#eeeeee" padding="20px 0" />
    <mj-text color="#999999" font-size="12px">
      This is an automated notification from PartyWings.
    </mj-text>
  </mj-column>
</mj-section>`;
