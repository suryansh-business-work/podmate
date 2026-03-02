import ImageKit from 'imagekit';
import logger from './logger';

let imagekitInstance: ImageKit | null = null;

function getImageKit(): ImageKit {
  if (imagekitInstance) return imagekitInstance;

  const publicKey = process.env.IMAGEKIT_PUBLIC_KEY ?? '';
  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY ?? '';
  const urlEndpoint = process.env.IMAGEKIT_URL_ENDPOINTS ?? '';

  if (!publicKey || !privateKey || !urlEndpoint) {
    throw new Error(
      'ImageKit credentials not configured. Set IMAGEKIT_PUBLIC_KEY, IMAGEKIT_PRIVATE_KEY, and IMAGEKIT_URL_ENDPOINTS in .env',
    );
  }

  imagekitInstance = new ImageKit({ publicKey, privateKey, urlEndpoint });
  logger.info('ImageKit initialized successfully');
  return imagekitInstance;
}

export function getImageKitAuthParams(): { token: string; expire: number; signature: string } {
  const ik = getImageKit();
  return ik.getAuthenticationParameters() as {
    token: string;
    expire: number;
    signature: string;
  };
}

export default { getImageKitAuthParams };
