import { Loading } from '@/components/Loading';
import { useBackRoute } from '@/hooks/useBackRoute';
import { setSenderReceiverState } from '@/redux/slices/senderReceiverSlice';
import { getAllConversationsRS } from '@/services/backendApi';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import dayjs from 'dayjs';
import dayOfYear from 'dayjs/plugin/dayOfYear';
import utc from 'dayjs/plugin/utc';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { showMessage } from 'react-native-flash-message';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch } from 'react-redux';
import { io } from 'socket.io-client';

export default function ChatsTab() {
  dayjs.extend(utc);
  dayjs.extend(dayOfYear);
  const currentDate = dayjs();
  const currentDay = currentDate.date();
  const currentWeek = Math.ceil(currentDate.dayOfYear() / 7);
  const currentMonth = currentDate.month() + 1;
  const currentYear = currentDate.year();
  const router = useRouter();
  const backRoute = useBackRoute('/repair-shop/(tabs)/inbox');
  const dispatch = useDispatch();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [chatInfo, setChatInfo] = useState<
    {
      shopID: number;
      chatID: number;
      customerID: number;
      customerFirstname: string;
      customerLastname: string;
      profilePic: string | null;
      profileBG: string;
      message: string;
      messageDate: string;
      status: string;
      fromYou: boolean;
    }[]
  >([]);

  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        const chatInfoData: {
          shopID: number;
          chatID: number;
          customerID: number;
          customerFirstname: string;
          customerLastname: string;
          profilePic: string | null;
          profileBG: string;
          message: string;
          messageDate: string;
          status: string;
          fromYou: boolean;
        }[] = [];

        const res = await getAllConversationsRS();

        res.forEach((item: any) => {
          chatInfoData.push({
            shopID: item.shopID,
            chatID: item.chatID,
            customerID: item.customerID,
            customerFirstname: item.customerFirstname,
            customerLastname: item.customerLastname,
            profilePic: item.profilePic,
            profileBG: item.profileBG,
            message: item.message,
            messageDate: item.messageDate,
            status: item.status,
            fromYou: item.senderID ? true : false,
          });
        });

        setChatInfo(chatInfoData);
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
    const socket = io(process.env.EXPO_PUBLIC_BACKEND_BASE_URL);

    socket.on('connect', () => {
      console.log('Connected to server: ', socket.id);
    });

    socket.on('updateRSInbox', ({ groupedChatInfoDataRS }) => {
      setChatInfo(groupedChatInfoDataRS);
    });

    return () => {
      socket.off('updateRSInbox');
      socket.disconnect();
    };
  }, []);

  const transformDate = (date: string) => {
    const messageDate = dayjs(date).utc(true).local();
    const messageTime = messageDate.format('HH:mm');
    const messageDay = messageDate.date();
    const messageWeek = Math.ceil(messageDate.dayOfYear() / 7);
    const messageMonth = messageDate.month() + 1;
    const messageYear = messageDate.year();

    if (
      messageDay === currentDay &&
      messageWeek === currentWeek &&
      messageMonth === currentMonth &&
      messageYear === currentYear
    ) {
      return messageTime;
    }

    if (messageWeek === currentWeek && messageMonth === currentMonth && messageYear === currentYear) {
      return messageDate.format('ddd');
    }

    if (messageMonth !== currentMonth && messageYear === currentYear) {
      return messageDate.format('DD/MM');
    }

    if (messageYear !== currentYear) {
      return messageDate.format('DD/MM/YY');
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
          <Text style={styles.headerText}>Chats</Text>
        </View>
      </View>

      <View style={styles.lowerBox}>
        {chatInfo.map((item) => (
          <View key={item.chatID}>
            <ScrollView>
              <TouchableOpacity
                style={styles.conversationButton}
                onPress={() => {
                  backRoute();
                  dispatch(
                    setSenderReceiverState({
                      senderID: item.shopID,
                      receiverID: item.customerID,
                      role: 'repair-shop',
                    })
                  );
                  router.replace('/chat-room/chat-room');
                }}
              >
                {item.profilePic === null && (
                  <View style={[styles.profilePicWrapper, { backgroundColor: item.profileBG }]}>
                    <Text style={styles.userInitials}>{`${item.customerFirstname[0]}${item.customerLastname[0]}`}</Text>
                  </View>
                )}

                {item.profilePic !== null && (
                  <View style={styles.profilePicWrapper}>
                    <Image style={styles.profilePic} source={{ uri: item.profilePic }} width={65} height={65} />
                  </View>
                )}

                <View style={styles.nameMessageContainer}>
                  {item.fromYou && (
                    <>
                      <Text
                        numberOfLines={1}
                        style={[styles.nameText, { fontFamily: item.fromYou ? 'BodyRegular' : 'BodyBold' }]}
                      >
                        {`${item.customerFirstname} ${item.customerLastname}`}
                      </Text>
                      <View style={styles.messageDateContainer}>
                        <Text
                          numberOfLines={1}
                          style={[styles.messageText, { fontFamily: item.fromYou ? 'BodyRegular' : 'BodyBold' }]}
                        >
                          {item.message}
                        </Text>
                        <Text style={[styles.dateText, { fontFamily: item.fromYou ? 'BodyRegular' : 'BodyBold' }]}>
                          {transformDate(item.messageDate)}
                        </Text>
                      </View>
                    </>
                  )}

                  {!item.fromYou && (
                    <>
                      <Text
                        numberOfLines={1}
                        style={[styles.nameText, { fontFamily: item.status === 'seen' ? 'BodyRegular' : 'BodyBold' }]}
                      >
                        {`${item.customerFirstname} ${item.customerLastname}`}
                      </Text>
                      <View style={styles.messageDateContainer}>
                        <Text
                          numberOfLines={1}
                          style={[
                            styles.messageText,
                            { fontFamily: item.status === 'seen' ? 'BodyRegular' : 'BodyBold' },
                          ]}
                        >
                          {item.message}
                        </Text>
                        <Text
                          style={[styles.dateText, { fontFamily: item.status === 'seen' ? 'BodyRegular' : 'BodyBold' }]}
                        >
                          {transformDate(item.messageDate)}
                        </Text>
                      </View>
                    </>
                  )}
                </View>
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
  conversationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 10,
  },
  profilePicWrapper: {
    width: 65,
    height: 65,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 65,
  },
  userInitials: {
    fontFamily: 'HeaderBold',
    fontSize: 20,
    color: '#FFF',
  },
  profilePic: {
    borderRadius: 65,
  },
  nameMessageContainer: {
    width: '74%',
    borderBottomWidth: 1,
    borderColor: '#EAEAEA',
    paddingVertical: 20,
  },
  nameText: {
    width: '100%',
    color: '#333',
    fontSize: 16,
  },
  messageDateContainer: {
    flexDirection: 'row',
  },
  messageText: {
    width: '75%',
    color: '#555',
    fontSize: 15,
  },
  dateText: {
    width: '25%',
    textAlign: 'right',
    color: '#555',
  },
});
