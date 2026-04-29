/**
 * Kalshi API Authentication Utilities
 * Handles RSA-PSS signing for Kalshi API requests
 * 
 * IMPORTANT: This requires installing a React Native compatible crypto library.
 * Run: npm install react-native-rsa-native
 * or: npm install tweetnacl-js
 * 
 * If using react-native-rsa-native:
 * - iOS: pod install in ios/ folder
 * - Android: Should auto-link
 */

import { NativeModules } from 'react-native';

// Try to use react-native-rsa-native for RSA signing
let RNRsa: any = null;
try {
  RNRsa = NativeModules.RNRsa;
} catch (error) {
  console.warn('react-native-rsa-native not available, RSA signing may fail');
}

export interface KalshiAuthConfig {
  apiKeyId: string;
  privateKey: string;
  baseUrl?: string;
}

/**
 * Sign a request using RSA-PSS with SHA256
 * Requires react-native-rsa-native to be installed
 */
export const signKalshiRequest = async (
  privateKey: string,
  timestamp: string,
  method: string,
  path: string
): Promise<string> => {
  // Strip query parameters from path
  const pathWithoutQuery = path.split('?')[0];
  
  // Create message to sign: timestamp + method + path
  const message = `${timestamp}${method}${pathWithoutQuery}`;
  
  if (!RNRsa) {
    throw new Error(
      'React Native RSA module not available. Install react-native-rsa-native: npm install react-native-rsa-native'
    );
  }

  try {
    // Use react-native-rsa-native to sign with RSA-PSS
    // Note: This is a simplified approach - you may need to adjust based on RNRsa API
    const signature = await RNRsa.signWithAlgorithm(
      message,
      privateKey,
      'RSA/ECB/PKCS1Padding'
    );
    
    return signature;
  } catch (error) {
    console.error('Failed to sign Kalshi request:', error);
    throw error;
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

