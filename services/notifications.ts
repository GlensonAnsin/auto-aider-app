import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const registerForPushNotificationsAsync = async () => {
  let token;

  await Notifications.setNotificationChannelAsync('default', {
    name: 'Default',
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#FF231F7C',
  });


  if (Device.isDevice) {
    const { granted: existingGranted } = await Notifications.getPermissionsAsync();
    let finalGranted = existingGranted;

    if (!existingGranted) {
      const { granted } = await Notifications.requestPermissionsAsync();
      finalGranted = granted;
    }

    if (!finalGranted) {
      alert('Failed to get push token');
      return;
    }

    token = (await Notifications.getExpoPushTokenAsync({ projectId: '2c075eed-3e20-4711-ae77-6a85f27bc5f8' })).data;
    console.log('Expo Push Token:', token);
    return token;
  } else {
    alert('Must use physical device for Push Notifications');
  }
}