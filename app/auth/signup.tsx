import { popRouteState } from '@/redux/slices/routeSlice';
import { RootState } from '@/redux/store';
import { createRepairShop, createUser, generateOtp, getRepairShops, getUsers } from '@/services/backendApi';
import { AutoRepairShop } from '@/types/autoRepairShop';
import { User } from '@/types/user';
import dayjs from 'dayjs';
import { Checkbox } from 'expo-checkbox';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  AppState,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { showMessage } from 'react-native-flash-message';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import MapView, { Marker, Region } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';
import SelectDropdown from 'react-native-select-dropdown';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useDispatch, useSelector } from 'react-redux';

const Signup = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const routes: any[] = useSelector((state: RootState) => state.route.route);
  const mapRef = useRef<MapView>(null);
  const [firstname, setFirstname] = useState<string>('');
  const [lastname, setLastname] = useState<string>('');
  const [gender, setGender] = useState<string>('');
  const [mobileNum, setMobileNum] = useState<string>('09');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [role, setRole] = useState<string>('');
  const [shopName, setShopName] = useState<string>('');
  const [page, setPage] = useState<string>('');
  const [region, setRegion] = useState<Region | undefined>(undefined);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [carOwnerModalVisible, isCarOwnerModalVisible] = useState<boolean>(false);
  const [repairShopModalVisible, isRepairShopModalVisible] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [timer, setTimer] = useState<number>(45);
  const endRef = useRef<number>(Date.now() + timer * 1000);
  const [isTimerActivate, setIsTimerActivate] = useState<boolean>(false);
  const [confirm, setConfirm] = useState<any>(null);
  const [otp, setOtp] = useState<string[]>(Array(6).fill(''));
  const [sendCodeLoading, setSendCodeLoading] = useState<boolean>(false);
  const [confirmCodeLoading, setConfirmCodeLoading] = useState<boolean>(false);
  const [verificationModalVisible, setVerificationModalVisible] = useState<boolean>(false);
  const inputs = useRef<(TextInput | null)[]>([]);
  const prefix = '09';

  const roles = [
    { title: 'Car Owner', icon: 'car-outline' },
    { title: 'Repair Shop', icon: 'tools' },
  ];
  const genders = [
    { title: 'Male', icon: 'gender-male' },
    { title: 'Female', icon: 'gender-female' },
  ];
  const services = [
    { id: '1', label: 'Engine diagnostics and repair' },
    { id: '2', label: 'Transmission repair and overhaul' },
    {
      id: '3',
      label: 'Oil change and fluid replacement (engine oil, brake fluid, coolant, etc.)',
    },
    {
      id: '4',
      label: 'Brake system service (pads, discs, drums, ABS systems)',
    },
    { id: '5', label: 'Clutch system service' },
    { id: '6', label: 'Battery check and replacement' },
    { id: '7', label: 'Timing belt/chain replacement' },
    { id: '8', label: 'Alternator and starter motor repair' },
    { id: '9', label: 'Suspension and steering repair' },
    { id: '10', label: 'Wheel alignment and balancing' },
    { id: '11', label: 'Shock absorber and strut replacement' },
    { id: '12', label: 'CV joint and axle repair' },
    { id: '13', label: 'Radiator repair and replacement' },
    { id: '14', label: 'Fuel system service (cleaning, injector repair)' },
    { id: '15', label: 'Air conditioning system service and repair' },
    { id: '16', label: 'Computerized engine diagnostics (OBD scanning)' },
    { id: '17', label: 'Wiring and electrical system repair' },
    { id: '18', label: 'ECU reprogramming' },
    { id: '19', label: 'Sensor and fuse replacement' },
    { id: '20', label: 'Headlight, taillight, and signal light repairs' },
    { id: '21', label: 'Power window and central lock repair' },
    { id: '22', label: 'Dent removal (Paintless Dent Removal)' },
    { id: '23', label: 'Auto body repair and repainting' },
    { id: '24', label: 'Collision repair' },
    { id: '25', label: 'Rustproofing and undercoating' },
    { id: '26', label: 'Car detailing and polishing' },
    { id: '27', label: 'Headlight restoration' },
    { id: '28', label: 'Full car wash (interior and exterior)' },
    { id: '29', label: 'Engine wash' },
    { id: '30', label: 'Interior vacuuming and shampooing' },
    { id: '31', label: 'Ceramic coating or wax application' },
    { id: '32', label: 'Upholstery and leather care' },
    { id: '33', label: 'Tire replacement and sales' },
    { id: '34', label: 'Brake pads, rotors, and linings' },
    { id: '35', label: 'Filters (air, fuel, oil, cabin)' },
    { id: '36', label: 'Belts and hoses' },
    { id: '37', label: 'Spark plugs and ignition coils' },
    {
      id: '38',
      label: 'Accessories (car alarms, dashcams, LED lights, spoilers, etc.)',
    },
    { id: '39', label: 'Preventive maintenance service (PMS)' },
    { id: '40', label: 'LTO vehicle inspection assistance' },
    { id: '41', label: 'Emission testing assistance' },
    { id: '42', label: 'Vehicle pre-buy inspection' },
    { id: '43', label: 'Insurance claim estimates and repairs' },
    { id: '44', label: '24/7 towing service' },
    { id: '45', label: 'Roadside assistance' },
    {
      id: '46',
      label: 'Fleet maintenance (for companies with multiple vehicles)',
    },
    { id: '47', label: 'Car restoration (classic or vintage cars)' },
    { id: '48', label: 'Custom modifications and tuning' },
  ];

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.warn('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      setRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });

      mapRef.current?.animateToRegion(
        {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        300
      );
    })();
  }, []);

  const startTimer = (seconds = timer) => {
    endRef.current = Date.now() + seconds * 1000;
    setIsTimerActivate(true);
    setTimer(seconds);
    scheduleTick();
  };

  const clearTimer = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const scheduleTick = useCallback(() => {
    clearTimer();
    const msLeft = endRef.current - Date.now();
    const secsLeft = Math.max(Math.ceil(msLeft / 1000), 0);
    setTimer(secsLeft);

    if (secsLeft <= 0) {
      clearTimer();
      setIsTimerActivate(false);
      setConfirm(null);
      setError('');
      setOtp(Array(6).fill(''));
      setTimer(45);
      return;
    }

    const remainder = msLeft % 1000;
    const nextDelay = remainder === 0 ? 1000 : remainder;
    timeoutRef.current = setTimeout(scheduleTick, nextDelay);
  }, [clearTimer, setIsTimerActivate, setConfirm, setError, setOtp, setTimer]);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        const msLeft = endRef.current - Date.now();
        const secsLeft = Math.max(Math.ceil(msLeft / 1000), 0);
        setTimer(secsLeft);

        if (secsLeft > 0 && !timeoutRef.current) {
          scheduleTick();
        }
      }
    });
    return () => sub.remove();
  }, [scheduleTick]);

  const handlePhoneNumInputChange = (text: string) => {
    if (!text.startsWith(prefix)) {
      setMobileNum(prefix);
    } else {
      setMobileNum(text);
    }

    if (!/^[0-9]*$/.test(text)) {
      setMobileNum(prefix);
    }
  };

  const handleOtpInputChange = (text: string, index: number) => {
    let newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    if (text && index < 5) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handleDrag = (e: any) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;

    const newRegion: Region = {
      ...region!,
      latitude,
      longitude,
    };
    setRegion(newRegion);
    mapRef.current?.animateToRegion(newRegion, 300);
  };

  const toggleCheckbox = (id: string) => {
    setSelectedServices((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const getRandomHexColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  const handleAddUser = async () => {
    if (!firstname || !lastname || !gender || !mobileNum || !password || !confirmPassword || !role) {
      showMessage({
        message: 'Please fill in all fields.',
        type: 'warning',
        floating: true,
        color: '#FFF',
        icon: 'warning',
      });
      return;
    }

    if (password !== confirmPassword) {
      showMessage({
        message: "Password don't match.",
        type: 'warning',
        floating: true,
        color: '#FFF',
        icon: 'warning',
      });
      return;
    }

    if (password.length < 8) {
      showMessage({
        message: 'Password must be at least 8 characters.',
        type: 'warning',
        floating: true,
        color: '#FFF',
        icon: 'warning',
      });
      return;
    }

    try {
      const fetchedUsers: User[] = await getUsers();
      const mobileNumExists = fetchedUsers.some((user) => user.mobile_num === mobileNum.trim());

      if (mobileNumExists) {
        showMessage({
          message: 'Mobile number is already used by another account.',
          type: 'warning',
          floating: true,
          color: '#FFF',
          icon: 'warning',
        });
        return;
      }
      handleSendCode();
    } catch {
      showMessage({
        message: 'Something went wrong. Please try again.',
        type: 'danger',
        floating: true,
        color: '#FFF',
        icon: 'danger',
      });
      return;
    }
  };

  const handleAddRepairShop = async () => {
    if (page === 'Repair Shop') {
      if (!firstname || !lastname || !gender || !mobileNum || !password || !confirmPassword || !shopName || !role) {
        showMessage({
          message: 'Please fill out all fields.',
          type: 'warning',
          floating: true,
          color: '#FFF',
          icon: 'warning',
        });
        return;
      }

      if (password !== confirmPassword) {
        showMessage({
          message: "Password don't match.",
          type: 'warning',
          floating: true,
          color: '#FFF',
          icon: 'warning',
        });
        return;
      }

      if (password.length < 8) {
        showMessage({
          message: 'Password must be at least 8 characters.',
          type: 'warning',
          floating: true,
          color: '#FFF',
          icon: 'warning',
        });
        return;
      }

      try {
        const fetchedAutoRepairShops: AutoRepairShop[] = await getRepairShops();
        const mobileNumExists = fetchedAutoRepairShops.some((repairShop) => repairShop.mobile_num === mobileNum.trim());

        if (mobileNumExists) {
          showMessage({
            message: 'Mobile number is already used by another account.',
            type: 'warning',
            floating: true,
            color: '#FFF',
            icon: 'warning',
          });
          return;
        }
      } catch {
        showMessage({
          message: 'Something went wrong. Please try again.',
          type: 'danger',
          floating: true,
          color: '#FFF',
          icon: 'danger',
        });
      }

      setPage('Location');
    } else if (page === 'Location') {
      setPage('Services Offered');
    } else {
      if (selectedServices.length === 0) {
        showMessage({
          message: 'Please select your services oferred.',
          type: 'warning',
          floating: true,
          color: '#FFF',
          icon: 'warning',
        });
        return;
      }
      handleSendCode();
    }
  };

  const handleSendCode = async () => {
    if (mobileNum.length < 11) {
      showMessage({
        message: 'Invalid number.',
        type: 'warning',
        floating: true,
        color: '#FFF',
        icon: 'warning',
      });
      return;
    }

    try {
      setSendCodeLoading(true);
      const res = await generateOtp(mobileNum.trim(), '', 'sms', role, 'sms-verification');
      setConfirm(res);

      showMessage({
        message: 'Verification sent!',
        type: 'success',
        floating: true,
        color: '#FFF',
        icon: 'success',
      });

      setTimeout(() => {
        setVerificationModalVisible(true);
        startTimer();
      }, 2000);
    } catch {
      showMessage({
        message: 'Failed to send verification.',
        type: 'danger',
        floating: true,
        color: '#FFF',
        icon: 'danger',
      });
    } finally {
      setSendCodeLoading(false);
    }
  };

  const handleResendCode = async () => {
    try {
      setConfirmCodeLoading(true);
      const res = await generateOtp(mobileNum.trim(), '', 'sms', role, 'sms-verification');
      setConfirm(res);
      startTimer();
    } catch {
      setError('Failed to send verification.');
    } finally {
      setConfirmCodeLoading(false);
    }
  };

  const verifyCode = async () => {
    if (otp.join('') === '') {
      setError('Please input code first.');
      return;
    }

    if (otp.join('').length >= 1 && otp.join('').length <= 5) {
      setError('Invalid code');
      return;
    }

    setError('');

    try {
      setConfirmCodeLoading(true);

      if (otp.join('') !== confirm) {
        setError('You entered a wrong code.');
        return;
      }

      setVerificationModalVisible(false);
      clearTimer();
      setIsTimerActivate(false);
      setConfirm(null);
      setError('');
      setOtp(Array(6).fill(''));
      setTimer(45);

      try {
        if (role === 'Car Owner') {
          const newUser = {
            firstname: firstname.trim(),
            lastname: lastname.trim(),
            gender: gender.trim(),
            email: null,
            mobile_num: mobileNum.trim(),
            password: password.trim(),
            creation_date: dayjs().format(),
            profile_pic: null,
            role: role.trim(),
            user_initials_bg: getRandomHexColor(),
            is_deleted: false,
          };

          await createUser(newUser);
          setFirstname('');
          setLastname('');
          setGender('');
          setMobileNum('');
          setPassword('');
          setConfirmPassword('');
        } else {
          const newRepairShop = {
            repair_shop_id: null,
            owner_firstname: firstname.trim(),
            owner_lastname: lastname.trim(),
            gender: gender.trim(),
            shop_name: shopName.trim(),
            mobile_num: mobileNum.trim(),
            password: password.trim(),
            email: null,
            services_offered: selectedServices,
            longitude: region?.longitude !== undefined ? region.longitude.toString() : '',
            latitude: region?.latitude !== undefined ? region.latitude.toString() : '',
            creation_date: null,
            profile_pic: null,
            shop_images: [],
            number_of_ratings: 0,
            average_rating: 0,
            approval_status: 'Pending',
            total_score: 0,
            profile_bg: getRandomHexColor(),
            availability: 'close',
            is_deleted: false,
          };

          await createRepairShop(newRepairShop);
          setFirstname('');
          setLastname('');
          setGender('');
          setShopName('');
          setMobileNum('');
          setPassword('');
          setConfirmPassword('');
          setSelectedServices([]);
          setRegion(undefined);
        }
      } catch {
        showMessage({
          message: 'Something went wrong. Please try again.',
          type: 'danger',
          floating: true,
          color: '#FFF',
          icon: 'danger',
        });
        return;
      }

      showMessage({
        message: 'Verified!',
        type: 'success',
        floating: true,
        color: '#FFF',
        icon: 'success',
      });

      setTimeout(() => {
        if (role === 'Car Owner') {
          isCarOwnerModalVisible(true);
        } else {
          isRepairShopModalVisible(true);
        }
      }, 2000);
    } catch {
      setError('You entered a wrong code.');
    } finally {
      setConfirmCodeLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAwareScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <View style={styles.upperBox}>
          <View style={styles.logoContainer}>
            <Image source={require('../../assets/images/logo.png')} style={styles.logo} />
          </View>

          <View style={styles.textInputContainer1}>
            <Text style={styles.upperTextInputLbl}>Register as</Text>
            <SelectDropdown
              data={roles}
              onSelect={(selectedItem) => {
                setRole(selectedItem.title);
                setPage(selectedItem.title);
                setFirstname('');
                setLastname('');
                setGender('');
                setMobileNum('');
                setPassword('');
                setConfirmPassword('');
                setSelectedServices([]);
                setRegion(undefined);
                setShopName('');
              }}
              statusBarTranslucent={true}
              renderButton={(selectedItem, isOpen) => (
                <View style={styles.upperDropdownButtonStyle}>
                  {selectedItem && <Icon name={selectedItem.icon} style={styles.dropdownButtonIconStyle} />}
                  <Text style={styles.dropdownButtonTxtStyle}>
                    {(selectedItem && selectedItem.title) || 'Select role'}
                  </Text>
                  <Icon name={isOpen ? 'chevron-up' : 'chevron-down'} style={styles.dropdownButtonArrowStyle} />
                </View>
              )}
              renderItem={(item, _index, isSelected) => (
                <View
                  style={{
                    ...styles.dropdownItemStyle,
                    ...(isSelected && { backgroundColor: '#D2D9DF' }),
                  }}
                >
                  <Icon name={item.icon} style={styles.dropdownItemIconStyle} />
                  <Text style={styles.dropdownItemTxtStyle}>{item.title}</Text>
                </View>
              )}
              showsVerticalScrollIndicator={false}
              dropdownStyle={styles.dropdownMenuStyle}
            />
          </View>
        </View>

        <View style={styles.lowerBox}>
          {page === 'Car Owner' && (
            <>
              <View style={styles.arrowHeaderContainer}>
                <TouchableOpacity
                  style={styles.arrowWrapper}
                  onPress={() => {
                    router.replace(routes[routes.length - 1]);
                    dispatch(popRouteState());
                  }}
                >
                  <Icon name="arrow-left" size={24} style={styles.arrowBack} />
                </TouchableOpacity>
                <Text style={styles.header}>Create Account</Text>
              </View>

              <View style={styles.row}>
                <View style={styles.textInputContainer2}>
                  <Text style={styles.textInputLbl}>First Name</Text>
                  <TextInput
                    value={firstname}
                    onChangeText={setFirstname}
                    style={styles.input}
                    placeholder="John"
                    placeholderTextColor="#555"
                  />
                </View>

                <View style={styles.textInputContainer2}>
                  <Text style={styles.textInputLbl}>Last Name</Text>
                  <TextInput
                    value={lastname}
                    onChangeText={setLastname}
                    style={styles.input}
                    placeholder="Doe"
                    placeholderTextColor="#555"
                  />
                </View>
              </View>

              <View style={styles.row}>
                <View style={styles.textInputContainer2}>
                  <Text style={styles.textInputLbl}>Gender</Text>
                  <SelectDropdown
                    data={genders}
                    onSelect={(selectedItem) => setGender(selectedItem.title)}
                    statusBarTranslucent={true}
                    renderButton={(selectedItem, isOpen) => (
                      <View style={styles.dropdownButtonStyle}>
                        {selectedItem && <Icon name={selectedItem.icon} style={styles.dropdownButtonIconStyle} />}
                        <Text style={styles.dropdownButtonTxtStyle}>
                          {(selectedItem && selectedItem.title) || 'Select gender'}
                        </Text>
                        <Icon name={isOpen ? 'chevron-up' : 'chevron-down'} style={styles.dropdownButtonArrowStyle} />
                      </View>
                    )}
                    renderItem={(item, _index, isSelected) => (
                      <View
                        style={{
                          ...styles.dropdownItemStyle,
                          ...(isSelected && { backgroundColor: '#D2D9DF' }),
                        }}
                      >
                        <Icon name={item.icon} style={styles.dropdownItemIconStyle} />
                        <Text style={styles.dropdownItemTxtStyle}>{item.title}</Text>
                      </View>
                    )}
                    showsVerticalScrollIndicator={false}
                    dropdownStyle={styles.dropdownMenuStyle}
                  />
                </View>

                <View style={styles.textInputContainer2}>
                  <Text style={styles.textInputLbl}>Mobile Number</Text>
                  <TextInput
                    value={mobileNum}
                    onChangeText={handlePhoneNumInputChange}
                    maxLength={11}
                    style={styles.input}
                    keyboardType="number-pad"
                    placeholder="09XXXXXXXXX"
                    placeholderTextColor="#555"
                  />
                </View>
              </View>

              <View style={styles.row}>
                <View style={styles.textInputContainer2}>
                  <Text style={styles.textInputLbl}>Password</Text>
                  <TextInput
                    value={password}
                    onChangeText={setPassword}
                    style={styles.input}
                    secureTextEntry
                    placeholder="********"
                    placeholderTextColor="#555"
                  />
                </View>

                <View style={styles.textInputContainer2}>
                  <Text style={styles.textInputLbl}>Confirm Password</Text>
                  <TextInput
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    style={styles.input}
                    secureTextEntry
                    placeholder="********"
                    placeholderTextColor="#555"
                  />
                </View>
              </View>

              <View style={styles.loginContainer}>
                <Text style={styles.questionLbl}>Have an account?</Text>
                <TouchableOpacity onPress={() => router.replace('/auth/login')}>
                  <Text style={styles.loginLbl}>Log In</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.button} onPress={() => handleAddUser()}>
                <Text style={styles.buttonTxt}>Sign Up</Text>
              </TouchableOpacity>

              <Modal
                animationType="fade"
                backdropColor={'rgba(0, 0, 0, 0.5)'}
                visible={carOwnerModalVisible}
                onRequestClose={() => {
                  isCarOwnerModalVisible(!carOwnerModalVisible);
                  router.replace('/auth/login');
                  setPage('');
                }}
              >
                <View style={styles.centeredView}>
                  <View style={styles.modalView}>
                    <Text style={styles.modalTxt}>Account created successfully. Thank you for registering!</Text>
                    <TouchableOpacity
                      style={styles.modalButton}
                      onPress={() => {
                        isCarOwnerModalVisible(!carOwnerModalVisible);
                        router.replace('/auth/login');
                        setPage('');
                      }}
                    >
                      <Text style={styles.buttonTxt}>Ok</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Modal>
            </>
          )}

          {page === 'Repair Shop' && (
            <>
              <View style={styles.arrowHeaderContainer}>
                <TouchableOpacity
                  style={styles.arrowWrapper}
                  onPress={() => {
                    router.replace(routes[routes.length - 1]);
                    dispatch(popRouteState());
                  }}
                >
                  <Icon name="arrow-left" size={24} style={styles.arrowBack} />
                </TouchableOpacity>
                <Text style={styles.header}>Create Account</Text>
              </View>

              <View style={styles.row}>
                <View style={styles.textInputContainer2}>
                  <Text style={styles.textInputLbl}>First Name</Text>
                  <TextInput
                    value={firstname}
                    onChangeText={setFirstname}
                    style={styles.input}
                    placeholder="John"
                    placeholderTextColor="#555"
                  />
                </View>

                <View style={styles.textInputContainer2}>
                  <Text style={styles.textInputLbl}>Last Name</Text>
                  <TextInput
                    value={lastname}
                    onChangeText={setLastname}
                    style={styles.input}
                    placeholder="Doe"
                    placeholderTextColor="#555"
                  />
                </View>
              </View>

              <View style={styles.row}>
                <View style={styles.textInputContainer2}>
                  <Text style={styles.textInputLbl}>Gender</Text>
                  <SelectDropdown
                    data={genders}
                    onSelect={(selectedItem) => setGender(selectedItem.title)}
                    statusBarTranslucent={true}
                    renderButton={(selectedItem, isOpen) => (
                      <View style={styles.dropdownButtonStyle}>
                        {selectedItem && <Icon name={selectedItem.icon} style={styles.dropdownButtonIconStyle} />}
                        <Text style={styles.dropdownButtonTxtStyle}>
                          {(selectedItem && selectedItem.title) || 'Select gender'}
                        </Text>
                        <Icon name={isOpen ? 'chevron-up' : 'chevron-down'} style={styles.dropdownButtonArrowStyle} />
                      </View>
                    )}
                    renderItem={(item, _index, isSelected) => (
                      <View
                        style={{
                          ...styles.dropdownItemStyle,
                          ...(isSelected && { backgroundColor: '#D2D9DF' }),
                        }}
                      >
                        <Icon name={item.icon} style={styles.dropdownItemIconStyle} />
                        <Text style={styles.dropdownItemTxtStyle}>{item.title}</Text>
                      </View>
                    )}
                    showsVerticalScrollIndicator={false}
                    dropdownStyle={styles.dropdownMenuStyle}
                  />
                </View>

                <View style={styles.textInputContainer2}>
                  <Text style={styles.textInputLbl}>Mobile Number</Text>
                  <TextInput
                    value={mobileNum}
                    onChangeText={handlePhoneNumInputChange}
                    maxLength={11}
                    style={styles.input}
                    keyboardType="number-pad"
                    placeholder="09XXXXXXXXX"
                    placeholderTextColor="#555"
                  />
                </View>
              </View>

              <View style={styles.row}>
                <View style={styles.textInputContainer2}>
                  <Text style={styles.textInputLbl}>Password</Text>
                  <TextInput
                    value={password}
                    onChangeText={setPassword}
                    style={styles.input}
                    secureTextEntry
                    placeholder="********"
                    placeholderTextColor="#555"
                  />
                </View>

                <View style={styles.textInputContainer2}>
                  <Text style={styles.textInputLbl}>Confirm Password</Text>
                  <TextInput
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    style={styles.input}
                    secureTextEntry
                    placeholder="********"
                    placeholderTextColor="#555"
                  />
                </View>
              </View>

              <View style={styles.textInputContainer3}>
                <Text style={styles.textInputLbl}>Shop Name</Text>
                <TextInput
                  value={shopName}
                  onChangeText={setShopName}
                  style={styles.shopNameInput}
                  placeholder="John Repair Shop"
                  placeholderTextColor="#555"
                />
              </View>

              <TouchableOpacity style={styles.button} onPress={() => handleAddRepairShop()}>
                <Text style={styles.buttonTxt}>Next</Text>
              </TouchableOpacity>
            </>
          )}

          {page === 'Location' && (
            <>
              <View style={styles.arrowHeaderContainer}>
                <TouchableOpacity style={styles.arrowWrapper} onPress={() => setPage('Repair Shop')}>
                  <Icon name="arrow-left" size={24} style={styles.arrowBack} />
                </TouchableOpacity>
                <Text style={styles.header}>Location</Text>
              </View>

              <Text style={styles.textInputLbl}>Please set up your shop location on the map.</Text>

              <MapView
                style={styles.map}
                ref={mapRef}
                mapType="hybrid"
                initialRegion={region}
                onRegionChange={(newRegion) => setRegion(newRegion)}
              >
                {region && (
                  <Marker
                    coordinate={{
                      latitude: region.latitude,
                      longitude: region.longitude,
                    }}
                    draggable
                    onDragEnd={handleDrag}
                  />
                )}
              </MapView>

              <TouchableOpacity style={styles.button} onPress={() => handleAddRepairShop()}>
                <Text style={styles.buttonTxt}>Next</Text>
              </TouchableOpacity>
            </>
          )}

          {page === 'Services Offered' && (
            <>
              <View style={styles.arrowHeaderContainer}>
                <TouchableOpacity style={styles.arrowWrapper} onPress={() => setPage('Location')}>
                  <Icon name="arrow-left" size={24} style={styles.arrowBack} />
                </TouchableOpacity>
                <Text style={styles.header}>Services Offered</Text>
              </View>

              <View style={styles.servicesList}>
                {services.map((item) => (
                  <View key={item.id} style={styles.checkboxContainer}>
                    <Checkbox
                      value={selectedServices.includes(item.label)}
                      onValueChange={() => toggleCheckbox(item.label)}
                      color={selectedServices.includes(item.label) ? '#000B58' : undefined}
                    />
                    <Text style={styles.checkboxTxt}>{item.label}</Text>
                  </View>
                ))}
              </View>

              <TouchableOpacity style={styles.button} onPress={() => handleAddRepairShop()}>
                <Text style={styles.buttonTxt}>Submit</Text>
              </TouchableOpacity>

              <Modal
                animationType="fade"
                backdropColor={'rgba(0, 0, 0, 0.5)'}
                visible={repairShopModalVisible}
                onRequestClose={() => {
                  isRepairShopModalVisible(!repairShopModalVisible);
                  router.replace('/auth/login');
                  setPage('');
                }}
              >
                <View style={styles.centeredView}>
                  <View style={styles.modalView}>
                    <Text style={styles.modalTxt}>
                      Thank you for registering! Please wait for admin approval. An update will be sent via SMS.
                    </Text>
                    <TouchableOpacity
                      style={styles.modalButton}
                      onPress={() => {
                        isRepairShopModalVisible(!repairShopModalVisible);
                        router.replace('/auth/login');
                        setPage('');
                      }}
                    >
                      <Text style={styles.buttonTxt}>Ok</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Modal>
            </>
          )}

          <Modal
            animationType="fade"
            backdropColor={'rgba(0, 0, 0, 0.5)'}
            visible={verificationModalVisible}
            onRequestClose={() => {
              setVerificationModalVisible(false);
              clearTimer();
              setIsTimerActivate(false);
              setConfirm(null);
              setError('');
              setOtp(Array(6).fill(''));
              setTimer(45);
            }}
          >
            <TouchableWithoutFeedback
              onPress={() => {
                setVerificationModalVisible(false);
                clearTimer();
                setIsTimerActivate(false);
                setConfirm(null);
                setError('');
                setOtp(Array(6).fill(''));
                setTimer(45);
              }}
            >
              <View style={styles.centeredView}>
                <Pressable style={styles.verificationModalView} onPress={() => {}}>
                  <Text style={styles.modalHeader}>Verification</Text>
                  <Text style={styles.modalText}>We have sent the verification code to your number.</Text>
                  <View style={styles.codeInputContainer}>
                    {otp.map((digit, index) => (
                      <TextInput
                        key={index}
                        style={[styles.input, { width: 30 }]}
                        value={digit}
                        onChangeText={(text) => handleOtpInputChange(text.replace(/[^0-9]/g, ''), index)}
                        onKeyPress={(e) => handleKeyPress(e, index)}
                        keyboardType="number-pad"
                        maxLength={1}
                        readOnly={isTimerActivate ? false : true}
                        ref={(ref) => {
                          inputs.current[index] = ref;
                        }}
                      />
                    ))}
                  </View>
                  <Text style={[styles.modalText, { fontSize: 12 }]}>
                    {isTimerActivate ? `Resend code in ${timer}s` : 'You can resend the code now'}
                  </Text>
                  {error.length > 0 && (
                    <View style={styles.errorContainer}>
                      <Text style={styles.errorMessage}>{error}</Text>
                    </View>
                  )}

                  {confirmCodeLoading && (
                    <ActivityIndicator style={{ marginBottom: 10 }} size="small" color="#000B58" />
                  )}

                  {!isTimerActivate && (
                    <TouchableOpacity style={[styles.sendButton, { marginTop: 0 }]} onPress={() => handleResendCode()}>
                      <Text style={styles.sendButtonText}>Resend Code</Text>
                    </TouchableOpacity>
                  )}

                  {isTimerActivate && (
                    <TouchableOpacity style={[styles.sendButton, { marginTop: 0 }]} onPress={() => verifyCode()}>
                      <Text style={styles.sendButtonText}>Verify Code</Text>
                    </TouchableOpacity>
                  )}
                </Pressable>
              </View>
            </TouchableWithoutFeedback>
          </Modal>
        </View>
      </KeyboardAwareScrollView>
      {sendCodeLoading && (
        <View style={styles.sendCodeLoadingContainer}>
          <ActivityIndicator size="large" color="#000B58" />
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f4f7',
  },
  upperBox: {
    backgroundColor: '#000B58',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    padding: 10,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 85,
    height: 70,
  },
  upperTextInputLbl: {
    color: '#FFF',
    fontFamily: 'BodyRegular',
  },
  upperDropdownButtonStyle: {
    width: '100%',
    height: 45,
    backgroundColor: '#fff',
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  lowerBox: {
    alignItems: 'center',
    flex: 1,
  },
  header: {
    color: '#000B58',
    fontSize: 22,
    fontFamily: 'HeaderBold',
    position: 'absolute',
    textAlign: 'center',
    width: '100%',
    zIndex: 1,
  },
  textInputContainer1: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    marginTop: 10,
    width: '50%',
  },
  textInputContainer2: {
    gap: 10,
    marginTop: 10,
    width: '45%',
  },
  textInputContainer3: {
    gap: 10,
    marginTop: 10,
    width: '93%',
  },
  row: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-evenly',
  },
  textInputLbl: {
    color: '#333',
    fontFamily: 'BodyRegular',
  },
  input: {
    backgroundColor: '#fff',
    width: '100%',
    height: 45,
    borderRadius: 10,
    padding: 10,
    color: '#333',
    fontFamily: 'BodyRegular',
    marginBottom: 20,
  },
  dropdownButtonStyle: {
    width: '100%',
    height: 45,
    backgroundColor: '#fff',
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  dropdownButtonTxtStyle: {
    flex: 1,
    color: '#333',
    fontFamily: 'BodyRegular',
  },
  dropdownButtonArrowStyle: {
    fontSize: 24,
    color: '#333',
  },
  dropdownButtonIconStyle: {
    fontSize: 24,
    color: '#333',
    marginRight: 8,
  },
  dropdownMenuStyle: {
    backgroundColor: '#EAEAEA',
    borderRadius: 10,
  },
  dropdownItemStyle: {
    width: '100%',
    flexDirection: 'row',
    paddingHorizontal: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
  },
  dropdownItemTxtStyle: {
    flex: 1,
    color: '#333',
    fontFamily: 'BodyRegular',
  },
  dropdownItemIconStyle: {
    fontSize: 24,
    color: '#333',
    marginRight: 8,
  },
  questionLbl: {
    color: '#333',
    fontFamily: 'BodyRegular',
  },
  loginLbl: {
    fontSize: 12,
    color: '#333',
    fontFamily: 'BodyBold',
    textDecorationLine: 'underline',
  },
  loginContainer: {
    flexDirection: 'column',
    gap: 5,
    alignItems: 'center',
    marginTop: 30,
  },
  button: {
    width: 120,
    padding: 10,
    backgroundColor: '#000B58',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    marginTop: 20,
    marginBottom: 20,
  },
  buttonTxt: {
    color: '#FFF',
    fontFamily: 'HeaderBold',
  },
  shopNameInput: {
    backgroundColor: '#fff',
    width: '100%',
    height: 45,
    borderRadius: 10,
    padding: 10,
    fontFamily: 'BodyRegular',
  },
  map: {
    width: '100%',
    flex: 1,
    borderRadius: 10,
  },
  arrowHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
    paddingVertical: 10,
    width: '95%',
  },
  arrowWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  arrowBack: {
    color: '#000B58',
  },
  servicesList: {
    width: '95%',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    gap: 10,
  },
  checkboxTxt: {
    fontFamily: 'BodyRegular',
    width: '90%',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalView: {
    backgroundColor: '#FFF',
    width: '70%',
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
  modalTxt: {
    textAlign: 'center',
    fontFamily: 'BodyRegular',
    color: '#333',
  },
  modalButton: {
    width: '50%',
    height: 45,
    backgroundColor: '#000B58',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    marginTop: 10,
  },
  sendButton: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000B58',
    padding: 10,
    borderRadius: 10,
    marginTop: 20,
  },
  sendButtonText: {
    fontFamily: 'BodyRegular',
    color: '#fff',
  },
  verificationModalView: {
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
    fontSize: 20,
    fontFamily: 'HeaderBold',
    color: '#333',
    marginBottom: 10,
  },
  modalText: {
    fontFamily: 'BodyRegular',
    color: '#333',
    marginBottom: 10,
  },
  codeInputContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  errorContainer: {
    backgroundColor: '#EAEAEA',
    borderRadius: 5,
    width: '100%',
    padding: 10,
    marginBottom: 10,
  },
  errorMessage: {
    fontFamily: 'BodyRegular',
    color: 'red',
    textAlign: 'center',
    fontSize: 12,
  },
  sendCodeLoadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 10,
  },
});

export default Signup;
