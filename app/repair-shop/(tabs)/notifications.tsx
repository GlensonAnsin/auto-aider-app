import { Loading } from '@/components/Loading';
import { useBackRoute } from '@/hooks/useBackRoute';
import { RootState } from '@/redux/store';
import { deleteNotificationRS, getNotificationsRS, updateNotificationStatusRS } from '@/services/backendApi';
import socket from '@/services/socket';
import Entypo from '@expo/vector-icons/Entypo';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import dayjs from 'dayjs';
import dayOfYear from 'dayjs/plugin/dayOfYear';
import utc from 'dayjs/plugin/utc';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { showMessage } from 'react-native-flash-message';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';

export default function NotificationsTab() {
  dayjs.extend(utc);
  dayjs.extend(dayOfYear);
  const currentDate = dayjs();
  const currentDay = currentDate.date();
  const currentWeek = Math.ceil(currentDate.dayOfYear() / 7);
  const currentMonth = currentDate.month() + 1;
  const currentYear = currentDate.year();
  const backRoute = useBackRoute('/repair-shop');
  const router = useRouter();
  const [notification, setNotification] = useState<
    { notificationID: number; title: string; message: string; isRead: boolean; createdAt: string }[]
  >([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const shopID = useSelector((state: RootState) => state.role.ID);

  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        const notificationData: {
          notificationID: number;
          title: string;
          message: string;
          isRead: boolean;
          createdAt: string;
        }[] = [];

        const res = await getNotificationsRS();

        res.forEach((item: any) => {
          notificationData.push({
            notificationID: item.notification_id,
            title: item.title,
            message: item.message,
            isRead: item.is_read,
            createdAt: item.created_at,
          });
        });

        setNotification(notificationData);
      } catch {
        showMessage({
          message: 'Something went wrong. Please try again.',
          type: 'danger',
          floating: true,
          color: '#FFF',
          icon: 'danger',
        });
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.on(`newNotif-RS-${shopID}`, ({ newNotif }) => {
      const newNotifData = {
        notificationID: newNotif.notification_id,
        title: newNotif.title,
        message: newNotif.message,
        isRead: newNotif.is_read,
        createdAt: newNotif.created_at,
      };
      setNotification((prev) => [...prev, newNotifData]);
    });

    return () => {
      socket.off(`newNotif-RS-${shopID}`);
    };
  }, [shopID]);

  const transformDate = (date: string) => {
    const notificationDate = dayjs(date).utc(true);
    const notificationTime = notificationDate.format('HH:mm');
    const notificationDay = notificationDate.date();
    const notificationWeek = Math.ceil(notificationDate.dayOfYear() / 7);
    const notificationMonth = notificationDate.month() + 1;
    const notificationYear = notificationDate.year();

    if (
      notificationDay === currentDay &&
      notificationWeek === currentWeek &&
      notificationMonth === currentMonth &&
      notificationYear === currentYear
    ) {
      return notificationTime;
    }

    if (notificationWeek === currentWeek && notificationMonth === currentMonth && notificationYear === currentYear) {
      return notificationDate.format('ddd');
    }

    if (notificationMonth !== currentMonth && notificationYear === currentYear) {
      return notificationDate.format('DD/MM');
    }

    if (notificationYear !== currentYear) {
      return notificationDate.format('DD/MM/YY');
    }
  };

  const identifyIcon = (title: string) => {
    if (title === 'New Repair Request') {
      return <Entypo name="new-message" size={30} color="#17B978" />;
    } else {
      return <MaterialIcons name="star-rate" size={30} color="#FDCC0D" />;
    }
  };

  const handleNotificationPress = async (title: string, notificationID: number) => {
    try {
      backRoute();

      if (title === 'New Repair Request') {
        router.replace('/repair-shop/(screens)/repair-requests/repair-requests');
      } else {
        router.replace('/repair-shop');
      }

      await updateNotificationStatusRS(notificationID);
      setNotification((prev) => prev.map((n) => (n.notificationID === notificationID ? { ...n, isRead: true } : n)));
    } catch {
      showMessage({
        message: 'Something went wrong. Please try again.',
        type: 'danger',
        floating: true,
        color: '#FFF',
        icon: 'danger',
      });
    }
  };

  const deleteNotifAlert = (notifID: number) => {
    Alert.alert('Delete Notifcation', 'Delete this notification?', [
      {
        text: 'Cancel',
        onPress: () => {},
        style: 'cancel',
      },
      {
        text: 'Yes',
        onPress: () => handleDeleteNotif(notifID),
      },
    ]);
  };

  const handleDeleteNotif = async (notifID: number) => {
    try {
      await deleteNotificationRS(notifID);
      const deletedNotif = notification.filter((n) => n.notificationID !== notifID);
      setNotification(deletedNotif);
    } catch {
      showMessage({
        message: 'Something went wrong. Please try again.',
        type: 'danger',
        floating: true,
        color: '#FFF',
        icon: 'danger',
      });
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.arrowHeaderContainer}>
          <TouchableOpacity style={styles.arrowWrapper} onPress={() => router.replace('/repair-shop')}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerText}>Notifications</Text>
        </View>
      </View>

      <View style={styles.lowerBox}>
        {notification.length === 0 && (
          <View style={styles.noHistoryContainer}>
            <MaterialCommunityIcons name="file-document-outline" size={150} color="#EAEAEA" />
            <Text style={styles.emptyText}>Empty</Text>
          </View>
        )}
        <FlatList
          data={notification.sort((a, b) => b.notificationID - a.notificationID)}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.notifButton, { backgroundColor: item.isRead ? '#fff' : 'rgba(0, 11, 88, 0.1)' }]}
              onPress={() => handleNotificationPress(item.title, item.notificationID)}
              onLongPress={() => deleteNotifAlert(item.notificationID)}
            >
              <View style={styles.iconTextContainer}>
                <View>{identifyIcon(item.title)}</View>
                <View>
                  <Text style={styles.notifButtonText1}>{item.title}</Text>
                  <Text style={styles.notifButtonText2}>{item.message}</Text>
                </View>
              </View>
              <Text style={styles.notifButtonText3}>{transformDate(item.createdAt)}</Text>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item.notificationID.toString()}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f4f7',
  },
  header: {
    backgroundColor: '#000B58',
    justifyContent: 'center',
    alignItems: 'center',
    height: 63,
  },
  arrowHeaderContainer: {
    flexDirection: 'row',
    width: '90%',
    alignItems: 'center',
    gap: 10,
  },
  arrowWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    color: '#FFF',
    fontFamily: 'HeaderBold',
    fontSize: 18,
  },
  lowerBox: {
    flex: 1,
    marginBottom: 80,
  },
  noHistoryContainer: {
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: 'BodyRegular',
    color: '#EAEAEA',
    fontSize: 30,
  },
  notifButton: {
    borderBottomWidth: 1,
    borderColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 30,
  },
  iconTextContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  notifButtonText1: {
    fontFamily: 'BodyBold',
    fontSize: 16,
    color: '#333',
  },
  notifButtonText2: {
    fontFamily: 'BodyRegular',
    color: '#555',
  },
  notifButtonText3: {
    fontFamily: 'BodyRegular',
    color: '#555',
    textAlign: 'right',
  },
});
