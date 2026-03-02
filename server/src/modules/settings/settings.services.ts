import { v4 as uuidv4 } from 'uuid';
import { AppSettingsModel, toAppSettings } from './settings.models';
import type { AppSettings } from './settings.models';
import nodemailer from 'nodemailer';
import logger from '../../lib/logger';

export async function getSetting(key: string): Promise<AppSettings | null> {
  const doc = await AppSettingsModel.findOne({ key }).lean({ virtuals: true });
  return toAppSettings(doc);
}

export async function getSettingValue(key: string): Promise<string | null> {
  const setting = await getSetting(key);
  return setting?.value ?? null;
}

/** Get a config value: DB first, then env fallback */
export async function getConfigValue(key: string, envKey: string): Promise<string> {
  const dbVal = await getSettingValue(key);
  if (dbVal) return dbVal;
  return process.env[envKey] ?? '';
}

export async function getSettingsByCategory(category: string): Promise<AppSettings[]> {
  const docs = await AppSettingsModel.find({ category }).lean({ virtuals: true });
  return docs.map(toAppSettings).filter(Boolean) as AppSettings[];
}

export async function getAllSettings(): Promise<AppSettings[]> {
  const docs = await AppSettingsModel.find().lean({ virtuals: true });
  return docs.map(toAppSettings).filter(Boolean) as AppSettings[];
}

export async function upsertSetting(key: string, value: string, category: string): Promise<AppSettings> {
  const doc = await AppSettingsModel.findOneAndUpdate(
    { key },
    { $set: { key, value, category, updatedAt: new Date().toISOString() }, $setOnInsert: { _id: uuidv4() } },
    { returnDocument: 'after', upsert: true },
  ).lean({ virtuals: true });
  return toAppSettings(doc) as AppSettings;
}

export async function upsertBulkSettings(
  items: Array<{ key: string; value: string; category: string }>,
): Promise<AppSettings[]> {
  const results: AppSettings[] = [];
  for (const item of items) {
    const result = await upsertSetting(item.key, item.value, item.category);
    results.push(result);
  }
  return results;
}

export async function deleteSetting(key: string): Promise<boolean> {
  const result = await AppSettingsModel.deleteOne({ key });
  return result.deletedCount > 0;
}

export async function isMaintenanceMode(): Promise<boolean> {
  const setting = await getSetting('maintenance_mode');
  return setting?.value === 'true';
}

export async function isAppMaintenanceMode(): Promise<boolean> {
  const setting = await getSetting('maintenance_mode_app');
  return setting?.value === 'true';
}

export async function isWebsiteMaintenanceMode(): Promise<boolean> {
  const setting = await getSetting('maintenance_mode_website');
  return setting?.value === 'true';
}

/* ── Test Connections ── */

export async function testSmtpConnection(): Promise<{ success: boolean; message: string }> {
  try {
    const host = await getConfigValue('smtp_host', 'SMTP_HOST');
    const port = parseInt(await getConfigValue('smtp_port', 'SMTP_PORT') || '587', 10);
    const user = await getConfigValue('smtp_user', 'SMTP_USER');
    const pass = await getConfigValue('smtp_pass', 'SMTP_PASS');

    if (!host || !user || !pass) {
      return { success: false, message: 'SMTP credentials not configured' };
    }

    const transport = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });

    await transport.verify();
    return { success: true, message: 'SMTP connection successful' };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown SMTP error';
    logger.error('SMTP test failed:', message);
    return { success: false, message: `SMTP connection failed: ${message}` };
  }
}

export async function testOpenAiConnection(): Promise<{ success: boolean; message: string }> {
  try {
    const apiKey = await getConfigValue('openai_api_key', 'OPENAI_API_KEY');

    if (!apiKey) {
      return { success: false, message: 'OpenAI API key not configured' };
    }

    const response = await fetch('https://api.openai.com/v1/models', {
      headers: { Authorization: `Bearer ${apiKey}` },
    });

    if (response.ok) {
      return { success: true, message: 'OpenAI connection successful' };
    }
    const body = await response.text();
    return { success: false, message: `OpenAI API returned ${response.status}: ${body}` };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown OpenAI error';
    logger.error('OpenAI test failed:', message);
    return { success: false, message: `OpenAI connection failed: ${message}` };
  }
}

export async function testImageKitConnection(): Promise<{ success: boolean; message: string }> {
  try {
    const publicKey = await getConfigValue('imagekit_public_key', 'IMAGEKIT_PUBLIC_KEY');
    const privateKey = await getConfigValue('imagekit_private_key', 'IMAGEKIT_PRIVATE_KEY');
    const urlEndpoint = await getConfigValue('imagekit_url_endpoint', 'IMAGEKIT_URL_ENDPOINTS');

    if (!publicKey || !privateKey || !urlEndpoint) {
      return { success: false, message: 'ImageKit credentials not configured' };
    }

    return { success: true, message: 'ImageKit credentials are set' };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown ImageKit error';
    return { success: false, message: `ImageKit test failed: ${message}` };
  }
}
