import { Loading } from '@/components/Loading';
import { useBackRoute } from '@/hooks/useBackRoute';
import { setSenderReceiverState } from '@/redux/slices/senderReceiverSlice';
import { RootState } from '@/redux/store';
import { getAllConversationsRS } from '@/services/backendApi';
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
  const shopID = useSelector((state: RootState) => state.role.ID);

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

    socket.on(`updateInbox-RS-${shopID}`, ({ groupedChatInfoDataRS }) => {
      setChatInfo(groupedChatInfoDataRS);
    });

    return () => {
      socket.off(`updateInbox-RS-${shopID}`);
    };
  }, [shopID]);

  const transformDate = (date: string) => {
    const messageDate = dayjs(date).utc(true);
    const messageTime = messageDate.format('HH:mm');
    const messageDay = messageDate.date();
    const messageWeek = Math.ceil(messageDate.dayOfYear() / 7);
    const messageMonth = messageDate.month() + 1;
    const messageYear = messageDate.year();

    // Same day
    if (
      messageDay === currentDay &&
      messageWeek === currentWeek &&
      messageMonth === currentMonth &&
      messageYear === currentYear
    ) {
      return messageTime;
    }

    // Same week, same month, same year
    if (messageWeek === currentWeek && messageMonth === currentMonth && messageYear === currentYear) {
      return messageDate.format('ddd');
    }

    // Different year
    if (messageYear !== currentYear) {
      return messageDate.format('DD/MM/YY');
    }

    // Different month, same year
    if (messageMonth !== currentMonth && messageYear === currentYear) {
      return messageDate.format('DD/MM');
    }

    // Default case: different day, same month, same year
    return messageDate.format('DD/MM');
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
        {chatInfo.length === 0 && (
          <View style={styles.noHistoryContainer}>
            <MaterialCommunityIcons name="chat-outline" size={120} color="#D1D5DB" />
            <Text style={styles.emptyText}>No Messages Yet</Text>
            <Text style={styles.emptySubText}>Your conversations will appear here</Text>
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
                    senderID: Number(item.shopID),
                    receiverID: Number(item.customerID),
                    role: 'repair-shop',
                  })
                );
                router.replace('/chat-room/chat-room');
              }}
            >
              <View style={styles.profileSection}>
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

                {!item.fromYou && item.status !== 'seen' && <View style={styles.unreadBadge} />}
              </View>

              <View style={styles.nameMessageContainer}>
                <View style={styles.nameRow}>
                  <Text
                    numberOfLines={1}
                    style={[
                      styles.nameText,
                      {
                        fontFamily: item.fromYou || item.status === 'seen' ? 'BodyRegular' : 'BodyBold',
                      },
                    ]}
                  >
                    {`${item.customerFirstname} ${item.customerLastname}`}
                  </Text>
                  <Text
                    style={[
                      styles.dateText,
                      {
                        fontFamily: item.fromYou || item.status === 'seen' ? 'BodyRegular' : 'BodyBold',
                      },
                    ]}
                  >
                    {transformDate(item.messageDate)}
                  </Text>
                </View>

                <View style={styles.messageDateContainer}>
                  {item.fromYou && (
                    <MaterialCommunityIcons
                      name={item.status === 'seen' ? 'check-all' : 'check'}
                      size={16}
                      color={item.status === 'seen' ? '#10B981' : '#9CA3AF'}
                      style={styles.checkIcon}
                    />
                  )}
                  <Text
                    numberOfLines={2}
                    style={[
                      styles.messageText,
                      {
                        fontFamily: item.fromYou || item.status === 'seen' ? 'BodyRegular' : 'BodyBold',
                        color: item.fromYou || item.status === 'seen' ? '#6B7280' : '#111827',
                      },
                    ]}
                  >
                    {item.message}
                  </Text>
                </View>
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
    marginBottom: 80,
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
  conversationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 10,
    marginVertical: 4,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  profileSection: {
    position: 'relative',
  },
  profilePicWrapper: {
    width: 65,
    height: 65,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 65,
    borderWidth: 2,
    borderColor: '#F3F4F6',
  },
  userInitials: {
    fontFamily: 'HeaderBold',
    fontSize: 20,
    color: '#FFF',
  },
  profilePic: {
    borderRadius: 65,
  },
  unreadBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#EF4444',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  nameMessageContainer: {
    flex: 1,
    gap: 4,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nameText: {
    flex: 1,
    color: '#111827',
    fontSize: 16,
    marginRight: 8,
  },
  messageDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  checkIcon: {
    marginRight: 2,
  },
  messageText: {
    flex: 1,
    color: '#6B7280',
    fontSize: 14,
    lineHeight: 20,
  },
  dateText: {
    color: '#9CA3AF',
    fontSize: 12,
  },
});
