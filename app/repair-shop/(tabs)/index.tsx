import { Loading } from '@/components/Loading';
import { getRepairShopInfo } from '@/services/backendApi';
import Fontisto from '@expo/vector-icons/Fontisto';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Home() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [repShopName, setRepShopName] = useState<string>('');
  const [ownerFirstname, setOwnerFirstname] = useState<string>('');
  const [ownerLastname, setOwnerLastname] = useState<string>('');
  const [mobileNum, setMobileNum] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [ratingsNum, setRatingsNum] = useState<number>(0);
  const [averageRating, setAverageRating] = useState<number>(0);
  const [profilePic, setProfilePic] = useState<string | null>(null)
  const [shopImages, setShopImages] = useState<string[]>([]);

  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        const res = await getRepairShopInfo();

        setRepShopName(res.shop_name);
        setOwnerFirstname(res.owner_firstname);
        setOwnerLastname(res.owner_lastname);
        setMobileNum(res.mobile_num);
        setEmail(res.email);
        setRatingsNum(res.number_of_ratings);
        setAverageRating(res.average_rating);
        setProfilePic(res.profile_pic);
        setShopImages(res.shop_images);

      } catch (e) {
        console.log('Error: ', e);

      } finally {
        setIsLoading(false);
      }
    })()
  }, []);

  if (isLoading) {
    return <Loading />
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.upperBox}>
        <Text style={styles.header}>Auto Repair Shop</Text>
        <TouchableOpacity style={styles.iconWrapper}>
            <MaterialCommunityIcons name='logout' style={styles.icon}
            />
        </TouchableOpacity>
      </View>

      <View style={styles.lowerBox}>
        <View style={styles.repShopUpperContainer}>
          <View style={styles.profilePicWrapper}>
            <MaterialCommunityIcons name='car-wrench' size={24} color='#FFF' />
          </View>

          <View style={styles.repShopNameContainer}>
            <Text style={styles.repShopName}>{repShopName}</Text>
            <Text style={styles.contactText}>{`${ownerFirstname} ${ownerLastname}`}</Text>
            <Text style={styles.contactText}>{mobileNum}</Text>
            <Text style={styles.contactText}>{email}</Text>
            <View style={styles.ratingContainer}>
              <Fontisto name='persons' size={24} color='black' />
              <Text style={styles.rating}>{ratingsNum}</Text>
              <MaterialIcons name='star-rate' size={24} color='black' />
              <Text style={styles.rating}>{averageRating}</Text>
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF',
    },
    upperBox: {
        backgroundColor: '#000B58',
        justifyContent: 'center',
        alignItems: 'center',
        height: 63,
    },
    header: {
        color: '#FFF',
        fontFamily: 'LeagueSpartan_Bold',
        fontSize: 22,
    },
    iconWrapper: {
        top: 23,
        right: 320,
        position: 'absolute',
    },
    icon: {
        fontSize: 22,
        color: '#FFF',
    },
    lowerBox: {},
    repShopUpperContainer: {},
    profilePicWrapper: {},
    repShopNameContainer: {},
    repShopName: {
      fontFamily: 'LeagueSpartan_Bold',
      color: '#333',
    },
    contactText: {
      fontFamily: 'LeagueSpartan_Bold',
      color: '#555',
    },
    ratingContainer: {},
    rating: {
      fontFamily: 'LeagueSpartan_Bold',
      color: '#555',
    },
});