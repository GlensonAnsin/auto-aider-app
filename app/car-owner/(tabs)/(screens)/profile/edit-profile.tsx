import { Header } from '@/components/Header';
import { Loading } from '@/components/Loading';
import { getUserInfo, getUsers, updateUserInfo } from '@/services/backendApi';
import { UpdateUserInfo, UserWithID } from '@/types/user';
import Entypo from '@expo/vector-icons/Entypo';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { showMessage } from 'react-native-flash-message';
import { SafeAreaView } from 'react-native-safe-area-context';
import SelectDropdown from 'react-native-select-dropdown';
import { io, Socket } from 'socket.io-client';

const EditProfile = () => {
  const [_socket, setSocket] = useState<Socket | null>(null);

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

      } catch (e) {
        console.error('Error: ', e);

      } finally {
        setIsLoading(false)
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
        newSocket.off('updatedUserInfo');
        newSocket.disconnect();
    };
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

      const fetchedUsers: UserWithID[] = await getUsers();
      const userExcluded = fetchedUsers.filter(user => user.user_id !== userID);

      switch (field) {
        case 'firstname':
          userInfo.firstname = localFirstname.trim();
          setFirstname(localFirstname);
          break;
        case 'lastname':
          userInfo.lastname = localLastname.trim();
          setLastname(localLastname);
          break;
        case 'gender':
          userInfo.gender = localGender.trim();
          setGender(localGender);
          break;
        case 'mobile-num':
          const mobileNumExists = userExcluded.some(user => user.mobile_num === localMobileNum.trim());

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

          userInfo.mobile_num = localMobileNum.trim();
          setMobileNum(localMobileNum);
          break;
        case 'email':
          const emailExists = userExcluded.some(user => user.email === localEmail?.trim());

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

          if (localEmail === '') {
            userInfo.email = null;
            setEmail(null);
            break;
          };

          if (localEmail !== null) {
            userInfo.email = localEmail.trim();
            setEmail(localEmail);
            break;
          };
        case 'profile':
          userInfo.profile_pic = link;
          setProfilePic(link);
          break;
        default:
          throw new Error('Unsupported field');
      }

      await updateUserInfo(userInfo)

      setEdit('');
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

    } catch (e: any) {
      console.error('Upload Error: ', e);
      Alert.alert('Upload failed', 'An error occured during upload.');
    }
  }

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
          <Header headerTitle='Edit Profile' />

          <View style={styles.lowerBox}>
            <View style={styles.editPicContainer}>
              {localProfilePic === null && (
                <View style={[styles.profilePicWrapper, { backgroundColor: userInitialsBG }]}>
                  <Text style={styles.userInitials}>{userInitials}</Text>
                </View>
              )}

              {localProfilePic !== null && (
                <View style={styles.profilePicWrapper}>
                  <Image
                    style={styles.profilePic}
                    source={{ uri: localProfilePic }}
                    width={120}
                    height={120}
                  />
                </View>
              )}

              <TouchableOpacity style={styles.editPicWrapper} onPress={() => pickImage()}>
                <MaterialCommunityIcons name='pencil' style={styles.editIcon} />
              </TouchableOpacity>
            </View>

            {localProfilePic !== null && !pickedImage && (
              <View style={styles.profileButtonContainer}>
                <TouchableOpacity style={[styles.profileButton, { backgroundColor: '#780606', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 5, }]} onPress={() => {
                  deleteImage();
                  handleUpdateUserInfo('profile', null);
                }}>
                  <MaterialCommunityIcons name='image-remove' size={20} color='#FFF' />
                  <Text style={styles.profileButtonText}>Remove</Text>
                </TouchableOpacity>
              </View>
            )}

            {localProfilePic !== null && pickedImage && (
              <View style={styles.profileButtonContainer}>
                <TouchableOpacity style={[styles.profileButton, { borderWidth: 1, borderColor: '#555' }]} onPress={() => handleRestoreInfo('profile')}>
                  <Text style={[styles.profileButtonText, { color: '#555' }]}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.profileButton, { backgroundColor: '#000B58' }]} onPress={() => {
                  if (profilePic !== null) {
                    deleteImage();
                  }
                  uploadImage();
                }}>
                  <Text style={styles.profileButtonText}>Save</Text>
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.editInfoContainer}>
              <Text style={styles.subHeader}>User Details</Text>
              <View style={styles.row}>
                <Text style={styles.infoLabel}>First Name:</Text>
                <View style={styles.infoEdit}>
                  {edit === 'firstname' && (
                    <>
                      <TextInput
                        value={localFirstname}
                        onChangeText={setLocalFirstname}
                        style={styles.input}
                      />

                      {localFirstname !== '' && (
                        <>
                          <TouchableOpacity onPress={() => handleRestoreInfo('firstname')}>
                            <Entypo name='cross' size={20} color='#780606' />
                          </TouchableOpacity>

                          <TouchableOpacity onPress={() => handleUpdateUserInfo('firstname', null)}>
                            <FontAwesome5 name='check' size={16} color='#22bb33' />
                          </TouchableOpacity>
                        </>
                      )}

                      {localFirstname === '' && (
                        <TouchableOpacity onPress={() => handleRestoreInfo('firstname')}>
                          <Entypo name='cross' size={20} color='#780606' />
                        </TouchableOpacity>
                      )}
                    </>
                  )}

                  {edit !== 'firstname' && (
                    <>
                      <Text style={styles.infoText}>{localFirstname}</Text>
                      <TouchableOpacity onPress={() => setEdit('firstname')}>
                        <MaterialIcons name='edit' size={16} color='#555' />
                      </TouchableOpacity> 
                    </>
                  )}        
                </View>
              </View>

              <View style={styles.row}>
                <Text style={styles.infoLabel}>Last Name:</Text>
                <View style={styles.infoEdit}>
                  {edit === 'lastname' && (
                    <>
                      <TextInput
                        value={localLastname}
                        onChangeText={setLocalLastname}
                        style={styles.input}
                      />

                      {localLastname !== '' && (
                        <>
                          <TouchableOpacity onPress={() => handleRestoreInfo('lastname')}>
                            <Entypo name='cross' size={20} color='#780606' />
                          </TouchableOpacity>

                          <TouchableOpacity onPress={() => handleUpdateUserInfo('lastname', null)}>
                            <FontAwesome5 name='check' size={16} color='#22bb33' />
                          </TouchableOpacity>
                        </>
                      )}

                      {localLastname === '' && (
                        <TouchableOpacity onPress={() => handleRestoreInfo('lastname')}>
                          <Entypo name='cross' size={20} color='#780606' />
                        </TouchableOpacity>
                      )}
                    </>
                  )}

                  {edit !== 'lastname' && (
                    <>
                      <Text style={styles.infoText}>{localLastname}</Text>
                      <TouchableOpacity onPress={() => setEdit('lastname')}>
                        <MaterialIcons name='edit' size={16} color='#555' />
                      </TouchableOpacity> 
                    </>
                  )}
                </View>
              </View>

              <View style={styles.row}>
                <Text style={styles.infoLabel}>Gender:</Text>
                <View style={styles.infoEdit}>
                  {edit === 'gender' && (
                    <>  
                      <SelectDropdown
                        data={genders}
                        defaultValue={localGender}
                        onSelect={(selectedItem) => setLocalGender(selectedItem)}
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
                        <TouchableOpacity onPress={() => handleRestoreInfo('gender')}>
                          <Entypo name='cross' size={20} color='#780606' />
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => handleUpdateUserInfo('gender', null)}>
                          <FontAwesome5 name='check' size={16} color='#22bb33' />
                        </TouchableOpacity>
                    </>
                  )}

                  {edit !== 'gender' && (
                    <>
                      <Text style={styles.infoText}>{localGender}</Text>
                      <TouchableOpacity onPress={() => setEdit('gender')}>
                        <MaterialIcons name='edit' size={16} color='#555' />
                      </TouchableOpacity> 
                    </>
                  )}
                </View>
              </View>

              <View style={styles.row}>
                <Text style={styles.infoLabel}>Number:</Text>
                <View style={styles.infoEdit}>
                  {edit === 'mobile-num' && (
                    <>
                      <TextInput
                        value={localMobileNum}
                        onChangeText={setLocalMobileNum}
                        style={styles.input}
                        keyboardType='number-pad'
                      />

                      {localMobileNum !== '' && (
                        <>
                          <TouchableOpacity onPress={() => handleRestoreInfo('mobile-num')}>
                            <Entypo name='cross' size={20} color='#780606' />
                          </TouchableOpacity>

                          <TouchableOpacity onPress={() => handleUpdateUserInfo('mobile-num', null)}>
                            <FontAwesome5 name='check' size={16} color='#22bb33' />
                          </TouchableOpacity>
                        </>
                      )}

                      {localMobileNum === '' && (
                        <TouchableOpacity onPress={() => handleRestoreInfo('mobile-num')}>
                          <Entypo name='cross' size={20} color='#780606' />
                        </TouchableOpacity>
                      )}
                    </>
                  )}

                  {edit !== 'mobile-num' && (
                    <>
                      <Text style={styles.infoText}>{localMobileNum}</Text>
                      <TouchableOpacity onPress={() => setEdit('mobile-num')}>
                          <MaterialIcons name='edit' size={16} color='#555' />
                      </TouchableOpacity> 
                    </>
                  )}
                </View>
              </View>

              <View style={styles.row}>
                <Text style={styles.infoLabel}>Email:</Text>
                {localEmail === null && (
                  <TouchableOpacity style={styles.editButton} onPress={() => {
                    setLocalEmail('');
                    setEdit('email');
                  }}>
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
                        />

                        <TouchableOpacity onPress={() => handleRestoreInfo('email')}>
                          <Entypo name='cross' size={20} color='#780606' />
                        </TouchableOpacity>   

                        <TouchableOpacity onPress={() => handleUpdateUserInfo('email', null)}>
                          <FontAwesome5 name='check' size={16} color='#22bb33' />
                        </TouchableOpacity>                                                                         
                      </>
                    )}

                    {edit !== 'email' && (
                      <>
                        <Text style={styles.infoText}>{localEmail}</Text>
                        <TouchableOpacity onPress={() => setEdit('email')}>
                          <MaterialIcons name='edit' size={16} color='#555' />
                        </TouchableOpacity> 
                      </>
                    )}
                  </View>
                )}
              </View>
            </View>
          </View>
        </ScrollView>
        {updateLoading && (
          <View style={styles.updateLoadingContainer}>
            <ActivityIndicator size='large' color='#000B58'  />
          </View>
        )}
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
    width: '90%',
    alignSelf: 'center',
    marginTop: 20,
    marginBottom: 100,
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
  },
  editPicWrapper: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    width: 120,
    height: 120,
    borderRadius: 120,
    justifyContent: 'center',
    alignItems: 'center',
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
    marginTop: 30,
    borderTopWidth: 1,
    borderColor: '#EAEAEA',
    paddingTop: 10,
  },
  profileButtonContainer: {
    flexDirection: 'row',
    alignSelf: 'center',
    marginTop: 10,
    gap: 10,
  },
  profileButton: {
    width: 100,
    padding: 5,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileButtonText: {
    fontFamily: 'LeagueSpartan',
    color: '#FFF',
    fontSize: 16,
  },
  subHeader: {
    fontFamily: 'LeagueSpartan_Bold',
    fontSize: 20,
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    width: '100%',
  },
  infoLabel: {
    fontFamily: 'LeagueSpartan_Bold',
    fontSize: 16,
    width: '30%',
    color: '#555',
  },
  infoEdit: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '70%',
    gap: 10,
  },
  infoText: {
    fontFamily: 'LeagueSpartan',
    fontSize: 16,
    color: '#555',
    maxWidth: '85%',
  },
  editButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  editButtonText: {
    fontFamily: 'LeagueSpartan',
    fontSize: 16,
    color: '#000B58'
  },
  input: {
    fontFamily: 'LeagueSpartan',
    fontSize: 16,
    color: '#555',
    padding: 0,
    borderBottomWidth: 1,
    borderColor: '#555',
    minWidth: 30,
    maxWidth: '75%',
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
    fontSize: 16,
    color: '#555',
    fontFamily: 'LeagueSpartan',
  },
  dropdownButtonArrowStyle: {
    fontSize: 24,
    color: '#555',
  },
  dropdownMenuStyle: {
    backgroundColor: '#EAEAEA',
    borderRadius: 5,
    marginTop: -1,
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
    fontSize: 16,
    color: '#555',
    fontFamily: 'LeagueSpartan',
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