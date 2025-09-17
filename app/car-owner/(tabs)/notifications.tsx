import { Loading } from '@/components/Loading';
import { getNotificationsCO } from '@/services/backendApi';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import dayjs from 'dayjs';
import dayOfYear from 'dayjs/plugin/dayOfYear';
import utc from 'dayjs/plugin/utc';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { showMessage } from 'react-native-flash-message';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function NotificationsTab() {
  dayjs.extend(utc);
  dayjs.extend(dayOfYear);
  const currentDate = dayjs();
  const currentDay = currentDate.date();
  const currentWeek = Math.ceil(currentDate.dayOfYear() / 7);
  const currentMonth = currentDate.month() + 1;
  const currentYear = currentDate.year();
  const router = useRouter();
  const [notification, setNotification] = useState<
    { notificationID: number; title: string; message: string; isRead: boolean; createdAt: string }[]
  >([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

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
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const transformDate = (date: string) => {
    const notificationDate = dayjs(date).utc(true).local();
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
        {notification.map((item) => (
          <View key={item.notificationID}>
            <ScrollView>
              <TouchableOpacity style={styles.notifButton}>
                <Text style={styles.notifButtonText1}>{item.title}</Text>
                <Text style={styles.notifButtonText2}>{item.message}</Text>
                <Text style={styles.notifButtonText3}>{transformDate(item.createdAt)}</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
  },
  notifButton: {
    borderBottomWidth: 1,
    borderColor: '#EAEAEA',
    paddingVertical: 20,
    paddingHorizontal: 10,
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
