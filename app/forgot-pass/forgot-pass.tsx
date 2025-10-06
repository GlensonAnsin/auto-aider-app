import { Header } from '@/components/Header';
import { popRouteState } from '@/redux/slices/routeSlice';
import { RootState } from '@/redux/store';
import { checkNumOrEmailCO, checkNumOrEmailRS, generateOtp, resetPassCO } from '@/services/backendApi';
import { getAuth, signInWithPhoneNumber } from '@react-native-firebase/auth';
import { Checkbox } from 'expo-checkbox';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  AppState,
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
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useDispatch, useSelector } from 'react-redux';

const ForgotPass = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const auth = getAuth();
  const routes: any[] = useSelector((state: RootState) => state.route.route);
  const [selectedRole, setSelectedRole] = useState<string>('Car Owner');
  const [selectedAuthType, setSelectedAuthType] = useState<string>('sms');
  const [phoneNum, setPhoneNum] = useState<string>('09');
  const [email, setEmail] = useState<string>('');
  const [confirm, setConfirm] = useState<any>(null);
  const [otp, setOtp] = useState<string[]>(Array(6).fill(''));
  const inputs = useRef<(TextInput | null)[]>([]);
  const [verificationModalVisible, setVerificationModalVisible] = useState<boolean>(false);
  const [resetPassModalVisible, setResetPassModalVisible] = useState<boolean>(false);
  const [sendCodeLoading, setSendCodeLoading] = useState<boolean>(false);
  const [confirmCodeLoading, setConfirmCodeLoading] = useState<boolean>(false);
  const [resetPassLoading, setResetPassLoading] = useState<boolean>(false);
  const [newPass, setNewPass] = useState<string>('');
  const [confirmNewPass, setConfirmNewPass] = useState<string>('');
  const [error, setError] = useState<string>('');
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [timer, setTimer] = useState<number>(45);
  const endRef = useRef<number>(Date.now() + timer * 1000);
  const [isTimerActivate, setIsTimerActivate] = useState<boolean>(false);
  const prefix = '09';

  const roles = [
    { title: 'Car Owner', icon: 'car-outline' },
    { title: 'Repair Shop', icon: 'tools' },
  ];

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
      setPhoneNum(prefix);
    } else {
      setPhoneNum(text);
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

  const handleSendCode = async () => {
    if (phoneNum === '09' && !email) {
      showMessage({
        message: 'Please fill out the field.',
        type: 'warning',
        floating: true,
        color: '#FFF',
        icon: 'warning',
      });
      return;
    }

    if (selectedAuthType === 'sms') {
      if (phoneNum.length < 11) {
        showMessage({
          message: 'Invalid number or email.',
          type: 'warning',
          floating: true,
          color: '#FFF',
          icon: 'warning',
        });
        return;
      }
    }

    try {
      setSendCodeLoading(true);
      if (selectedRole === 'Car Owner') {
        const res = await checkNumOrEmailCO(phoneNum.trim(), email.trim(), selectedAuthType);

        if (!res.isExist) {
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
          return;
        }

        if (selectedAuthType === 'sms') {
          const intPhoneNum = phoneNum.replace(/^0/, '+63');
          const confirmation = await signInWithPhoneNumber(auth, intPhoneNum);
          setConfirm(confirmation);
          showMessage({
            message: 'Verification sent!',
            type: 'success',
            floating: true,
            color: '#FFF',
            icon: 'success',
          });
        } else {
          setTimer(300);
          const res = await generateOtp(phoneNum.trim(), email.trim(), selectedAuthType, selectedRole);
          setConfirm(res);
          showMessage({
            message: 'Verification sent!',
            type: 'success',
            floating: true,
            color: '#FFF',
            icon: 'success',
          });
        }
      } else {
        const res = await checkNumOrEmailRS(phoneNum.trim(), email.trim(), selectedAuthType);

        if (!res.isExist) {
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
          return;
        }

        if (selectedAuthType === 'sms') {
          const intPhoneNum = phoneNum.replace(/^0/, '+63');
          const confirmation = await signInWithPhoneNumber(auth, intPhoneNum);
          setConfirm(confirmation);
          showMessage({
            message: 'Verification sent!',
            type: 'success',
            floating: true,
            color: '#FFF',
            icon: 'success',
          });
        } else {
          const res = await generateOtp(phoneNum.trim(), email.trim(), selectedAuthType, selectedRole);
          setConfirm(res);
          showMessage({
            message: 'Verification sent!',
            type: 'success',
            floating: true,
            color: '#FFF',
            icon: 'success',
          });
        }
      }
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
      if (selectedRole === 'Car Owner') {
        const res = await checkNumOrEmailCO(phoneNum.trim(), email.trim(), selectedAuthType);

        if (!res.isExist) {
          startTimer();
          return;
        }

        if (selectedAuthType === 'sms') {
          const intPhoneNum = phoneNum.replace(/^0/, '+63');
          const confirmation = await signInWithPhoneNumber(auth, intPhoneNum);
          setConfirm(confirmation);
        } else {
          return;
        }
      } else {
        const res = await checkNumOrEmailRS(phoneNum.trim(), email.trim(), selectedAuthType);

        if (!res.isExist) {
          startTimer();
          return;
        }

        if (selectedAuthType === 'sms') {
          const intPhoneNum = phoneNum.replace(/^0/, '+63');
          const confirmation = await signInWithPhoneNumber(auth, intPhoneNum);
          setConfirm(confirmation);
        } else {
          return;
        }
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
      if (selectedAuthType === 'sms') {
        await confirm.confirm(otp.join(''));
      } else {
        if (otp.join('') !== confirm) {
          setError('You entered a wrong code.');
          return;
        }
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
        setResetPassModalVisible(true);
      }, 2000);
    } catch {
      setError('You entered a wrong code.');
    } finally {
      setConfirmCodeLoading(false);
    }
  };

  const handleResetPass = async () => {
    if (!newPass || !confirmNewPass) {
      setError('Please fill in all fields.');
      return;
    }
    if (newPass !== confirmNewPass) {
      setError("Password don't match.");
      return;
    }

    if (newPass.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setError('');

    try {
      setResetPassLoading(true);
      if (selectedRole === 'Car Owner') {
        await resetPassCO(phoneNum.trim(), email.trim(), selectedAuthType, newPass);
        setResetPassModalVisible(false);
        setPhoneNum('');
        setEmail('');
        showMessage({
          message: 'Password reset successful!',
          type: 'success',
          floating: true,
          color: '#fff',
          icon: 'success',
        });
        setTimeout(() => {
          router.replace(routes[routes.length - 1]);
          dispatch(popRouteState());
        }, 2000);
      }
    } catch {
      showMessage({
        message: 'Something went wrong. Please try again.',
        type: 'danger',
        floating: true,
        color: '#fff',
        icon: 'danger',
      });
    } finally {
      setConfirm(null);
      setResetPassLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header headerTitle="Account Recovery" />
      <KeyboardAwareScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <View style={styles.lowerBox}>
          <View style={styles.formContainer}>
            <View style={styles.chooseButtonContainer}>
              {roles.map((item) => (
                <View key={item.title} style={styles.chooseButtonTextContainer}>
                  <TouchableOpacity
                    style={[
                      styles.chooseButton,
                      { backgroundColor: selectedRole === item.title ? '#000B58' : '#808080' },
                    ]}
                    onPress={() => setSelectedRole(item.title)}
                  >
                    <Icon name={item.icon} size={24} color={selectedRole === item.title ? '#fff' : '#EAEAEA'} />
                    <Text
                      style={[styles.chooseButtonText, { color: selectedRole === item.title ? '#fff' : '#EAEAEA' }]}
                    >
                      {item.title}
                    </Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>

            <Text style={styles.subHeader}>Authentication type:</Text>

            <View style={styles.chooseButtonTextContainer}>
              <Checkbox
                value={selectedAuthType.includes('sms')}
                onValueChange={() => {
                  setSelectedAuthType('sms');
                  setEmail('');
                }}
                color={selectedAuthType.includes('sms') ? '#000B58' : undefined}
              />
              <Text style={styles.checkboxTxt}>SMS</Text>
            </View>
            <TextInput
              value={phoneNum}
              onChangeText={handlePhoneNumInputChange}
              keyboardType="number-pad"
              maxLength={11}
              readOnly={selectedAuthType === 'sms' ? false : true}
              style={[styles.input, { backgroundColor: selectedAuthType === 'sms' ? '#fff' : '#808080' }]}
            />

            <View style={styles.chooseButtonTextContainer}>
              <Checkbox
                value={selectedAuthType.includes('email')}
                onValueChange={() => {
                  setSelectedAuthType('email');
                  setPhoneNum('09');
                }}
                color={selectedAuthType.includes('email') ? '#000B58' : undefined}
              />
              <Text style={styles.checkboxTxt}>Email</Text>
            </View>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="example@gmail.com"
              placeholderTextColor={selectedAuthType === 'email' ? '#555' : '#EAEAEA'}
              keyboardType="email-address"
              readOnly={selectedAuthType === 'email' ? false : true}
              style={[styles.input, { backgroundColor: selectedAuthType === 'email' ? '#fff' : '#808080' }]}
            />

            <TouchableOpacity style={styles.sendButton} onPress={() => handleSendCode()}>
              <Text style={styles.sendButtonText}>Send Code</Text>
            </TouchableOpacity>

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
                    <Text style={styles.modalText}>
                      We have sent the verification code to your{' '}
                      {selectedAuthType === 'sms' ? 'number.' : 'email address.'}
                    </Text>
                    <View style={styles.codeInputContainer}>
                      {otp.map((digit, index) => (
                        <TextInput
                          key={index}
                          style={[styles.input, { width: 30, backgroundColor: '#EAEAEA' }]}
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
                      <TouchableOpacity
                        style={[styles.sendButton, { marginTop: 0 }]}
                        onPress={() => handleResendCode()}
                      >
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

            <Modal
              animationType="fade"
              backdropColor={'rgba(0, 0, 0, 0.5)'}
              visible={resetPassModalVisible}
              onRequestClose={() => setResetPassModalVisible(false)}
            >
              <TouchableWithoutFeedback onPress={() => setResetPassModalVisible(false)}>
                <View style={styles.centeredView}>
                  <Pressable style={styles.verificationModalView} onPress={() => {}}>
                    <Text style={styles.modalHeader}>Reset Password</Text>
                    <View style={styles.passInputContainer}>
                      <Text style={styles.textInputLbl}>New Password</Text>
                      <TextInput
                        value={newPass}
                        onChangeText={setNewPass}
                        style={[styles.input, { backgroundColor: '#EAEAEA' }]}
                        secureTextEntry
                      />
                    </View>
                    <View style={styles.passInputContainer}>
                      <Text style={styles.textInputLbl}>Confirm Password</Text>
                      <TextInput
                        value={confirmNewPass}
                        onChangeText={setConfirmNewPass}
                        style={[styles.input, { backgroundColor: '#EAEAEA' }]}
                        secureTextEntry
                      />
                    </View>
                    {error.length > 0 && (
                      <View style={styles.errorContainer}>
                        <Text style={styles.errorMessage}>{error}</Text>
                      </View>
                    )}

                    {resetPassLoading && (
                      <ActivityIndicator style={{ marginBottom: 10 }} size="small" color="#000B58" />
                    )}

                    <TouchableOpacity
                      style={[styles.sendButton, { marginTop: 0, width: 100 }]}
                      onPress={() => handleResetPass()}
                    >
                      <Text style={styles.sendButtonText}>Reset</Text>
                    </TouchableOpacity>
                  </Pressable>
                </View>
              </TouchableWithoutFeedback>
            </Modal>
          </View>
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
    backgroundColor: '#fff',
  },
  lowerBox: {
    width: '90%',
    alignSelf: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  formContainer: {
    backgroundColor: '#EAEAEA',
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  chooseButtonContainer: {
    flexDirection: 'row',
    gap: 10,
    alignSelf: 'center',
    marginBottom: 20,
  },
  chooseButtonTextContainer: {
    flexDirection: 'row',
    gap: 5,
    marginBottom: 10,
  },
  chooseButton: {
    flexDirection: 'row',
    gap: 5,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
  },
  chooseButtonText: {
    fontFamily: 'BodyRegular',
    color: '#333',
  },
  subHeader: {
    fontFamily: 'BodyRegular',
    color: '#333',
    marginBottom: 20,
  },
  checkboxTxt: {
    fontFamily: 'BodyRegular',
    color: '#333',
  },
  input: {
    width: '100%',
    height: 45,
    borderRadius: 10,
    padding: 10,
    color: '#333',
    fontFamily: 'BodyRegular',
    marginBottom: 20,
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
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  textInputLbl: {
    fontFamily: 'BodyRegular',
    color: '#333',
  },
  passInputContainer: {
    width: '100%',
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
});

export default ForgotPass;
