import { Header } from '@/components/Header';
import { Loading } from '@/components/Loading';
import { generateOtp, getUserInfo, getUsers, updateUserInfo } from '@/services/backendApi';
import socket from '@/services/socket';
import { UpdateUserInfo, UserWithID } from '@/types/user';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  AppState,
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
import { SafeAreaView } from 'react-native-safe-area-context';
import SelectDropdown from 'react-native-select-dropdown';

const EditProfile = () => {
  const router = useRouter();
  const [userID, setUserID] = useState<number>(0);
  const [firstname, setFirstname] = useState<string>('');
  const [lastname, setLastname] = useState<string>('');
  const [gender, setGender] = useState<string>('');
  const [mobileNum, setMobileNum] = useState<string>('');
  const [email, setEmail] = useState<string | null>(null);
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [userInitials, setUserInitials] = useState<string>('');
  const [userInitialsBG, setUserInitialsBG] = useState<string>('');
  const [updateLoading, setUpdateLoading] = useState<boolean>(false);
  const [pickedImage, setPickedImage] = useState<boolean>(false);
  const [edit, setEdit] = useState<string>('');

  const [localFirstname, setLocalFirstname] = useState<string>('');
  const [localLastname, setLocalLastname] = useState<string>('');
  const [localGender, setLocalGender] = useState<string>('');
  const [localMobileNum, setLocalMobileNum] = useState<string>('');
  const [localEmail, setLocalEmail] = useState<string | null>(null);
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

  const genders = ['Male', 'Female'];

  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        const res = await getUserInfo();

        setUserID(res.user_id);
        setFirstname(res.firstname);
        setLastname(res.lastname);
        setGender(res.gender);
        setMobileNum(res.mobile_num);
        setEmail(res.email);
        setProfilePic(res.profile_pic);
        setUserInitials(`${res.firstname[0]}${res.lastname[0]}`);
        setUserInitialsBG(res.user_initials_bg);

        setLocalFirstname(res.firstname);
        setLocalLastname(res.lastname);
        setLocalGender(res.gender);
        setLocalMobileNum(res.mobile_num);
        setLocalEmail(res.email);
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
        setIsLoading(false);
      }
    })();
  }, [router]);

  useEffect(() => {
    if (!socket) return;

    socket.on(`updatedUserInfo-CO-${userID}`, ({ updatedUserInfo }) => {
      setFirstname(updatedUserInfo.firstname);
      setLastname(updatedUserInfo.lastname);
      setGender(updatedUserInfo.gender);
      setMobileNum(updatedUserInfo.mobile_num);
      setEmail(updatedUserInfo.email);
      setProfilePic(updatedUserInfo.profile_pic);
      setUserInitials(`${updatedUserInfo.firstname[0]}${updatedUserInfo.lastname[0]}`);

      setLocalFirstname(updatedUserInfo.firstname);
      setLocalLastname(updatedUserInfo.lastname);
      setLocalGender(updatedUserInfo.gender);
      setLocalMobileNum(updatedUserInfo.mobile_num);
      setLocalEmail(updatedUserInfo.email);
      setLocalProfilePic(updatedUserInfo.profile_pic);
    });

    return () => {
      socket.off(`updatedUserInfo-CO-${userID}`);
    };
  }, [userID]);

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

  const pickImage = async (): Promise<void> => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Please grant access to photos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 4],
      quality: 1,
    });

    if (!result.canceled) {
      setLocalProfilePic(result.assets[0].uri);
      setPickedImage(true);
    }
  };

  const handleUpdateUserInfo = async (field: string, link: string | null) => {
    try {
      setUpdateLoading(true);
      const userInfo: UpdateUserInfo = {
        firstname: null,
        lastname: null,
        gender: null,
        email: null,
        mobile_num: null,
        profile_pic: null,
        field,
      };

      switch (field) {
        case 'firstname':
          if (localFirstname === firstname) {
            setEdit('');
            return;
          }
          userInfo.firstname = localFirstname.trim();
          setFirstname(localFirstname);
          break;
        case 'lastname':
          if (localLastname === lastname) {
            setEdit('');
            return;
          }
          userInfo.lastname = localLastname.trim();
          setLastname(localLastname);
          break;
        case 'gender':
          if (localGender === gender) {
            setEdit('');
            return;
          }
          userInfo.gender = localGender.trim();
          setGender(localGender);
          break;
        case 'mobile-num':
          userInfo.mobile_num = localMobileNum.trim();
          setMobileNum(localMobileNum);
          break;
        case 'email':
          if (localEmail === '') {
            userInfo.email = null;
            setEmail(null);
            break;
          }

          if (localEmail !== null) {
            userInfo.email = localEmail.trim();
            setEmail(localEmail);
            break;
          }
        case 'profile':
          userInfo.profile_pic = link;
          setProfilePic(link);
          break;
        default:
          throw new Error('Unsupported field');
      }

      await updateUserInfo(userInfo);

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

  const uploadImage = async () => {
    try {
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
      handleUpdateUserInfo('profile', uploadedUrl);
    } catch {
      Alert.alert('Upload failed', 'An error occured during upload.');
    }
  };

  const handleRestoreInfo = (field: string) => {
    switch (field) {
      case 'firstname':
        setLocalFirstname(firstname);
        break;
      case 'lastname':
        setLocalLastname(lastname);
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
      case 'profile':
        setLocalProfilePic(profilePic);
        setPickedImage(false);
        break;
      default:
        throw new Error('Unsupported field');
    }

    setEdit('');
  };

  const deleteImage = async () => {
    setUpdateLoading(true);
    const parts = profilePic?.split('/');
    const lastPart = parts?.slice(-1)[0];
    const folderName = parts?.slice(-2)[0];
    const fileName = lastPart?.split('.')[0];

    await axios.post(`${process.env.EXPO_PUBLIC_BACKEND_API_URL}/cloudinary/delete-image `, {
      public_id: `${folderName}/${fileName}`,
    });
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
    const fetchedUsers: UserWithID[] = await getUsers();
    const userExcluded = fetchedUsers.filter((user) => user.user_id !== userID);

    if (localEmail === '') {
      handleUpdateUserInfo('email', null);
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

      const mobileNumExists = userExcluded.some((user) => user.mobile_num === localMobileNum.trim());

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

      const emailExists = userExcluded.some((user) => user.email === localEmail?.trim());

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
          handleUpdateUserInfo('mobile-num', null);
        } else {
          handleUpdateUserInfo('email', null);
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
      <Header headerTitle="Edit Profile" />
      <KeyboardAwareScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <View style={styles.lowerBox}>
          <View style={styles.profileHeaderContainer}>
            <View style={styles.editPicContainer}>
              {localProfilePic === null && (
                <View style={[styles.profilePicWrapper, { backgroundColor: userInitialsBG }]}>
                  <Text style={styles.userInitials}>{userInitials}</Text>
                </View>
              )}

              {localProfilePic !== null && (
                <View style={styles.profilePicWrapper}>
                  <Image style={styles.profilePic} source={{ uri: localProfilePic }} width={120} height={120} />
                </View>
              )}

              <TouchableOpacity style={styles.editPicWrapper} onPress={() => pickImage()} disabled={buttonDisable}>
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
                  deleteImage();
                  handleUpdateUserInfo('profile', null);
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
                    deleteImage();
                  }
                  uploadImage();
                }}
                disabled={buttonDisable}
              >
                <MaterialCommunityIcons name="check" size={18} color="#FFF" />
                <Text style={styles.profileButtonText}>Save Photo</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.editInfoContainer}>
            <View style={styles.subHeaderContainer}>
              <MaterialCommunityIcons name="account-details" size={24} color="#000B58" />
              <Text style={styles.subHeader}>Personal Information</Text>
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
                      value={localFirstname}
                      onChangeText={setLocalFirstname}
                      style={styles.input}
                      placeholder="Enter first name"
                      placeholderTextColor="#9CA3AF"
                    />

                    {localFirstname !== '' && (
                      <>
                        <TouchableOpacity onPress={() => handleRestoreInfo('firstname')} disabled={buttonDisable}>
                          <MaterialCommunityIcons name="close-circle" size={22} color="#DC2626" />
                        </TouchableOpacity>

                        <TouchableOpacity
                          onPress={() => handleUpdateUserInfo('firstname', null)}
                          disabled={buttonDisable}
                        >
                          <MaterialCommunityIcons name="check-circle" size={22} color="#10B981" />
                        </TouchableOpacity>
                      </>
                    )}

                    {localFirstname === '' && (
                      <TouchableOpacity onPress={() => handleRestoreInfo('firstname')} disabled={buttonDisable}>
                        <MaterialCommunityIcons name="close-circle" size={22} color="#DC2626" />
                      </TouchableOpacity>
                    )}
                  </>
                )}

                {edit !== 'firstname' && (
                  <>
                    <Text style={styles.infoText}>{localFirstname}</Text>
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
                      value={localLastname}
                      onChangeText={setLocalLastname}
                      style={styles.input}
                      placeholder="Enter last name"
                      placeholderTextColor="#9CA3AF"
                    />

                    {localLastname !== '' && (
                      <>
                        <TouchableOpacity onPress={() => handleRestoreInfo('lastname')} disabled={buttonDisable}>
                          <MaterialCommunityIcons name="close-circle" size={22} color="#DC2626" />
                        </TouchableOpacity>

                        <TouchableOpacity
                          onPress={() => handleUpdateUserInfo('lastname', null)}
                          disabled={buttonDisable}
                        >
                          <MaterialCommunityIcons name="check-circle" size={22} color="#10B981" />
                        </TouchableOpacity>
                      </>
                    )}

                    {localLastname === '' && (
                      <TouchableOpacity onPress={() => handleRestoreInfo('lastname')} disabled={buttonDisable}>
                        <MaterialCommunityIcons name="close-circle" size={22} color="#DC2626" />
                      </TouchableOpacity>
                    )}
                  </>
                )}

                {edit !== 'lastname' && (
                  <>
                    <Text style={styles.infoText}>{localLastname}</Text>
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

                    <TouchableOpacity onPress={() => handleUpdateUserInfo('gender', null)} disabled={buttonDisable}>
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
                      value={localMobileNum}
                      onChangeText={handlePhoneNumInputChange}
                      style={styles.input}
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
                        value={localEmail}
                        onChangeText={setLocalEmail}
                        style={styles.input}
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
          </View>

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
    marginBottom: 24,
  },
  editPicContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
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
  userInitials: {
    fontFamily: 'HeaderBold',
    fontSize: 38,
    color: '#FFF',
  },
  profilePic: {
    borderRadius: 120,
  },
  editIcon: {
    fontSize: 30,
    color: '#000B58',
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
  editInfoContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
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
  subHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 20,
    paddingBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: '#E5E7EB',
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
  dropdownButtonStyle: {
    flex: 1,
    padding: 8,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  dropdownButtonTxtStyle: {
    flex: 1,
    color: '#555',
    fontFamily: 'BodyRegular',
    fontSize: 15,
  },
  dropdownButtonArrowStyle: {
    fontSize: 20,
    color: '#6B7280',
  },
  dropdownMenuStyle: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  dropdownItemStyle: {
    width: '100%',
    flexDirection: 'row',
    paddingHorizontal: 12,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
  },
  dropdownItemTxtStyle: {
    flex: 1,
    color: '#555',
    fontFamily: 'BodyRegular',
    fontSize: 15,
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

export default EditProfile;
