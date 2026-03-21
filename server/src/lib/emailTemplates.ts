import mjml2html from 'mjml';

const BRAND_COLOR = '#F50247';
const LOGO_TEXT = 'PartyWings';

function wrapMjml(bodyContent: string): string {
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

function renderMjml(mjmlContent: string): string {
  const { html, errors } = mjml2html(mjmlContent, { validationLevel: 'soft' });
  if (errors.length > 0) {
    errors.forEach((e: { message: string }) => console.warn('MJML warning:', e.message));
  }
  return html;
}

export function emailOtpTemplate(otp: string): { subject: string; html: string; text: string } {
  const mjmlContent = wrapMjml(`
    <mj-section background-color="#ffffff" padding="30px 20px">
      <mj-column>
        <mj-text font-size="22px" font-weight="bold" color="#333333">
          Verify Your Email
        </mj-text>
        <mj-text padding-top="10px">
          Use the code below to verify your email address on PartyWings.
        </mj-text>
        <mj-text align="center" font-size="36px" font-weight="bold" color="${BRAND_COLOR}"
          padding="20px 0" letter-spacing="8px">
          ${otp}
        </mj-text>
        <mj-text>
          This code is valid for <strong>5 minutes</strong>. Do not share it with anyone.
        </mj-text>
        <mj-divider border-color="#eeeeee" padding="20px 0" />
        <mj-text color="#999999" font-size="12px">
          If you didn't request this, you can safely ignore this email.
        </mj-text>
      </mj-column>
    </mj-section>
  `);

  return {
    subject: `${otp} is your PartyWings email verification code`,
    html: renderMjml(mjmlContent),
    text: `Your PartyWings email verification code is: ${otp}. Valid for 5 minutes.`,
  };
}

export function profileUpdateTemplate(userName: string): {
  subject: string;
  html: string;
  text: string;
} {
  const mjmlContent = wrapMjml(`
    <mj-section background-color="#ffffff" padding="30px 20px">
      <mj-column>
        <mj-text font-size="22px" font-weight="bold" color="#333333">
          Profile Updated
        </mj-text>
        <mj-text padding-top="10px">
          Hi ${userName},
        </mj-text>
        <mj-text>
          Your PartyWings profile has been successfully updated.
        </mj-text>
        <mj-text>
          If you didn't make this change, please contact our support team immediately.
        </mj-text>
        <mj-button background-color="${BRAND_COLOR}" color="#ffffff" href="mailto:support@partywings.com"
          border-radius="8px" padding="20px 0">
          Contact Support
        </mj-button>
        <mj-divider border-color="#eeeeee" padding="10px 0" />
        <mj-text color="#999999" font-size="12px">
          This is an automated notification from PartyWings.
        </mj-text>
      </mj-column>
    </mj-section>
  `);

  return {
    subject: 'Your PartyWings profile has been updated',
    html: renderMjml(mjmlContent),
    text: `Hi ${userName}, your PartyWings profile has been successfully updated. If you didn't make this change, please contact support.`,
  };
}

export function emailVerifiedTemplate(userName: string): {
  subject: string;
  html: string;
  text: string;
} {
  const mjmlContent = wrapMjml(`
    <mj-section background-color="#ffffff" padding="30px 20px">
      <mj-column>
        <mj-text font-size="22px" font-weight="bold" color="#333333">
          Email Verified ✓
        </mj-text>
        <mj-text padding-top="10px">
          Hi ${userName},
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
    </mj-section>
  `);

  return {
    subject: 'Email verified on PartyWings',
    html: renderMjml(mjmlContent),
    text: `Hi ${userName}, your email has been successfully verified on PartyWings.`,
  };
}

export function meetingConfirmationTemplate(
  userName: string,
  meetingDate: string,
  meetingTime: string,
): { subject: string; html: string; text: string } {
  const mjmlContent = wrapMjml(`
    <mj-section background-color="#ffffff" padding="30px 20px">
      <mj-column>
        <mj-text font-size="22px" font-weight="bold" color="#333333">
          Meeting Request Received
        </mj-text>
        <mj-text padding-top="10px">
          Hi ${userName},
        </mj-text>
        <mj-text>
          Your 1:1 meeting request has been received. Here are the details:
        </mj-text>
        <mj-table>
          <tr>
            <td style="padding: 8px 16px; font-weight: bold; color: #333;">Date</td>
            <td style="padding: 8px 16px; color: #555;">${meetingDate}</td>
          </tr>
          <tr>
            <td style="padding: 8px 16px; font-weight: bold; color: #333;">Time</td>
            <td style="padding: 8px 16px; color: #555;">${meetingTime}</td>
          </tr>
          <tr>
            <td style="padding: 8px 16px; font-weight: bold; color: #333;">Status</td>
            <td style="padding: 8px 16px; color: ${BRAND_COLOR};">Pending Confirmation</td>
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
    </mj-section>
  `);

  return {
    subject: 'Meeting Request Received - PartyWings',
    html: renderMjml(mjmlContent),
    text: `Hi ${userName}, your 1:1 meeting request for ${meetingDate} at ${meetingTime} has been received. Our team will review and confirm shortly.`,
  };
}

export function meetingAdminNotificationTemplate(
  userName: string,
  userEmail: string,
  meetingDate: string,
  meetingTime: string,
): { subject: string; html: string; text: string } {
  const mjmlContent = wrapMjml(`
    <mj-section background-color="#ffffff" padding="30px 20px">
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
            <td style="padding: 8px 16px; color: #555;">${userName}</td>
          </tr>
          <tr>
            <td style="padding: 8px 16px; font-weight: bold; color: #333;">Email</td>
            <td style="padding: 8px 16px; color: #555;">${userEmail}</td>
          </tr>
          <tr>
            <td style="padding: 8px 16px; font-weight: bold; color: #333;">Date</td>
            <td style="padding: 8px 16px; color: #555;">${meetingDate}</td>
          </tr>
          <tr>
            <td style="padding: 8px 16px; font-weight: bold; color: #333;">Time</td>
            <td style="padding: 8px 16px; color: #555;">${meetingTime}</td>
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
    </mj-section>
  `);

  return {
    subject: `New Meeting Request from ${userName} - PartyWings`,
    html: renderMjml(mjmlContent),
    text: `New meeting request from ${userName} (${userEmail}) for ${meetingDate} at ${meetingTime}. Please review in the admin panel.`,
  };
}

export function meetingInviteTemplate(
  userName: string,
  meetingDate: string,
  meetingTime: string,
  meetingLink: string,
): { subject: string; html: string; text: string } {
  const mjmlContent = wrapMjml(`
    <mj-section background-color="#ffffff" padding="30px 20px">
      <mj-column>
        <mj-text font-size="22px" font-weight="bold" color="#333333">
          Meeting Confirmed ✓
        </mj-text>
        <mj-text padding-top="10px">
          Hi ${userName},
        </mj-text>
        <mj-text>
          Your 1:1 meeting has been confirmed! Here are the details:
        </mj-text>
        <mj-table>
          <tr>
            <td style="padding: 8px 16px; font-weight: bold; color: #333;">Date</td>
            <td style="padding: 8px 16px; color: #555;">${meetingDate}</td>
          </tr>
          <tr>
            <td style="padding: 8px 16px; font-weight: bold; color: #333;">Time</td>
            <td style="padding: 8px 16px; color: #555;">${meetingTime}</td>
          </tr>
        </mj-table>
        <mj-button background-color="${BRAND_COLOR}" color="#ffffff" href="${meetingLink}"
          border-radius="8px" padding="20px 0" font-size="16px">
          Join Meeting
        </mj-button>
        <mj-text padding-top="10px" font-size="13px" color="#666666">
          Meeting Link: ${meetingLink}
        </mj-text>
        <mj-divider border-color="#eeeeee" padding="20px 0" />
        <mj-text color="#999999" font-size="12px">
          This is an automated notification from PartyWings.
        </mj-text>
      </mj-column>
    </mj-section>
  `);

  return {
    subject: 'Meeting Confirmed - PartyWings',
    html: renderMjml(mjmlContent),
    text: `Hi ${userName}, your 1:1 meeting on ${meetingDate} at ${meetingTime} is confirmed. Join here: ${meetingLink}`,
  };
}

export function meetingRescheduleTemplate(
  userName: string,
  previousDateTime: string,
  newDate: string,
  newTime: string,
  meetingLink: string,
): { subject: string; html: string; text: string } {
  const mjmlContent = wrapMjml(`
    <mj-section background-color="#ffffff" padding="30px 20px">
      <mj-column>
        <mj-text font-size="22px" font-weight="bold" color="#333333">
          Meeting Rescheduled
        </mj-text>
        <mj-text padding-top="10px">
          Hi ${userName},
        </mj-text>
        <mj-text>
          Your 1:1 meeting has been rescheduled. Here are the updated details:
        </mj-text>
        <mj-table>
          <tr>
            <td style="padding: 8px 16px; font-weight: bold; color: #333;">Previous</td>
            <td style="padding: 8px 16px; color: #999; text-decoration: line-through;">${previousDateTime}</td>
          </tr>
          <tr>
            <td style="padding: 8px 16px; font-weight: bold; color: #333;">New Date</td>
            <td style="padding: 8px 16px; color: #555;">${newDate}</td>
          </tr>
          <tr>
            <td style="padding: 8px 16px; font-weight: bold; color: #333;">New Time</td>
            <td style="padding: 8px 16px; color: #555;">${newTime}</td>
          </tr>
        </mj-table>
        ${
          meetingLink
            ? `
        <mj-button background-color="${BRAND_COLOR}" color="#ffffff" href="${meetingLink}"
          border-radius="8px" padding="20px 0" font-size="16px">
          Join Meeting
        </mj-button>
        <mj-text padding-top="10px" font-size="13px" color="#666666">
          Meeting Link: ${meetingLink}
        </mj-text>
        `
            : `
        <mj-text padding-top="10px" color="#666666">
          A meeting link will be provided once the meeting is confirmed.
        </mj-text>
        `
        }
        <mj-divider border-color="#eeeeee" padding="20px 0" />
        <mj-text color="#999999" font-size="12px">
          This is an automated notification from PartyWings.
        </mj-text>
      </mj-column>
    </mj-section>
  `);

  return {
    subject: 'Meeting Rescheduled - PartyWings',
    html: renderMjml(mjmlContent),
    text: `Hi ${userName}, your meeting previously scheduled for ${previousDateTime} has been rescheduled to ${newDate} at ${newTime}.${meetingLink ? ` Join here: ${meetingLink}` : ''}`,
  };
}
