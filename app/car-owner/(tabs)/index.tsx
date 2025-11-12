import { Loading } from '@/components/Loading';
import { useBackRoute } from '@/hooks/useBackRoute';
import { setRoleState } from '@/redux/slices/roleSlice';
import { clearRouteState } from '@/redux/slices/routeSlice';
import { setSettingsState } from '@/redux/slices/settingsSlice';
import { addVehicle, dismissPms, getUserInfo, getVehicle } from '@/services/backendApi';
import { verifyCar } from '@/services/geminiApi';
import { registerForPushNotificationsAsync } from '@/services/notifications';
import socket from '@/services/socket';
import { storeRole } from '@/services/tokenStorage';
import Entypo from '@expo/vector-icons/Entypo';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import axios from 'axios';
import dayjs from 'dayjs';
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { showMessage } from 'react-native-flash-message';
import { SafeAreaView } from 'react-native-safe-area-context';
import SelectDropdown from 'react-native-select-dropdown';
import { useDispatch } from 'react-redux';

export default function Home() {
  const dispatch = useDispatch();
  const backRoute = useBackRoute('/car-owner');
  const router = useRouter();
  const [addVehicleModalVisible, isAddVehicleModalVisible] = useState(false);
  const [selectedMake, setSelectedMake] = useState<string>('');
  const [model, setModel] = useState<string>('');
  const [year, setYear] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isAddCarLoading, setIsAddCarLoading] = useState<boolean>(false);
  const [userID, setUserID] = useState<number>(0);
  const [firstname, setFirstname] = useState<string>('');
  const [lastname, setLastname] = useState<string>('');
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [userInitialsBG, setUserInitialsBG] = useState<string>('');
  const [isVehicles, setIsVehicles] = useState<boolean>(false);

  const targetMakes = [
    'Acura',
    'Audi',
    'BMW',
    'Chevrolet',
    'Dodge',
    'Chrysler',
    'Jeep',
    'Ford',
    'Foton',
    'Geely',
    'Honda',
    'Hyundai',
    'Infiniti',
    'Isuzu',
    'Jaguar',
    'Kia',
    'Land Rover',
    'Lexus',
    'Mazda',
    'Mercedes-Benz',
    'MG',
    'Mitsubishi',
    'Nissan',
    'RAM',
    'Subaru',
    'Suzuki',
    'Toyota',
    'Volkswagen',
  ];

  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);

        dispatch(
          setRoleState({
            ID: Number(userID),
            role: 'car-owner',
          })
        );

        await storeRole('car-owner');

        dispatch(clearRouteState());
        const res1 = await getUserInfo();
        const res2 = await getVehicle();

        socket.emit('registerUser', { userID: Number(res1.user_id), role: 'car-owner' });

        setUserID(res1.user_id);
        setFirstname(res1.firstname);
        setLastname(res1.lastname);
        setProfilePic(res1.profile_pic);
        setUserInitialsBG(res1.user_initials_bg);

        dispatch(
          setSettingsState({
            mapType: res1.settings_map_type,
            pushNotif: res1.settings_push_notif,
          })
        );

        if (res2.length === 0) {
          setIsVehicles(false);
        } else {
          setIsVehicles(true);
        }
      } catch {
        router.push('/error/server-error');
      } finally {
        setIsLoading(false);
      }
    })();
  }, [dispatch, router, userID]);

  useEffect(() => {
    if (!socket) return;

    socket.on(`updatedUserInfo-CO-${userID}`, ({ updatedUserInfo }) => {
      setFirstname(updatedUserInfo.firstname);
      setLastname(updatedUserInfo.lastname);
      setProfilePic(updatedUserInfo.profile_pic);
    });

    socket.on(`vehicleAdded-CO-${userID}`, ({ vehicleAdded }) => {
      setIsVehicles(vehicleAdded);
    });

    socket.on(`noVehicles-CO-${userID}`, ({ noVehicles }) => {
      setIsVehicles(noVehicles);
    });

    return () => {
      socket.off(`updatedUserInfo-CO-${userID}`);
      socket.off(`vehicleAdded-CO-${userID}`);
      socket.off(`noVehicles-CO-${userID}`);
    };
  }, [userID]);

  useEffect(() => {
    (async () => {
      await Notifications.setNotificationCategoryAsync('pmsReminder', [
        {
          identifier: 'DISMISS',
          buttonTitle: 'Dismiss',
          options: { opensAppToForeground: false },
        },
        {
          identifier: 'SCHEDULE',
          buttonTitle: 'Schedule PMS',
          options: { opensAppToForeground: true },
        },
      ]);

      try {
        const notificationToken = await registerForPushNotificationsAsync();
        if (notificationToken) {
          try {
            await axios.post(`${process.env.EXPO_PUBLIC_BACKEND_API_URL}/notifications/save-push-token`, {
              userID: userID,
              token: notificationToken,
              platform: 'android',
              role: 'car-owner',
              updatedAt: dayjs().format(),
            });
            console.log('Push token saved!');
          } catch (e) {
            console.error('Error saving token:', e);
          }
        }

        const notificationListener = Notifications.addNotificationReceivedListener(async (notif) => {});

        const responseListener = Notifications.addNotificationResponseReceivedListener(async (response) => {
          const actionId = response.actionIdentifier;
          const notifId = response.notification.request.identifier;
          const { vehicleId } = response.notification.request.content.data;

          if (actionId === 'DISMISS') {
            Notifications.dismissNotificationAsync(notifId);
            await dismissPms(Number(vehicleId));
          }

          if (actionId === 'SCHEDULE') {
            Notifications.dismissNotificationAsync(notifId);
            router.replace('/car-owner/(screens)/repair-shops/repair-shops');
            backRoute();
          }
        });

        return () => {
          notificationListener.remove();
          responseListener.remove();
        };
      } catch (e) {
        console.error('Notification error:', e);
      }
    })();
  }, [backRoute, router, userID]);

  const handleCarVerification = async () => {
    if (!selectedMake || !model || !year) {
      setError('Please fill out all fields.');
      return;
    }

    if (parseInt(year) < 1996) {
      setError('OBD2 scanners only support vehicles manufactured in 1996 and newer.');
      return;
    }

    setError('');

    try {
      setIsAddCarLoading(true);
      const result = await verifyCar(selectedMake, model, year);
      if (result === 'false') {
        setError('Invalid car details. Please check and try again.');
      } else {
        handleAddCar();
      }
    } catch {
      setError('An error occurred while verifying the car.');
    } finally {
      setIsAddCarLoading(false);
    }
  };

  const handleCancelAddCar = () => {
    setSelectedMake('');
    setModel('');
    setYear('');
    setError('');
    isAddVehicleModalVisible(!addVehicleModalVisible);
  };

  const handleAddCar = async () => {
    const vehicleInfo = {
      make: selectedMake.toUpperCase().trim(),
      model: model.toUpperCase().trim(),
      year: year.trim(),
      date_added: dayjs().format(),
      is_deleted: false,
      last_pms_trigger: dayjs().format(),
    };

    try {
      await addVehicle(vehicleInfo);
      setSelectedMake('');
      setModel('');
      setYear('');
      setError('');
      isAddVehicleModalVisible(!addVehicleModalVisible);
      showMessage({
        message: 'Car added successfully!',
        type: 'success',
        floating: true,
        color: '#FFF',
        icon: 'success',
      });
    } catch {
      setError('Something went wrong. Please try again.');
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.upperBox}>
        <Image source={require('../../../assets/images/logo.png')} style={styles.logo} />
      </View>

      <ScrollView>
        <View style={styles.userContainer}>
          <View style={styles.userNameContainer}>
            <Text style={styles.header}>Hello,</Text>
            <Text style={styles.userName}>{`${firstname} ${lastname}`}</Text>
          </View>

          {profilePic === null && (
            <TouchableOpacity
              style={[styles.profileWrapper, { backgroundColor: userInitialsBG }]}
              onPress={() => {
                backRoute();
                router.replace('./profile/profile');
              }}
            >
              <Text style={styles.userInitials}>{`${firstname[0]}${lastname[0]}`}</Text>
            </TouchableOpacity>
          )}

          {profilePic !== null && (
            <TouchableOpacity
              style={styles.profileWrapper}
              onPress={() => {
                backRoute();
                router.replace('./profile/profile');
              }}
            >
              <Image style={styles.profilePic} source={{ uri: profilePic }} width={100} height={100} />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.introTxtContainer}>
          <MaterialCommunityIcons name="hand-wave" size={24} color="#F59E0B" style={styles.waveIcon} />
          <Text style={styles.introHeader}>Let&apos;s get started</Text>
          <Text style={styles.introBody}>Start your experience to easier vehicle maintenance.</Text>
        </View>

        <View style={styles.featuresContainer}>
          <View style={styles.column}>
            <TouchableOpacity
              style={styles.feature}
              onPress={() => {
                backRoute();
                router.replace('./diagnostic-history/diagnostic-history');
              }}
            >
              <View style={styles.featureIconWrapper}>
                <MaterialIcons name="history" size={35} color="#FFF" />
              </View>
              <View style={styles.featureTxtWrapper}>
                <Text style={styles.featureHeader}>Diagnostic History</Text>
                <Text style={styles.featureDescription}>View past diagnostic checks</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.feature}
              onPress={() => {
                if (!isVehicles) {
                  showMessage({
                    message: 'You have not added a car yet.',
                    type: 'warning',
                    floating: true,
                    color: '#FFF',
                    icon: 'warning',
                  });
                } else {
                  backRoute();
                  router.replace('./run-diagnostics/run-diagnostics');
                }
              }}
            >
              <View style={styles.featureIconWrapper}>
                <Ionicons name="scan" size={35} color="#FFF" />
              </View>
              <View style={styles.featureTxtWrapper}>
                <Text style={styles.featureHeader}>Scan Car</Text>
                <Text style={styles.featureDescription}>Perform a quick system diagnostic</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.feature}
              onPress={() => {
                backRoute();
                router.replace('./repair-shops/repair-shops');
              }}
            >
              <View style={styles.featureIconWrapper}>
                <Entypo name="location" size={35} color="#FFF" />
              </View>
              <View style={styles.featureTxtWrapper}>
                <Text style={styles.featureHeader}>Repair Shops</Text>
                <Text style={styles.featureDescription}>Locate nearby repair shops</Text>
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.column}>
            <TouchableOpacity style={styles.feature} onPress={() => isAddVehicleModalVisible(true)}>
              <View style={styles.featureIconWrapper}>
                <Ionicons name="add-circle" size={35} color="#FFF" />
              </View>
              <View style={styles.featureTxtWrapper}>
                <Text style={styles.featureHeader}>Add Vehicle</Text>
                <Text style={styles.featureDescription}>Register or add a new vehicle</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.feature}
              onPress={() => {
                backRoute();
                router.replace('./profile/profile');
              }}
            >
              <View style={styles.featureIconWrapper}>
                <MaterialCommunityIcons name="account" size={35} color="#FFF" />
              </View>
              <View style={styles.featureTxtWrapper}>
                <Text style={styles.featureHeader}>My Profile</Text>
                <Text style={styles.featureDescription}>Manage your account details</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.feature}
              onPress={() => {
                backRoute();
                router.replace('./request-status/request-status');
              }}
            >
              <View style={styles.featureIconWrapper}>
                <MaterialCommunityIcons name="clipboard-edit" size={35} color="#FFF" />
              </View>
              <View style={styles.featureTxtWrapper}>
                <Text style={styles.featureHeader}>Request Status</Text>
                <Text style={styles.featureDescription}>Status of your repair request</Text>
              </View>
            </TouchableOpacity>
          </View>

          <Modal
            animationType="fade"
            transparent={true}
            visible={addVehicleModalVisible}
            onRequestClose={() => {
              isAddVehicleModalVisible(false);
              setSelectedMake('');
              setModel('');
              setYear('');
              setError('');
            }}
          >
            <View style={styles.modalOverlay}>
              <TouchableWithoutFeedback
                onPress={() => {
                  isAddVehicleModalVisible(false);
                  setSelectedMake('');
                  setModel('');
                  setYear('');
                  setError('');
                }}
              >
                <View style={styles.modalBackground} />
              </TouchableWithoutFeedback>

              <View style={styles.vehicleModalContent}>
                <View style={styles.vehicleModalHeader}>
                  <MaterialCommunityIcons name="car" size={24} color="#000B58" />
                  <Text style={styles.vehicleModalTitle}>Add Vehicle</Text>
                  <TouchableOpacity style={styles.modalCloseButton} onPress={() => handleCancelAddCar()}>
                    <MaterialCommunityIcons name="close" size={24} color="#6B7280" />
                  </TouchableOpacity>
                </View>

                <View style={styles.vehicleModalBody}>
                  <View style={styles.vehicleInputGroup}>
                    <Text style={styles.vehicleInputLabel}>Manufacturer</Text>
                    <SelectDropdown
                      data={targetMakes}
                      onSelect={(selectedItem) => setSelectedMake(selectedItem)}
                      renderButton={(selectedItem, isOpen) => (
                        <View style={styles.dropdownButtonStyle}>
                          <MaterialCommunityIcons name="factory" size={18} color="#6B7280" style={{ marginRight: 8 }} />
                          <Text
                            style={[styles.dropdownButtonTxtStyle, { color: selectedItem ? '#111827' : '#9CA3AF' }]}
                          >
                            {selectedItem || 'Select manufacturer'}
                          </Text>
                          <MaterialCommunityIcons
                            name={isOpen ? 'chevron-up' : 'chevron-down'}
                            style={styles.dropdownButtonArrowStyle}
                          />
                        </View>
                      )}
                      renderItem={(item, _index, isSelected) => (
                        <View
                          style={{
                            ...styles.dropdownItemStyle,
                            ...(isSelected && { backgroundColor: '#EEF2FF' }),
                          }}
                        >
                          <Text style={styles.dropdownItemTxtStyle}>{item}</Text>
                        </View>
                      )}
                      showsVerticalScrollIndicator={false}
                      dropdownStyle={styles.dropdownMenuStyle}
                    />
                  </View>

                  <View style={styles.vehicleInputGroup}>
                    <Text style={styles.vehicleInputLabel}>Model</Text>
                    <View style={styles.vehicleInputWrapper}>
                      <MaterialCommunityIcons name="card-text" size={18} color="#6B7280" style={{ marginLeft: 12 }} />
                      <TextInput
                        value={model}
                        onChangeText={setModel}
                        style={styles.vehicleInput}
                        placeholder="Enter model"
                        placeholderTextColor="#9CA3AF"
                        editable={!selectedMake ? false : true}
                      />
                    </View>
                  </View>

                  <View style={styles.vehicleInputGroup}>
                    <Text style={styles.vehicleInputLabel}>Year</Text>
                    <View style={styles.vehicleInputWrapper}>
                      <MaterialCommunityIcons name="calendar" size={18} color="#6B7280" style={{ marginLeft: 12 }} />
                      <TextInput
                        value={year}
                        onChangeText={setYear}
                        style={styles.vehicleInput}
                        keyboardType="numeric"
                        placeholder="Enter year (1996 or newer)"
                        placeholderTextColor="#9CA3AF"
                        maxLength={4}
                        editable={!model ? false : true}
                      />
                    </View>
                    <Text style={styles.vehicleHint}>
                      <MaterialCommunityIcons name="information-outline" size={12} color="#6B7280" /> OBD2 scanners
                      support vehicles from 1996 onwards
                    </Text>
                  </View>

                  {error.length > 0 && (
                    <View style={styles.errorContainer}>
                      <MaterialCommunityIcons name="alert-circle" size={18} color="#DC2626" />
                      <Text style={styles.errorMessage}>{error}</Text>
                    </View>
                  )}
                </View>

                <View style={styles.vehicleModalActions}>
                  <TouchableOpacity
                    style={[styles.vehicleButton, styles.vehicleCancelButton]}
                    onPress={() => handleCancelAddCar()}
                  >
                    <MaterialCommunityIcons name="close" size={18} color="#6B7280" />
                    <Text style={styles.vehicleCancelButtonText}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.vehicleButton,
                      styles.vehicleAddButton,
                      isAddCarLoading && styles.vehicleButtonDisabled,
                    ]}
                    onPress={() => handleCarVerification()}
                    disabled={isAddCarLoading}
                  >
                    {isAddCarLoading && <ActivityIndicator size="small" color="#FFF" />}
                    <MaterialCommunityIcons name="check" size={18} color="#FFF" />
                    <Text style={styles.vehicleAddButtonText}>{isAddCarLoading ? 'Verifying...' : 'Add Vehicle'}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
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
    alignItems: 'flex-start',
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
  logo: {
    width: 60,
    height: 50,
    marginLeft: 20,
  },
  userContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 24,
    width: '90%',
    alignSelf: 'center',
  },
  userNameContainer: {
    flexDirection: 'column',
    width: '70%',
  },
  header: {
    fontFamily: 'BodyBold',
    fontSize: 30,
    color: '#111827',
  },
  userName: {
    fontFamily: 'BodyRegular',
    fontSize: 22,
    color: '#6B7280',
  },
  profileWrapper: {
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 80,
    borderWidth: 3,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  userInitials: {
    fontFamily: 'HeaderBold',
    fontSize: 28,
    color: '#FFF',
  },
  profilePic: {
    borderRadius: 100,
  },
  introTxtContainer: {
    backgroundColor: '#FFFFFF',
    borderWidth: 0,
    borderLeftWidth: 4,
    borderLeftColor: '#000B58',
    width: '90%',
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  waveIcon: {
    marginBottom: 8,
  },
  introHeader: {
    fontFamily: 'BodyBold',
    fontSize: 18,
    color: '#111827',
    marginBottom: 4,
  },
  introBody: {
    fontFamily: 'BodyRegular',
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    textAlign: 'center',
  },
  featuresContainer: {
    backgroundColor: 'transparent',
    width: '90%',
    flexDirection: 'row',
    alignSelf: 'center',
    borderRadius: 0,
    marginTop: 24,
    marginBottom: 80,
    gap: 10,
    paddingTop: 0,
    paddingBottom: 0,
    justifyContent: 'center',
    shadowColor: 'transparent',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  column: {
    width: '48%',
    gap: 10,
  },
  feature: {
    flexDirection: 'column',
    backgroundColor: '#000B58',
    width: '100%',
    minHeight: 110,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 5,
  },
  featureIconWrapper: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureTxtWrapper: {
    flexDirection: 'column',
    width: '100%',
    alignItems: 'center',
  },
  featureHeader: {
    color: '#FFF',
    fontFamily: 'BodyBold',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 4,
  },
  featureDescription: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontFamily: 'BodyRegular',
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 16,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  vehicleModalContent: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    width: '90%',
    maxWidth: 450,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    overflow: 'hidden',
  },
  vehicleModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
    gap: 12,
  },
  vehicleModalTitle: {
    fontFamily: 'HeadingBold',
    fontSize: 18,
    color: '#000B58',
    flex: 1,
  },
  modalCloseButton: {
    padding: 4,
    borderRadius: 8,
  },
  vehicleModalBody: {
    padding: 20,
    gap: 16,
  },
  vehicleInputGroup: {
    gap: 8,
  },
  vehicleInputLabel: {
    fontFamily: 'HeaderBold',
    fontSize: 14,
    color: '#374151',
  },
  vehicleInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    backgroundColor: '#F9FAFB',
  },
  vehicleInput: {
    flex: 1,
    height: 44,
    paddingHorizontal: 12,
    fontFamily: 'BodyRegular',
    fontSize: 15,
    color: '#111827',
  },
  vehicleHint: {
    fontFamily: 'BodyRegular',
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  vehicleModalActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
  },
  vehicleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
    minWidth: 140,
  },
  vehicleCancelButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
  },
  vehicleAddButton: {
    backgroundColor: '#000B58',
  },
  vehicleButtonDisabled: {
    opacity: 0.6,
    backgroundColor: '#9CA3AF',
  },
  vehicleCancelButtonText: {
    fontFamily: 'BodyBold',
    color: '#6B7280',
    fontSize: 14,
  },
  vehicleAddButtonText: {
    fontFamily: 'BodyBold',
    color: '#FFF',
    fontSize: 14,
  },
  dropdownButtonStyle: {
    width: '100%',
    height: 44,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  dropdownButtonTxtStyle: {
    flex: 1,
    fontFamily: 'BodyRegular',
    fontSize: 15,
  },
  dropdownButtonArrowStyle: {
    fontSize: 20,
    color: '#6B7280',
  },
  dropdownMenuStyle: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  dropdownItemStyle: {
    width: '100%',
    flexDirection: 'row',
    paddingHorizontal: 12,
    alignItems: 'center',
    paddingVertical: 12,
  },
  dropdownItemTxtStyle: {
    flex: 1,
    color: '#333',
    fontFamily: 'BodyRegular',
    fontSize: 15,
  },
  errorContainer: {
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DC2626',
    width: '100%',
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  errorMessage: {
    fontFamily: 'BodyRegular',
    color: '#DC2626',
    fontSize: 13,
    flex: 1,
  },
});
