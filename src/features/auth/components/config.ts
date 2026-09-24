import { Platform } from 'react-native';

export const APP_NAME = 'Qotes'; // placeholder: swap for your product name

// "localhost" means something different in each runtime:
//   iOS simulator / web browser -> your computer      (works)
//   Android emulator            -> the emulator itself (use 10.0.2.2)
//   physical phone              -> the phone itself    (use your computer's LAN IP)
// Set EXPO_PUBLIC_API_URL (e.g. http://192.168.1.20:3030) to override.
const DEV_HOST = Platform.select({ android: '10.0.2.2', default: 'localhost' });

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ?? `http://${DEV_HOST}:3030`;

export const REQUEST_TIMEOUT_MS = 15_000;
