import { Loading } from '@/components/Loading';
import { getRepairShopInfo } from '@/services/backendApi';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import Fontisto from '@expo/vector-icons/Fontisto';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useEffect, useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import Carousel from 'react-native-reanimated-carousel';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Home() {
  const { width: screenWidth } = Dimensions.get('window');

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [repShopName, setRepShopName] = useState<string>('');
  const [ownerFirstname, setOwnerFirstname] = useState<string>('');
  const [ownerLastname, setOwnerLastname] = useState<string>('');
  const [gender, setGender] = useState<string>('');
  const [mobileNum, setMobileNum] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [ratingsNum, setRatingsNum] = useState<number>(0);
  const [averageRating, setAverageRating] = useState<number>(0);
  const [servicesOffered, setServicesOffered] = useState<string[]>([]);
  const [profilePic, setProfilePic] = useState<string | null>(null)
  const [shopImages, setShopImages] = useState<string[]>([]);
  const [isEnabled, setIsEnabled] = useState<boolean>(false);

  const toggleSwitch = () => setIsEnabled(previousState => !previousState);

  const data = [
    {id: 1, color: 'green'},
    {id: 2, color: 'blue'},
    {id: 3, color: 'red'},
    {id: 4, color: 'teal'},
    {id: 5, color: 'cyan'},
  ];

  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        const res = await getRepairShopInfo();

        setRepShopName(res.shop_name);
        setOwnerFirstname(res.owner_firstname);
        setOwnerLastname(res.owner_lastname);
        setGender(res.gender);
        setMobileNum(res.mobile_num);
        setEmail(res.email);
        setRatingsNum(res.number_of_ratings);
        setAverageRating(res.average_rating);
        setServicesOffered(res.services_offered);
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
      <ScrollView>
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
              <MaterialCommunityIcons name='car-wrench' size={50} color='#FFF' />
            </View>

            <View style={styles.repShopNameContainer}>
              <Text style={styles.repShopName}>{repShopName}</Text>
              <View style={styles.genderNameContainer}>
                {gender === 'Male' && (
                  <>
                    <Fontisto name='male' size={16} color='#555' />
                    <Text style={styles.contactText}>{`${ownerFirstname} ${ownerLastname}`}</Text>
                  </>
                )}

                {gender === 'Female' && (
                  <>
                    <Fontisto name='female' size={16} color='#555' />
                    <Text style={styles.contactText}>{`${ownerFirstname} ${ownerLastname}`}</Text>
                  </>
                )}
              </View>
              <Text style={styles.contactText}>{mobileNum}</Text>
              {email !== null && (
                <Text style={styles.contactText}>{email}</Text>
              )}

              <View style={styles.ratingSwitchContainer}>
                <View style={styles.ratingContainer}>
                  <Fontisto name='persons' size={16} color='#555' />
                  <Text style={styles.rating}>{ratingsNum}</Text>
                  <MaterialIcons name='star-rate' size={16} color='#FDCC0D' />
                  <Text style={styles.rating}>{averageRating}</Text>
                </View>

                <View style={styles.availabilityContainer}>
                  <Text style={styles.availabilityText}>Availability</Text>
                  <Switch
                    trackColor={{false: '#767577', true: '#000B58'}}
                    thumbColor={isEnabled ? '#EEE' : '#DDD'}
                    ios_backgroundColor='#3e3e3e'
                    onValueChange={toggleSwitch}
                    value={isEnabled}
                  />
                </View>
              </View>
            </View>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button}>
                <MaterialIcons name='manage-history' size={15} color='#FFF' />
                <Text style={styles.buttonText}>History</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.button}>
                <FontAwesome6 name='screwdriver-wrench' size={10} color='#FFF' />
                <Text style={styles.buttonText}>Requests</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.button}>
                <FontAwesome6 name='edit' size={10} color='#FFF' />
                <Text style={styles.buttonText}>Edit Shop</Text>
              </TouchableOpacity>
          </View>

          <View style={styles.shopImages}>
            <Text style={styles.subHeader}>Shop Images</Text>
            <Carousel
              width={screenWidth * 0.9}
              height={200}
              data={data}
              mode='parallax'
              autoPlay={true}
              autoPlayInterval={3000}
              scrollAnimationDuration={2000}
              loop={true}
              renderItem={({ item }) => (
                <View style={[styles.carouselItem, { backgroundColor: item.color }]}>
                  <Text style={styles.carouselText}>{`Item ${item.id}`}</Text>
                </View>
              )}
            />
          </View>

          <View style={styles.servicesOffered}>
              <Text style={styles.subHeader}>Services Offered</Text>
              {servicesOffered.map((item) => (
                <View key={item} style={styles.services}>
                  <Text style={styles.bullet}>{`\u2022`}</Text>
                  <Text style={styles.servicesText}>{item}</Text>
                </View>
              ))}
            </View>
        </View>
      </ScrollView>
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
    lowerBox: {
      width: '90%',
      alignSelf: 'center',
      marginTop: 20,
      marginBottom: 100,
    },
    repShopUpperContainer: {
      flexDirection: 'row',
      gap: 20,
      width: '100%',
    },
    profilePicWrapper: {
      backgroundColor: 'green',
      width: 100,
      height: 100,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 100,
    },
    repShopNameContainer: {
      width: '63%',
    },
    repShopName: {
      fontFamily: 'LeagueSpartan_Bold',
      color: '#333',
      fontSize: 22,
    },
    genderNameContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 3,
    },
    contactText: {
      fontFamily: 'LeagueSpartan',
      color: '#555',
      fontSize: 16,
    },
    ratingSwitchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    ratingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 3,
    },
    rating: {
      fontFamily: 'LeagueSpartan',
      color: '#555',
      fontSize: 16,
    },
    availabilityContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
    },
    availabilityText: {
      fontFamily: 'LeagueSpartan',
      fontSize: 16,
      color: '#555',
    },
    buttonContainer: {
      justifyContent: 'space-evenly',
      width: '100%',
      flexDirection: 'row',
      flexWrap: 'wrap',
      borderBottomWidth: 1,
      borderColor: '#EAEAEA',
      paddingBottom: 20,
    },
    button: {
      backgroundColor: '#000B58',
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'row',
      gap: 3,
      width: 90,
      padding: 5,
      borderRadius: 5,
    },
    buttonText: {
      fontFamily: 'LeagueSpartan',
      fontSize: 14,
      color: '#FFF',
    },
    shopImages: {
      width: '100%',
      marginTop: 20,
      paddingBottom: 20,
    },
    subHeader: {
      fontFamily: 'LeagueSpartan_Bold',
      color: '#333',
      fontSize: 20,
      marginBottom: 10,
    },
    carouselItem: {
      flex: 1,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
    },
    carouselText: {
      color: '#fff',
      fontFamily: 'LeagueSpartan',
      fontSize: 24,
    },
    servicesOffered: {
      width: '100%',
    },
    services: {
      width: '100%',
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      paddingLeft: 5
    },
    bullet: {
      fontFamily: 'LeagueSpartan_Bold',
      color: '#333',
      fontSize: 16,
    },
    servicesText: {
      fontFamily: 'LeagueSpartan',
      color: '#333',
      fontSize: 16,
    },
});