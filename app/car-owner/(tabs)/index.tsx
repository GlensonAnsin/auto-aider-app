import { Loading } from '@/components/Loading';
import { useBackRoute } from '@/hooks/useBackRoute';
import { clearRouteState } from '@/redux/slices/routeSlice';
import { addVehicle, getUserInfo, getVehicle } from '@/services/backendApi';
import { verifyCar } from '@/services/geminiApi';
import Entypo from '@expo/vector-icons/Entypo';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import dayjs from 'dayjs';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
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
import { io, Socket } from 'socket.io-client';

export default function Home() {
  const dispatch = useDispatch();
  const backRoute = useBackRoute('/car-owner');
  const router = useRouter();
  const [_socket, setSocket] = useState<Socket | null>(null);
  const [addVehicleModalVisible, isAddVehicleModalVisible] = useState(false);
  const [selectedMake, setSelectedMake] = useState<string>('');
  const [model, setModel] = useState<string>('');
  const [year, setYear] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isAddCarLoading, setIsAddCarLoading] = useState<boolean>(false);
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
        dispatch(clearRouteState());
        const res1 = await getUserInfo();
        const res2 = await getVehicle();

        setFirstname(res1.firstname);
        setLastname(res1.lastname);
        setProfilePic(res1.profile_pic);
        setUserInitialsBG(res1.user_initials_bg);

        if (res2.length === 0) {
          setIsVehicles(false);
        } else {
          setIsVehicles(true);
        }
      } catch (e) {
        console.error('Error: ', e);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    const newSocket = io(process.env.EXPO_PUBLIC_BACKEND_BASE_URL, {
      transports: ['websocket'],
    });

    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Connected to server: ', newSocket.id);
    });

    newSocket.on('updatedUserInfo', ({ updatedUserInfo }) => {
      setFirstname(updatedUserInfo.firstname);
      setLastname(updatedUserInfo.lastname);
      setProfilePic(updatedUserInfo.profile_pic);
    });

    newSocket.on('vehicleAdded', ({ vehicleAdded }) => {
      setIsVehicles(vehicleAdded);
    });

    newSocket.on('noVehicles', ({ noVehicles }) => {
      setIsVehicles(noVehicles);
    });

    return () => {
      newSocket.off('updatedUserInfo');
      newSocket.off('vehicleAdded');
      newSocket.off('noVehicles');
      newSocket.disconnect();
    };
  }, []);

  const handleCarVerification = async () => {
    if (!selectedMake || !model || !year) {
      setError('Please fill in all fields.');
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
    } catch (e) {
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
    } catch (e) {
      setError('Something went wrong. Please try again.');
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <Image source={require('../../../assets/images/screen-design-2.png')} style={styles.screenDesign} />
        <Image source={require('../../../assets/images/logo.png')} style={styles.logo} width={200} height={25} />

        <View style={styles.userContainer}>
          <View style={styles.userNameContainer}>
            <Text style={styles.header}>Hello,</Text>
            <Text style={styles.userName}>{`${firstname} ${lastname}`}</Text>
          </View>

          {profilePic === null && (
            <TouchableOpacity
              style={[styles.profileWrapper, { backgroundColor: userInitialsBG }]}
              onPress={() => router.replace('./profile/profile')}
            >
              <Text style={styles.userInitials}>{`${firstname[0]}${lastname[0]}`}</Text>
            </TouchableOpacity>
          )}

          {profilePic !== null && (
            <TouchableOpacity style={styles.profileWrapper} onPress={() => router.replace('./profile/profile')}>
              <Image style={styles.profilePic} source={{ uri: profilePic }} width={100} height={100} />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.introTxtContainer}>
          <Text style={styles.introHeader}>Let's get started</Text>
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
              <MaterialIcons name="history" size={35} color="#FFF" />
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
              <Ionicons name="scan" size={35} color="#FFF" />
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
              <Entypo name="location" size={35} color="#FFF" />
              <View style={styles.featureTxtWrapper}>
                <Text style={styles.featureHeader}>Repair Shops</Text>
                <Text style={styles.featureDescription}>Locate nearby repair shops</Text>
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.column}>
            <TouchableOpacity style={styles.feature} onPress={() => isAddVehicleModalVisible(true)}>
              <Ionicons name="add-circle" size={35} color="#FFF" />
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
              <MaterialCommunityIcons name="account" size={35} color="#FFF" />
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
              <MaterialCommunityIcons name="clipboard-edit" size={35} color="#FFF" />
              <View style={styles.featureTxtWrapper}>
                <Text style={styles.featureHeader}>Request Status</Text>
                <Text style={styles.featureDescription}>Status of your repair request</Text>
              </View>
            </TouchableOpacity>
          </View>

          <Modal
            animationType="fade"
            backdropColor={'rgba(0, 0, 0, 0.5)'}
            visible={addVehicleModalVisible}
            onRequestClose={() => {
              isAddVehicleModalVisible(false);
              setSelectedMake('');
              setModel('');
              setYear('');
              setError('');
            }}
          >
            <TouchableWithoutFeedback
              onPress={() => {
                isAddVehicleModalVisible(false);
                setSelectedMake('');
                setModel('');
                setYear('');
                setError('');
              }}
            >
              <View style={styles.centeredView}>
                <Pressable style={styles.addCarModalView} onPress={() => {}}>
                  <Text style={styles.modalHeader}>Add Vehicle</Text>
                  <View style={styles.textInputContainer}>
                    <Text style={styles.textInputLbl}>Manufacturer</Text>
                    <SelectDropdown
                      data={targetMakes}
                      onSelect={(selectedItem) => setSelectedMake(selectedItem)}
                      renderButton={(selectedItem, isOpen) => (
                        <View style={styles.dropdownButtonStyle}>
                          <Text style={styles.dropdownButtonTxtStyle}>{selectedItem || 'Select manufacturer'}</Text>
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
                            ...(isSelected && { backgroundColor: '#D2D9DF' }),
                          }}
                        >
                          <Text style={styles.dropdownItemTxtStyle}>{item}</Text>
                        </View>
                      )}
                      showsVerticalScrollIndicator={false}
                      dropdownStyle={styles.dropdownMenuStyle}
                    />
                  </View>

                  <View style={styles.textInputContainer}>
                    <Text style={styles.textInputLbl}>Model</Text>
                    <TextInput
                      value={model}
                      onChangeText={setModel}
                      style={styles.input}
                      placeholder="Model"
                      editable={!selectedMake ? false : true}
                    />
                  </View>

                  <View style={styles.textInputContainer}>
                    <Text style={styles.textInputLbl}>Year</Text>
                    <TextInput
                      value={year}
                      onChangeText={setYear}
                      style={styles.input}
                      keyboardType="numeric"
                      placeholder="Year"
                      maxLength={4}
                      editable={!model ? false : true}
                    />
                  </View>

                  {error.length > 0 && (
                    <View style={styles.errorContainer}>
                      <Text style={styles.errorMessage}>{error}</Text>
                    </View>
                  )}

                  {isAddCarLoading === true && (
                    <ActivityIndicator style={{ marginTop: 20 }} size="small" color="#000B58" />
                  )}

                  <View style={styles.cancelSaveContainer}>
                    <TouchableOpacity
                      style={[styles.modalButton, { borderWidth: 1, borderColor: '#555' }]}
                      onPress={() => handleCancelAddCar()}
                    >
                      <Text style={[styles.modalButtonText, { color: '#555' }]}>Cancel</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.modalButton, { backgroundColor: '#000B58' }]}
                      onPress={() => handleCarVerification()}
                    >
                      <Text style={[styles.modalButtonText, { color: '#FFF' }]}>Add</Text>
                    </TouchableOpacity>
                  </View>
                </Pressable>
              </View>
            </TouchableWithoutFeedback>
          </Modal>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  screenDesign: {
    width: '100%',
  },
  logo: {
    position: 'absolute',
    top: 35,
    left: 20,
  },
  userContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    width: '90%',
    alignSelf: 'center',
  },
  userNameContainer: {
    flexDirection: 'column',
    width: '70%',
  },
  header: {
    fontFamily: 'LeagueSpartan_Bold',
    fontSize: 30,
    color: '#333',
  },
  userName: {
    fontFamily: 'LeagueSpartan',
    fontSize: 24,
    color: '#333',
  },
  profileWrapper: {
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 80,
  },
  userInitials: {
    fontFamily: 'LeagueSpartan_Bold',
    fontSize: 30,
    color: '#FFF',
  },
  profilePic: {
    borderRadius: 100,
  },
  introTxtContainer: {
    borderWidth: 2,
    borderColor: '#003161',
    width: '94%',
    borderRadius: 10,
    padding: 10,
    marginTop: 20,
    alignSelf: 'center',
  },
  introHeader: {
    fontFamily: 'LeagueSpartan',
    fontSize: 18,
    textAlign: 'center',
  },
  introBody: {
    fontFamily: 'LeagueSpartan',
    fontSize: 16,
    textAlign: 'center',
  },
  featuresContainer: {
    backgroundColor: '#EAEAEA',
    width: '94%',
    flexDirection: 'row',
    alignSelf: 'center',
    borderRadius: 8,
    marginTop: 20,
    marginBottom: 100,
    gap: 5,
    paddingTop: 5,
    paddingBottom: 5,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  column: {
    width: '47%',
    gap: 5,
  },
  feature: {
    flexDirection: 'row',
    backgroundColor: '#000B58',
    width: '100%',
    height: 85,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  featureTxtWrapper: {
    flexDirection: 'column',
    width: '60%',
  },
  featureHeader: {
    color: '#FFF',
    fontFamily: 'LeagueSpartan_Bold',
    fontSize: 16,
  },
  featureDescription: {
    color: '#FFF',
    fontFamily: 'LeagueSpartan',
    fontSize: 12,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addCarModalView: {
    backgroundColor: '#FFF',
    width: '85%',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    fontSize: 22,
    fontFamily: 'LeagueSpartan_Bold',
    color: '#333',
  },
  textInputContainer: {
    gap: 10,
    marginTop: 10,
    width: '100%',
  },
  textInputLbl: {
    fontSize: 16,
    fontFamily: 'LeagueSpartan',
    color: '#333',
  },
  dropdownButtonStyle: {
    width: '100%',
    height: 45,
    backgroundColor: '#EAEAEA',
    borderRadius: 5,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  dropdownButtonTxtStyle: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    fontFamily: 'LeagueSpartan',
  },
  dropdownButtonArrowStyle: {
    fontSize: 24,
    color: '#333',
  },
  dropdownMenuStyle: {
    backgroundColor: '#EAEAEA',
    borderRadius: 10,
    marginTop: -1,
  },
  dropdownItemStyle: {
    width: '100%',
    flexDirection: 'row',
    paddingHorizontal: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 10,
  },
  dropdownItemTxtStyle: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    fontFamily: 'LeagueSpartan',
  },
  input: {
    backgroundColor: '#EAEAEA',
    width: '100%',
    height: 45,
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
    color: '#333',
    fontFamily: 'LeagueSpartan',
  },
  cancelSaveContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    gap: 10,
    marginTop: 10,
  },
  modalButton: {
    width: '30%',
    height: 45,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  modalButtonText: {
    fontSize: 16,
    fontFamily: 'LeagueSpartan_Bold',
  },
  errorContainer: {
    backgroundColor: '#EAEAEA',
    borderRadius: 5,
    width: '100%',
    padding: 10,
    marginTop: 20,
  },
  errorMessage: {
    fontFamily: 'LeagueSpartan',
    color: 'red',
    textAlign: 'center',
  },
});
