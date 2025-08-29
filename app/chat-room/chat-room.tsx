import { Loading } from '@/components/Loading';
import { RootState } from '@/redux/store';
import {
  getConversationForCarOwner,
  getConversationForShop,
  getShopInfoForChat,
  getUserInfoForChat,
} from '@/services/backendApi';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { Audio } from 'expo-av';
import { useEffect, useRef, useState } from 'react';
import { Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { showMessage } from 'react-native-flash-message';
import { KeyboardAwareFlatList } from 'react-native-keyboard-aware-scroll-view';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { io } from 'socket.io-client';

dayjs.extend(utc);
const socket = io(process.env.EXPO_PUBLIC_BACKEND_BASE_URL);

const ChatRoom = () => {
  const flatListRef = useRef<any>(null);
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
      fromYou: boolean;
    }[]
  >([]);
  const [receiverFirstname, setReceiverFirstname] = useState<string | null>(null);
  const [receiverLastname, setReceiverLastname] = useState<string | null>(null);
  const [receiverShopName, setReceiverShopName] = useState<string | null>(null);
  const [receiverProfile, setReceiverProfile] = useState<string | null>(null);
  const [receiverProfileBG, setReceiverProfileBG] = useState<string>('');
  const [message, setMessage] = useState<string>('');

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
          fromYou: boolean;
        }[] = [];

        if (role === 'car-owner') {
          const res1 = await getConversationForCarOwner(Number(receiverID ?? 0));
          const res2 = await getShopInfoForChat(Number(receiverID ?? 0));

          res1.forEach((item: any) => {
            conversationData.push({
              chatID: item.chat_id,
              senderUserID: item.sender_user_id,
              senderShopID: item.sender_repair_shop_id,
              receiverUserID: item.receiver_user_id,
              receiverShopID: item.receiver_repair_shop_id,
              message: item.message,
              sentAt: dayjs(item.sent_at).utc(true).local().format('HH:mm'),
              fromYou: item.sender_user_id === senderID ? true : false,
            });
          });

          setConversation(conversationData);

          setReceiverFirstname(null);
          setReceiverLastname(null);
          setReceiverShopName(res2.shop_name);
          setReceiverProfile(res2.profile_pic);
          setReceiverProfileBG(res2.profile_bg);
        } else {
          const res1 = await getConversationForShop(Number(receiverID ?? 0));
          const res2 = await getUserInfoForChat(Number(receiverID ?? 0));

          res1.forEach((item: any) => {
            conversationData.push({
              chatID: item.chat_id,
              senderUserID: item.sender_user_id,
              senderShopID: item.sender_repair_shop_id,
              receiverUserID: item.receiver_user_id,
              receiverShopID: item.receiver_repair_shop_id,
              message: item.message,
              sentAt: dayjs(item.sent_at).utc(true).local().format('HH:mm'),
              fromYou: item.sender_repair_shop_id === senderID ? true : false,
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
    socket.on('connect', () => {
      console.log('Connected to server: ', socket.id);
    });

    socket.on('receiveMessage', ({ conversation }) => {
      if (role === 'car-owner') {
        const formattedConversation = {
          ...conversation,
          sentAt: dayjs(conversation.sent_at).utc(true).local().format('HH:mm'),
          fromYou: conversation.sender_user_id === senderID ? true : false,
        };
        setConversation((prev) => [...prev, formattedConversation]);
      } else {
        const formattedConversation = {
          ...conversation,
          sentAt: dayjs(conversation.sent_at).utc(true).local().format('HH:mm'),
          fromYou: conversation.sender_repair_shop_id === senderID ? true : false,
        };
        setConversation((prev) => [...prev, formattedConversation]);
      }
    });

    return () => {
      socket.off('receiveMessage');
      socket.disconnect();
    };
  }, [role, senderID]);

  useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  const sendMessage = async () => {
    if (message.trim() !== '') {
      socket.emit('sendMessage', {
        senderID: Number(senderID),
        receiverID: Number(receiverID),
        role: role,
        message,
        sentAt: dayjs().format(),
      });

      const { sound } = await Audio.Sound.createAsync(require('../../assets/sounds/bubble-pop.mp3'));
      setSound(sound);
      await sound.playAsync();

      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
      setMessage('');
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.arrowWrapper}>
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

          {role === 'car-owner' && (
            <Text numberOfLines={1} style={styles.name}>
              {receiverShopName}
            </Text>
          )}
          {role === 'repair-shop' && <Text style={styles.name}>{`${receiverFirstname} ${receiverLastname}`}</Text>}
        </View>
      </View>

      <KeyboardAwareFlatList
        data={conversation}
        ref={flatListRef}
        style={{ flex: 1, backgroundColor: '#F9FAFB' }}
        keyboardShouldPersistTaps="handled"
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
        renderItem={({ item }) => (
          <View
            style={{
              alignSelf: item.fromYou ? 'flex-end' : 'flex-start',
              backgroundColor: item.fromYou ? '#1E3A8A' : '#E5E7EB',
              padding: 10,
              marginHorizontal: 10,
              marginVertical: 5,
              borderRadius: 20,
              maxWidth: '75%',
            }}
          >
            <Text
              style={{
                fontFamily: 'BodyRegular',
                color: item.fromYou ? '#FFF' : '#333',
              }}
            >
              {item.message}
            </Text>
            <Text
              style={{
                fontFamily: 'BodyRegular',
                fontSize: 10,
                color: item.fromYou ? '#FFF' : '#333',
                marginTop: 4,
                alignSelf: 'flex-end',
              }}
            >
              {item.sentAt}
            </Text>
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
    backgroundColor: '#FFF',
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
    backgroundColor: '#EAEAEA',
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
