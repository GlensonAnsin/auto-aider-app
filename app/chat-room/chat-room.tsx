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
import { FlatList, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
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
              sentAt: dayjs(item.sent_at).utc(true).local().format('HH:mm'),
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
              sentAt: dayjs(item.sent_at).utc(true).local().format('HH:mm'),
              status: item.status,
              fromYou: Number(item.sender_repair_shop_id) === senderID ? true : false,
            });
          });

          setConversation(conversationData);

          setReceiverFirstname(res2.firstname);
          setReceiverLastname(res2.lastname);
          setReceiverShopName(null);
          setReceiverProfile(res2.profile_pic);
          setReceiverProfileBG(res2.profile_bg);
        }
      } catch (e) {
        console.error(e);
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
  }, [senderID, receiverID, role]);

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
            sentAt: dayjs(newChatCO.sentAt).utc(true).local().format('HH:mm'),
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
            sentAt: dayjs(newChatRS.sentAt).utc(true).local().format('HH:mm'),
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
    if (!socket) return;

    socket.emit('sendMessage', {
      senderID: Number(senderID),
      receiverID: Number(receiverID),
      role: role,
      message,
      sentAt: dayjs().format(),
    });

    flatListRef.current?.scrollToOffset({ offset: 0, animated: true });

    const { sound } = await Audio.Sound.createAsync(require('../../assets/sounds/bubble-pop.mp3'));
    setSound(sound);
    await sound.playAsync();
    setMessage('');
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

          <View>
            {role === 'car-owner' && (
              <>
                <Text numberOfLines={1} style={styles.name}>
                  {receiverShopName}
                </Text>
                {isReceiverOnline && <Text style={styles.onlineStatus}>Online</Text>}
                {!isReceiverOnline && <Text style={styles.onlineStatus}>Away</Text>}
              </>
            )}

            {role === 'repair-shop' && (
              <>
                <Text numberOfLines={1} style={styles.name}>{`${receiverFirstname} ${receiverLastname}`}</Text>
                {isReceiverOnline && <Text style={styles.onlineStatus}>Online</Text>}
                {!isReceiverOnline && <Text style={styles.onlineStatus}>Away</Text>}
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
                backgroundColor: item.fromYou ? '#1E3A8A' : '#E5E7EB',
              },
            ]}
          >
            <Text
              style={[
                styles.messageText,
                {
                  color: item.fromYou ? '#FFF' : '#333',
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
                    color: item.fromYou ? '#FFF' : '#333',
                  },
                ]}
              >
                {item.sentAt}
              </Text>
              {item.fromYou && (
                <>
                  {item.status === 'seen' && <Ionicons name="checkmark-done-sharp" size={12} color="#FFF" />}
                  {item.status === 'unread' && <Ionicons name="checkmark-sharp" size={12} color="#FFF" />}
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
          placeholder="Message"
          placeholderTextColor="#555"
          multiline={true}
          numberOfLines={6}
          style={styles.messageInput}
        />
        <TouchableOpacity style={styles.sendButton} disabled={message ? false : true} onPress={() => sendMessage()}>
          <Ionicons name="send" size={24} color={message ? '#FFF' : '#E1E1E1'} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f4f7',
  },
  header: {
    backgroundColor: '#000B58',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    height: 63,
    gap: 10,
  },
  arrowWrapper: {
    marginLeft: 10,
  },
  arrowBack: {
    fontSize: 22,
    color: '#FFF',
  },
  receiverInfo: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  profileWrapper: {
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 50,
  },
  userInitials: {
    fontFamily: 'HeaderBold',
    fontSize: 20,
    color: '#FFF',
  },
  profilePic: {
    borderRadius: 50,
  },
  name: {
    fontFamily: 'HeaderRegular',
    fontSize: 18,
    color: '#FFF',
    width: 230,
  },
  onlineStatus: {
    fontFamily: 'HeaderRegular',
    color: '#FFF',
    fontSize: 12,
  },
  messageContainer: {
    padding: 10,
    marginHorizontal: 10,
    marginVertical: 5,
    borderRadius: 20,
    maxWidth: '75%',
  },
  messageText: {
    fontFamily: 'BodyRegular',
  },
  dateText: {
    fontFamily: 'BodyRegular',
    fontSize: 10,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  dateCheckContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 2,
  },
  messageInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#000B58',
    paddingVertical: 10,
    paddingHorizontal: 20,
    gap: 10,
  },
  messageInput: {
    borderRadius: 20,
    padding: 10,
    backgroundColor: '#fff',
    fontFamily: 'BodyRegular',
    color: '#333',
    flex: 1,
  },
  sendButton: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
  },
});

export default ChatRoom;
