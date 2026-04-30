/**
 * Kalshi API Authentication Utilities
 * Handles RSA-PSS signing for Kalshi API requests
 * 
 * Note: RSA signing requires jsrsasign, which may not be available in React Native.
 * If signing fails, the app falls back to public markets automatically.
 */

let KJUR: any = null;
try {
  const jsrsasign = require('jsrsasign');
  KJUR = jsrsasign.KJUR;
} catch (e) {
  // jsrsasign not available - auth will fail gracefully and fall back to public markets
}

export interface KalshiAuthConfig {
  apiKeyId: string;
  privateKey: string;
  baseUrl?: string;
}

/**
 * Sign a request using RSA SHA-256.
 * Returns empty string if crypto unavailable - Kalshi will reject and app falls back to public markets.
 */
export const signKalshiRequest = async (
  privateKey: string,
  timestamp: string,
  method: string,
  path: string
): Promise<string> => {
  if (!KJUR || !KJUR.crypto || !KJUR.crypto.Signature) {
    // Crypto not available - return empty so Kalshi rejects and we fall back to public markets
    console.warn('RSA signing not available in this environment - will use public markets only');
    return '';
  }

  const pathWithoutQuery = path.split('?')[0];
  const message = `${timestamp}${method}${pathWithoutQuery}`;

  try {
    const signer = new KJUR.crypto.Signature({ alg: 'SHA256withRSA' });
    signer.init(privateKey);
    signer.updateString(message);
    return signer.sign();
  } catch (error) {
    console.warn('Failed to sign Kalshi request, will use public markets:', error);
    return '';
  }
};

/**
 * Get authentication headers for a Kalshi API request
 */
export const getKalshiHeaders = async (
  apiKeyId: string,
  privateKey: string,
  method: string,
  path: string
): Promise<{
  'KALSHI-ACCESS-KEY': string;
  'KALSHI-ACCESS-SIGNATURE': string;
  'KALSHI-ACCESS-TIMESTAMP': string;
  'Content-Type'?: string;
}> => {
  const timestamp = Date.now().toString();
  const signature = await signKalshiRequest(privateKey, timestamp, method, path);

  return {
    'KALSHI-ACCESS-KEY': apiKeyId,
    'KALSHI-ACCESS-SIGNATURE': signature,
    'KALSHI-ACCESS-TIMESTAMP': timestamp,
  };
};

/**
 * Make an authenticated GET request to Kalshi API
 */
export const kalshiGet = async <T>(
  config: KalshiAuthConfig,
  path: string
): Promise<T> => {
  const baseUrl = config.baseUrl || 'https://api.elections.kalshi.com';
  const headers = await getKalshiHeaders(config.apiKeyId, config.privateKey, 'GET', path);

  const response = await fetch(`${baseUrl}${path}`, {
    method: 'GET',
    headers,
  });

  if (!response.ok) {
    throw new Error(
      `Kalshi API error ${response.status}: ${response.statusText}`
    );
  }

  return response.json() as Promise<T>;
};

/**
 * Make an authenticated POST request to Kalshi API
 */
export const kalshiPost = async <T>(
  config: KalshiAuthConfig,
  path: string,
  data: unknown
): Promise<T> => {
  const baseUrl = config.baseUrl || 'https://api.elections.kalshi.com';
  const headers = await getKalshiHeaders(config.apiKeyId, config.privateKey, 'POST', path);

  const response = await fetch(`${baseUrl}${path}`, {
    method: 'POST',
    headers: {
      ...headers,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(
      `Kalshi API error ${response.status}: ${response.statusText}`
    );
  }

  return response.json() as Promise<T>;
};

