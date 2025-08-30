import { Loading } from '@/components/Loading';
import { getAllConversationsCO, getShopInfoForChat } from '@/services/backendApi';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import dayjs from 'dayjs';
import dayOfYear from 'dayjs/plugin/dayOfYear';
import utc from 'dayjs/plugin/utc';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { showMessage } from 'react-native-flash-message';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ChatsTab() {
  dayjs.extend(utc);
  dayjs.extend(dayOfYear);
  const currentDate = dayjs();
  const currentDay = currentDate.date();
  const currentWeek = Math.ceil(currentDate.dayOfYear() / 7);
  const currentMonth = currentDate.month() + 1;
  const currentYear = currentDate.year();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [chatInfo, setChatInfo] = useState<
    {
      chatID: number;
      name: string;
      profilePic: string | null;
      profileBG: string;
      message: string;
      messageDate: string;
      group: number;
    }[]
  >([]);

  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        const chatInfoData: {
          chatID: number;
          name: string;
          profilePic: string | null;
          profileBG: string;
          message: string;
          messageDate: string;
          group: number;
        }[] = [];

        const res1 = await getAllConversationsCO();

        res1.forEach(async (item: any) => {
          const res2 = await getShopInfoForChat(
            item.sender_repair_shop_id ? item.sender_repair_shop_id : item.receiver_repair_shop_id
          );
          chatInfoData.push({
            chatID: item.chat_id,
            name: res2.shop_name,
            profilePic: res2.profile_pic,
            profileBG: res2.profile_bg,
            message: item.message,
            messageDate: item.sent_at,
            group: res2.repair_shop_id,
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

  const grouped = Object.values(
    chatInfo.reduce(
      (acc, item) => {
        const id = item.group;

        if (!acc[id]) {
          acc[id] = {
            chatID: item.chatID,
            name: item.name,
            profilePic: item.profilePic,
            profileBG: item.profileBG,
            message: [item.message],
            messageDate: [item.messageDate],
            group: item.group,
          };
        } else {
          acc[id].message.push(item.message);
          acc[id].messageDate.push(item.messageDate);
        }

        return acc;
      },
      {} as Record<
        string,
        {
          chatID: number;
          name: string;
          profilePic: string | null;
          profileBG: string;
          message: string[];
          messageDate: string[];
          group: number;
        }
      >
    )
  );

  const transformDate = (date: string) => {
    const messageDate = dayjs(date);
    const messageTime = messageDate.format('HH:mm');
    const messageDay = messageDate.date();
    const messageWeek = Math.ceil(messageDate.dayOfYear() / 7);
    const messageMonth = messageDate.month() + 1;
    const messageYear = messageDate.year();

    console.log(currentWeek);
    console.log(messageWeek);

    if (messageDay === currentDay) {
      return messageTime;
    }

    if (messageWeek === currentWeek) {
      return messageDate.format('ddd');
    }

    if (messageMonth === currentMonth) {
      return messageDate.format('DD/MM');
    }

    if (messageYear === currentYear) {
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

      {grouped.map((item) => (
        <View key={item.chatID} style={styles.lowerBox}>
          <TouchableOpacity style={styles.conversationButton}>
            {item.profilePic === null && (
              <View style={[styles.profilePicWrapper, { backgroundColor: item.profileBG }]}>
                <MaterialCommunityIcons name="car-wrench" size={50} color="#FFF" />
              </View>
            )}

            {item.profilePic !== null && (
              <View style={styles.profilePicWrapper}>
                <Image style={styles.profilePic} source={{ uri: item.profilePic }} width={70} height={70} />
              </View>
            )}

            <View style={styles.nameMessageContainer}>
              <Text numberOfLines={1} style={styles.nameText}>
                {item.name}
              </Text>
              <View style={styles.messageDateContainer}>
                <Text numberOfLines={1} style={styles.messageText}>
                  {item.message[item.message.length - 1]}
                </Text>
                <Text style={styles.dateText}>{transformDate(item.messageDate[item.messageDate.length - 1])}</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      ))}
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
    gap: 20,
  },
  profilePicWrapper: {
    width: 70,
    height: 70,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 70,
  },
  profilePic: {
    borderRadius: 70,
  },
  nameMessageContainer: {
    backgroundColor: 'yellow',
    width: '74%',
  },
  nameText: {
    backgroundColor: 'red',
    width: '100%',
  },
  messageDateContainer: {},
  messageText: {},
  dateText: {},
});
