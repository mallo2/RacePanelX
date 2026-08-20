const B64_ALPHABET =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

/**
 * Encode un tableau d'octets en base64.
 *
 * react-native-ble-plx n'accepte que du base64 pour les écritures GATT, et
 * `btoa` n'est pas polyfillé par React Native — d'où cet encodeur local.
 */
export const bytesToBase64 = (bytes: number[]): string => {
  let result = '';

  for (let i = 0; i < bytes.length; i += 3) {
    const b0 = bytes[i] & 0xff;
    const b1 = bytes[i + 1] & 0xff;
    const b2 = bytes[i + 2] & 0xff;

    const remaining = bytes.length - i;

    result += B64_ALPHABET[b0 >> 2];
    result += B64_ALPHABET[((b0 & 0x03) << 4) | (remaining > 1 ? b1 >> 4 : 0)];
    result += remaining > 1
        ? B64_ALPHABET[((b1 & 0x0f) << 2) | (remaining > 2 ? b2 >> 6 : 0)]
        : '=';
    result += remaining > 2 ? B64_ALPHABET[b2 & 0x3f] : '=';
  }

  return result;
};
