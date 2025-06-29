import { getUserInfo, getUsers, updateUserInfo } from '@/services/backendApi';
import { UserWithID } from '@/types/user';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { showMessage } from 'react-native-flash-message';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import SelectDropdown from 'react-native-select-dropdown';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const EditProfile = () => {
  const router = useRouter();

  const [userID, setUserID] = useState<number>(0);
  const [firstname, setFirstname] = useState<string>('');
  const [lastname, setLastname] = useState<string>('');
  const [gender, setGender] = useState<string>('');
  const [mobileNum, setMobileNum] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [profilePic, setProfilePic] = useState<string | null>(null);

  const genders = ['Male', 'Female'];

  useEffect(() => {
    (async () => {
      try {
        const res = await getUserInfo();
        
        setUserID(res.user_id);
        setFirstname(res.firstname);
        setLastname(res.lastname);
        setGender(res.gender);
        setMobileNum(res.mobile_num);
        setEmail(res.email);
        setProfilePic(res.profile_pic);

      } catch (e) {
        console.error('Error: ', e);
      }
    })();
  }, []);

  const handleUpdateUserInfo = async () => {
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
        message: 'Server error',
        type: 'danger',
        floating: true,
        color: '#FFF',
        icon: 'danger',
      });
      return;
    }

    const userInfo = {
      firstname: firstname.trim(),
      lastname: lastname.trim(),
      gender: gender.trim(),
      email: email.trim(),
      mobile_num: mobileNum.trim(),
      profile_pic: profilePic
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

      setTimeout(() => {
        router.push('/car-owner/(tabs)/(screens)/profile/profile');
      }, 2000);

    } catch (e) {
      showMessage({
        message: 'Server error',
        type: 'danger',
        floating: true,
        color: '#FFF',
        icon: 'danger',
      });
    }
  }

  return (
    <SafeAreaProvider>
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
            <View style={styles.upperBox}>
              <Text style={styles.header}>|  Edit Profile</Text>
              <TouchableOpacity style={styles.arrowWrapper} onPress={() => router.push('/car-owner/(tabs)/(screens)/profile/profile')}>
                <Icon name='arrow-left' style={styles.arrowBack} />
              </TouchableOpacity>
            </View>

            <View style={styles.lowerBox}>
              <View style={styles.editPicContainer}>
                <View style={styles.profilePicWrapper}>
                  {profilePic === null && (
                    <Text style={styles.userInitials}>{`${firstname[0]}${lastname[0]}`}</Text>
                  )}

                  {profilePic !== null && (
                    <Image
                      source={{ uri: profilePic }}
                    />
                  )}
                </View>

                <TouchableOpacity style={styles.editPicWrapper}>
                  <Icon
                    name='pencil'
                    style={styles.editIcon}
                  />
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

              <TouchableOpacity style={styles.button} onPress={() => handleUpdateUserInfo()}>
                <Text style={styles.buttonTxt}>Save</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </SafeAreaProvider>
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
    alignItems: 'flex-start',
    height: 63,
  },
  header: {
    color: '#FFF',
    fontFamily: 'LeagueSpartan_Bold',
    fontSize: 22,
    marginLeft: 50,
  },
  arrowWrapper: {
    top: 23,
    right: 320,
    position: 'absolute',
  },
  arrowBack: {
    fontSize: 22,
    color: '#FFF',
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
    backgroundColor: 'green',
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 120,
    position: 'absolute',
    zIndex: 1,
  },
  editPicWrapper: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
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
    fontSize: 30,
    color: '#FFF',
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
  button: {
    width: '40%',
    height: 45,
    backgroundColor: '#000B58',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    marginTop: 30,
    marginBottom: 30,
  },
  buttonTxt: {
    color: '#FFF',
    fontSize: 16,
    fontFamily: 'LeagueSpartan_Bold',
  },
})

export default EditProfile