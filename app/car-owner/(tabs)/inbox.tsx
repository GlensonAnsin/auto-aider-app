import { Loading } from '@/components/Loading';
import { useBackRoute } from '@/hooks/useBackRoute';
import { setSenderReceiverState } from '@/redux/slices/senderReceiverSlice';
import { RootState } from '@/redux/store';
import { getAllConversationsCO } from '@/services/backendApi';
import socket from '@/services/socket';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import dayjs from 'dayjs';
import dayOfYear from 'dayjs/plugin/dayOfYear';
import utc from 'dayjs/plugin/utc';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { showMessage } from 'react-native-flash-message';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';

export default function ChatsTab() {
  dayjs.extend(utc);
  dayjs.extend(dayOfYear);
  const currentDate = dayjs();
  const currentDay = currentDate.date();
  const currentWeek = Math.ceil(currentDate.dayOfYear() / 7);
  const currentMonth = currentDate.month() + 1;
  const currentYear = currentDate.year();
  const router = useRouter();
  const backRoute = useBackRoute('/car-owner/(tabs)/inbox');
  const dispatch = useDispatch();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [chatInfo, setChatInfo] = useState<
    {
      userID: number;
      chatID: number;
      shopID: number;
      shopName: string;
      profilePic: string | null;
      profileBG: string;
      message: string;
      messageDate: string;
      status: string;
      fromYou: boolean;
    }[]
  >([]);
  const userID = useSelector((state: RootState) => state.role.ID);

  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        const chatInfoData: {
          userID: number;
          chatID: number;
          shopID: number;
          shopName: string;
          profilePic: string | null;
          profileBG: string;
          message: string;
          messageDate: string;
          status: string;
          fromYou: boolean;
        }[] = [];

        const res = await getAllConversationsCO();

        res.forEach((item: any) => {
          chatInfoData.push({
            userID: item.userID,
            chatID: item.chatID,
            shopID: item.shopID,
            shopName: item.shopName,
            profilePic: item.profilePic,
            profileBG: item.profileBG,
            message: item.message,
            messageDate: item.messageDate,
            status: item.status,
            fromYou: item.fromYou,
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
    if (!socket) return;

    socket.on(`updateInbox-CO-${userID}`, ({ groupedChatInfoDataCO }) => {
      setChatInfo(groupedChatInfoDataCO);
    });

    return () => {
      socket.off(`updateInbox-CO-${userID}`);
    };
  }, [userID]);

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
          <TouchableOpacity style={styles.arrowWrapper} onPress={() => router.replace('/car-owner')}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerText}>Chats</Text>
        </View>
      </View>

      <View style={styles.lowerBox}>
        {chatInfo.length === 0 && (
          <View style={styles.noHistoryContainer}>
            <MaterialCommunityIcons name="file-document-outline" size={150} color="#EAEAEA" />
            <Text style={styles.emptyText}>Empty</Text>
          </View>
        )}
        <FlatList
          data={chatInfo.sort((a, b) => b.chatID - a.chatID)}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.conversationButton}
              onPress={() => {
                backRoute();
                dispatch(
                  setSenderReceiverState({
                    senderID: Number(item.userID),
                    receiverID: Number(item.shopID),
                    role: 'car-owner',
                  })
                );
                router.replace('/chat-room/chat-room');
              }}
            >
              {item.profilePic === null && (
                <View style={[styles.profilePicWrapper, { backgroundColor: item.profileBG }]}>
                  <MaterialCommunityIcons name="car-wrench" size={45} color="#FFF" />
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
                      {item.shopName}
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
                      {item.shopName}
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
          )}
          keyExtractor={(item) => item.chatID.toString()}
        />
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
    marginBottom: 100,
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
