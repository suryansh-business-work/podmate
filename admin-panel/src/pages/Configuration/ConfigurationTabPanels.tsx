import React from 'react';
import { Box } from '@mui/material';
import ConfigTabSection from './ConfigTabSection';
import SmtpFormFields from './SmtpFormFields';
import { ImageKitFormFields, SlackFormFields, GoogleMapsFormFields } from './IntegrationFormFields';
import StripeFormFields from './StripeFormFields';
import GoogleCalendarFormFields from './GoogleCalendarFormFields';
import { AppSettingsFormFields, DevelopmentFormFields } from './AppDevFormFields';
import type { useConfigurationState } from './useConfigurationState';

interface TabPanelProps {
  children: React.ReactNode;
  value: number;
  index: number;
}

const Panel: React.FC<TabPanelProps> = ({ children, value, index }) => (
  <Box role="tabpanel" hidden={value !== index} sx={{ pt: 3 }}>
    {value === index && children}
  </Box>
);

type ConfigState = ReturnType<typeof useConfigurationState>;

interface Props {
  state: ConfigState;
}

const ConfigurationTabPanels: React.FC<Props> = ({ state: c }) => {
  const saveSmtp = () =>
    c.saveCategory('smtp', [
      { key: 'smtp_host', value: c.smtp.host },
      { key: 'smtp_port', value: c.smtp.port },
      { key: 'smtp_user', value: c.smtp.user },
      { key: 'smtp_password', value: c.smtp.password },
      { key: 'smtp_fromName', value: c.smtp.fromName },
      { key: 'smtp_fromEmail', value: c.smtp.fromEmail },
    ]);
  const saveImageKit = () =>
    c.saveCategory('imagekit', [
      { key: 'imagekit_public_key', value: c.imagekit.publicKey },
      { key: 'imagekit_private_key', value: c.imagekit.privateKey },
      { key: 'imagekit_url_endpoint', value: c.imagekit.urlEndpoint },
    ]);
  const saveSlack = () =>
    c.saveCategory('slack', [
      { key: 'slack_webhook_url', value: c.slack.webhookUrl },
      { key: 'slack_channel', value: c.slack.channel },
      { key: 'slack_enabled', value: c.slack.enabled },
    ]);
  const saveStripe = () =>
    c.saveCategory('stripe', [
      { key: 'stripe_publishable_key', value: c.stripe.publishableKey },
      { key: 'stripe_secret_key', value: c.stripe.secretKey },
      { key: 'stripe_webhook_secret', value: c.stripe.webhookSecret },
      { key: 'stripe_enabled', value: c.stripe.enabled },
    ]);
  const saveGoogleMaps = () =>
    c.saveCategory('googlemaps', [
      { key: 'google_maps_api_key', value: c.googleMaps.apiKey },
      { key: 'google_maps_enabled', value: c.googleMaps.enabled },
    ]);
  const saveGoogleCal = () =>
    c.saveCategory('googlecalendar', [
      { key: 'google_calendar_client_id', value: c.googleCalendar.clientId },
      { key: 'google_calendar_client_secret', value: c.googleCalendar.clientSecret },
      { key: 'google_calendar_refresh_token', value: c.googleCalendar.refreshToken },
      { key: 'google_calendar_calendar_id', value: c.googleCalendar.calendarId },
      { key: 'google_calendar_enabled', value: c.googleCalendar.enabled },
    ]);
  const saveApp = () =>
    c.saveCategory('app', [
      { key: 'app_name', value: c.appConfig.appName },
      { key: 'app_description', value: c.appConfig.appDescription },
      { key: 'app_logo', value: c.appConfig.appLogo },
      { key: 'app_splash_video_url', value: c.appConfig.splashVideoUrl },
    ]);
  const saveDev = () =>
    c.saveCategory('dev', [
      { key: 'dev_mode', value: c.devConfig.devMode },
      { key: 'dummy_checkout', value: c.devConfig.dummyCheckout },
    ]);

  return (
    <>
      <Panel value={c.tab} index={0}>
        <ConfigTabSection
          title="Email / SMTP Configuration"
          description="Configure SMTP settings for sending emails."
          saving={c.saving}
          onSave={saveSmtp}
          testing={c.testingSmtp}
          onTest={() => c.handleTest('smtp')}
        >
          <SmtpFormFields smtp={c.smtp} onChange={(k, v) => c.setSmtp((p) => ({ ...p, [k]: v }))} />
        </ConfigTabSection>
      </Panel>
      <Panel value={c.tab} index={1}>
        <ConfigTabSection
          title="ImageKit Configuration"
          description="Configure ImageKit for media uploads and processing."
          saving={c.saving}
          onSave={saveImageKit}
          testing={c.testingImageKit}
          onTest={() => c.handleTest('imagekit')}
        >
          <ImageKitFormFields
            config={c.imagekit}
            onChange={(k, v) => c.setImagekit((p) => ({ ...p, [k]: v }))}
          />
        </ConfigTabSection>
      </Panel>
      <Panel value={c.tab} index={2}>
        <ConfigTabSection
          title="Slack Configuration"
          description="Configure Slack webhook for notifications."
          saving={c.saving}
          onSave={saveSlack}
        >
          <SlackFormFields
            config={c.slack}
            onChange={(k, v) => c.setSlack((p) => ({ ...p, [k]: v }))}
          />
        </ConfigTabSection>
      </Panel>
      <Panel value={c.tab} index={3}>
        <ConfigTabSection
          title="Stripe Payment Configuration"
          description="Configure Stripe API keys for processing payments and refunds."
          saving={c.saving}
          onSave={saveStripe}
        >
          <StripeFormFields
            config={c.stripe}
            onChange={(k, v) => c.setStripe((p) => ({ ...p, [k]: v }))}
          />
        </ConfigTabSection>
      </Panel>
      <Panel value={c.tab} index={4}>
        <ConfigTabSection
          title="Google Maps Configuration"
          description="Configure Google Maps & Places API for location services."
          saving={c.saving}
          onSave={saveGoogleMaps}
        >
          <GoogleMapsFormFields
            config={c.googleMaps}
            onChange={(k, v) => c.setGoogleMaps((p) => ({ ...p, [k]: v }))}
          />
        </ConfigTabSection>
      </Panel>
      <Panel value={c.tab} index={5}>
        <ConfigTabSection
          title="Google Calendar / Meet Configuration"
          description="Configure Google Calendar API for auto-creating Google Meet links when confirming meetings."
          saving={c.saving}
          onSave={saveGoogleCal}
          testing={c.testingGoogleCal}
          onTest={() => c.handleTest('googlecalendar')}
        >
          <GoogleCalendarFormFields
            config={c.googleCalendar}
            onChange={(k, v) => c.setGoogleCalendar((p) => ({ ...p, [k]: v }))}
          />
        </ConfigTabSection>
      </Panel>
      <Panel value={c.tab} index={6}>
        <ConfigTabSection
          title="App Settings"
          description="Configure app-level settings like name, logo, and splash video."
          saving={c.saving}
          onSave={saveApp}
        >
          <AppSettingsFormFields
            config={c.appConfig}
            onChange={(k, v) => c.setAppConfig((p) => ({ ...p, [k]: v }))}
          />
        </ConfigTabSection>
      </Panel>
      <Panel value={c.tab} index={7}>
        <ConfigTabSection
          title="Development Settings"
          description="Configure development mode and testing options."
          saving={c.saving}
          onSave={saveDev}
        >
          <DevelopmentFormFields
            config={c.devConfig}
            onChange={(k, v) => c.setDevConfig((p) => ({ ...p, [k]: v }))}
          />
        </ConfigTabSection>
      </Panel>
    </>
  );
};

export default ConfigurationTabPanels;
