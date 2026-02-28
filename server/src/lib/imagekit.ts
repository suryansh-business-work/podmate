import ImageKit from 'imagekit';

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY ?? 'your_public_key',
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY ?? 'your_private_key',
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINTS ?? 'https://ik.imagekit.io/your_id',
});

export function getImageKitAuthParams(): { token: string; expire: number; signature: string } {
  return imagekit.getAuthenticationParameters() as {
    token: string;
    expire: number;
    signature: string;
  };
}

export default imagekit;
