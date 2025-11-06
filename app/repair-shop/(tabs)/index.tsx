import { Loading } from '@/components/Loading';
import { useBackRoute } from '@/hooks/useBackRoute';
import { clearRoleState, setRoleState } from '@/redux/slices/roleSlice';
import { clearRouteState } from '@/redux/slices/routeSlice';
import { clearScanReferenceState } from '@/redux/slices/scanReferenceSlice';
import { clearScanState } from '@/redux/slices/scanSlice';
import { clearSenderReceiverState } from '@/redux/slices/senderReceiverSlice';
import { setSettingsState } from '@/redux/slices/settingsSlice';
import { clearVehicleDiagIDArrState } from '@/redux/slices/vehicleDiagIDArrSlice';
import { clearVehicleDiagIDState } from '@/redux/slices/vehicleDiagIDSlice';
import { getRepairShopInfo, updateAvailability } from '@/services/backendApi';
import { registerForPushNotificationsAsync } from '@/services/notifications';
import socket from '@/services/socket';
import { clearRole, clearTokens, storeRole } from '@/services/tokenStorage';
import Fontisto from '@expo/vector-icons/Fontisto';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import axios from 'axios';
import dayjs from 'dayjs';
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Dimensions,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { showMessage } from 'react-native-flash-message';
import Carousel from 'react-native-reanimated-carousel';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch } from 'react-redux';

