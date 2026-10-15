import { Platform } from 'react-native';

// "localhost" differs per runtime: Android emulator needs 10.0.2.2, a physical device needs
// your LAN IP. Set EXPO_PUBLIC_API_URL to override (e.g. https://qotes-server.onrender.com).
const DEV_HOST = Platform.select({ android: '10.0.2.2', default: 'localhost' });

export const API_BASE_URL = (
  process.env.EXPO_PUBLIC_API_URL ?? `http://${DEV_HOST}:3030`
).replace(/\/+$/, '');

export const REQUEST_TIMEOUT_MS = 15_000;
