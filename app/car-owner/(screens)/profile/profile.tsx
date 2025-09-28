import { Header } from '@/components/Header';
import { Loading } from '@/components/Loading';
import { useBackRoute } from '@/hooks/useBackRoute';
import { clearRoleState } from '@/redux/slices/roleSlice';
import { clearRouteState } from '@/redux/slices/routeSlice';
import { clearScanReferenceState } from '@/redux/slices/scanReferenceSlice';
import { clearScanState } from '@/redux/slices/scanSlice';
import { clearSenderReceiverState } from '@/redux/slices/senderReceiverSlice';
import { clearVehicleDiagIDArrState } from '@/redux/slices/vehicleDiagIDArrSlice';
import { clearVehicleDiagIDState } from '@/redux/slices/vehicleDiagIDSlice';
import { changePass, getUserInfo } from '@/services/backendApi';
import { clearTokens } from '@/services/tokenStorage';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
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
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch } from 'react-redux';

const Profile = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const backRoute = useBackRoute('/car-owner/(screens)/profile/profile');
  const [currentPassword, setCurrentPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [firstname, setFirstname] = useState<string>('');
  const [lastname, setLastname] = useState<string>('');
  const [mobileNum, setMobileNum] = useState<string>('');
  const [email, setEmail] = useState<string | null>(null);
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [userInitialsBG, setUserInitialsBG] = useState<string>('');

  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        const res = await getUserInfo();

        setFirstname(res.firstname);
        setLastname(res.lastname);
        setMobileNum(res.mobile_num);
        setEmail(res.email);
        setProfilePic(res.profile_pic);
        setUserInitialsBG(res.user_initials_bg);
      } catch (e) {
        console.error('Error: ', e);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const handleLogout = async () => {
    try {
      await clearTokens();
      dispatch(clearRoleState());
      dispatch(clearRouteState());
      dispatch(clearScanState());
      dispatch(clearScanReferenceState());
      dispatch(clearSenderReceiverState());
      dispatch(clearVehicleDiagIDArrState());
      dispatch(clearVehicleDiagIDState());
      router.replace('/auth/login');
    } catch (e: any) {
      showMessage({
        message: 'Something went wrong. Please try again.',
        type: 'danger',
        floating: true,
        color: '#FFF',
        icon: 'danger',
      });
      console.log('Login error:', e.message);
    }
  };

  const handleChangePass = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      showMessage({
        message: 'Please fill in all fields.',
        type: 'warning',
        floating: true,
        color: '#FFF',
        icon: 'warning',
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      showMessage({
        message: "Password don't match.",
        type: 'warning',
        floating: true,
        color: '#FFF',
        icon: 'warning',
      });
      return;
    }

    if (newPassword.length < 8) {
      showMessage({
        message: 'Password must be at least 8 characters.',
        type: 'warning',
        floating: true,
        color: '#FFF',
        icon: 'warning',
      });
      return;
    }

    const userData = {
      newPassword: newPassword.trim(),
      currentPassword: currentPassword.trim(),
    };

    try {
      const res = await changePass(userData);

      if (res === '401') {
        showMessage({
          message: 'Wrong current password',
          type: 'warning',
          floating: true,
          color: '#FFF',
          icon: 'warning',
        });
        return;
      }

      showMessage({
        message: 'Password changed!',
        type: 'success',
        floating: true,
        color: '#FFF',
        icon: 'success',
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setModalVisible(!modalVisible);
    } catch {
      showMessage({
        message: 'Something went wrong. Please try again.',
        type: 'danger',
        floating: true,
        color: '#FFF',
        icon: 'danger',
      });
    }
  };

  const handleCancelChangePass = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setModalVisible(!modalVisible);
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header headerTitle="Profile" />
      <View style={styles.lowerBox}>
        <View style={styles.userContainer}>
          {profilePic === null && (
            <View style={[styles.profilePicWrapper, { backgroundColor: userInitialsBG }]}>
              <Text style={styles.userInitials}>{`${firstname[0]}${lastname[0]}`}</Text>
            </View>
          )}

          {profilePic !== null && (
            <View style={styles.profilePicWrapper}>
              <Image style={styles.profilePic} source={{ uri: profilePic }} width={100} height={100} />
            </View>
          )}

          <View style={styles.userNameContainer}>
            <Text style={styles.userName}>{`${firstname} ${lastname}`}</Text>
            <Text style={styles.userContact}>{`${mobileNum}`}</Text>
            {email !== null && <Text style={styles.userContact}>{`${email}`}</Text>}
          </View>
        </View>

        <View style={styles.profileTabContainer}>
          <TouchableOpacity
            style={styles.profileTab}
            onPress={() => {
              backRoute();
              router.replace('./edit-profile');
            }}
          >
            <MaterialCommunityIcons name="account-edit-outline" style={styles.icon} />
            <Text style={styles.tabName}>Edit Profile</Text>
            <MaterialIcons name="keyboard-arrow-right" style={styles.forwardIcon} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.profileTab}
            onPress={() => {
              backRoute();
              router.replace('./manage-vehicles');
            }}
          >
            <MaterialCommunityIcons name="car-outline" style={styles.icon} />
            <Text style={styles.tabName}>Manage Vehicles</Text>
            <MaterialIcons name="keyboard-arrow-right" style={styles.forwardIcon} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.profileTab} onPress={() => setModalVisible(true)}>
            <MaterialCommunityIcons name="lock-outline" style={styles.icon} />
            <Text style={styles.tabName}>Change Password</Text>
            <MaterialIcons name="keyboard-arrow-right" style={styles.forwardIcon} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.profileTab}
            onPress={() => {
              backRoute();
              router.replace('./settings');
            }}
          >
            <Ionicons name="settings-outline" style={styles.icon} />
            <Text style={styles.tabName}>Settings</Text>
            <MaterialIcons name="keyboard-arrow-right" style={styles.forwardIcon} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.profileTab} onPress={() => handleLogout()}>
            <MaterialCommunityIcons name="logout" style={[styles.icon, { color: '#780606' }]} />
            <Text style={[styles.tabName, { color: '#780606' }]}>Logout</Text>
            <MaterialIcons name="keyboard-arrow-right" style={[styles.forwardIcon, { color: '#780606' }]} />
          </TouchableOpacity>

          <Modal
            animationType="fade"
            backdropColor={'rgba(0, 0, 0, 0.5)'}
            visible={modalVisible}
            onRequestClose={() => {
              setModalVisible(false);
              setCurrentPassword('');
              setNewPassword('');
              setConfirmPassword('');
            }}
          >
            <TouchableWithoutFeedback
              onPress={() => {
                setModalVisible(false);
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
              }}
            >
              <View style={styles.centeredView}>
                <Pressable style={styles.modalView} onPress={() => {}}>
                  <Text style={styles.modalHeader}>Change Password</Text>
                  <View style={styles.textInputContainer}>
                    <Text style={styles.textInputLbl}>Current Password</Text>
                    <TextInput
                      value={currentPassword}
                      onChangeText={setCurrentPassword}
                      style={styles.input}
                      secureTextEntry
                    />
                  </View>

                  <View style={styles.textInputContainer}>
                    <Text style={styles.textInputLbl}>New Password</Text>
                    <TextInput value={newPassword} onChangeText={setNewPassword} style={styles.input} secureTextEntry />
                  </View>

                  <View style={styles.textInputContainer}>
                    <Text style={styles.textInputLbl}>Confirm New Password</Text>
                    <TextInput
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      style={styles.input}
                      secureTextEntry
                    />
                  </View>

                  <View style={styles.cancelSaveContainer}>
                    <TouchableOpacity
                      style={[styles.modalButton, { borderWidth: 1, borderColor: '#555' }]}
                      onPress={() => handleCancelChangePass()}
                    >
                      <Text style={[styles.modalButtonText, { color: '#555' }]}>Cancel</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.modalButton, { backgroundColor: '#000B58' }]}
                      onPress={() => handleChangePass()}
                    >
                      <Text style={[styles.modalButtonText, { color: '#FFF' }]}>Save</Text>
                    </TouchableOpacity>
                  </View>
                </Pressable>
              </View>
            </TouchableWithoutFeedback>
          </Modal>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  lowerBox: {
    alignItems: 'center',
    flex: 1,
  },
  userContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 50,
    width: '90%',
  },
  userNameContainer: {
    flexDirection: 'column',
    width: '65%',
  },
  userName: {
    fontFamily: 'BodyBold',
    fontSize: 20,
    color: '#333',
  },
  userContact: {
    fontFamily: 'BodyRegular',
    color: '#555',
  },
  profilePicWrapper: {
    width: 100,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 100,
  },
  userInitials: {
    fontFamily: 'HeaderBold',
    fontSize: 33,
    color: '#FFF',
  },
  profilePic: {
    borderRadius: 100,
  },
  profileTabContainer: {
    width: '100%',
    marginTop: 30,
    gap: 5,
  },
  profileTab: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EAEAEA',
    padding: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  icon: {
    fontSize: 35,
    color: '#000B58',
  },
  tabName: {
    color: '#000B58',
    fontFamily: 'BodyRegular',
    marginLeft: 10,
    width: '78%',
  },
  forwardIcon: {
    fontSize: 35,
    color: '#000B58',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalView: {
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
  },
  textInputContainer: {
    gap: 10,
    marginTop: 10,
    width: '100%',
  },
  textInputLbl: {
    fontFamily: 'BodyRegular',
    color: '#333',
  },
  input: {
    backgroundColor: '#EAEAEA',
    width: '100%',
    height: 45,
    borderRadius: 10,
    padding: 10,
    color: '#333',
    fontFamily: 'BodyRegular',
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
    fontFamily: 'HeaderBold',
  },
});

export default Profile;
