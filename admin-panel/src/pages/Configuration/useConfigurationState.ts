import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_APP_SETTINGS } from '../../graphql/queries';
import {
  UPSERT_SETTING,
  TEST_SMTP_CONNECTION,
  TEST_IMAGEKIT_CONNECTION,
  TEST_GOOGLE_CALENDAR_CONNECTION,
} from '../../graphql/mutations';
import type {
  AppSetting,
  SettingsData,
  SmtpConfig,
  ImageKitConfig,
  SlackConfig,
  AppConfig,
  DevConfig,
  StripeConfig,
  GoogleMapsConfig,
  GoogleCalendarConfig,
  TestConnectionResult,
} from './Configuration.types';
import {
  DEFAULT_SMTP,
  DEFAULT_IMAGEKIT,
  DEFAULT_SLACK,
  DEFAULT_APP_CONFIG,
  DEFAULT_DEV_CONFIG,
  DEFAULT_STRIPE,
  DEFAULT_GOOGLE_MAPS,
  DEFAULT_GOOGLE_CALENDAR,
} from './Configuration.types';

export function useConfigurationState() {
  const [tab, setTab] = useState(0);
  const [smtp, setSmtp] = useState<SmtpConfig>({ ...DEFAULT_SMTP });
  const [imagekit, setImagekit] = useState<ImageKitConfig>({ ...DEFAULT_IMAGEKIT });
  const [slack, setSlack] = useState<SlackConfig>({ ...DEFAULT_SLACK });
  const [appConfig, setAppConfig] = useState<AppConfig>({ ...DEFAULT_APP_CONFIG });
  const [devConfig, setDevConfig] = useState<DevConfig>({ ...DEFAULT_DEV_CONFIG });
  const [stripe, setStripe] = useState<StripeConfig>({ ...DEFAULT_STRIPE });
  const [googleMaps, setGoogleMaps] = useState<GoogleMapsConfig>({ ...DEFAULT_GOOGLE_MAPS });
  const [googleCalendar, setGoogleCalendar] = useState<GoogleCalendarConfig>({
    ...DEFAULT_GOOGLE_CALENDAR,
  });
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [testResult, setTestResult] = useState<TestConnectionResult | null>(null);

  const { data, loading } = useQuery<SettingsData>(GET_APP_SETTINGS, {
    fetchPolicy: 'cache-and-network',
  });
  const [upsertSetting, { loading: saving }] = useMutation(UPSERT_SETTING);
  const [testSmtp, { loading: testingSmtp }] = useMutation(TEST_SMTP_CONNECTION);
  const [testImageKit, { loading: testingImageKit }] = useMutation(TEST_IMAGEKIT_CONNECTION);
  const [testGoogleCal, { loading: testingGoogleCal }] = useMutation(
    TEST_GOOGLE_CALENDAR_CONNECTION,
  );

  const populateFromSettings = useCallback((settings: AppSetting[]) => {
    const get = (cat: string, key: string) =>
      settings.find((s) => s.category === cat && s.key === key)?.value ?? '';
    setSmtp({
      host: get('smtp', 'smtp_host') || DEFAULT_SMTP.host,
      port: get('smtp', 'smtp_port') || DEFAULT_SMTP.port,
      user: get('smtp', 'smtp_user') || DEFAULT_SMTP.user,
      password: get('smtp', 'smtp_password') || DEFAULT_SMTP.password,
      fromName: get('smtp', 'smtp_fromName') || DEFAULT_SMTP.fromName,
      fromEmail: get('smtp', 'smtp_fromEmail') || DEFAULT_SMTP.fromEmail,
    });
    setImagekit({
      publicKey: get('imagekit', 'imagekit_public_key') || DEFAULT_IMAGEKIT.publicKey,
      privateKey: get('imagekit', 'imagekit_private_key') || DEFAULT_IMAGEKIT.privateKey,
      urlEndpoint: get('imagekit', 'imagekit_url_endpoint') || DEFAULT_IMAGEKIT.urlEndpoint,
    });
    setSlack({
      webhookUrl: get('slack', 'slack_webhook_url') || DEFAULT_SLACK.webhookUrl,
      channel: get('slack', 'slack_channel') || DEFAULT_SLACK.channel,
      enabled: get('slack', 'slack_enabled') || DEFAULT_SLACK.enabled,
    });
    setAppConfig({
      appName: get('app', 'app_name') || DEFAULT_APP_CONFIG.appName,
      appDescription: get('app', 'app_description') || DEFAULT_APP_CONFIG.appDescription,
      appLogo: get('app', 'app_logo') || DEFAULT_APP_CONFIG.appLogo,
      splashVideoUrl: get('app', 'app_splash_video_url') || DEFAULT_APP_CONFIG.splashVideoUrl,
    });
    setDevConfig({
      devMode: get('dev', 'dev_mode') || DEFAULT_DEV_CONFIG.devMode,
      dummyCheckout: get('dev', 'dummy_checkout') || DEFAULT_DEV_CONFIG.dummyCheckout,
    });
    setStripe({
      publishableKey: get('stripe', 'stripe_publishable_key') || DEFAULT_STRIPE.publishableKey,
      secretKey: get('stripe', 'stripe_secret_key') || DEFAULT_STRIPE.secretKey,
      webhookSecret: get('stripe', 'stripe_webhook_secret') || DEFAULT_STRIPE.webhookSecret,
      enabled: get('stripe', 'stripe_enabled') || DEFAULT_STRIPE.enabled,
    });
    setGoogleMaps({
      apiKey: get('googlemaps', 'google_maps_api_key') || DEFAULT_GOOGLE_MAPS.apiKey,
      enabled: get('googlemaps', 'google_maps_enabled') || DEFAULT_GOOGLE_MAPS.enabled,
    });
    setGoogleCalendar({
      clientId:
        get('googlecalendar', 'google_calendar_client_id') || DEFAULT_GOOGLE_CALENDAR.clientId,
      clientSecret:
        get('googlecalendar', 'google_calendar_client_secret') ||
        DEFAULT_GOOGLE_CALENDAR.clientSecret,
      refreshToken:
        get('googlecalendar', 'google_calendar_refresh_token') ||
        DEFAULT_GOOGLE_CALENDAR.refreshToken,
      calendarId:
        get('googlecalendar', 'google_calendar_calendar_id') || DEFAULT_GOOGLE_CALENDAR.calendarId,
      enabled: get('googlecalendar', 'google_calendar_enabled') || DEFAULT_GOOGLE_CALENDAR.enabled,
    });
  }, []);

  useEffect(() => {
    if (data?.appSettings) populateFromSettings(data.appSettings);
  }, [data, populateFromSettings]);

  const saveCategory = async (category: string, entries: Array<{ key: string; value: string }>) => {
    setError('');
    setSuccess('');
    try {
      await Promise.all(
        entries.map((e) =>
          upsertSetting({ variables: { input: { key: e.key, value: e.value, category } } }),
        ),
      );
      setSuccess(`${category.toUpperCase()} configuration saved successfully`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    }
  };

  const handleTest = async (type: 'smtp' | 'imagekit' | 'googlecalendar') => {
    setTestResult(null);
    try {
      let result: { data?: Record<string, TestConnectionResult> };
      if (type === 'smtp') result = await testSmtp();
      else if (type === 'imagekit') result = await testImageKit();
      else result = await testGoogleCal();

      const keyMap: Record<string, string> = {
        smtp: 'testSmtpConnection',
        imagekit: 'testImageKitConnection',
        googlecalendar: 'testGoogleCalendarConnection',
      };
      const d = result?.data?.[keyMap[type]];
      if (d) setTestResult(d);
    } catch (err) {
      setTestResult({
        success: false,
        message: err instanceof Error ? err.message : 'Test failed',
      });
    }
  };

  return {
    tab,
    setTab,
    smtp,
    setSmtp,
    imagekit,
    setImagekit,
    slack,
    setSlack,
    appConfig,
    setAppConfig,
    devConfig,
    setDevConfig,
    stripe,
    setStripe,
    googleMaps,
    setGoogleMaps,
    googleCalendar,
    setGoogleCalendar,
    success,
    setSuccess,
    error,
    setError,
    testResult,
    setTestResult,
    loading,
    saving,
    testingSmtp,
    testingImageKit,
    testingGoogleCal,
    saveCategory,
    handleTest,
  };
}
