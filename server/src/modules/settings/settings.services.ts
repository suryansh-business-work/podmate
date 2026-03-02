import { v4 as uuidv4 } from 'uuid';
import { AppSettingsModel, toAppSettings } from './settings.models';
import type { AppSettings } from './settings.models';

export async function getSetting(key: string): Promise<AppSettings | null> {
  const doc = await AppSettingsModel.findOne({ key }).lean({ virtuals: true });
  return toAppSettings(doc);
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
    { new: true, upsert: true },
  ).lean({ virtuals: true });
  return toAppSettings(doc) as AppSettings;
}

export async function deleteSetting(key: string): Promise<boolean> {
  const result = await AppSettingsModel.deleteOne({ key });
  return result.deletedCount > 0;
}

export async function isMaintenanceMode(): Promise<boolean> {
  const setting = await getSetting('maintenance_mode');
  return setting?.value === 'true';
}