export default function Home() {
  const router = useRouter();
  const dispatch = useDispatch();
  const backRoute = useBackRoute('/repair-shop');
  const { width: screenWidth } = Dimensions.get('window');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [shopID, setShopID] = useState<number>(0);
  const [repShopName, setRepShopName] = useState<string>('');
  const [ownerFirstname, setOwnerFirstname] = useState<string>('');
  const [ownerLastname, setOwnerLastname] = useState<string>('');
  const [gender, setGender] = useState<string>('');
  const [mobileNum, setMobileNum] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [ratingsNum, setRatingsNum] = useState<number>(0);
  const [averageRating, setAverageRating] = useState<number>(0);
  const [servicesOffered, setServicesOffered] = useState<string[]>([]);
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [shopImages, setShopImages] = useState<string[]>([]);
  const [isAvailable, setIsAvailable] = useState<boolean>(false);
  const [profileBG, setProfileBG] = useState<string>('');
  const [imageModalVisible, setImageModalVisible] = useState<boolean>(false);

  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);

        dispatch(
          setRoleState({
            ID: Number(shopID),
            role: 'repair-shop',
          })
        );

        await storeRole('repair-shop');

        dispatch(clearRouteState());
        const res = await getRepairShopInfo();

        socket.emit('registerUser', { userID: Number(res.repair_shop_id), role: 'repair-shop' });

        setShopID(res.repair_shop_id);
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
        setProfileBG(res.profile_bg);
        setIsAvailable(res.availability === 'open' ? true : false);

        dispatch(
          setSettingsState({
            mapType: res.settings_map_type,
            pushNotif: res.settings_push_notif,
          })
        );
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
  }, [dispatch, router, shopID]);

  useEffect(() => {
    if (!socket) return;

    socket.on(`updatedRepairShopInfo-RS-${shopID}`, ({ updatedRepairShopInfo }) => {
      setRepShopName(updatedRepairShopInfo.shop_name);
      setOwnerFirstname(updatedRepairShopInfo.owner_firstname);
      setOwnerLastname(updatedRepairShopInfo.owner_lastname);
      setGender(updatedRepairShopInfo.gender);
      setMobileNum(updatedRepairShopInfo.mobile_num);
      setEmail(updatedRepairShopInfo.email);
      setRatingsNum(updatedRepairShopInfo.number_of_ratings);
      setAverageRating(updatedRepairShopInfo.average_rating);
      setServicesOffered(updatedRepairShopInfo.services_offered);
      setProfilePic(updatedRepairShopInfo.profile_pic);
      setShopImages(updatedRepairShopInfo.shop_images);
    });

    return () => {
      socket.off(`updatedRepairShopInfo-RS-${shopID}`);
    };
  }, [shopID]);

  useEffect(() => {
    (async () => {
      try {
        const notificationToken = await registerForPushNotificationsAsync();
        if (notificationToken) {
          try {
            await axios.post(`${process.env.EXPO_PUBLIC_BACKEND_API_URL}/notifications/save-push-token`, {
              userID: shopID,
              token: notificationToken,
              platform: 'android',
              role: 'repair-shop',
              updatedAt: dayjs().format(),
            });
            console.log('Push token saved!');
          } catch (e) {
            console.error('Error saving token:', e);
          }
        }

        const notificationListener = Notifications.addNotificationReceivedListener((notif) => {
          console.log(notif);
        });

        const responseListener = Notifications.addNotificationResponseReceivedListener((response) => {
          console.log(response);
        });

        return () => {
          notificationListener.remove();
          responseListener.remove();
        };
      } catch (e) {
        console.error('Notification error:', e);
      }
    })();
  }, [shopID]);

  const handleLogout = async () => {
    try {
      await clearTokens();
      await clearRole();
      dispatch(clearRoleState());
      dispatch(clearRouteState());
      dispatch(clearScanState());
      dispatch(clearScanReferenceState());
      dispatch(clearSenderReceiverState());
      dispatch(clearVehicleDiagIDArrState());
      dispatch(clearVehicleDiagIDState());
      router.replace('/auth/login');
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
    }
  };

  const toggleSwitch = async () => {
    setIsAvailable((previousState) => !previousState);

    try {
      await updateAvailability(isAvailable);
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
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.upperBox}>
        <View style={styles.iconHeaderContainer}>
          <TouchableOpacity style={styles.iconWrapper} onPress={() => handleLogout()}>
            <MaterialCommunityIcons name="logout" style={styles.icon} />
          </TouchableOpacity>
          <Text style={styles.header}>Auto Repair Shop</Text>
        </View>
      </View>

      <ScrollView>
        <View style={styles.lowerBox}>
          <View style={styles.repShopUpperContainer}>
            {profilePic === null && (
              <>
                <TouchableOpacity
                  style={[styles.profilePicWrapper, { backgroundColor: profileBG }]}
                  onPress={() => setImageModalVisible(true)}
                >
                  <MaterialCommunityIcons name="car-wrench" size={50} color="#FFF" />
                </TouchableOpacity>

                <Modal
                  animationType="fade"
                  backdropColor={'rgba(0, 0, 0, 0.5)'}
                  visible={imageModalVisible}
                  onRequestClose={() => setImageModalVisible(false)}
                >
                  <TouchableWithoutFeedback onPress={() => setImageModalVisible(false)}>
                    <View style={styles.centeredView}>
                      <Pressable style={styles.imageView} onPress={() => {}}>
                        <View style={[styles.modalProfilePicWrapper, { backgroundColor: profileBG }]}>
                          <MaterialCommunityIcons name="car-wrench" size={100} color="#FFF" />
                        </View>
                      </Pressable>
                    </View>
                  </TouchableWithoutFeedback>
                </Modal>
              </>
            )}

            {profilePic !== null && (
              <>
                <TouchableOpacity style={styles.profilePicWrapper} onPress={() => setImageModalVisible(true)}>
                  <Image style={styles.profilePic} source={{ uri: profilePic }} width={100} height={100} />
                  <View style={styles.profileBadge}>
                    <MaterialCommunityIcons name="check-decagram" size={24} color="#000B58" />
                  </View>
                </TouchableOpacity>

                <Modal
                  animationType="fade"
                  backdropColor={'rgba(0, 0, 0, 0.5)'}
                  visible={imageModalVisible}
                  onRequestClose={() => setImageModalVisible(false)}
                >
                  <TouchableWithoutFeedback onPress={() => setImageModalVisible(false)}>
                    <View style={styles.centeredView}>
                      <Pressable style={styles.imageView}>
                        <Image width={500} height={300} style={styles.viewImage} source={{ uri: profilePic }} />
                      </Pressable>
                    </View>
                  </TouchableWithoutFeedback>
                </Modal>
              </>
            )}

            <View style={styles.repShopNameContainer}>
              <Text style={styles.repShopName}>{repShopName}</Text>
              <View style={styles.genderNameContainer}>
                {gender === 'Male' && <Fontisto name="male" size={16} color="#6B7280" />}

                {gender === 'Female' && <Fontisto name="female" size={16} color="#6B7280" />}
                <Text style={styles.contactText}>{`${ownerFirstname} ${ownerLastname}`}</Text>
              </View>

              <View style={styles.contactRow}>
                <MaterialCommunityIcons name="phone" size={14} color="#6B7280" />
                <Text style={styles.contactText}>{mobileNum}</Text>
              </View>

              {email !== null && (
                <View style={styles.contactRow}>
                  <MaterialCommunityIcons name="email" size={14} color="#6B7280" />
                  <Text style={styles.contactText}>{email}</Text>
                </View>
              )}

              <View style={styles.ratingReviewsRow}>
                <MaterialCommunityIcons name="account-group" size={16} color="#6B7280" />
                <Text style={styles.rating}>{ratingsNum}</Text>
                <View style={styles.ratingBadge}>
                  <MaterialIcons name="star" size={14} color="#FDCC0D" />
                  <Text style={styles.ratingBadgeText}>{averageRating}</Text>
                </View>
                <View style={styles.availabilityContainer}>
                  <View style={styles.statusLabelContainer}>
                    <View style={[styles.statusDot, isAvailable ? styles.statusDotOpen : styles.statusDotClosed]} />
                    <Text style={[styles.statusText, isAvailable ? styles.statusTextOpen : styles.statusTextClosed]}>
                      {isAvailable ? 'Open' : 'Closed'}
                    </Text>
                  </View>
                  <Switch
                    trackColor={{ false: '#D1D5DB', true: '#000B58' }}
                    thumbColor={isAvailable ? '#FFF' : '#F3F4F6'}
                    ios_backgroundColor="#3e3e3e"
                    onValueChange={toggleSwitch}
                    value={isAvailable}
                  />
                </View>
              </View>
            </View>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.button}
              onPress={() => {
                backRoute();
                router.replace('./edit-shop/edit-shop');
              }}
            >
              <View style={styles.buttonIconWrapper}>
                <MaterialCommunityIcons name="store-edit" size={20} color="#000B58" />
              </View>
              <Text style={styles.buttonText}>Edit Shop</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.button}
              onPress={() => {
                backRoute();
                router.replace('./repair-requests/repair-requests');
              }}
            >
              <View style={styles.buttonIconWrapper}>
                <MaterialCommunityIcons name="wrench-clock" size={20} color="#000B58" />
              </View>
              <Text style={styles.buttonText}>Requests</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.button}
              onPress={() => {
                backRoute();
                router.replace('./settings/settings');
              }}
            >
              <View style={styles.buttonIconWrapper}>
                <MaterialCommunityIcons name="cog" size={20} color="#000B58" />
              </View>
              <Text style={styles.buttonText}>Settings</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.shopImages}>
            <Text style={styles.subHeader}>Shop Images</Text>
            {shopImages.length === 0 && (
              <TouchableOpacity
                style={styles.editButton2}
                onPress={() => {
                  backRoute();
                  router.replace('./edit-shop/edit-shop');
                }}
              >
                <MaterialCommunityIcons name="image-plus" size={16} color="#555" />
                <Text style={styles.editButtonText}>Upload Image</Text>
              </TouchableOpacity>
            )}

            {shopImages.length !== 0 && (
              <Carousel
                width={screenWidth * 0.9}
                height={300}
                data={shopImages}
                mode="parallax"
                autoPlay={true}
                autoPlayInterval={3000}
                scrollAnimationDuration={2000}
                loop={true}
                renderItem={({ item }) => <Image key={item} height={300} style={styles.image} source={{ uri: item }} />}
              />
            )}
          </View>

          <View style={styles.servicesOffered}>
            <Text style={styles.subHeader}>Services Offered</Text>
            <View style={styles.servicesGrid}>
              {servicesOffered.map((item) => (
                <View key={item} style={styles.services}>
                  <MaterialCommunityIcons name="check-circle" size={16} color="#000B58" />
                  <Text style={styles.servicesText}>{item}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f4f7',
  },
  upperBox: {
    backgroundColor: '#000B58',
    justifyContent: 'center',
    alignItems: 'center',
    height: 63,
  },
  header: {
    color: '#FFF',
    fontFamily: 'HeaderBold',
    fontSize: 18,
    position: 'absolute',
    textAlign: 'center',
    width: '100%',
    zIndex: 1,
  },
  iconHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
    width: '95%',
  },
  iconWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  icon: {
    fontSize: 22,
    color: '#FFF',
  },
  lowerBox: {
    width: '90%',
    alignSelf: 'center',
    marginTop: 20,
    marginBottom: 80,
  },
  repShopUpperContainer: {
    flexDirection: 'row',
    gap: 20,
    width: '100%',
  },
  profilePicWrapper: {
    width: 100,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 100,
    borderWidth: 3,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    position: 'relative',
  },
  profilePic: {
    borderRadius: 100,
  },
  profileBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 2,
  },
  repShopNameContainer: {
    flex: 1,
  },
  repShopName: {
    fontFamily: 'BodyBold',
    color: '#333',
    fontSize: 20,
    marginBottom: 4,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    gap: 2,
    flexShrink: 0,
  },
  ratingBadgeText: {
    fontFamily: 'BodyBold',
    color: '#92400E',
    fontSize: 12,
  },
  genderNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  contactText: {
    fontFamily: 'BodyRegular',
    color: '#6B7280',
    fontSize: 14,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  ratingReviewsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  rating: {
    fontFamily: 'BodyRegular',
    color: '#6B7280',
    fontSize: 13,
  },
  availabilityContainer: {
    marginLeft: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusDotOpen: {
    backgroundColor: '#10B981',
  },
  statusDotClosed: {
    backgroundColor: '#EF4444',
  },
  statusText: {
    fontFamily: 'BodyBold',
    fontSize: 13,
  },
  statusTextOpen: {
    color: '#10B981',
  },
  statusTextClosed: {
    color: '#EF4444',
  },
  buttonContainer: {
    justifyContent: 'space-evenly',
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderBottomWidth: 1,
    borderColor: '#EAEAEA',
    marginTop: 20,
    paddingBottom: 20,
    gap: 12,
  },
  button: {
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
    gap: 8,
    width: 100,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  buttonIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontFamily: 'BodyBold',
    fontSize: 12,
    color: '#374151',
  },
  shopImages: {
    width: '100%',
    marginTop: 20,
    paddingBottom: 20,
  },
  editButton2: {
    backgroundColor: '#D9D9D9',
    minHeight: 100,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    flexDirection: 'row',
    gap: 5,
  },
  editButtonText: {
    fontFamily: 'BodyRegular',
    color: '#555',
  },
  subHeader: {
    fontFamily: 'BodyBold',
    color: '#333',
    fontSize: 18,
    marginBottom: 10,
  },
  image: {
    flex: 1,
    borderRadius: 8,
  },
  servicesOffered: {
    width: '100%',
  },
  servicesGrid: {
    gap: 8,
  },
  services: {
    width: '100%',
    flexDirection: 'row',
    gap: 8,
    paddingLeft: 5,
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#000B58',
  },
  servicesText: {
    fontFamily: 'BodyRegular',
    color: '#374151',
    fontSize: 14,
    flex: 1,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageView: {
    backgroundColor: '#FFF',
    width: '85%',
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    overflow: 'hidden',
  },
  viewImage: {
    width: '100%',
  },
  modalProfilePicWrapper: {
    width: '100%',
    height: 300,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
});
