import { Loading } from '@/components/Loading';
import { RootState } from '@/redux/store';
import {
  getConversationForCarOwner,
  getConversationForShop,
  getShopInfoForChat,
  getUserInfoForChat,
} from '@/services/backendApi';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { showMessage } from 'react-native-flash-message';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';

const ChatRoom = () => {
  dayjs.extend(utc);

  const senderID: number | null = useSelector((state: RootState) => state.senderReceiver.sender);
  const receiverID: number | null = useSelector((state: RootState) => state.senderReceiver.receiver);
  const role: string | null = useSelector((state: RootState) => state.senderReceiver.role);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [conversation, setConversation] = useState<
    {
      chatID: number;
      senderUserID: number | null;
      senderShopID: number | null;
      receiverUserID: number | null;
      receiverShopID: number | null;
      message: string;
      sentAt: string;
    }[]
  >([]);
  const [receiverFirstname, setReceiverFirstname] = useState<string | null>(null);
  const [receiverLastname, setReceiverLastname] = useState<string | null>(null);
  const [receiverShopName, setReceiverShopName] = useState<string | null>(null);
  const [receiverProfile, setReceiverProfile] = useState<string | null>(null);
  const [receiverProfileBG, setReceiverProfileBG] = useState<string>('');

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
              sentAt: item.sent_at,
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
              sentAt: item.sent_at,
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
    fontFamily: 'LeagueSpartan_Bold',
    fontSize: 22,
    color: '#FFF',
  },
  profilePic: {
    borderRadius: 50,
  },
  name: {
    fontFamily: 'LeagueSpartan',
    fontSize: 22,
    color: '#FFF',
    width: 230,
  },
});

export default ChatRoom;
