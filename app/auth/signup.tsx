import PrivacyPolicyComp from '@/components/PrivacyPolicyComp';
import TermsOfServiceComp from '@/components/TermsOfServiceComp';
import { popRouteState } from '@/redux/slices/routeSlice';
import { RootState } from '@/redux/store';
import { createRepairShop, createUser, generateOtp, getRepairShops, getUsers } from '@/services/backendApi';
import { AutoRepairShop } from '@/types/autoRepairShop';
import { User } from '@/types/user';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import dayjs from 'dayjs';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  AppState,
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
  const [timer, setTimer] = useState<number>(60);
  const endRef = useRef<number>(Date.now() + timer * 1000);
  const [isTimerActivate, setIsTimerActivate] = useState<boolean>(false);
  const [confirm, setConfirm] = useState<any>(null);
  const [otp, setOtp] = useState<string[]>(Array(6).fill(''));
  const [sendCodeLoading, setSendCodeLoading] = useState<boolean>(false);
  const [confirmCodeLoading, setConfirmCodeLoading] = useState<boolean>(false);
  const [signupLoading, setSignupLoading] = useState<boolean>(false);
  const [verificationModalVisible, setVerificationModalVisible] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [showShopPassword, setShowShopPassword] = useState<boolean>(false);
  const [showShopConfirmPassword, setShowShopConfirmPassword] = useState<boolean>(false);
  const inputs = useRef<(TextInput | null)[]>([]);
  const prefix = '09';
  const [termsModalVisible, setTermsModalVisible] = useState<boolean>(false);
  const [privacyModalVisible, setPrivacyModalVisible] = useState<boolean>(false);

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
      if (page === 'Location') {
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
      } else {
        return;
      }
    })();
  }, [page]);

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
      setTimer(60);
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

    // Move to next field if text is entered and not the last field
    if (text && index < 5) {
      inputs.current[index + 1]?.focus();
    }
    // Move to previous field if text is deleted and not the first field
    else if (!text && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    // Handle backspace when current field is empty
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
    // Handle backspace when current field has a digit - clear it and move to previous
    else if (e.nativeEvent.key === 'Backspace' && otp[index] && index > 0) {
      let newOtp = [...otp];
      newOtp[index] = '';
      setOtp(newOtp);
      inputs.current[index - 1]?.focus();
    }
    // Handle backspace on first field - just clear it
    else if (e.nativeEvent.key === 'Backspace' && otp[index] && index === 0) {
      let newOtp = [...otp];
      newOtp[index] = '';
      setOtp(newOtp);
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
    if (signupLoading) return; // Prevent multiple clicks

    if (!firstname || !lastname || !gender || !mobileNum || !password || !confirmPassword || !role) {
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

    setSignupLoading(true);

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
        setSignupLoading(false);
        return;
      }
      handleSendCode();
    } catch {
      setSignupLoading(false);
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

  const handleAddRepairShop = async () => {
    if (signupLoading) return; // Prevent multiple clicks

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

      setSignupLoading(true);

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
          setSignupLoading(false);
          return;
        }
      } catch {
        setSignupLoading(false);
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

      setSignupLoading(false);
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
      setTimeout(() => {
        router.push('/error/server-error');
      }, 2000);
    } finally {
      setSendCodeLoading(false);
      setSignupLoading(false);
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
      setTimer(60);

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
            settings_map_type: 'standard',
            settings_push_notif: true,
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
            settings_map_type: 'standard',
            settings_push_notif: true,
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
        setTimeout(() => {
          router.push('/error/server-error');
        }, 2000);
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
                  <View style={styles.passwordInputContainer}>
                    <TextInput
                      value={password}
                      onChangeText={setPassword}
                      style={styles.passwordInput}
                      secureTextEntry={!showPassword}
                      placeholder="********"
                      placeholderTextColor="#555"
                    />
                    <TouchableOpacity style={styles.eyeIcon} onPress={() => setShowPassword(!showPassword)}>
                      <Icon name={showPassword ? 'eye-off' : 'eye'} size={20} color="#555" />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.textInputContainer2}>
                  <Text style={styles.textInputLbl}>Confirm Password</Text>
                  <View style={styles.passwordInputContainer}>
                    <TextInput
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      style={styles.passwordInput}
                      secureTextEntry={!showConfirmPassword}
                      placeholder="********"
                      placeholderTextColor="#555"
                    />
                    <TouchableOpacity
                      style={styles.eyeIcon}
                      onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      <Icon name={showConfirmPassword ? 'eye-off' : 'eye'} size={20} color="#555" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              <View style={styles.loginContainer}>
                <Text style={styles.questionLbl}>Have an account?</Text>
                <TouchableOpacity onPress={() => router.replace('/auth/login')}>
                  <Text style={styles.loginLbl}>Log In</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.termsContainer}>
                <Text style={styles.termsText}>By clicking Sign Up, you agree to our </Text>
                <TouchableOpacity onPress={() => setTermsModalVisible(true)}>
                  <Text style={[styles.termsText, { color: '#007BFF' }]}>Terms of Service</Text>
                </TouchableOpacity>
                <Text> and </Text>
                <TouchableOpacity onPress={() => setPrivacyModalVisible(true)}>
                  <Text style={[styles.termsText, { color: '#007BFF' }]}>Privacy Policy</Text>
                </TouchableOpacity>
                <Text style={styles.termsText}>.</Text>
              </View>

              <TouchableOpacity
                style={[styles.button, signupLoading && styles.buttonDisabled]}
                onPress={() => handleAddUser()}
                disabled={signupLoading}
              >
                {signupLoading ? (
                  <ActivityIndicator size="small" color="#333" />
                ) : (
                  <Text style={styles.buttonTxt}>Sign Up</Text>
                )}
              </TouchableOpacity>

              <Modal
                animationType="fade"
                transparent={true}
                visible={termsModalVisible}
                onRequestClose={() => setTermsModalVisible(false)}
              >
                <View style={styles.modalOverlay}>
                  <TouchableWithoutFeedback onPress={() => setTermsModalVisible(false)}>
                    <View style={styles.modalBackground} />
                  </TouchableWithoutFeedback>

                  <View style={styles.termsPrivacyModalView}>
                    <View style={styles.modalHeaderSection}>
                      <Icon name="file-document-outline" size={24} color="#000B58" />
                      <Text style={styles.modalHeaderText}>Terms of Service</Text>
                    </View>
                    <ScrollView>
                      <View style={styles.modalScrollContent}>
                        <View style={styles.introCard}>
                          <View style={styles.iconContainer}>
                            <MaterialCommunityIcons name="file-document-outline" size={32} color="#000B58" />
                          </View>
                          <Text style={styles.introTitle}>Legal Agreement</Text>
                          <Text style={styles.introText}>
                            Please read these terms and conditions carefully before using the Auto AIDER application
                          </Text>
                        </View>

                        <TermsOfServiceComp />
                      </View>
                    </ScrollView>
                    <TouchableOpacity style={styles.modalCloseButton} onPress={() => setTermsModalVisible(false)}>
                      <Text style={styles.modalCloseButtonText}>Close</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Modal>

              <Modal
                animationType="fade"
                transparent={true}
                visible={privacyModalVisible}
                onRequestClose={() => setPrivacyModalVisible(false)}
              >
                <View style={styles.modalOverlay}>
                  <TouchableWithoutFeedback onPress={() => setPrivacyModalVisible(false)}>
                    <View style={styles.modalBackground} />
                  </TouchableWithoutFeedback>

                  <View style={styles.termsPrivacyModalView}>
                    <View style={styles.modalHeaderSection}>
                      <Icon name="shield-lock-outline" size={24} color="#000B58" />
                      <Text style={styles.modalHeaderText}>Privacy Policy</Text>
                    </View>
                    <ScrollView>
                      <View style={styles.modalScrollContent}>
                        <View style={styles.introCard}>
                          <View style={styles.iconContainer}>
                            <MaterialCommunityIcons name="shield-lock-outline" size={32} color="#000B58" />
                          </View>
                          <Text style={styles.introTitle}>Your Privacy Matters</Text>
                          <Text style={styles.introText}>
                            We are committed to protecting your personal information and your right to privacy
                          </Text>
                        </View>

                        <PrivacyPolicyComp />
                      </View>
                    </ScrollView>
                    <TouchableOpacity style={styles.modalCloseButton} onPress={() => setPrivacyModalVisible(false)}>
                      <Text style={styles.modalCloseButtonText}>Close</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Modal>

              <Modal
                animationType="fade"
                transparent={true}
                visible={carOwnerModalVisible}
                onRequestClose={() => {
                  isCarOwnerModalVisible(!carOwnerModalVisible);
                  router.replace('/auth/login');
                  setPage('');
                }}
              >
                <View style={styles.modalOverlay}>
                  <TouchableWithoutFeedback
                    onPress={() => {
                      isCarOwnerModalVisible(!carOwnerModalVisible);
                      router.replace('/auth/login');
                      setPage('');
                    }}
                  >
                    <View style={styles.modalBackground} />
                  </TouchableWithoutFeedback>

                  <View style={styles.modalView}>
                    <View style={styles.successIconContainer}>
                      <Icon name="check-circle" size={64} color="#10B981" />
                    </View>
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
                  <View style={styles.passwordInputContainer}>
                    <TextInput
                      value={password}
                      onChangeText={setPassword}
                      style={styles.passwordInput}
                      secureTextEntry={!showShopPassword}
                      placeholder="********"
                      placeholderTextColor="#555"
                    />
                    <TouchableOpacity style={styles.eyeIcon} onPress={() => setShowShopPassword(!showShopPassword)}>
                      <Icon name={showShopPassword ? 'eye-off' : 'eye'} size={20} color="#555" />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.textInputContainer2}>
                  <Text style={styles.textInputLbl}>Confirm Password</Text>
                  <View style={styles.passwordInputContainer}>
                    <TextInput
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      style={styles.passwordInput}
                      secureTextEntry={!showShopConfirmPassword}
                      placeholder="********"
                      placeholderTextColor="#555"
                    />
                    <TouchableOpacity
                      style={styles.eyeIcon}
                      onPress={() => setShowShopConfirmPassword(!showShopConfirmPassword)}
                    >
                      <Icon name={showShopConfirmPassword ? 'eye-off' : 'eye'} size={20} color="#555" />
                    </TouchableOpacity>
                  </View>
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

              <TouchableOpacity
                style={[styles.button, signupLoading && styles.buttonDisabled]}
                onPress={() => handleAddRepairShop()}
                disabled={signupLoading}
              >
                {signupLoading ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Text style={styles.buttonTxt}>Next</Text>
                )}
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

              <View style={styles.locationInstructions}>
                <Icon name="map-marker-radius" size={24} color="#000B58" />
                <Text style={styles.locationInstructionsText}>
                  Drag the marker to set your shop&apos;s exact location on the map
                </Text>
              </View>

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

              <TouchableOpacity
                style={[styles.button, signupLoading && styles.buttonDisabled]}
                onPress={() => handleAddRepairShop()}
                disabled={signupLoading}
              >
                {signupLoading ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Text style={styles.buttonTxt}>Next</Text>
                )}
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

              <Text style={[styles.textInputLbl, { width: '95%', marginTop: 10, marginBottom: 16 }]}>
                Select the services your shop provides
              </Text>

              <ScrollView style={styles.servicesList} showsVerticalScrollIndicator={false}>
                {services.map((item) => {
                  const isSelected = selectedServices.includes(item.label);
                  return (
                    <TouchableOpacity
                      key={item.id}
                      style={[styles.serviceCard, isSelected && styles.serviceCardSelected]}
                      onPress={() => toggleCheckbox(item.label)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.serviceCardContent}>
                        <View style={[styles.serviceCheckbox, isSelected && styles.serviceCheckboxSelected]}>
                          {isSelected && <Icon name="check" size={18} color="#FFF" />}
                        </View>
                        <Text style={[styles.checkboxTxt, isSelected && styles.checkboxTxtSelected]}>{item.label}</Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              <View style={[styles.termsContainer, { marginTop: 20 }]}>
                <Text style={styles.termsText}>By clicking Sign Up, you agree to our </Text>
                <TouchableOpacity onPress={() => setTermsModalVisible(true)}>
                  <Text style={[styles.termsText, { color: '#007BFF' }]}>Terms of Service</Text>
                </TouchableOpacity>
                <Text> and </Text>
                <TouchableOpacity onPress={() => setPrivacyModalVisible(true)}>
                  <Text style={[styles.termsText, { color: '#007BFF' }]}>Privacy Policy</Text>
                </TouchableOpacity>
                <Text style={styles.termsText}>.</Text>
              </View>

              <TouchableOpacity
                style={[styles.button, signupLoading && styles.buttonDisabled]}
                onPress={() => handleAddRepairShop()}
                disabled={signupLoading}
              >
                {signupLoading ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Text style={styles.buttonTxt}>Sign Up</Text>
                )}
              </TouchableOpacity>

              <Modal
                animationType="fade"
                transparent={true}
                visible={termsModalVisible}
                onRequestClose={() => setTermsModalVisible(false)}
              >
                <View style={styles.modalOverlay}>
                  <TouchableWithoutFeedback onPress={() => setTermsModalVisible(false)}>
                    <View style={styles.modalBackground} />
                  </TouchableWithoutFeedback>

                  <View style={styles.termsPrivacyModalView}>
                    <View style={styles.modalHeaderSection}>
                      <Icon name="file-document-outline" size={24} color="#000B58" />
                      <Text style={styles.modalHeaderText}>Terms of Service</Text>
                    </View>
                    <ScrollView>
                      <View style={styles.modalScrollContent}>
                        <View style={styles.introCard}>
                          <View style={styles.iconContainer}>
                            <MaterialCommunityIcons name="file-document-outline" size={32} color="#000B58" />
                          </View>
                          <Text style={styles.introTitle}>Legal Agreement</Text>
                          <Text style={styles.introText}>
                            Please read these terms and conditions carefully before using the Auto AIDER application
                          </Text>
                        </View>

                        <TermsOfServiceComp />
                      </View>
                    </ScrollView>
                    <TouchableOpacity style={styles.modalCloseButton} onPress={() => setTermsModalVisible(false)}>
                      <Text style={styles.modalCloseButtonText}>Close</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Modal>

              <Modal
                animationType="fade"
                transparent={true}
                visible={privacyModalVisible}
                onRequestClose={() => setPrivacyModalVisible(false)}
              >
                <View style={styles.modalOverlay}>
                  <TouchableWithoutFeedback onPress={() => setPrivacyModalVisible(false)}>
                    <View style={styles.modalBackground} />
                  </TouchableWithoutFeedback>

                  <View style={styles.termsPrivacyModalView}>
                    <View style={styles.modalHeaderSection}>
                      <Icon name="shield-lock-outline" size={24} color="#000B58" />
                      <Text style={styles.modalHeaderText}>Privacy Policy</Text>
                    </View>
                    <ScrollView>
                      <View style={styles.modalScrollContent}>
                        <View style={styles.introCard}>
                          <View style={styles.iconContainer}>
                            <MaterialCommunityIcons name="shield-lock-outline" size={32} color="#000B58" />
                          </View>
                          <Text style={styles.introTitle}>Your Privacy Matters</Text>
                          <Text style={styles.introText}>
                            We are committed to protecting your personal information and your right to privacy
                          </Text>
                        </View>

                        <PrivacyPolicyComp />
                      </View>
                    </ScrollView>
                    <TouchableOpacity style={styles.modalCloseButton} onPress={() => setPrivacyModalVisible(false)}>
                      <Text style={styles.modalCloseButtonText}>Close</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Modal>

              <Modal
                animationType="fade"
                transparent={true}
                visible={repairShopModalVisible}
                onRequestClose={() => {
                  isRepairShopModalVisible(!repairShopModalVisible);
                  router.replace('/auth/login');
                  setPage('');
                }}
              >
                <View style={styles.modalOverlay}>
                  <TouchableWithoutFeedback
                    onPress={() => {
                      isRepairShopModalVisible(!repairShopModalVisible);
                      router.replace('/auth/login');
                      setPage('');
                    }}
                  >
                    <View style={styles.modalBackground} />
                  </TouchableWithoutFeedback>

                  <View style={styles.modalView}>
                    <View style={styles.successIconContainer}>
                      <Icon name="clock-check-outline" size={64} color="#F59E0B" />
                    </View>
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
            transparent={true}
            visible={verificationModalVisible}
            onRequestClose={() => {
              setVerificationModalVisible(false);
              clearTimer();
              setIsTimerActivate(false);
              setConfirm(null);
              setError('');
              setOtp(Array(6).fill(''));
              setTimer(60);
            }}
          >
            <View style={styles.modalOverlay}>
              <TouchableWithoutFeedback
                onPress={() => {
                  setVerificationModalVisible(false);
                  clearTimer();
                  setIsTimerActivate(false);
                  setConfirm(null);
                  setError('');
                  setOtp(Array(6).fill(''));
                  setTimer(60);
                }}
              >
                <View style={styles.modalBackground} />
              </TouchableWithoutFeedback>

              <View style={styles.verificationModalView}>
                <View style={styles.modalIconContainer}>
                  <MaterialCommunityIcons name="cellphone-message" size={48} color="#000B58" />
                </View>

                <Text style={styles.modalHeader}>Verification Required</Text>
                <Text style={styles.modalText}>We have sent a 6-digit verification code to your phone number</Text>

                <View style={styles.codeInputContainer}>
                  {otp.map((digit, index) => (
                    <TextInput
                      key={index}
                      style={[
                        styles.otpInput,
                        digit && styles.otpInputFilled,
                        !isTimerActivate && styles.otpInputDisabled,
                      ]}
                      value={digit}
                      onChangeText={(text) => {
                        // Only allow single digit
                        const cleanText = text.replace(/[^0-9]/g, '').slice(-1);
                        handleOtpInputChange(cleanText, index);
                      }}
                      onKeyPress={(e) => handleKeyPress(e, index)}
                      keyboardType="number-pad"
                      maxLength={1}
                      readOnly={!isTimerActivate}
                      selectTextOnFocus={true}
                      ref={(ref) => {
                        inputs.current[index] = ref;
                      }}
                    />
                  ))}
                </View>

                <View style={styles.timerInfoContainer}>
                  <MaterialCommunityIcons
                    name={isTimerActivate ? 'timer-sand' : 'check-circle'}
                    size={18}
                    color={isTimerActivate ? '#000B58' : '#10B981'}
                  />
                  <Text style={[styles.timerInfoText, !isTimerActivate && styles.timerInfoTextReady]}>
                    {isTimerActivate ? `Resend available in ${timer}s` : 'Ready to resend code'}
                  </Text>
                </View>

                {error.length > 0 && (
                  <View style={styles.errorContainer}>
                    <MaterialCommunityIcons name="alert-circle" size={18} color="#DC2626" />
                    <Text style={styles.errorMessage}>{error}</Text>
                  </View>
                )}

                {confirmCodeLoading && (
                  <View style={styles.modalLoadingContainer}>
                    <ActivityIndicator size="small" color="#000B58" />
                    <Text style={styles.modalLoadingText}>Verifying...</Text>
                  </View>
                )}

                <View style={styles.modalButtonContainer}>
                  {!isTimerActivate ? (
                    <TouchableOpacity
                      style={[styles.modalButton, styles.modalButtonPrimary]}
                      onPress={() => handleResendCode()}
                      disabled={confirmCodeLoading}
                    >
                      <MaterialCommunityIcons name="refresh" size={20} color="#FFF" />
                      <Text style={styles.modalButtonText}>Resend Code</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      style={[styles.modalButton, styles.modalButtonPrimary]}
                      onPress={() => verifyCode()}
                      disabled={confirmCodeLoading}
                    >
                      <MaterialCommunityIcons name="check-circle-outline" size={20} color="#FFF" />
                      <Text style={styles.modalButtonText}>Verify Code</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>
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
    backgroundColor: '#F3F4F6',
  },
  upperBox: {
    backgroundColor: '#000B58',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 24,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  logo: {
    width: 100,
    height: 85,
  },
  upperTextInputLbl: {
    color: '#FFF',
    fontSize: 15,
    fontFamily: 'BodyBold',
    marginBottom: 4,
  },
  upperDropdownButtonStyle: {
    width: '100%',
    height: 48,
    backgroundColor: '#fff',
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 14,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lowerBox: {
    alignItems: 'center',
    flex: 1,
    paddingTop: 8,
  },
  header: {
    color: '#000B58',
    fontSize: 22,
    fontFamily: 'HeaderBold',
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
    color: '#374151',
    fontSize: 14,
    fontFamily: 'BodyBold',
    marginBottom: 4,
  },
  input: {
    backgroundColor: '#fff',
    width: '100%',
    height: 45,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 12,
    color: '#333',
    fontSize: 14,
    fontFamily: 'BodyRegular',
    marginBottom: 20,
  },
  passwordInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    width: '100%',
    height: 45,
    marginBottom: 20,
  },
  passwordInput: {
    flex: 1,
    paddingLeft: 12,
    paddingRight: 8,
    color: '#333',
    fontSize: 14,
    fontFamily: 'BodyRegular',
  },
  eyeIcon: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  dropdownButtonStyle: {
    width: '100%',
    height: 45,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  dropdownButtonTxtStyle: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    fontFamily: 'BodyRegular',
  },
  dropdownButtonArrowStyle: {
    fontSize: 24,
    color: '#6B7280',
  },
  dropdownButtonIconStyle: {
    fontSize: 22,
    color: '#000B58',
    marginRight: 10,
  },
  dropdownMenuStyle: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  dropdownItemStyle: {
    width: '100%',
    flexDirection: 'row',
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  dropdownItemTxtStyle: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    fontFamily: 'BodyRegular',
  },
  dropdownItemIconStyle: {
    fontSize: 22,
    color: '#000B58',
    marginRight: 10,
  },
  questionLbl: {
    color: '#6B7280',
    fontSize: 14,
    fontFamily: 'BodyRegular',
  },
  loginLbl: {
    fontSize: 14,
    color: '#000B58',
    fontFamily: 'BodyBold',
    textDecorationLine: 'underline',
  },
  loginContainer: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  termsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    width: '90%',
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  termsText: {
    fontFamily: 'BodyRegular',
    color: '#6B7280',
    fontSize: 13,
    lineHeight: 18,
  },
  button: {
    minWidth: 140,
    paddingVertical: 14,
    paddingHorizontal: 32,
    backgroundColor: '#000B58',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    marginTop: 20,
    marginBottom: 20,
    shadowColor: '#000B58',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonDisabled: {
    backgroundColor: '#9CA3AF',
    shadowOpacity: 0.1,
  },
  buttonTxt: {
    color: '#FFF',
    fontSize: 16,
    fontFamily: 'HeaderBold',
  },
  shopNameInput: {
    backgroundColor: '#fff',
    width: '100%',
    height: 45,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 12,
    fontSize: 14,
    color: '#333',
    fontFamily: 'BodyRegular',
  },
  map: {
    width: '95%',
    flex: 1,
    borderRadius: 16,
    marginTop: 16,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  locationInstructions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#EEF2FF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  locationInstructionsText: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'BodyRegular',
    color: '#374151',
    lineHeight: 20,
  },
  arrowHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    width: '100%',
    gap: 5,
  },
  arrowWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F9FAFB',
  },
  arrowBack: {
    color: '#000B58',
  },
  servicesList: {
    width: '95%',
    flex: 1,
    marginBottom: 16,
  },
  serviceCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    padding: 14,
    marginBottom: 12,
  },
  serviceCardSelected: {
    backgroundColor: '#EEF2FF',
    borderColor: '#000B58',
  },
  serviceCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  serviceCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  serviceCheckboxSelected: {
    backgroundColor: '#000B58',
    borderColor: '#000B58',
  },
  checkboxTxt: {
    fontFamily: 'BodyRegular',
    fontSize: 14,
    color: '#374151',
    flex: 1,
    lineHeight: 20,
  },
  checkboxTxtSelected: {
    fontFamily: 'BodyBold',
    color: '#000B58',
  },
  modalView: {
    backgroundColor: '#FFF',
    width: '80%',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  modalTxt: {
    textAlign: 'center',
    fontSize: 15,
    lineHeight: 22,
    fontFamily: 'BodyRegular',
    color: '#374151',
    marginVertical: 16,
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
  termsPrivacyModalView: {
    backgroundColor: '#FFF',
    width: '90%',
    maxHeight: '90%',
    borderRadius: 16,
    padding: 0,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    overflow: 'hidden',
  },
  modalHeaderSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  modalHeaderText: {
    fontSize: 18,
    fontFamily: 'HeaderBold',
    color: '#000B58',
    flex: 1,
  },
  modalScrollContent: {
    height: '85%',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  modalCloseButton: {
    backgroundColor: '#000B58',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 10,
    marginHorizontal: 20,
    marginVertical: 16,
    alignItems: 'center',
    shadowColor: '#000B58',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  modalCloseButtonText: {
    color: '#FFF',
    fontSize: 15,
    fontFamily: 'BodyBold',
  },
  successIconContainer: {
    marginBottom: 16,
  },
  introCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E0E7FF',
  },
  iconContainer: {
    backgroundColor: '#E0E7FF',
    borderRadius: 50,
    width: 70,
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  introTitle: {
    fontFamily: 'HeaderBold',
    fontSize: 20,
    color: '#111827',
    marginBottom: 8,
  },
  introText: {
    fontFamily: 'BodyRegular',
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  verificationModalView: {
    backgroundColor: '#FFF',
    width: '90%',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalIconContainer: {
    backgroundColor: '#E0E7FF',
    borderRadius: 60,
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalHeader: {
    fontSize: 22,
    fontFamily: 'HeaderBold',
    color: '#333',
    marginBottom: 12,
  },
  modalText: {
    fontFamily: 'BodyRegular',
    color: '#555',
    marginBottom: 16,
    textAlign: 'center',
    fontSize: 15,
    lineHeight: 22,
  },
  codeInputContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  otpInput: {
    width: 45,
    height: 55,
    borderRadius: 12,
    padding: 10,
    color: '#333',
    fontFamily: 'HeaderBold',
    fontSize: 20,
    backgroundColor: '#F9FAFB',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    textAlign: 'center',
  },
  otpInputFilled: {
    backgroundColor: '#E0E7FF',
    borderColor: '#000B58',
  },
  otpInputDisabled: {
    backgroundColor: '#F3F4F6',
    borderColor: '#D1D5DB',
    opacity: 0.6,
  },
  timerInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  timerInfoText: {
    fontFamily: 'BodyRegular',
    fontSize: 13,
    color: '#000B58',
  },
  timerInfoTextReady: {
    color: '#10B981',
  },
  modalLoadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
    paddingVertical: 12,
  },
  modalLoadingText: {
    fontFamily: 'BodyRegular',
    fontSize: 14,
    color: '#6B7280',
  },
  modalButtonContainer: {
    width: '100%',
    gap: 10,
  },
  modalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  modalButtonPrimary: {
    backgroundColor: '#000B58',
  },
  modalButtonText: {
    fontFamily: 'BodyBold',
    color: '#FFF',
    fontSize: 15,
  },
  errorContainer: {
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DC2626',
    width: '100%',
    padding: 12,
    marginBottom: 16,
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

export default Signup;
