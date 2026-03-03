import { ImageKit } from '@imagekit/nodejs';
import logger from './logger';

let imagekitInstance: ImageKit | null = null;

async function getImageKitCredentials(): Promise<{
  publicKey: string;
  privateKey: string;
  urlEndpoint: string;
}> {
  /* Try DB settings first, then fall back to env vars */
  try {
    const { AppSettingsModel } = await import('../modules/settings/settings.models');
    const pubDoc = await AppSettingsModel.findOne({ key: 'imagekit_public_key' }).lean();
    const privDoc = await AppSettingsModel.findOne({ key: 'imagekit_private_key' }).lean();
    const urlDoc = await AppSettingsModel.findOne({ key: 'imagekit_url_endpoint' }).lean();

    const publicKey = (pubDoc?.value || process.env.IMAGEKIT_PUBLIC_KEY) ?? '';
    const privateKey = (privDoc?.value || process.env.IMAGEKIT_PRIVATE_KEY) ?? '';
    const urlEndpoint = (urlDoc?.value || process.env.IMAGEKIT_URL_ENDPOINTS) ?? '';

    return { publicKey, privateKey, urlEndpoint };
  } catch {
    return {
      publicKey: process.env.IMAGEKIT_PUBLIC_KEY ?? '',
      privateKey: process.env.IMAGEKIT_PRIVATE_KEY ?? '',
      urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINTS ?? '',
    };
  }
}

async function getImageKit(): Promise<ImageKit> {
  const { publicKey, privateKey, urlEndpoint } = await getImageKitCredentials();

  if (!publicKey || !privateKey || !urlEndpoint) {
    throw new Error(
      'ImageKit credentials not configured. Set keys in admin panel or IMAGEKIT_PUBLIC_KEY, IMAGEKIT_PRIVATE_KEY, and IMAGEKIT_URL_ENDPOINTS in .env',
    );
  }

  /* @imagekit/nodejs v7 constructor only accepts privateKey; publicKey and urlEndpoint are managed separately */
  imagekitInstance = new ImageKit({ privateKey });
  logger.info('ImageKit initialized successfully');
  return imagekitInstance;
}

export async function getImageKitAuthParams(): Promise<{ token: string; expire: number; signature: string; publicKey: string }> {
  const { publicKey } = await getImageKitCredentials();
  const ik = await getImageKit();
  const authParams = ik.helper.getAuthenticationParameters() as {
    token: string;
    expire: number;
    signature: string;
  };
  return { ...authParams, publicKey };
}

export default { getImageKitAuthParams };
