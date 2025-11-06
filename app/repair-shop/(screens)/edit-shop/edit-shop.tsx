import { Header } from '@/components/Header';
import { Loading } from '@/components/Loading';
import { RootState } from '@/redux/store';
import { generateOtp, getRepairShopInfo, getRepairShops, updateRepairShopInfo } from '@/services/backendApi';
import socket from '@/services/socket';
import { AutoRepairShop, UpdateRepairShopInfo } from '@/types/autoRepairShop';
import Entypo from '@expo/vector-icons/Entypo';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import { Checkbox } from 'expo-checkbox';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  AppState,
  Dimensions,
  Image,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { showMessage } from 'react-native-flash-message';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import MapView, { Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';
import SelectDropdown from 'react-native-select-dropdown';
import { useSelector } from 'react-redux';

const EditShop = () => {
  const router = useRouter();
  const mapRef = useRef<MapView>(null);

  // Helper function to calculate display dimensions while maintaining aspect ratio
  const calculateImageDisplaySize = (
    originalWidth: number,
    originalHeight: number
  ): { width: number; height: number } => {
    const screenWidth = Dimensions.get('window').width;
    const maxWidth = screenWidth;
    const maxHeight = 500; // Maximum height for the image container

    const aspectRatio = originalWidth / originalHeight;

    let displayWidth = originalWidth;
    let displayHeight = originalHeight;

    // Scale down if image is larger than max dimensions
    if (displayWidth > maxWidth) {
      displayWidth = maxWidth;
      displayHeight = displayWidth / aspectRatio;
    }

    if (displayHeight > maxHeight) {
      displayHeight = maxHeight;
      displayWidth = displayHeight * aspectRatio;
    }

    return { width: displayWidth, height: displayHeight };
  };

  const [repShopID, setRepShopID] = useState<number>(0);
  const [repShopName, setRepShopName] = useState<string>('');
  const [ownerFirstname, setOwnerFirstname] = useState<string>('');
  const [ownerLastname, setOwnerLastname] = useState<string>('');
  const [gender, setGender] = useState<string>('');
  const [mobileNum, setMobileNum] = useState<string>('');
  const [email, setEmail] = useState<string | null>(null);
  const [servicesOffered, setServicesOffered] = useState<string[]>([]);
  const [region, setRegion] = useState<Region | undefined>(undefined);
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [shopImages, setShopImages] = useState<string[]>([]);
  const [currentPassword, setCurrentPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isEditServices, setIsEditServices] = useState<boolean>(false);
  const [edit, setEdit] = useState<string>('');
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [mapModalVisible, setMapModalVisible] = useState<boolean>(false);
  const [imageModalVisible, setImageModalVisible] = useState<boolean>(false);
  const [imageSource, setImageSource] = useState<string>('');
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
  const [passwordError, setPasswordError] = useState<string>('');
  const [showCurrentPassword, setShowCurrentPassword] = useState<boolean>(false);
  const [showNewPassword, setShowNewPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [profileBG, setProfileBG] = useState<string>('');
  const [pickedImage, setPickedImage] = useState<boolean>(false);
  const [updateLoading, setUpdateLoading] = useState<boolean>(false);

  const [localRepShopName, setLocalRepShopName] = useState<string>('');
  const [localOwnerFirstname, setLocalOwnerFirstname] = useState<string>('');
  const [localOwnerLastname, setLocalOwnerLastname] = useState<string>('');
  const [localGender, setLocalGender] = useState<string>('');
  const [localMobileNum, setLocalMobileNum] = useState<string>('');
  const [localEmail, setLocalEmail] = useState<string | null>(null);
  const [localServicesOffered, setLocalServicesOffered] = useState<string[]>([]);
  const [localRegion, setLocalRegion] = useState<Region | undefined>(undefined);
  const [localProfilePic, setLocalProfilePic] = useState<string | null>(null);

  const [error, setError] = useState<string>('');
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [timer, setTimer] = useState<number>(45);
  const endRef = useRef<number>(Date.now() + timer * 1000);
  const [isTimerActivate, setIsTimerActivate] = useState<boolean>(false);
  const [confirm, setConfirm] = useState<any>(null);
  const [otp, setOtp] = useState<string[]>(Array(6).fill(''));
  const inputs = useRef<(TextInput | null)[]>([]);
  const [verificationModalVisible, setVerificationModalVisible] = useState<boolean>(false);
  const [confirmCodeLoading, setConfirmCodeLoading] = useState<boolean>(false);
  const [buttonDisable, setButtonDisable] = useState<boolean>(false);
  const prefix = '09';
  const mapType = useSelector((state: RootState) => state.settings.mapType);

  const genders = ['Male', 'Female'];

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

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const fetchData = async () => {
        try {
          setIsLoading(true);
          const res = await getRepairShopInfo();

          if (!isActive) return;

          setRepShopID(res.repair_shop_id);
          setRepShopName(res.shop_name);
          setOwnerFirstname(res.owner_firstname);
          setOwnerLastname(res.owner_lastname);
          setGender(res.gender);
          setMobileNum(res.mobile_num);
          setEmail(res.email);
          setServicesOffered(res.services_offered);
          setRegion({
            latitude: parseFloat(res.latitude),
            longitude: parseFloat(res.longitude),
            latitudeDelta: 0.001,
            longitudeDelta: 0.001,
          });
          setProfilePic(res.profile_pic);
          setShopImages(res.shop_images);
          setProfileBG(res.profile_bg);

          setLocalRepShopName(res.shop_name);
          setLocalOwnerFirstname(res.owner_firstname);
          setLocalOwnerLastname(res.owner_lastname);
          setLocalGender(res.gender);
          setLocalMobileNum(res.mobile_num);
          setLocalEmail(res.email);
          setLocalServicesOffered(res.services_offered);
          setLocalRegion({
            latitude: parseFloat(res.latitude),
            longitude: parseFloat(res.longitude),
            latitudeDelta: 0.001,
            longitudeDelta: 0.001,
          });
          setLocalProfilePic(res.profile_pic);
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
          if (isActive) setIsLoading(false);
        }
      };

      fetchData();

      return () => {
        isActive = false;
        setEdit('');
      };
    }, [router])
  );

  useEffect(() => {
    if (!socket) return;

    socket.on(`updatedRepairShopInfo-RS-${repShopID}`, ({ updatedRepairShopInfo }) => {
      setRepShopName(updatedRepairShopInfo.shop_name);
      setOwnerFirstname(updatedRepairShopInfo.owner_firstname);
      setOwnerLastname(updatedRepairShopInfo.owner_lastname);
      setGender(updatedRepairShopInfo.gender);
      setMobileNum(updatedRepairShopInfo.mobile_num);
      setEmail(updatedRepairShopInfo.email);
      setServicesOffered(updatedRepairShopInfo.services_offered);
      setRegion({
        latitude: parseFloat(updatedRepairShopInfo.latitude),
        longitude: parseFloat(updatedRepairShopInfo.longitude),
        latitudeDelta: 0.001,
        longitudeDelta: 0.001,
      });
      setProfilePic(updatedRepairShopInfo.profile_pic);
      setShopImages(updatedRepairShopInfo.shop_images);

      setLocalRepShopName(updatedRepairShopInfo.shop_name);
      setLocalOwnerFirstname(updatedRepairShopInfo.owner_firstname);
      setLocalOwnerLastname(updatedRepairShopInfo.owner_lastname);
      setLocalGender(updatedRepairShopInfo.gender);
      setLocalMobileNum(updatedRepairShopInfo.mobile_num);
      setLocalEmail(updatedRepairShopInfo.email);
      setLocalServicesOffered(updatedRepairShopInfo.services_offered);
      setLocalRegion({
        latitude: parseFloat(updatedRepairShopInfo.latitude),
        longitude: parseFloat(updatedRepairShopInfo.longitude),
        latitudeDelta: 0.001,
        longitudeDelta: 0.001,
      });
      setLocalProfilePic(updatedRepairShopInfo.profile_pic);
    });

    return () => {
      socket.off(`updatedRepairShopInfo-RS-${repShopID}`);
    };
  }, [repShopID]);

  useEffect(() => {
    if (edit === 'mobile-num') {
      setTimer(45);
    } else if (edit === 'email') {
      setTimer(300);
    } else {
      return;
    }
  }, [edit]);

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

  const handleRestoreInfo = (field: string) => {
    switch (field) {
      case 'rep-shop-name':
        setLocalRepShopName(repShopName);
        break;
      case 'firstname':
        setLocalOwnerFirstname(ownerFirstname);
        break;
      case 'lastname':
        setLocalOwnerLastname(ownerLastname);
        break;
      case 'gender':
        setLocalGender(gender);
        break;
      case 'mobile-num':
        setLocalMobileNum(mobileNum);
        break;
      case 'email':
        setLocalEmail(email);
        break;
      case 'services-offered':
        setLocalServicesOffered(servicesOffered);
        break;
      case 'region':
        setLocalRegion(region);
        break;
      case 'profile':
        setLocalProfilePic(profilePic);
        setPickedImage(false);
        break;
      default:
        throw new Error('Unsupported field');
    }

    setEdit('');
  };

  const handleCancelChangePass = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setPasswordError('');
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    setModalVisible(!modalVisible);
  };

  useEffect(() => {
    if (servicesOffered.every((element) => localServicesOffered.includes(element))) {
      setIsEditServices(false);
    } else {
      setIsEditServices(true);
    }

    if (localServicesOffered.length !== servicesOffered.length) {
      setIsEditServices(true);
    }
  }, [localServicesOffered, servicesOffered]);

  const toggleCheckbox = (id: string) => {
    setLocalServicesOffered((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const handleDrag = (e: any) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;

    const newRegion: Region = {
      ...localRegion!,
      latitude,
      longitude,
    };
    setLocalRegion(newRegion);
    mapRef.current?.animateToRegion(newRegion, 300);
  };

  const handleUpdateRepShopInfo = async (
    field: string,
    link: string | null,
    arrayLink: string[] | null,
    imageAction: string | null
  ) => {
    try {
      setUpdateLoading(true);
      const repairShopData: UpdateRepairShopInfo = {
        owner_firstname: null,
        owner_lastname: null,
        gender: null,
        shop_name: null,
        mobile_num: null,
        email: null,
        currentPassword: null,
        newPassword: null,
        services_offered: null,
        longitude: null,
        latitude: null,
        profile_pic: null,
        shop_images: null,
        field: field,
      };

      switch (field) {
        case 'firstname':
          if (localOwnerFirstname === ownerFirstname) {
            setEdit('');
            return;
          }
          repairShopData.owner_firstname = localOwnerFirstname.trim();
          setOwnerFirstname(localOwnerFirstname);
          break;
        case 'lastname':
          if (localOwnerLastname === ownerLastname) {
            setEdit('');
            return;
          }
          repairShopData.owner_lastname = localOwnerLastname.trim();
          setOwnerLastname(localOwnerLastname);
          break;
        case 'gender':
          if (localGender === gender) {
            setEdit('');
            return;
          }
          repairShopData.gender = localGender.trim();
          setGender(localGender);
          break;
        case 'rep-shop-name':
          if (localRepShopName === repShopName) {
            setEdit('');
            return;
          }
          repairShopData.shop_name = localRepShopName.trim();
          setRepShopName(localRepShopName);
          break;
        case 'mobile-num':
          repairShopData.mobile_num = localMobileNum.trim();
          setMobileNum(localMobileNum);
          break;
        case 'email':
          if (localEmail === '') {
            repairShopData.email = null;
            setEmail(null);
            break;
          }

          if (localEmail !== null) {
            repairShopData.email = localEmail.trim();
            setEmail(localEmail);
            break;
          }
        case 'change-password':
          if (!currentPassword || !newPassword || !confirmPassword) {
            setPasswordError('Please fill out all fields.');
            return;
          }

          if (newPassword !== confirmPassword) {
            setPasswordError("Password don't match.");
            return;
          }

          if (newPassword.length < 8) {
            setPasswordError('Password must be at least 8 characters.');
            return;
          }

          repairShopData.currentPassword = currentPassword.trim();
          repairShopData.newPassword = newPassword.trim();
          setModalVisible(false);
          setCurrentPassword('');
          setNewPassword('');
          setConfirmPassword('');
          setPasswordError('');
          break;
        case 'services-offered':
          if (localServicesOffered.length === servicesOffered.length) {
            if (localServicesOffered.every((element) => servicesOffered.includes(element))) {
              setEdit('');
              return;
            }
          }
          repairShopData.services_offered = localServicesOffered;
          setServicesOffered(localServicesOffered);
          break;
        case 'region':
          repairShopData.longitude = localRegion?.longitude !== undefined ? localRegion.longitude.toString() : '';
          repairShopData.latitude = localRegion?.latitude !== undefined ? localRegion.latitude.toString() : '';
          setRegion({
            latitude: localRegion?.latitude !== undefined ? localRegion.latitude : 0,
            longitude: localRegion?.longitude !== undefined ? localRegion.longitude : 0,
            latitudeDelta: 0.001,
            longitudeDelta: 0.001,
          });
          break;
        case 'profile':
          repairShopData.profile_pic = link;
          setProfilePic(link);
          break;
        case 'shop-images':
          if (imageAction === 'add') {
            repairShopData.shop_images = arrayLink ? [...shopImages, ...arrayLink] : [...shopImages];
            setShopImages(arrayLink ? [...shopImages, ...arrayLink] : [...shopImages]);
          } else {
            repairShopData.shop_images = arrayLink ? [...arrayLink] : [...shopImages];
            setShopImages(arrayLink ? [...arrayLink] : [...shopImages]);
          }
          break;
        default:
          throw new Error('Unsupported field');
      }

      const res = await updateRepairShopInfo(repairShopData);

      if (res === '401') {
        setPasswordError('Wrong current password');
        return;
      }

      setEdit('');
      showMessage({
        message: 'Changes saved!',
        type: 'success',
        floating: true,
        color: '#FFF',
        icon: 'success',
      });
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
      setUpdateLoading(false);
    }
  };

  const pickProfileImage = async (): Promise<void> => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Please grant access to photos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setLocalProfilePic(result.assets[0].uri);
      setPickedImage(true);
    }
  };

  const pickShopImages = async (): Promise<void> => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Please grant access to photos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      quality: 1,
    });

    if (!result.canceled) {
      const uris = result.assets.map((asset) => asset.uri);
      setShopImages([...(shopImages ?? []), ...uris]);
      uploadShopImages(uris);
    }
  };

  const uploadProfileImage = async () => {
    try {
      setUpdateLoading(true);
      const signRes = await axios.post(`${process.env.EXPO_PUBLIC_BACKEND_API_URL}/cloudinary/generate-signature`);
      const { timestamp, signature, apiKey, cloudName, folder } = signRes.data;

      const formData = new FormData();
      formData.append('file', {
        uri: localProfilePic,
        type: 'image/jpeg',
        name: 'upload.jpg',
      } as any);

      formData.append('api_key', apiKey);
      formData.append('timestamp', timestamp.toString());
      formData.append('signature', signature);
      formData.append('folder', folder);

      const uploadRes = await axios.post(
        `${process.env.EXPO_PUBLIC_CLOUDINARY_BASE_URL}/${cloudName}/image/upload`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      const uploadedUrl = uploadRes.data.secure_url;
      setPickedImage(false);
      handleUpdateRepShopInfo('profile', uploadedUrl, null, null);
    } catch {
      Alert.alert('Upload failed', 'An error occured during upload.');
    }
  };

  const uploadShopImages = async (arrayLink: string[]) => {
    try {
      setUpdateLoading(true);
      const signRes = await axios.post(
        `${process.env.EXPO_PUBLIC_BACKEND_API_URL}/cloudinary/generate-signature-shop-images`
      );
      const { timestamp, signature, apiKey, cloudName, folder } = signRes.data;

      const uploadedUrls: string[] = [];

      for (const asset of arrayLink) {
        const formData = new FormData();
        formData.append('file', {
          uri: asset,
          type: 'image/jpeg',
          name: `image-${Date.now()}.jpg`,
        } as any);
        formData.append('api_key', apiKey);
        formData.append('timestamp', timestamp.toString());
        formData.append('signature', signature);
        formData.append('folder', folder);

        const uploadRes = await axios.post(
          `${process.env.EXPO_PUBLIC_CLOUDINARY_BASE_URL}/${cloudName}/image/upload`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }
        );
        uploadedUrls.push(uploadRes.data.secure_url);
      }
      handleUpdateRepShopInfo('shop-images', null, uploadedUrls, 'add');
    } catch {
      Alert.alert('Upload failed', 'An error occured during upload.');
    }
  };

  const deleteImage = async (field: string, image: string | null) => {
    setUpdateLoading(true);
    if (field === 'profile') {
      const parts = profilePic?.split('/');
      const lastPart = parts?.slice(-1)[0];
      const folderName = parts?.slice(-2)[0];
      const fileName = lastPart?.split('.')[0];

      await axios.post(`${process.env.EXPO_PUBLIC_BACKEND_API_URL}/cloudinary/delete-image `, {
        public_id: `${folderName}/${fileName}`,
      });
    } else {
      const parts = image?.split('/');
      const lastPart = parts?.slice(-1)[0];
      const folderName = parts?.slice(-2)[0];
      const fileName = lastPart?.split('.')[0];

      await axios.post(`${process.env.EXPO_PUBLIC_BACKEND_API_URL}/cloudinary/delete-image `, {
        public_id: `${folderName}/${fileName}`,
      });
    }
  };

  const handlePhoneNumInputChange = (text: string) => {
    if (/^[0-9]*$/.test(text)) {
      setLocalMobileNum(text);
    } else {
      setLocalMobileNum('');
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

  const handleSendCode = async () => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const fetchedAutoRepairShops: AutoRepairShop[] = await getRepairShops();
    const userExcluded = fetchedAutoRepairShops.filter((repairShop) => repairShop.repair_shop_id !== repShopID);

    if (localEmail === '') {
      handleUpdateRepShopInfo('email', null, null, null);
      return;
    }

    if (edit === 'mobile-num') {
      if (localMobileNum === mobileNum) {
        setEdit('');
        return;
      }

      if (!localMobileNum.startsWith(prefix)) {
        showMessage({
          message: 'Invalid number format.',
          type: 'warning',
          color: '#FFF',
          floating: true,
          icon: 'warning',
        });
        return;
      }

      const mobileNumExists = userExcluded.some((repairShop) => repairShop.mobile_num === localMobileNum.trim());

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
    } else {
      if (localEmail === email) {
        setEdit('');
        return;
      }

      if (!emailPattern.test(localEmail ?? '')) {
        showMessage({
          message: 'Invalid email format.',
          type: 'warning',
          color: '#FFF',
          floating: true,
          icon: 'warning',
        });
        return;
      }

      const emailExists = userExcluded.some((repairShop) => repairShop.email === localEmail?.trim());

      if (emailExists) {
        showMessage({
          message: 'Email is already used by another account.',
          type: 'warning',
          floating: true,
          color: '#FFF',
          icon: 'warning',
        });
        return;
      }
    }

    try {
      setUpdateLoading(true);
      setButtonDisable(true);

      if (edit === 'mobile-num') {
        const res = await generateOtp(localMobileNum.trim(), '', 'sms', 'Repair Shop', 'sms-verification');
        setConfirm(res);
      } else {
        const res = await generateOtp('', localEmail?.trim() ?? '', 'email', 'Repair Shop', 'email-verification');
        setConfirm(res);
      }

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
        setButtonDisable(false);
      }, 2000);
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
      setUpdateLoading(false);
    }
  };

  const handleResendCode = async () => {
    try {
      setConfirmCodeLoading(true);

      if (edit === 'mobile-num') {
        const res = await generateOtp(localMobileNum.trim(), '', 'sms', 'Repair Shop', 'sms-verification');
        setConfirm(res);
      } else {
        const res = await generateOtp('', localEmail?.trim() ?? '', 'email', 'Repair Shop', 'email-verification');
        setConfirm(res);
      }

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
      setButtonDisable(true);

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

      showMessage({
        message: 'Verified!',
        type: 'success',
        floating: true,
        color: '#FFF',
        icon: 'success',
      });

      setTimeout(() => {
        if (edit === 'mobile-num') {
          handleUpdateRepShopInfo('mobile-num', null, null, null);
        } else {
          handleUpdateRepShopInfo('email', null, null, null);
        }

        setButtonDisable(false);
      }, 2000);
    } catch {
      setError('You entered a wrong code.');
    } finally {
      setConfirmCodeLoading(false);
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header headerTitle="Edit Shop" />
      <KeyboardAwareScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <View style={styles.lowerBox}>
          <View style={styles.profileHeaderContainer}>
            <View style={styles.editPicContainer}>
              {localProfilePic === null && (
                <View style={[styles.profilePicWrapper, { backgroundColor: profileBG }]}>
                  <MaterialCommunityIcons name="car-wrench" size={50} color="#FFF" />
                </View>
              )}

              {localProfilePic !== null && (
                <View style={styles.profilePicWrapper}>
                  <Image style={styles.profilePic} source={{ uri: localProfilePic }} width={120} height={120} />
                </View>
              )}

              <TouchableOpacity
                style={styles.editPicWrapper}
                onPress={() => pickProfileImage()}
                disabled={buttonDisable}
              >
                <View style={styles.editIconContainer}>
                  <MaterialCommunityIcons name="camera-plus" size={28} color="#FFF" />
                </View>
              </TouchableOpacity>
            </View>

            <View style={styles.profileActions}>
              <Text style={styles.profileActionText}>Tap to change profile picture</Text>
              <View style={styles.profileActionHint}>
                <MaterialCommunityIcons name="information-outline" size={14} color="#6B7280" />
                <Text style={styles.profileActionHintText}>Square images work best</Text>
              </View>
            </View>
          </View>

          {localProfilePic !== null && !pickedImage && (
            <View style={styles.profileButtonContainer}>
              <TouchableOpacity
                style={[styles.profileButton, styles.removeButton]}
                onPress={() => {
                  deleteImage('profile', null);
                  handleUpdateRepShopInfo('profile', null, null, null);
                }}
                disabled={buttonDisable}
              >
                <MaterialCommunityIcons name="image-remove" size={18} color="#FFF" />
                <Text style={styles.profileButtonText}>Remove Photo</Text>
              </TouchableOpacity>
            </View>
          )}

          {localProfilePic !== null && pickedImage && (
            <View style={styles.profileButtonContainer}>
              <TouchableOpacity
                style={[styles.profileButton, styles.cancelButton]}
                onPress={() => handleRestoreInfo('profile')}
                disabled={buttonDisable}
              >
                <MaterialCommunityIcons name="close" size={18} color="#555" />
                <Text style={[styles.profileButtonText, { color: '#555' }]}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.profileButton, styles.saveButton]}
                onPress={() => {
                  if (profilePic !== null) {
                    deleteImage('profile', null);
                  }
                  uploadProfileImage();
                }}
                disabled={buttonDisable}
              >
                <MaterialCommunityIcons name="check" size={18} color="#FFF" />
                <Text style={styles.profileButtonText}>Save Photo</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.infoEdit1}>
            {edit === 'rep-shop-name' && (
              <>
                <TextInput style={styles.input1} value={localRepShopName} onChangeText={setLocalRepShopName} />

                {localRepShopName !== '' && (
                  <>
                    <TouchableOpacity onPress={() => handleRestoreInfo('rep-shop-name')} disabled={buttonDisable}>
                      <MaterialCommunityIcons name="close-circle" size={26} color="#DC2626" />
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => handleUpdateRepShopInfo('rep-shop-name', null, null, null)}
                      disabled={buttonDisable}
                    >
                      <MaterialCommunityIcons name="check-circle" size={26} color="#10B981" />
                    </TouchableOpacity>
                  </>
                )}

                {localRepShopName === '' && (
                  <TouchableOpacity onPress={() => handleRestoreInfo('rep-shop-name')} disabled={buttonDisable}>
                    <MaterialCommunityIcons name="close-circle" size={26} color="#DC2626" />
                  </TouchableOpacity>
                )}
              </>
            )}

            {edit !== 'rep-shop-name' && (
              <>
                <Text style={styles.repShopName}>{localRepShopName}</Text>
                <TouchableOpacity onPress={() => setEdit('rep-shop-name')} disabled={buttonDisable}>
                  <MaterialCommunityIcons name="pencil" size={22} color="#333" />
                </TouchableOpacity>
              </>
            )}
          </View>

          <View style={styles.editInfoContainer}>
            <View style={styles.subHeaderContainer}>
              <MaterialCommunityIcons name="account-details" size={24} color="#000B58" />
              <Text style={styles.subHeader}>Owner Details</Text>
            </View>
            <View style={styles.row}>
              <View style={styles.labelContainer}>
                <MaterialCommunityIcons name="account" size={18} color="#6B7280" />
                <Text style={styles.infoLabel}>First Name</Text>
              </View>
              <View style={styles.infoEdit}>
                {edit === 'firstname' && (
                  <>
                    <TextInput
                      style={styles.input}
                      value={localOwnerFirstname}
                      onChangeText={setLocalOwnerFirstname}
                      placeholder="Enter first name"
                      placeholderTextColor="#9CA3AF"
                    />

                    {localOwnerFirstname !== '' && (
                      <>
                        <TouchableOpacity onPress={() => handleRestoreInfo('firstname')} disabled={buttonDisable}>
                          <MaterialCommunityIcons name="close-circle" size={22} color="#DC2626" />
                        </TouchableOpacity>

                        <TouchableOpacity
                          onPress={() => handleUpdateRepShopInfo('firstname', null, null, null)}
                          disabled={buttonDisable}
                        >
                          <MaterialCommunityIcons name="check-circle" size={22} color="#10B981" />
                        </TouchableOpacity>
                      </>
                    )}

                    {localOwnerFirstname === '' && (
                      <TouchableOpacity onPress={() => handleRestoreInfo('firstname')} disabled={buttonDisable}>
                        <MaterialCommunityIcons name="close-circle" size={22} color="#DC2626" />
                      </TouchableOpacity>
                    )}
                  </>
                )}

                {edit !== 'firstname' && (
                  <>
                    <Text style={styles.infoText}>{localOwnerFirstname}</Text>
                    <TouchableOpacity
                      onPress={() => setEdit('firstname')}
                      disabled={buttonDisable}
                      style={styles.editIconButton}
                    >
                      <MaterialCommunityIcons name="pencil" size={18} color="#000B58" />
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.labelContainer}>
                <MaterialCommunityIcons name="account" size={18} color="#6B7280" />
                <Text style={styles.infoLabel}>Last Name</Text>
              </View>
              <View style={styles.infoEdit}>
                {edit === 'lastname' && (
                  <>
                    <TextInput
                      style={styles.input}
                      value={localOwnerLastname}
                      onChangeText={setLocalOwnerLastname}
                      placeholder="Enter last name"
                      placeholderTextColor="#9CA3AF"
                    />

                    {localOwnerLastname !== '' && (
                      <>
                        <TouchableOpacity onPress={() => handleRestoreInfo('lastname')} disabled={buttonDisable}>
                          <MaterialCommunityIcons name="close-circle" size={22} color="#DC2626" />
                        </TouchableOpacity>

                        <TouchableOpacity
                          onPress={() => handleUpdateRepShopInfo('lastname', null, null, null)}
                          disabled={buttonDisable}
                        >
                          <MaterialCommunityIcons name="check-circle" size={22} color="#10B981" />
                        </TouchableOpacity>
                      </>
                    )}

                    {localOwnerLastname === '' && (
                      <TouchableOpacity onPress={() => handleRestoreInfo('lastname')} disabled={buttonDisable}>
                        <MaterialCommunityIcons name="close-circle" size={22} color="#DC2626" />
                      </TouchableOpacity>
                    )}
                  </>
                )}

                {edit !== 'lastname' && (
                  <>
                    <Text style={styles.infoText}>{localOwnerLastname}</Text>
                    <TouchableOpacity
                      onPress={() => setEdit('lastname')}
                      disabled={buttonDisable}
                      style={styles.editIconButton}
                    >
                      <MaterialCommunityIcons name="pencil" size={18} color="#000B58" />
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.labelContainer}>
                <MaterialCommunityIcons name="gender-male-female" size={18} color="#6B7280" />
                <Text style={styles.infoLabel}>Gender</Text>
              </View>
              <View style={styles.infoEdit}>
                {edit === 'gender' && (
                  <>
                    <SelectDropdown
                      data={genders}
                      defaultValue={localGender}
                      statusBarTranslucent={true}
                      onSelect={(selectedItem) => setLocalGender(selectedItem)}
                      renderButton={(selectedItem, isOpen) => (
                        <View style={styles.dropdownButtonStyle}>
                          <Text style={styles.dropdownButtonTxtStyle}>{selectedItem || 'Select gender'}</Text>
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
                            ...(isSelected && { backgroundColor: '#E0E7FF' }),
                          }}
                        >
                          <Text style={styles.dropdownItemTxtStyle}>{item}</Text>
                        </View>
                      )}
                      showsVerticalScrollIndicator={false}
                      dropdownStyle={styles.dropdownMenuStyle}
                      disabled={buttonDisable}
                    />

                    <TouchableOpacity onPress={() => handleRestoreInfo('gender')} disabled={buttonDisable}>
                      <MaterialCommunityIcons name="close-circle" size={22} color="#DC2626" />
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => handleUpdateRepShopInfo('gender', null, null, null)}
                      disabled={buttonDisable}
                    >
                      <MaterialCommunityIcons name="check-circle" size={22} color="#10B981" />
                    </TouchableOpacity>
                  </>
                )}

                {edit !== 'gender' && (
                  <>
                    <Text style={styles.infoText}>{localGender}</Text>
                    <TouchableOpacity
                      onPress={() => setEdit('gender')}
                      disabled={buttonDisable}
                      style={styles.editIconButton}
                    >
                      <MaterialCommunityIcons name="pencil" size={18} color="#000B58" />
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.labelContainer}>
                <MaterialCommunityIcons name="phone" size={18} color="#6B7280" />
                <Text style={styles.infoLabel}>Mobile</Text>
              </View>
              <View style={styles.infoEdit}>
                {edit === 'mobile-num' && (
                  <>
                    <TextInput
                      style={styles.input}
                      value={localMobileNum}
                      onChangeText={handlePhoneNumInputChange}
                      keyboardType="number-pad"
                      maxLength={11}
                      placeholder="09XXXXXXXXX"
                      placeholderTextColor="#9CA3AF"
                    />

                    {localMobileNum !== '' && (
                      <>
                        <TouchableOpacity onPress={() => handleRestoreInfo('mobile-num')} disabled={buttonDisable}>
                          <MaterialCommunityIcons name="close-circle" size={22} color="#DC2626" />
                        </TouchableOpacity>

                        {localMobileNum.length === 11 && (
                          <TouchableOpacity onPress={() => handleSendCode()} disabled={buttonDisable}>
                            <MaterialCommunityIcons name="check-circle" size={22} color="#10B981" />
                          </TouchableOpacity>
                        )}
                      </>
                    )}

                    {localMobileNum === '' && (
                      <TouchableOpacity onPress={() => handleRestoreInfo('mobile-num')} disabled={buttonDisable}>
                        <MaterialCommunityIcons name="close-circle" size={22} color="#DC2626" />
                      </TouchableOpacity>
                    )}
                  </>
                )}

                {edit !== 'mobile-num' && (
                  <>
                    <Text style={styles.infoText}>{localMobileNum}</Text>
                    <TouchableOpacity
                      onPress={() => setEdit('mobile-num')}
                      disabled={buttonDisable}
                      style={styles.editIconButton}
                    >
                      <MaterialCommunityIcons name="pencil" size={18} color="#000B58" />
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.labelContainer}>
                <MaterialCommunityIcons name="email" size={18} color="#6B7280" />
                <Text style={styles.infoLabel}>Email</Text>
              </View>
              {localEmail === null && (
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => {
                    setLocalEmail('');
                    setEdit('email');
                  }}
                  disabled={buttonDisable}
                >
                  <MaterialCommunityIcons name="plus-circle" size={18} color="#000B58" />
                  <Text style={styles.editButtonText}>Add Email</Text>
                </TouchableOpacity>
              )}

              {localEmail !== null && (
                <View style={styles.infoEdit}>
                  {edit === 'email' && (
                    <>
                      <TextInput
                        style={styles.input}
                        value={localEmail}
                        onChangeText={setLocalEmail}
                        placeholder="email@example.com"
                        placeholderTextColor="#9CA3AF"
                        keyboardType="email-address"
                        autoCapitalize="none"
                      />

                      <TouchableOpacity onPress={() => handleRestoreInfo('email')} disabled={buttonDisable}>
                        <MaterialCommunityIcons name="close-circle" size={22} color="#DC2626" />
                      </TouchableOpacity>

                      <TouchableOpacity onPress={() => handleSendCode()} disabled={buttonDisable}>
                        <MaterialCommunityIcons name="check-circle" size={22} color="#10B981" />
                      </TouchableOpacity>
                    </>
                  )}

                  {edit !== 'email' && (
                    <>
                      <Text style={styles.infoText}>{localEmail}</Text>
                      <TouchableOpacity
                        onPress={() => setEdit('email')}
                        disabled={buttonDisable}
                        style={styles.editIconButton}
                      >
                        <MaterialCommunityIcons name="pencil" size={18} color="#000B58" />
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              )}
            </View>

            <View style={styles.row}>
              <View style={styles.labelContainer}>
                <MaterialCommunityIcons name="lock" size={18} color="#6B7280" />
                <Text style={styles.infoLabel}>Password</Text>
              </View>
              <View style={styles.infoEdit}>
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => setModalVisible(true)}
                  disabled={buttonDisable}
                >
                  <MaterialCommunityIcons name="key-variant" size={18} color="#000B58" />
                  <Text style={styles.editButtonText}>Change Password</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <View style={styles.editInfoContainer}>
            <View style={styles.subHeaderContainer}>
              <MaterialCommunityIcons name="wrench" size={24} color="#000B58" />
              <Text style={styles.subHeader}>Services Offered</Text>
            </View>
            {services.map((item) => (
              <View key={item.id} style={styles.checkboxContainer}>
                <Checkbox
                  value={localServicesOffered.includes(item.label)}
                  onValueChange={() => toggleCheckbox(item.label)}
                  color={localServicesOffered.includes(item.label) ? '#000B58' : undefined}
                  disabled={buttonDisable}
                />
                <Text style={styles.checkboxTxt}>{item.label}</Text>
              </View>
            ))}

            {isEditServices && (
              <View style={styles.profileButtonContainer}>
                <TouchableOpacity
                  style={[styles.profileButton, styles.cancelButton]}
                  onPress={() => {
                    handleRestoreInfo('services-offered');
                    setIsEditServices(false);
                  }}
                  disabled={buttonDisable}
                >
                  <MaterialCommunityIcons name="close" size={18} color="#6B7280" />
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.profileButton, styles.saveButton]}
                  onPress={() => {
                    handleUpdateRepShopInfo('services-offered', null, null, null);
                    setIsEditServices(false);
                  }}
                  disabled={buttonDisable}
                >
                  <MaterialCommunityIcons name="check" size={18} color="#FFF" />
                  <Text style={styles.profileButtonText}>Save</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          <View style={styles.editInfoContainer}>
            <View style={styles.subHeaderContainer}>
              <MaterialCommunityIcons name="image-multiple" size={24} color="#000B58" />
              <Text style={styles.subHeader}>Shop Images</Text>
            </View>
            {shopImages.length === 0 && (
              <TouchableOpacity style={styles.editButton} onPress={() => pickShopImages()} disabled={buttonDisable}>
                <MaterialCommunityIcons name="image-plus" size={18} color="#000B58" />
                <Text style={styles.editButtonText}>Upload Image</Text>
              </TouchableOpacity>
            )}

            {shopImages.length !== 0 && (
              <>
                <View style={styles.imagesContainer}>
                  {shopImages.map((item) => (
                    <TouchableOpacity
                      key={item}
                      style={styles.imageWrapper}
                      onPress={() => {
                        setImageSource(item);
                        // Get the original image dimensions
                        Image.getSize(
                          item,
                          (width, height) => {
                            setImageDimensions({ width, height });
                            setImageModalVisible(true);
                          },
                          (error) => {
                            console.error('Failed to get image size:', error);
                            // Fallback to default dimensions
                            setImageDimensions({ width: 400, height: 300 });
                            setImageModalVisible(true);
                          }
                        );
                      }}
                      disabled={buttonDisable}
                    >
                      <Image style={styles.image} source={{ uri: item }} resizeMode="cover" />
                    </TouchableOpacity>
                  ))}
                  <TouchableOpacity
                    style={styles.addImageButton}
                    onPress={() => pickShopImages()}
                    disabled={buttonDisable}
                  >
                    <MaterialCommunityIcons name="image-plus" size={30} color="#000B58" />
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>

          <View style={styles.editInfoContainer}>
            <View style={styles.subHeaderContainer}>
              <MaterialCommunityIcons name="map-marker" size={24} color="#000B58" />
              <Text style={styles.subHeader}>Shop Location</Text>
            </View>
            <View style={styles.mapButtonContainer}>
              <View style={styles.mapView2}>
                <MapView
                  style={styles.map2}
                  ref={mapRef}
                  mapType={mapType as any}
                  region={localRegion}
                  provider={PROVIDER_GOOGLE}
                >
                  {localRegion && (
                    <Marker
                      coordinate={{
                        latitude: localRegion.latitude,
                        longitude: localRegion.longitude,
                      }}
                    />
                  )}
                </MapView>
              </View>

              <TouchableOpacity
                style={styles.editButton3}
                onPress={() => {
                  setMapModalVisible(true);
                  setTimeout(() => {
                    mapRef.current?.animateToRegion({
                      latitude: localRegion?.latitude ?? 0,
                      longitude: localRegion?.longitude ?? 0,
                      latitudeDelta: 0.01,
                      longitudeDelta: 0.01,
                    });
                  }, 1000);
                }}
                disabled={buttonDisable}
              >
                <Entypo name="location" size={16} color="#555" />
                <Text style={[styles.editButtonText, { color: '#555' }]}>Edit Location</Text>
              </TouchableOpacity>
            </View>
          </View>

          <Modal
            animationType="fade"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => {
              setModalVisible(false);
              setCurrentPassword('');
              setNewPassword('');
              setConfirmPassword('');
              setPasswordError('');
              setShowCurrentPassword(false);
              setShowNewPassword(false);
              setShowConfirmPassword(false);
            }}
          >
            <View style={styles.modalOverlay}>
              <TouchableWithoutFeedback
                onPress={() => {
                  setModalVisible(false);
                  setCurrentPassword('');
                  setNewPassword('');
                  setConfirmPassword('');
                  setPasswordError('');
                  setShowCurrentPassword(false);
                  setShowNewPassword(false);
                  setShowConfirmPassword(false);
                }}
              >
                <View style={styles.modalBackground} />
              </TouchableWithoutFeedback>

              <View style={styles.passwordModalContent}>
                <View style={styles.passwordModalHeader}>
                  <MaterialCommunityIcons name="lock-reset" size={24} color="#000B58" />
                  <Text style={styles.passwordModalTitle}>Change Password</Text>
                  <TouchableOpacity style={styles.modalCloseButton} onPress={() => handleCancelChangePass()}>
                    <MaterialCommunityIcons name="close" size={24} color="#6B7280" />
                  </TouchableOpacity>
                </View>

                <View style={styles.passwordModalBody}>
                  <View style={styles.passwordInputGroup}>
                    <Text style={styles.passwordInputLabel}>Current Password</Text>
                    <View style={styles.passwordInputWrapper}>
                      <TextInput
                        value={currentPassword}
                        onChangeText={setCurrentPassword}
                        style={styles.passwordInput}
                        placeholder="Enter current password"
                        placeholderTextColor="#9CA3AF"
                        secureTextEntry={!showCurrentPassword}
                        autoCapitalize="none"
                      />
                      <TouchableOpacity
                        style={styles.passwordToggleButton}
                        onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                      >
                        <MaterialCommunityIcons
                          name={showCurrentPassword ? 'eye-off' : 'eye'}
                          size={20}
                          color="#6B7280"
                        />
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View style={styles.passwordInputGroup}>
                    <Text style={styles.passwordInputLabel}>New Password</Text>
                    <View style={styles.passwordInputWrapper}>
                      <TextInput
                        value={newPassword}
                        onChangeText={setNewPassword}
                        style={styles.passwordInput}
                        placeholder="Enter new password"
                        placeholderTextColor="#9CA3AF"
                        secureTextEntry={!showNewPassword}
                        autoCapitalize="none"
                      />
                      <TouchableOpacity
                        style={styles.passwordToggleButton}
                        onPress={() => setShowNewPassword(!showNewPassword)}
                      >
                        <MaterialCommunityIcons name={showNewPassword ? 'eye-off' : 'eye'} size={20} color="#6B7280" />
                      </TouchableOpacity>
                    </View>
                    <Text style={styles.passwordHint}>
                      <MaterialCommunityIcons name="information-outline" size={12} color="#6B7280" /> Password must be
                      at least 8 characters
                    </Text>
                  </View>

                  <View style={styles.passwordInputGroup}>
                    <Text style={styles.passwordInputLabel}>Confirm New Password</Text>
                    <View style={styles.passwordInputWrapper}>
                      <TextInput
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        style={styles.passwordInput}
                        placeholder="Re-enter new password"
                        placeholderTextColor="#9CA3AF"
                        secureTextEntry={!showConfirmPassword}
                        autoCapitalize="none"
                      />
                      <TouchableOpacity
                        style={styles.passwordToggleButton}
                        onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        <MaterialCommunityIcons
                          name={showConfirmPassword ? 'eye-off' : 'eye'}
                          size={20}
                          color="#6B7280"
                        />
                      </TouchableOpacity>
                    </View>
                  </View>

                  {passwordError.length > 0 && (
                    <View style={[styles.errorContainer, { marginBottom: 0 }]}>
                      <MaterialCommunityIcons name="alert-circle" size={16} color="#DC2626" />
                      <Text style={styles.errorMessage}>{passwordError}</Text>
                    </View>
                  )}
                </View>

                <View style={styles.passwordModalActions}>
                  <TouchableOpacity
                    style={[styles.profileButton, styles.cancelButton]}
                    onPress={() => handleCancelChangePass()}
                  >
                    <MaterialCommunityIcons name="close" size={18} color="#6B7280" />
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.profileButton, styles.saveButton]}
                    onPress={() => handleUpdateRepShopInfo('change-password', null, null, null)}
                  >
                    <MaterialCommunityIcons name="check" size={18} color="#FFF" />
                    <Text style={styles.profileButtonText}>Save</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>

          <Modal
            animationType="fade"
            transparent={true}
            visible={mapModalVisible}
            onRequestClose={() => {
              setMapModalVisible(false);
              handleRestoreInfo('region');
            }}
          >
            <View style={styles.modalOverlay}>
              <TouchableWithoutFeedback
                onPress={() => {
                  setMapModalVisible(false);
                  handleRestoreInfo('region');
                }}
              >
                <View style={styles.modalBackground} />
              </TouchableWithoutFeedback>

              <View style={styles.mapView}>
                <View style={styles.mapModalHeader}>
                  <MaterialCommunityIcons name="map-marker-radius" size={24} color="#000B58" />
                  <Text style={styles.mapModalTitle}>Edit Shop Location</Text>
                  <TouchableOpacity
                    style={styles.mapModalCloseButton}
                    onPress={() => {
                      setMapModalVisible(false);
                      handleRestoreInfo('region');
                    }}
                  >
                    <MaterialCommunityIcons name="close" size={24} color="#6B7280" />
                  </TouchableOpacity>
                </View>

                <View style={styles.mapInstructionsContainer}>
                  <MaterialCommunityIcons name="information-outline" size={20} color="#000B58" />
                  <Text style={styles.mapInstructionsText}>
                    Drag the marker or pan the map to set your shop&apos;s exact location
                  </Text>
                </View>

                <MapView
                  style={styles.map}
                  ref={mapRef}
                  mapType={mapType as any}
                  provider={PROVIDER_GOOGLE}
                  initialRegion={localRegion}
                  onRegionChangeComplete={(newRegion) => setLocalRegion(newRegion)}
                >
                  {localRegion && (
                    <Marker
                      coordinate={{
                        latitude: localRegion.latitude,
                        longitude: localRegion.longitude,
                      }}
                      draggable
                      onDragEnd={handleDrag}
                    />
                  )}
                </MapView>

                <View style={styles.mapCoordinatesContainer}>
                  <View style={styles.mapCoordinateItem}>
                    <MaterialCommunityIcons name="latitude" size={16} color="#6B7280" />
                    <Text style={styles.mapCoordinateLabel}>Latitude:</Text>
                    <Text style={styles.mapCoordinateValue}>{localRegion?.latitude.toFixed(6) ?? '0.000000'}</Text>
                  </View>
                  <View style={styles.mapCoordinateItem}>
                    <MaterialCommunityIcons name="longitude" size={16} color="#6B7280" />
                    <Text style={styles.mapCoordinateLabel}>Longitude:</Text>
                    <Text style={styles.mapCoordinateValue}>{localRegion?.longitude.toFixed(6) ?? '0.000000'}</Text>
                  </View>
                </View>

                <View style={styles.cancelSaveContainer}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.modalButtonSecondary]}
                    onPress={() => {
                      setMapModalVisible(false);
                      handleRestoreInfo('region');
                    }}
                  >
                    <MaterialCommunityIcons name="close" size={20} color="#6B7280" />
                    <Text style={[styles.modalButtonText, { color: '#6B7280' }]}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.modalButton, styles.modalButtonPrimary]}
                    onPress={() => {
                      handleUpdateRepShopInfo('region', null, null, null);
                      setMapModalVisible(false);
                    }}
                  >
                    <MaterialCommunityIcons name="check-circle" size={20} color="#FFF" />
                    <Text style={[styles.modalButtonText, { color: '#FFF' }]}>Save</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>

          <Modal
            animationType="fade"
            transparent={true}
            visible={imageModalVisible}
            onRequestClose={() => {
              setImageModalVisible(false);
              setImageSource('');
              setImageDimensions({ width: 0, height: 0 });
            }}
          >
            <View style={styles.imageModalOverlay}>
              <TouchableWithoutFeedback
                onPress={() => {
                  setImageModalVisible(false);
                  setImageSource('');
                  setImageDimensions({ width: 0, height: 0 });
                }}
              >
                <View style={styles.imageModalBackground} />
              </TouchableWithoutFeedback>

              <View style={styles.imageModalContent}>
                <View style={styles.imageModalHeader}>
                  <Text style={styles.imageModalTitle}>Shop Image</Text>
                  <TouchableOpacity
                    style={styles.imageModalCloseButton}
                    onPress={() => {
                      setImageModalVisible(false);
                      setImageSource('');
                      setImageDimensions({ width: 0, height: 0 });
                    }}
                  >
                    <MaterialCommunityIcons name="close" size={24} color="#6B7280" />
                  </TouchableOpacity>
                </View>

                <View style={styles.imageModalImageContainer}>
                  <Image
                    style={[
                      styles.imageModalImage,
                      imageDimensions.width > 0 && {
                        width: calculateImageDisplaySize(imageDimensions.width, imageDimensions.height).width,
                        height: calculateImageDisplaySize(imageDimensions.width, imageDimensions.height).height,
                      },
                    ]}
                    source={{ uri: imageSource }}
                    resizeMode="cover"
                  />
                </View>

                <View style={styles.imageModalActions}>
                  <TouchableOpacity
                    style={[styles.profileButton, styles.cancelButton]}
                    onPress={() => {
                      setImageModalVisible(false);
                      setImageSource('');
                      setImageDimensions({ width: 0, height: 0 });
                    }}
                  >
                    <MaterialCommunityIcons name="close" size={18} color="#6B7280" />
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.profileButton, styles.removeButton]}
                    onPress={() => {
                      deleteImage('shop-image', imageSource);
                      const updatedLinks = shopImages.filter((item) => item !== imageSource);
                      setImageModalVisible(false);
                      setImageDimensions({ width: 0, height: 0 });
                      handleUpdateRepShopInfo('shop-images', null, updatedLinks, 'delete');
                    }}
                  >
                    <MaterialCommunityIcons name="delete" size={18} color="#FFF" />
                    <Text style={styles.profileButtonText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>

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
              setTimer(45);
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
                  setTimer(45);
                }}
              >
                <View style={styles.modalBackground} />
              </TouchableWithoutFeedback>

              <View style={styles.verificationModalView}>
                <View style={styles.modalIconContainer}>
                  <MaterialCommunityIcons
                    name={edit === 'mobile-num' ? 'cellphone-message' : 'email-check'}
                    size={48}
                    color="#000B58"
                  />
                </View>

                <Text style={styles.modalHeader}>Verification Required</Text>
                <Text style={styles.modalText}>
                  We have sent a 6-digit verification code to your{' '}
                  {edit === 'mobile-num' ? 'phone number' : 'email address'}
                </Text>

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
      {updateLoading && (
        <View style={styles.updateLoadingContainer}>
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
  lowerBox: {
    width: '90%',
    alignSelf: 'center',
    marginTop: 20,
    marginBottom: 80,
  },
  profileHeaderContainer: {
    alignItems: 'center',
    gap: 12,
    width: '100%',
    marginBottom: 16,
  },
  editPicContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profilePicWrapper: {
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 120,
    position: 'absolute',
    zIndex: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  profilePic: {
    borderRadius: 120,
  },
  editPicWrapper: {
    backgroundColor: 'rgba(0, 11, 88, 0.7)',
    width: 120,
    height: 120,
    borderRadius: 120,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  editIconContainer: {
    backgroundColor: '#000B58',
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFF',
  },
  profileActions: {
    alignItems: 'center',
  },
  profileActionText: {
    fontFamily: 'BodyBold',
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  profileActionHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  profileActionHintText: {
    fontFamily: 'BodyRegular',
    fontSize: 12,
    color: '#6B7280',
  },
  profileButtonContainer: {
    flexDirection: 'row',
    alignSelf: 'center',
    marginBottom: 16,
    gap: 12,
  },
  profileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
    minWidth: 140,
  },
  removeButton: {
    backgroundColor: '#DC2626',
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#F9FAFB',
  },
  saveButton: {
    backgroundColor: '#000B58',
  },
  profileButtonText: {
    fontFamily: 'BodyBold',
    color: '#FFF',
    fontSize: 14,
  },
  cancelButtonText: {
    fontFamily: 'BodyBold',
    color: '#6B7280',
    fontSize: 14,
  },
  editInfoContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginTop: 16,
  },
  subHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 20,
    paddingBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: '#E5E7EB',
  },
  infoEdit1: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: '100%',
    gap: 10,
  },
  repShopName: {
    fontFamily: 'BodyBold',
    fontSize: 20,
    color: '#333',
    maxWidth: '90%',
  },
  subHeader: {
    fontFamily: 'BodyBold',
    fontSize: 18,
    color: '#333',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    width: '100%',
    paddingVertical: 8,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '35%',
    gap: 8,
  },
  infoLabel: {
    fontFamily: 'HeaderBold',
    color: '#374151',
    fontSize: 14,
  },
  infoEdit: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '65%',
    gap: 10,
    paddingLeft: 10,
  },
  infoText: {
    fontFamily: 'BodyRegular',
    color: '#555',
    flex: 1,
    fontSize: 15,
  },
  input: {
    fontFamily: 'BodyRegular',
    color: '#555',
    padding: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    backgroundColor: '#F9FAFB',
    minWidth: 30,
    flex: 1,
    fontSize: 15,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#E0E7FF',
    borderRadius: 8,
  },
  editButtonText: {
    fontFamily: 'BodyBold',
    color: '#000B58',
    fontSize: 14,
  },
  editIconButton: {
    padding: 6,
    backgroundColor: '#E0E7FF',
    borderRadius: 8,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
    width: '90%',
  },
  checkboxTxt: {
    fontFamily: 'BodyRegular',
    color: '#555',
  },
  imagesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '100%',
    gap: 8,
  },
  imageWrapper: {
    width: '30%',
    aspectRatio: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  addImageButton: {
    width: '30%',
    aspectRatio: 1,
    borderRadius: 8,
    backgroundColor: '#E0E7FF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#000B58',
    borderStyle: 'dashed',
  },
  cancelSaveContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    gap: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  input1: {
    fontFamily: 'BodyBold',
    fontSize: 20,
    color: '#333',
    padding: 0,
    borderBottomWidth: 1,
    borderColor: '#555',
    minWidth: 50,
    maxWidth: '79%',
  },
  dropdownButtonStyle: {
    width: '50%',
    padding: 0,
    backgroundColor: '#EAEAEA',
    borderRadius: 5,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 5,
  },
  dropdownButtonTxtStyle: {
    flex: 1,
    color: '#555',
    fontFamily: 'BodyRegular',
  },
  dropdownButtonArrowStyle: {
    fontSize: 24,
    color: '#555',
  },
  dropdownMenuStyle: {
    backgroundColor: '#EAEAEA',
    borderRadius: 5,
  },
  dropdownItemStyle: {
    width: '100%',
    flexDirection: 'row',
    paddingHorizontal: 5,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
  },
  dropdownItemTxtStyle: {
    flex: 1,
    color: '#555',
    fontFamily: 'BodyRegular',
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
  passwordModalContent: {
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
  passwordModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
    gap: 12,
  },
  passwordModalTitle: {
    fontFamily: 'HeadingBold',
    fontSize: 18,
    color: '#000B58',
    flex: 1,
  },
  modalCloseButton: {
    padding: 4,
    borderRadius: 8,
  },
  passwordModalBody: {
    padding: 20,
    gap: 16,
  },
  passwordInputGroup: {
    gap: 8,
  },
  passwordInputLabel: {
    fontFamily: 'HeaderBold',
    fontSize: 14,
    color: '#374151',
  },
  passwordInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    backgroundColor: '#F9FAFB',
    paddingRight: 8,
  },
  passwordInput: {
    flex: 1,
    fontFamily: 'BodyRegular',
    fontSize: 15,
    color: '#333',
    padding: 12,
  },
  passwordToggleButton: {
    padding: 8,
  },
  passwordHint: {
    fontFamily: 'BodyRegular',
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  passwordModalActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
  },
  mapView: {
    backgroundColor: '#FFF',
    width: '95%',
    maxWidth: 700,
    maxHeight: '90%',
    borderRadius: 16,
    alignItems: 'center',
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
  mapModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
  },
  mapModalTitle: {
    fontSize: 18,
    fontFamily: 'HeaderBold',
    color: '#000B58',
    flex: 1,
    marginLeft: 12,
  },
  mapModalCloseButton: {
    padding: 4,
    borderRadius: 8,
    backgroundColor: 'transparent',
  },
  mapInstructionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#EEF2FF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  mapInstructionsText: {
    flex: 1,
    fontSize: 13,
    fontFamily: 'BodyRegular',
    color: '#374151',
    lineHeight: 18,
  },
  map: {
    width: '100%',
    height: 300,
    marginTop: 16,
  },
  mapCoordinatesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#F9FAFB',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  mapCoordinateItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  mapCoordinateLabel: {
    fontSize: 12,
    fontFamily: 'BodyBold',
    color: '#6B7280',
  },
  mapCoordinateValue: {
    fontSize: 13,
    fontFamily: 'BodyBold',
    color: '#000B58',
  },
  mapButtonContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  mapView2: {
    minHeight: 100,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    overflow: 'hidden',
    width: '100%',
    position: 'absolute',
    zIndex: 1,
  },
  map2: {
    width: '100%',
    height: 100,
  },
  editButton3: {
    backgroundColor: 'rgba(217, 217, 217, 0.8)',
    minHeight: 100,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    flexDirection: 'row',
    width: '100%',
    gap: 5,
    zIndex: 2,
  },
  imageModalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  imageModalBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  imageModalContent: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    width: '90%',
    maxWidth: 500,
    maxHeight: '85%',
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
  imageModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
  },
  imageModalTitle: {
    fontFamily: 'HeadingBold',
    fontSize: 18,
    color: '#000B58',
  },
  imageModalCloseButton: {
    padding: 4,
    borderRadius: 8,
  },
  imageModalImageContainer: {
    backgroundColor: '#F3F4F6',
    width: '100%',
    maxHeight: 500,
  },
  imageModalImage: {
    maxWidth: '100%',
    maxHeight: 500,
  },
  imageModalActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    padding: 16,
    backgroundColor: '#FFF',
  },
  updateLoadingContainer: {
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
    flex: 1,
  },
  modalButtonPrimary: {
    backgroundColor: '#000B58',
    shadowColor: '#000B58',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  modalButtonSecondary: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
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

export default EditShop;
