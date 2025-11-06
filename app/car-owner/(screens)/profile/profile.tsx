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
import { clearRole, clearTokens } from '@/services/tokenStorage';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
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
import { useDispatch } from 'react-redux';

const Profile = () => {
  dayjs.extend(utc);
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
  const [memberSince, setMemberSince] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [userInitialsBG, setUserInitialsBG] = useState<string>('');
  const [showCurrentPassword, setShowCurrentPassword] = useState<boolean>(false);
  const [showNewPassword, setShowNewPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

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
        setMemberSince(dayjs(res.creation_date).utc(true).format('YYYY'));
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

  const handleLogout = async () => {
    try {
      await clearTokens();
      await clearRole();
      dispatch(clearRoleState());
      dispatch(clearRouteState());
      dispatch(clearScanState());
      dispatch(clearScanReferenceState());
      dispatch(clearSenderReceiverState());
      dispatch(clearVehicleDiagIDArrState());
      dispatch(clearVehicleDiagIDState());
      router.replace('/auth/login');
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
    }
  };

  const handleChangePass = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('Please fill out all fields.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Password don't match.");
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    const userData = {
      newPassword: newPassword.trim(),
      currentPassword: currentPassword.trim(),
    };

    try {
      const res = await changePass(userData);

      if (res === '401') {
        setError('Wrong current password');
        return;
      }

      setModalVisible(!modalVisible);
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
    } catch {
      setError('Something went wrong. Please try again.');
    }
  };

  const handleCancelChangePass = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    setModalVisible(!modalVisible);
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header headerTitle="Profile" />
      <ScrollView>
        <View style={styles.lowerBox}>
          <View style={styles.userContainer}>
            <View style={styles.profileImageSection}>
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

              <View style={styles.statusBadge}>
                <MaterialCommunityIcons name="check-circle" size={16} color="#10B981" />
                <Text style={styles.statusText}>Active</Text>
              </View>
            </View>

            <View style={styles.userNameContainer}>
              <Text style={styles.userName}>{`${firstname} ${lastname}`}</Text>
              <View style={styles.contactRow}>
                <MaterialCommunityIcons name="phone" size={16} color="#6B7280" />
                <Text style={styles.userContact}>{`${mobileNum}`}</Text>
              </View>
              {email !== null && (
                <View style={styles.contactRow}>
                  <MaterialCommunityIcons name="email" size={16} color="#6B7280" />
                  <Text style={styles.userContact}>{`${email}`}</Text>
                </View>
              )}
              <View style={styles.memberSince}>
                <MaterialCommunityIcons name="calendar" size={14} color="#9CA3AF" />
                <Text style={styles.memberSinceText}>Member since {memberSince}</Text>
              </View>
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
              <View style={styles.tabIconContainer}>
                <MaterialCommunityIcons name="account-edit-outline" style={styles.icon} />
              </View>
              <View style={styles.tabContent}>
                <Text style={styles.tabName}>Edit Profile</Text>
                <Text style={styles.tabDescription}>Update your personal information</Text>
              </View>
              <MaterialIcons name="keyboard-arrow-right" style={styles.forwardIcon} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.profileTab}
              onPress={() => {
                backRoute();
                router.replace('./manage-vehicles');
              }}
            >
              <View style={styles.tabIconContainer}>
                <MaterialCommunityIcons name="car-outline" style={styles.icon} />
              </View>
              <View style={styles.tabContent}>
                <Text style={styles.tabName}>Manage Vehicles</Text>
                <Text style={styles.tabDescription}>View registered vehicles</Text>
              </View>
              <MaterialIcons name="keyboard-arrow-right" style={styles.forwardIcon} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.profileTab} onPress={() => setModalVisible(true)}>
              <View style={styles.tabIconContainer}>
                <MaterialCommunityIcons name="lock-outline" style={styles.icon} />
              </View>
              <View style={styles.tabContent}>
                <Text style={styles.tabName}>Change Password</Text>
                <Text style={styles.tabDescription}>Update your account security</Text>
              </View>
              <MaterialIcons name="keyboard-arrow-right" style={styles.forwardIcon} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.profileTab}
              onPress={() => {
                backRoute();
                router.replace('./settings');
              }}
            >
              <View style={styles.tabIconContainer}>
                <Ionicons name="settings-outline" style={styles.icon} />
              </View>
              <View style={styles.tabContent}>
                <Text style={styles.tabName}>Settings</Text>
                <Text style={styles.tabDescription}>Preferences and notifications</Text>
              </View>
              <MaterialIcons name="keyboard-arrow-right" style={styles.forwardIcon} />
            </TouchableOpacity>

            <TouchableOpacity style={[styles.profileTab, styles.logoutTab]} onPress={() => handleLogout()}>
              <View style={styles.tabIconContainer}>
                <MaterialCommunityIcons name="logout" style={[styles.icon, { color: '#780606' }]} />
              </View>
              <View style={styles.tabContent}>
                <Text style={[styles.tabName, { color: '#780606' }]}>Logout</Text>
                <Text style={[styles.tabDescription, { color: '#DC2626' }]}>Sign out of your account</Text>
              </View>
              <MaterialIcons name="keyboard-arrow-right" style={[styles.forwardIcon, { color: '#780606' }]} />
            </TouchableOpacity>

            <Modal
              animationType="fade"
              transparent={true}
              visible={modalVisible}
              onRequestClose={() => {
                setModalVisible(false);
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
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
                          <MaterialCommunityIcons
                            name={showNewPassword ? 'eye-off' : 'eye'}
                            size={20}
                            color="#6B7280"
                          />
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

                    {error.length > 0 && (
                      <View style={styles.errorContainer}>
                        <MaterialCommunityIcons name="alert-circle" size={18} color="#DC2626" />
                        <Text style={styles.errorMessage}>{error}</Text>
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
                      onPress={() => handleChangePass()}
                    >
                      <MaterialCommunityIcons name="check" size={18} color="#FFF" />
                      <Text style={styles.profileButtonText}>Save</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </Modal>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f4f7',
  },
  lowerBox: {
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: 16,
    marginBottom: 80,
  },
  userContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 30,
    width: '100%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  profileImageSection: {
    alignItems: 'center',
    position: 'relative',
  },
  userNameContainer: {
    flexDirection: 'column',
    flex: 1,
    marginLeft: 16,
  },
  userName: {
    fontFamily: 'BodyBold',
    fontSize: 22,
    color: '#333',
    marginBottom: 4,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 8,
  },
  userContact: {
    fontFamily: 'BodyRegular',
    color: '#555',
    fontSize: 15,
  },
  memberSince: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 6,
  },
  memberSinceText: {
    fontFamily: 'BodyRegular',
    color: '#9CA3AF',
    fontSize: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
    gap: 4,
  },
  statusText: {
    fontFamily: 'BodyBold',
    color: '#10B981',
    fontSize: 12,
  },
  profilePicWrapper: {
    width: 100,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 100,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
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
    marginTop: 24,
    gap: 8,
  },
  profileTab: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  logoutTab: {
    borderLeftWidth: 4,
    borderLeftColor: '#DC2626',
  },
  tabIconContainer: {
    width: 50,
    alignItems: 'center',
  },
  tabContent: {
    flex: 1,
    marginLeft: 12,
  },
  icon: {
    fontSize: 28,
    color: '#000B58',
  },
  tabName: {
    color: '#000B58',
    fontFamily: 'BodyBold',
    fontSize: 16,
    marginBottom: 2,
  },
  tabDescription: {
    color: '#6B7280',
    fontFamily: 'BodyRegular',
    fontSize: 13,
  },
  forwardIcon: {
    fontSize: 24,
    color: '#000B58',
  },
  passwordInput: {
    flex: 1,
    padding: 12,
    color: '#333',
    fontFamily: 'BodyRegular',
    fontSize: 15,
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#F9FAFB',
  },
  saveButton: {
    backgroundColor: '#000B58',
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

export default Profile;
