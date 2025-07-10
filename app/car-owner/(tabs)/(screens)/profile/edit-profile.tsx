import { Header } from '@/components/Header';
import { Loading } from '@/components/Loading';
import { getUserInfo, getUsers, updateUserInfo } from '@/services/backendApi';
import { UserWithID } from '@/types/user';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { showMessage } from 'react-native-flash-message';
import { SafeAreaView } from 'react-native-safe-area-context';
import SelectDropdown from 'react-native-select-dropdown';

const EditProfile = () => {
  const router = useRouter();

  const [userID, setUserID] = useState<number>(0);
  const [firstname, setFirstname] = useState<string>('');
  const [lastname, setLastname] = useState<string>('');
  const [gender, setGender] = useState<string>('');
  const [mobileNum, setMobileNum] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [userInitials, setUserInitials] = useState<string>('');
  const [userInitialsBG, setUserInitialsBG] = useState<string>('');
  const [updateLoading, setUpdateLoading] = useState<boolean>(false);
  const [pickedImage, setPickedImage] = useState<boolean>(false);

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

      } catch (e) {
        console.error('Error: ', e);

      } finally {
        setIsLoading(false)
      }
    })();
  }, []);

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
      setProfilePic(result.assets[0].uri);
      setPickedImage(true);
    }
  };

  const handleUpdateUserInfo = async (link: string | null) => {
    if (!firstname || !lastname || !gender || !mobileNum) {
      showMessage({
        message: 'Please fill in required fields.',
        type: 'warning',
        floating: true,
        color: '#FFF',
        icon: 'warning',
      });
      return;
    }

    try {
      const fetchedUsers: UserWithID[] = await getUsers();
      const userExcluded = fetchedUsers.filter(user => user.user_id !== userID);
      const mobileNumExists = userExcluded.some(user => user.mobile_num === mobileNum.trim());
      const emailExists = userExcluded.some(user => user.email === email.trim());

      if (mobileNumExists) {
        showMessage({
          message: 'Mobile number is already used by another account.',
          type: 'warning',
          floating: true,
          color: '#FFF',
          icon: 'warning',
        });
        return;
      };
      
      if (emailExists) {
        showMessage({
          message: 'Email is already used by another account.',
          type: 'warning',
          floating: true,
          color: '#FFF',
          icon: 'warning',
        });
        return;
      };

    } catch (e) {
      showMessage({
        message: 'Something went wrong. Please try again.',
        type: 'danger',
        floating: true,
        color: '#FFF',
        icon: 'danger',
      });
    }

    const userInfo = {
      firstname: firstname.trim(),
      lastname: lastname.trim(),
      gender: gender.trim(),
      email: email.trim(),
      mobile_num: mobileNum.trim(),
      profile_pic: link
    };

    try {
      await updateUserInfo(userInfo)
      showMessage({
        message: 'Changes saved!',
        type: 'success',
        floating: true,
        color: '#FFF',
        icon: 'success',
      });

    } catch (e) {
      showMessage({
        message: 'Something went wrong. Please try again.',
        type: 'danger',
        floating: true,
        color: '#FFF',
        icon: 'danger',
      });
    }
  }

  const uploadImage = async () => {
    try {
      const signRes = await axios.post(`${process.env.EXPO_PUBLIC_BACKEND_API_URL}/cloudinary/generate-signature`);
      const { timestamp, signature, apiKey, cloudName, folder } = signRes.data;

      const formData = new FormData();
      formData.append('file', {
        uri: profilePic,
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
      return uploadedUrl;

    } catch (e: any) {
      console.error('Upload Error: ', e);
      Alert.alert('Upload failed', 'An error occured during upload.');
    }
  }

  const handleSave = async () => {
    setUpdateLoading(true);
    if (pickedImage) {
      const res = await uploadImage();
      handleUpdateUserInfo(res);
    } else {
      handleUpdateUserInfo(null);
    }
    setUpdateLoading(false);
    setTimeout(() => {
        router.replace('./profile');
      }, 1000);
  };

  if (isLoading) {
    return <Loading />
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior='padding'
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps='handled' 
        >
          <Header headerTitle='Edit Profile' link='./profile' />

          <View style={styles.lowerBox}>
            <View style={styles.editPicContainer}>
              {profilePic === null && (
                <View style={[styles.profilePicWrapper, { backgroundColor: userInitialsBG }]}>
                  <Text style={styles.userInitials}>{userInitials}</Text>
                </View>
              )}

              {profilePic !== null && (
                <View style={styles.profilePicWrapper}>
                  <Image
                    style={styles.profilePic}
                    source={{ uri: profilePic }}
                    width={120}
                    height={120}
                  />
                </View>
              )}

              <TouchableOpacity style={styles.editPicWrapper} onPress={() => pickImage()}>
                <MaterialCommunityIcons name='pencil' style={styles.editIcon} />
              </TouchableOpacity>
            </View>

            <View style={styles.editInfoContainer}>
              <View style={styles.row}>
                <Text style={styles.textInputLbl}>First Name</Text>
                <TextInput
                  value={firstname}
                  onChangeText={setFirstname}
                  style={styles.input}
                />
              </View>

              <View style={styles.row}>
                <Text style={styles.textInputLbl}>Last Name</Text>
                <TextInput
                  value={lastname}
                  onChangeText={setLastname}
                  style={styles.input}
                />
              </View>

              <View style={styles.row}>
                <Text style={styles.textInputLbl}>Gender</Text>
                <SelectDropdown
                  data={genders}
                  defaultValue={gender}
                  onSelect={(selectedItem) => setGender(selectedItem)}
                  renderButton={(selectedItem, isOpen) => (
                    <View style={styles.dropdownButtonStyle}>
                      <Text style={styles.dropdownButtonTxtStyle}>
                        {selectedItem || 'Select gender'}
                      </Text>
                      <MaterialCommunityIcons name={isOpen ? 'chevron-up' : 'chevron-down'} style={styles.dropdownButtonArrowStyle} />
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

              <View style={styles.row}>
                <Text style={styles.textInputLbl}>Mobile Number</Text>
                <TextInput
                  value={mobileNum}
                  onChangeText={setMobileNum}
                  style={styles.input}
                  keyboardType='number-pad'
                />
              </View>

              <View style={styles.row}>
                <Text style={styles.textInputLbl}>Email</Text>
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  style={styles.input}
                />
              </View>
            </View>

            <View style={styles.cancelSaveContainer}>
              <TouchableOpacity style={[styles.button, { borderWidth: 1, borderColor: '#555' }]} onPress={() => router.replace('./profile')}>
                <Text style={[styles.buttonText, { color: '#555' }]}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.button, { backgroundColor: '#000B58' }]} onPress={() => handleSave()}>
                <Text style={[styles.buttonText, { color: '#FFF' }]}>Save</Text>
              </TouchableOpacity>
            </View>

            {updateLoading && (
              <View style={styles.updateLoadingContainer}>
                <ActivityIndicator size='large' color='#000B58'  />
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  lowerBox: {
    alignItems: 'center',
    flex: 1,
  },
  editPicContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 100,
  },
  profilePicWrapper: {
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 120,
    position: 'absolute',
    zIndex: 1,
  },
  editPicWrapper: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    width: 120,
    height: 120,
    borderRadius: 120,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    zIndex: 2,
  },
  userInitials: {
    fontFamily: 'LeagueSpartan_Bold',
    fontSize: 40,
    color: '#FFF',
  },
  profilePic: {
    borderRadius: 120,
  },
  editIcon: {
    fontSize: 30,
    color: '#000B58',
  },
  editInfoContainer: {
    gap: 10,
    marginTop: 100,
    width: '100%',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  textInputLbl: {
    fontSize: 16,
    fontFamily: 'LeagueSpartan',
    color: '#333',
    width: '35%',
  },
  input: {
    backgroundColor: '#EAEAEA',
    width: '50%',
    height: 45,
    borderRadius: 10,
    padding: 10,
    fontSize: 16,
    color: '#333',
    fontFamily: 'LeagueSpartan',
  },
  dropdownButtonStyle: {
    width: '50%',
    height: 45,
    backgroundColor: '#EAEAEA',
    borderRadius: 10,
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
  },
  dropdownItemTxtStyle: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    fontFamily: 'LeagueSpartan',
  },
  cancelSaveContainer: {
    marginTop: 30,
    marginBottom: 30,
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    gap: 10,
  },
  button: {
    width: '30%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    fontFamily: 'LeagueSpartan_Bold',
    fontSize: 16,
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
})

export default EditProfile