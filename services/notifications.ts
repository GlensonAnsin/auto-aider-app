import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export const registerForPushNotificationsAsync = async () => {
  if (Device.isDevice) {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Default',
      importance: Notifications.AndroidImportance.MAX,
    });

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      alert('Failed to get push token');
      return;
    }

    const token = (await Notifications.getExpoPushTokenAsync()).data;
    console.log('Expo Push Token:', token);
    return token;
  } else {
    alert('Must use physical device for Push Notifications');
  }
}

export const addNotificationListeners = ({
  onReceive,
  onRespond,
}: {
    onReceive?: (n: Notifications.Notification) => void;
    onRespond?: (n: Notifications.NotificationResponse) => void;
  }) => {
  const receiveSub = Notifications.addNotificationReceivedListener((n) => {
    onReceive?.(n);
  });

  const respondSub = Notifications.addNotificationResponseReceivedListener((r) => {
    onRespond?.(r);
  });

  return () => {
    receiveSub.remove();
    respondSub.remove();
  }
}