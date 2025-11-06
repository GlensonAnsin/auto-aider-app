import { Loading } from '@/components/Loading';
import { popRouteState } from '@/redux/slices/routeSlice';
import { RootState } from '@/redux/store';
import {
  getConversationForCarOwner,
  getConversationForShop,
  getShopInfoForChat,
  getUserInfoForChat,
} from '@/services/backendApi';
import socket from '@/services/socket';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { Audio } from 'expo-av';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { FlatList, Image, Keyboard, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { showMessage } from 'react-native-flash-message';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';

dayjs.extend(utc);

const ChatRoom = () => {
  const flatListRef = useRef<any>(null);
  const viewConfigRef = useRef({ viewAreaCoveragePercentThreshold: 50 });
  const dispatch = useDispatch();
  const router = useRouter();

  const routes: any[] = useSelector((state: RootState) => state.route.route);
  const senderID: number | null = useSelector((state: RootState) => state.senderReceiver.sender);
  const receiverID: number | null = useSelector((state: RootState) => state.senderReceiver.receiver);
  const role: string | null = useSelector((state: RootState) => state.senderReceiver.role);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [conversation, setConversation] = useState<
    {
      chatID: number;
      senderUserID: number | null;
      senderShopID: number | null;
      receiverUserID: number | null;
      receiverShopID: number | null;
      message: string;
      sentAt: string;
      status: string;
      fromYou: boolean;
    }[]
  >([]);
  const [receiverFirstname, setReceiverFirstname] = useState<string | null>(null);
  const [receiverLastname, setReceiverLastname] = useState<string | null>(null);
  const [receiverShopName, setReceiverShopName] = useState<string | null>(null);
  const [receiverProfile, setReceiverProfile] = useState<string | null>(null);
  const [receiverProfileBG, setReceiverProfileBG] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [isReceiverOnline, setIsReceiverOnline] = useState<boolean>(false);
  const reversedConversation = conversation.slice().reverse();

  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        const conversationData: {
          chatID: number;
          senderUserID: number | null;
          senderShopID: number | null;
          receiverUserID: number | null;
          receiverShopID: number | null;
          message: string;
          sentAt: string;
          status: string;
          fromYou: boolean;
        }[] = [];

        if (role === 'car-owner') {
          const res1 = await getConversationForCarOwner(receiverID ?? 0);
          const res2 = await getShopInfoForChat(receiverID ?? 0);

          res1.forEach((item: any) => {
            conversationData.push({
              chatID: item.chat_id,
              senderUserID: item.sender_user_id,
              senderShopID: item.sender_repair_shop_id,
              receiverUserID: item.receiver_user_id,
              receiverShopID: item.receiver_repair_shop_id,
              message: item.message,
              sentAt: dayjs(item.sent_at).utc(true).format('HH:mm'),
              status: item.status,
              fromYou: Number(item.sender_user_id) === senderID ? true : false,
            });
          });

          setConversation(conversationData);

          setReceiverFirstname(null);
          setReceiverLastname(null);
          setReceiverShopName(res2.shop_name);
          setReceiverProfile(res2.profile_pic);
          setReceiverProfileBG(res2.profile_bg);
        } else {
          const res1 = await getConversationForShop(receiverID ?? 0);
          const res2 = await getUserInfoForChat(receiverID ?? 0);

          res1.forEach((item: any) => {
            conversationData.push({
              chatID: item.chat_id,
              senderUserID: item.sender_user_id,
              senderShopID: item.sender_repair_shop_id,
              receiverUserID: item.receiver_user_id,
              receiverShopID: item.receiver_repair_shop_id,
              message: item.message,
              sentAt: dayjs(item.sent_at).utc(true).format('HH:mm'),
              status: item.status,
              fromYou: Number(item.sender_repair_shop_id) === senderID ? true : false,
            });
          });

          setConversation(conversationData);

          setReceiverFirstname(res2.firstname);
          setReceiverLastname(res2.lastname);
          setReceiverShopName(null);
          setReceiverProfile(res2.profile_pic);
          setReceiverProfileBG(res2.user_initials_bg);
        }
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
  }, [senderID, receiverID, role, router]);

  useEffect(() => {
    if (!socket) return;

    if (role === 'car-owner') {
      socket.emit('checkOnlineStatus', { ID: receiverID, role: 'car-owner' }, (res: { online: boolean }) => {
        setIsReceiverOnline(res.online);
      });

      socket.on('shopOnline', ({ ID, isOnline }) => {
        if (ID === receiverID) {
          setIsReceiverOnline(isOnline);
        }
      });

      socket.on('shopOffline', ({ ID, isOnline }) => {
        if (ID === receiverID) {
          setIsReceiverOnline(isOnline);
        }
      });

      socket.on('receiveMessageCO', ({ newChatCO }) => {
        if (
          (Number(newChatCO.receiverShopID) === receiverID && Number(newChatCO.senderUserID) === senderID) ||
          (Number(newChatCO.senderShopID) === receiverID && Number(newChatCO.receiverUserID) === senderID)
        ) {
          const formattedConversation = {
            ...newChatCO,
            sentAt: dayjs(newChatCO.sentAt).utc(true).format('HH:mm'),
          };

          setConversation((prev) => [...prev, formattedConversation]);

          if (!formattedConversation.fromYou) {
            socket.emit('updateStatus', {
              chatIDs: [Number(formattedConversation.chatID)],
              status: 'seen',
            });
          }
        }
      });
    } else {
      socket.emit('checkOnlineStatus', { ID: receiverID, role: 'repair-shop' }, (res: { online: boolean }) => {
        setIsReceiverOnline(res.online);
      });

      socket.on('userOnline', ({ ID, isOnline }) => {
        if (ID === receiverID) {
          setIsReceiverOnline(isOnline);
        }
      });

      socket.on('userOffline', ({ ID, isOnline }) => {
        if (ID === receiverID) {
          setIsReceiverOnline(isOnline);
        }
      });

      socket.on('receiveMessageRS', ({ newChatRS }) => {
        if (
          (Number(newChatRS.receiverUserID) === receiverID && Number(newChatRS.senderShopID) === senderID) ||
          (Number(newChatRS.senderUserID) === receiverID && Number(newChatRS.receiverShopID) === senderID)
        ) {
          const formattedConversation = {
            ...newChatRS,
            sentAt: dayjs(newChatRS.sentAt).utc(true).format('HH:mm'),
          };

          setConversation((prev) => [...prev, formattedConversation]);

          if (!formattedConversation.fromYou) {
            socket.emit('updateStatus', {
              chatIDs: [Number(formattedConversation.chatID)],
              status: 'seen',
            });
          }
        }
      });
    }

    socket.on('updatedMessage', ({ updatedChat }) => {
      setConversation((prevConversation) =>
        prevConversation.map((item) => {
          const matched = updatedChat.find((msg: any) => Number(msg.chatID) === Number(item.chatID));
          return matched ? { ...item, status: matched.status } : item;
        })
      );
    });

    return () => {
      socket.off('userOnline');
      socket.off('shopOnline');
      socket.off('userOffline');
      socket.off('shopOffline');
      socket.off('receiveMessageCO');
      socket.off('receiveMessageRS');
      socket.off('updatedMessage');
    };
  }, [receiverID, role, senderID]);

  useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  const sendMessage = async () => {
    if (!socket || isSending) return;

    setIsSending(true);

    socket.emit('sendMessage', {
      senderID: Number(senderID),
      receiverID: Number(receiverID),
      role: role,
      message,
      sentAt: dayjs().format(),
    });

    Keyboard.dismiss();
    flatListRef.current?.scrollToOffset({ offset: 0, animated: true });

    const { sound } = await Audio.Sound.createAsync(require('../../assets/sounds/bubble-pop.mp3'));
    setSound(sound);
    await sound.playAsync();
    setMessage('');

    // Brief delay to prevent rapid multiple sends
    setTimeout(() => {
      setIsSending(false);
    }, 500);
  };

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (!socket) return;
    const newSeenIDs: number[] = [];

    const unreadMessages = viewableItems.filter(({ item }: any) => item.fromYou === false && item.status === 'unread');

    unreadMessages.forEach(({ item }: any) => {
      newSeenIDs.push(Number(item.chatID));
    });

    if (newSeenIDs.length > 0) {
      socket.emit('updateStatus', {
        chatIDs: newSeenIDs,
        status: 'seen',
      });
      newSeenIDs.length = 0;
    }
  });

  if (isLoading) {
    return <Loading />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.arrowWrapper}
          onPress={() => {
            router.replace(routes[routes.length - 1]);
            dispatch(popRouteState());
          }}
        >
          <MaterialCommunityIcons name="arrow-left" style={styles.arrowBack} />
        </TouchableOpacity>
        <View style={styles.receiverInfo}>
          <View style={styles.profileSection}>
            {receiverProfile === null && (
              <View style={[styles.profileWrapper, { backgroundColor: receiverProfileBG }]}>
                {role === 'car-owner' && <MaterialCommunityIcons name="car-wrench" size={30} color="#FFF" />}

                {role === 'repair-shop' && (
                  <Text style={styles.userInitials}>{`${receiverFirstname?.[0]}${receiverLastname?.[0]}`}</Text>
                )}
              </View>
            )}

            {receiverProfile !== null && (
              <View style={styles.profileWrapper}>
                <Image style={styles.profilePic} source={{ uri: receiverProfile }} width={50} height={50} />
              </View>
            )}

            {isReceiverOnline && <View style={styles.onlineIndicator} />}
          </View>

          <View style={styles.nameStatusContainer}>
            {role === 'car-owner' && (
              <>
                <Text numberOfLines={1} style={styles.name}>
                  {receiverShopName}
                </Text>
                <View style={styles.statusRow}>
                  <View style={[styles.statusDot, { backgroundColor: isReceiverOnline ? '#10B981' : '#9CA3AF' }]} />
                  <Text style={styles.onlineStatus}>{isReceiverOnline ? 'Online' : 'Away'}</Text>
                </View>
              </>
            )}

            {role === 'repair-shop' && (
              <>
                <Text numberOfLines={1} style={styles.name}>{`${receiverFirstname} ${receiverLastname}`}</Text>
                <View style={styles.statusRow}>
                  <View style={[styles.statusDot, { backgroundColor: isReceiverOnline ? '#10B981' : '#9CA3AF' }]} />
                  <Text style={styles.onlineStatus}>{isReceiverOnline ? 'Online' : 'Away'}</Text>
                </View>
              </>
            )}
          </View>
        </View>
      </View>

      <FlatList
        data={reversedConversation}
        ref={flatListRef}
        style={{ flex: 1, backgroundColor: '#f2f4f7' }}
        keyboardShouldPersistTaps="handled"
        inverted
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={5}
        removeClippedSubviews={true}
        onViewableItemsChanged={onViewableItemsChanged.current}
        viewabilityConfig={viewConfigRef.current}
        renderItem={({ item }) => (
          <View
            style={[
              styles.messageContainer,
              {
                alignSelf: item.fromYou ? 'flex-end' : 'flex-start',
                backgroundColor: item.fromYou ? '#000B58' : '#FFFFFF',
                borderBottomRightRadius: item.fromYou ? 4 : 20,
                borderBottomLeftRadius: item.fromYou ? 20 : 4,
              },
            ]}
          >
            <Text
              style={[
                styles.messageText,
                {
                  color: item.fromYou ? '#FFF' : '#1F2937',
                },
              ]}
            >
              {item.message}
            </Text>
            <View style={styles.dateCheckContainer}>
              <Text
                style={[
                  styles.dateText,
                  {
                    color: item.fromYou ? '#E0E7FF' : '#9CA3AF',
                  },
                ]}
              >
                {item.sentAt}
              </Text>
              {item.fromYou && (
                <>
                  {item.status === 'seen' && <Ionicons name="checkmark-done-sharp" size={14} color="#10B981" />}
                  {item.status === 'unread' && <Ionicons name="checkmark-sharp" size={14} color="#E0E7FF" />}
                </>
              )}
            </View>
          </View>
        )}
        keyExtractor={(_, index) => index.toString()}
      />

      <View style={styles.messageInputContainer}>
        <TextInput
          value={message}
          onChangeText={setMessage}
          placeholder="Type a message..."
          placeholderTextColor="#9CA3AF"
          multiline={true}
          numberOfLines={6}
          style={styles.messageInput}
        />
        <TouchableOpacity style={styles.sendButton} disabled={!message || isSending} onPress={() => sendMessage()}>
          <View style={[styles.sendIconWrapper, { opacity: !message || isSending ? 0.4 : 1 }]}>
            <Ionicons name="send" size={20} color="#FFF" />
          </View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    backgroundColor: '#000B58',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    height: 63,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 4,
  },
  arrowWrapper: {
    marginLeft: 10,
    padding: 8,
    borderRadius: 20,
  },
  arrowBack: {
    fontSize: 24,
    color: '#FFF',
  },
  receiverInfo: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  profileSection: {
    position: 'relative',
  },
  profileWrapper: {
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 50,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#000B58',
  },
  userInitials: {
    fontFamily: 'HeaderBold',
    fontSize: 18,
    color: '#FFF',
  },
  profilePic: {
    borderRadius: 50,
  },
  nameStatusContainer: {
    gap: 2,
  },
  name: {
    fontFamily: 'HeaderBold',
    fontSize: 17,
    color: '#FFF',
    width: 220,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  onlineStatus: {
    fontFamily: 'BodyRegular',
    color: '#E5E7EB',
    fontSize: 13,
  },
  messageContainer: {
    padding: 12,
    marginHorizontal: 12,
    marginVertical: 4,
    borderRadius: 20,
    maxWidth: '75%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  messageText: {
    fontFamily: 'BodyRegular',
    fontSize: 15,
    lineHeight: 20,
  },
  dateText: {
    fontFamily: 'BodyRegular',
    fontSize: 11,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  dateCheckContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  messageInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 8,
  },
  messageInput: {
    borderRadius: 24,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#F3F4F6',
    fontFamily: 'BodyRegular',
    color: '#1F2937',
    fontSize: 15,
    flex: 1,
    maxHeight: 120,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  sendButton: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 4,
  },
  sendIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#000B58',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000B58',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
});

export default ChatRoom;
