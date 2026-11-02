import AsyncStorage from '@react-native-async-storage/async-storage';

export const GOOGLE_DRIVE_SCOPE = 'https://www.googleapis.com/auth/drive.file';

export interface GoogleAuthUser {
  email: string;
  name: string;
  picture?: string;
  accessToken: string;
  expiresAt?: number;
}

const AUTH_STORAGE_KEY = '@iknowmymoney_google_auth';

export const GoogleAuthService = {
  /**
   * Retrieves cached Google credentials from device storage.
   */
  async getStoredUser(): Promise<GoogleAuthUser | null> {
    try {
      const data = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
      if (!data) return null;
      return JSON.parse(data);
    } catch {
      return null;
    }
  },

  /**
   * Saves Google Auth user data securely to local device storage.
   */
  async storeUser(user: GoogleAuthUser): Promise<void> {
    await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
  },

  /**
   * Clears Google Auth session from device storage.
   */
  async signOut(): Promise<void> {
    await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
  },

  /**
   * Fetches Google user profile using an access token.
   */
  async fetchUserProfile(accessToken: string): Promise<{ email: string; name: string; picture?: string }> {
    const res = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!res.ok) {
      throw new Error('Failed to fetch Google user profile.');
    }

    return await res.json();
  },
};
