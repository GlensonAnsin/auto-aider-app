import AsyncStorage from '@react-native-async-storage/async-storage';

export const storeTokens = async (accessToken: string, refreshToken: string): Promise<void> => {
  await AsyncStorage.setItem('accessToken', accessToken);
  await AsyncStorage.setItem('refreshToken', refreshToken);
};

export const getAccessToken = async (): Promise<string | null> => {
  return await AsyncStorage.getItem('accessToken');
};

export const getRefreshToken = async (): Promise<string | null> => {
  return await AsyncStorage.getItem('refreshToken');
};

export const clearTokens = async (): Promise<void> => {
  await AsyncStorage.removeItem('accessToken');
  await AsyncStorage.removeItem('refreshToken');
};
