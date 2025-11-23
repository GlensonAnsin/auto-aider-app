import { Loading } from '@/components/Loading';
import { useBackRoute } from '@/hooks/useBackRoute';
import { RootState } from '@/redux/store';
import { deleteNotificationCO, getNotificationsCO, updateNotificationStatusCO } from '@/services/backendApi';
import socket from '@/services/socket';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import Ionicons from '@expo/vector-icons/Ionicons';
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
  const backRoute = useBackRoute('/car-owner');
  const router = useRouter();
  const [notification, setNotification] = useState<
    { notificationID: number; title: string; message: string; isRead: boolean; createdAt: string }[]
  >([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const userID = useSelector((state: RootState) => state.role.ID);

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

        const res = await getNotificationsCO();

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
        setTimeout(() => {
          router.push('/error/server-error');
        }, 2000);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [router]);

  useEffect(() => {
    if (!socket) return;

    socket.on(`newNotif-CO-${userID}`, ({ newNotif }) => {
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
      socket.off(`newNotif-CO-${userID}`);
    };
  }, [userID]);

  const transformDate = (date: string) => {
    const notificationDate = dayjs(date).utc(true);
    const notificationTime = notificationDate.format('HH:mm');
    const notificationDay = notificationDate.date();
    const notificationWeek = Math.ceil(notificationDate.dayOfYear() / 7);
    const notificationMonth = notificationDate.month() + 1;
    const notificationYear = notificationDate.year();

    // Same day
    if (
      notificationDay === currentDay &&
      notificationWeek === currentWeek &&
      notificationMonth === currentMonth &&
      notificationYear === currentYear
    ) {
      return notificationTime;
    }

    // Same week, same month, same year
    if (notificationWeek === currentWeek && notificationMonth === currentMonth && notificationYear === currentYear) {
      return notificationDate.format('ddd');
    }

    // Different year
    if (notificationYear !== currentYear) {
      return notificationDate.format('DD/MM/YY');
    }

    // Different month, same year
    if (notificationMonth !== currentMonth && notificationYear === currentYear) {
      return notificationDate.format('DD/MM');
    }

    // Default case: different day, same month, same year
    return notificationDate.format('DD/MM');
  };

  const identifyIcon = (title: string) => {
    if (title === 'Request Accepted') {
      return <FontAwesome6 name="file-circle-check" size={30} color="#17B978" />;
    } else if (title === 'Request Rejected') {
      return <MaterialCommunityIcons name="close-octagon" size={30} color="#780606" />;
    } else if (title === 'Request Successful') {
      return <Ionicons name="checkmark-done-circle" size={30} color="#17B978" />;
    } else if (title === 'Request Unsuccessful') {
      return <MaterialIcons name="car-crash" size={30} color="#780606" />;
    } else if (title === 'PMS Reminder') {
      return <FontAwesome6 name="car-on" size={30} color="#5bc0de" />;
    } else {
      return <FontAwesome name="warning" size={30} color="#f0ad4e" />;
    }
  };

  const handleNotificationPress = async (title: string, notificationID: number) => {
    try {
      backRoute();

      if (title === 'PMS Reminder' || title === 'PMS Overdue') {
        router.replace('/car-owner/(screens)/repair-shops/repair-shops');
      } else {
        router.replace('/car-owner/(screens)/request-status/request-status');
      }

      await updateNotificationStatusCO(notificationID);
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
      await deleteNotificationCO(notifID);
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
      setTimeout(() => {
        router.push('/error/server-error');
      }, 2000);
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.arrowHeaderContainer}>
          <TouchableOpacity style={styles.arrowWrapper} onPress={() => router.replace('/car-owner')}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerText}>Notifications</Text>
        </View>
      </View>

      <View style={styles.lowerBox}>
        {notification.length === 0 && (
          <View style={styles.noHistoryContainer}>
            <MaterialCommunityIcons name="bell-outline" size={120} color="#D1D5DB" />
            <Text style={styles.emptyText}>No Notifications</Text>
            <Text style={styles.emptySubText}>You&apos;ll see updates here when they arrive</Text>
          </View>
        )}
        <FlatList
          data={notification.sort((a, b) => b.notificationID - a.notificationID)}
          style={{ width: '100%' }}
          renderItem={({ item, index }) => (
            <TouchableOpacity
              style={[
                styles.notifButton,
                index === notification.length - 1 && styles.lastChild,
                { backgroundColor: item.isRead ? '#FFFFFF' : '#EEF2FF' },
              ]}
              onPress={() => handleNotificationPress(item.title, item.notificationID)}
              onLongPress={() => deleteNotifAlert(item.notificationID)}
            >
              <View style={styles.notifContent}>
                <View style={styles.iconTextContainer}>
                  <View style={styles.iconWrapper}>{identifyIcon(item.title)}</View>
                  <View style={styles.textContainer}>
                    <View style={styles.titleRow}>
                      <Text style={styles.notifButtonText1}>{item.title}</Text>
                      {!item.isRead && <View style={styles.unreadDot} />}
                    </View>
                    <Text style={styles.notifButtonText2} numberOfLines={2}>
                      {item.message}
                    </Text>
                    <Text style={styles.notifButtonText3}>{transformDate(item.createdAt)}</Text>
                  </View>
                </View>
              </View>
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
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 4,
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
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  headerText: {
    color: '#FFF',
    fontFamily: 'HeaderBold',
    fontSize: 20,
  },
  lowerBox: {
    flex: 1,
    paddingBottom: 62,
  },
  noHistoryContainer: {
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 40,
  },
  emptyText: {
    fontFamily: 'BodyBold',
    color: '#9CA3AF',
    fontSize: 22,
    textAlign: 'center',
  },
  emptySubText: {
    fontFamily: 'BodyRegular',
    color: '#D1D5DB',
    fontSize: 14,
    textAlign: 'center',
  },
  notifButton: {
    marginHorizontal: 10,
    marginVertical: 4,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  lastChild: {
    marginBottom: 10,
  },
  notifContent: {
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  iconTextContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    gap: 4,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  notifButtonText1: {
    fontFamily: 'BodyBold',
    fontSize: 16,
    color: '#111827',
    flex: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3B82F6',
  },
  notifButtonText2: {
    fontFamily: 'BodyRegular',
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  notifButtonText3: {
    fontFamily: 'BodyRegular',
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
  },
});
