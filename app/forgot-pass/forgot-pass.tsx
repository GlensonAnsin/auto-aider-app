import { Header } from '@/components/Header';
import { popRouteState } from '@/redux/slices/routeSlice';
import { RootState } from '@/redux/store';
import { checkNumOrEmailCO, checkNumOrEmailRS, generateOtp, resetPassCO } from '@/services/backendApi';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  AppState,
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
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useDispatch, useSelector } from 'react-redux';

const ForgotPass = () => {
  const dispatch = useDispatch();
  const router = useRouter();
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
  const [showNewPassword, setShowNewPassword] = useState<boolean>(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState<boolean>(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [timer, setTimer] = useState<number>(45);
  const endRef = useRef<number>(Date.now() + timer * 1000);
  const [isTimerActivate, setIsTimerActivate] = useState<boolean>(false);
  const prefix = '09';

  const roles = [
    { title: 'Car Owner', icon: 'car-outline' },
    { title: 'Repair Shop', icon: 'tools' },
  ];

  useEffect(() => {
    if (selectedAuthType === 'sms') {
      setTimer(45);
    } else {
      setTimer(300);
    }
  }, [selectedAuthType]);

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

    if (!/^[0-9]*$/.test(text)) {
      setPhoneNum(prefix);
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
          message: 'Invalid number.',
          type: 'warning',
          floating: true,
          color: '#FFF',
          icon: 'warning',
        });
        return;
      }
    } else {
      if (!emailPattern.test(email)) {
        showMessage({
          message: 'Invalid email format.',
          type: 'warning',
          color: '#FFF',
          floating: true,
          icon: 'warning',
        });
        return;
      }
    }

    try {
      setSendCodeLoading(true);
      if (selectedRole === 'Car Owner') {
        const res1 = await checkNumOrEmailCO(phoneNum.trim(), email.trim(), selectedAuthType);

        if (!res1.isExist) {
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

        const res2 = await generateOtp(phoneNum.trim(), email.trim(), selectedAuthType, selectedRole, 'reset-password');
        setConfirm(res2);
        showMessage({
          message: 'Verification sent!',
          type: 'success',
          floating: true,
          color: '#FFF',
          icon: 'success',
        });
      } else {
        const res1 = await checkNumOrEmailRS(phoneNum.trim(), email.trim(), selectedAuthType);

        if (!res1.isExist) {
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

        const res2 = await generateOtp(phoneNum.trim(), email.trim(), selectedAuthType, selectedRole, 'reset-password');
        setConfirm(res2);
        showMessage({
          message: 'Verification sent!',
          type: 'success',
          floating: true,
          color: '#FFF',
          icon: 'success',
        });
      }

      setTimeout(() => {
        setVerificationModalVisible(true);
        startTimer();
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
      setSendCodeLoading(false);
    }
  };

  const handleResendCode = async () => {
    try {
      setConfirmCodeLoading(true);
      if (selectedRole === 'Car Owner') {
        const res1 = await checkNumOrEmailCO(phoneNum.trim(), email.trim(), selectedAuthType);

        if (!res1.isExist) {
          startTimer();
          return;
        }

        const res2 = await generateOtp(phoneNum.trim(), email.trim(), selectedAuthType, selectedRole, 'reset-password');
        setConfirm(res2);
      } else {
        const res1 = await checkNumOrEmailRS(phoneNum.trim(), email.trim(), selectedAuthType);

        if (!res1.isExist) {
          startTimer();
          return;
        }

        const res2 = await generateOtp(phoneNum.trim(), email.trim(), selectedAuthType, selectedRole, 'reset-password');
        setConfirm(res2);
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
        color: '#FFF',
        icon: 'danger',
      });
      setTimeout(() => {
        router.push('/error/server-error');
      }, 2000);
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
          <View style={styles.welcomeSection}>
            <Icon name="lock-reset" size={60} color="#000B58" />
            <Text style={styles.welcomeTitle}>Reset Your Password</Text>
            <Text style={styles.welcomeSubtitle}>
              Don&apos;t worry! Enter your details below and we&apos;ll send you a verification code to reset your
              password.
            </Text>
          </View>

          <View style={styles.formContainer}>
            <Text style={styles.sectionTitle}>Select Account Type</Text>
            <View style={styles.chooseButtonContainer}>
              {roles.map((item) => (
                <TouchableOpacity
                  key={item.title}
                  style={[
                    styles.roleCard,
                    {
                      backgroundColor: selectedRole === item.title ? '#000B58' : '#fff',
                      borderColor: selectedRole === item.title ? '#000B58' : '#E5E7EB',
                    },
                  ]}
                  onPress={() => setSelectedRole(item.title)}
                >
                  <Icon name={item.icon} size={28} color={selectedRole === item.title ? '#fff' : '#6B7280'} />
                  <Text style={[styles.roleCardText, { color: selectedRole === item.title ? '#fff' : '#374151' }]}>
                    {item.title}
                  </Text>
                  {selectedRole === item.title && (
                    <View style={styles.selectedIndicator}>
                      <Icon name="check-circle" size={20} color="#fff" />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.sectionTitle}>Authentication Method</Text>

            <View style={styles.authMethodContainer}>
              <TouchableOpacity
                style={[
                  styles.authMethodCard,
                  {
                    backgroundColor: selectedAuthType === 'sms' ? '#EBF4FF' : '#F9FAFB',
                    borderColor: selectedAuthType === 'sms' ? '#000B58' : '#E5E7EB',
                  },
                ]}
                onPress={() => {
                  setSelectedAuthType('sms');
                  setEmail('');
                }}
              >
                <View style={styles.authMethodHeader}>
                  <Icon name="message-text" size={24} color={selectedAuthType === 'sms' ? '#000B58' : '#6B7280'} />
                  <Text style={[styles.authMethodTitle, { color: selectedAuthType === 'sms' ? '#000B58' : '#374151' }]}>
                    SMS Verification
                  </Text>
                  {selectedAuthType === 'sms' && <Icon name="check-circle" size={20} color="#000B58" />}
                </View>
                <Text style={styles.authMethodDescription}>We&apos;ll send a code to your phone number</Text>

                <View
                  style={[
                    styles.inputContainer,
                    {
                      backgroundColor: selectedAuthType === 'sms' ? '#fff' : '#F3F4F6',
                      opacity: selectedAuthType === 'sms' ? 1 : 0.6,
                    },
                  ]}
                >
                  <Icon name="phone" size={20} color="#6B7280" style={styles.inputIcon} />
                  <TextInput
                    value={phoneNum}
                    onChangeText={handlePhoneNumInputChange}
                    keyboardType="number-pad"
                    maxLength={11}
                    readOnly={selectedAuthType !== 'sms'}
                    placeholder="09XXXXXXXXX"
                    placeholderTextColor="#9CA3AF"
                    style={[
                      styles.enhancedInput,
                      {
                        backgroundColor: selectedAuthType === 'sms' ? '#fff' : '#F3F4F6',
                        opacity: selectedAuthType === 'sms' ? 1 : 0.6,
                      },
                    ]}
                  />
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.authMethodCard,
                  {
                    backgroundColor: selectedAuthType === 'email' ? '#EBF4FF' : '#F9FAFB',
                    borderColor: selectedAuthType === 'email' ? '#000B58' : '#E5E7EB',
                  },
                ]}
                onPress={() => {
                  setSelectedAuthType('email');
                  setPhoneNum('09');
                }}
              >
                <View style={styles.authMethodHeader}>
                  <Icon name="email" size={24} color={selectedAuthType === 'email' ? '#000B58' : '#6B7280'} />
                  <Text
                    style={[styles.authMethodTitle, { color: selectedAuthType === 'email' ? '#000B58' : '#374151' }]}
                  >
                    Email Verification
                  </Text>
                  {selectedAuthType === 'email' && <Icon name="check-circle" size={20} color="#000B58" />}
                </View>
                <Text style={styles.authMethodDescription}>We&apos;ll send a code to your email address</Text>

                <View
                  style={[
                    styles.inputContainer,
                    {
                      backgroundColor: selectedAuthType === 'email' ? '#fff' : '#F3F4F6',
                      opacity: selectedAuthType === 'email' ? 1 : 0.6,
                    },
                  ]}
                >
                  <Icon name="email-outline" size={20} color="#6B7280" style={styles.inputIcon} />
                  <TextInput
                    value={email}
                    onChangeText={setEmail}
                    placeholder="example@gmail.com"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="email-address"
                    readOnly={selectedAuthType !== 'email'}
                    style={[
                      styles.enhancedInput,
                      {
                        backgroundColor: selectedAuthType === 'email' ? '#fff' : '#F3F4F6',
                        opacity: selectedAuthType === 'email' ? 1 : 0.6,
                      },
                    ]}
                  />
                </View>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.enhancedSendButton, sendCodeLoading && styles.sendButtonDisabled]}
              onPress={() => handleSendCode()}
              disabled={sendCodeLoading}
            >
              <View style={styles.buttonContent}>
                {sendCodeLoading ? (
                  <>
                    <ActivityIndicator size="small" color="#FFF" />
                    <Text style={styles.sendButtonText}>Sending...</Text>
                  </>
                ) : (
                  <>
                    <Icon name="send" size={20} color="#FFF" />
                    <Text style={styles.sendButtonText}>Send Verification Code</Text>
                  </>
                )}
              </View>
            </TouchableOpacity>

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

                <View style={styles.enhancedModalView}>
                  <View style={styles.modalIconContainer}>
                    <Icon
                      name={selectedAuthType === 'sms' ? 'cellphone-message' : 'email-check'}
                      size={48}
                      color="#000B58"
                    />
                  </View>
                  <Text style={styles.modalHeader}>Verification Required</Text>
                  <Text style={styles.modalText}>
                    We&apos;ve sent a 6-digit verification code to your{' '}
                    {selectedAuthType === 'sms' ? 'phone number' : 'email address'}.
                  </Text>
                  <View style={styles.enhancedCodeInputContainer}>
                    {otp.map((digit, index) => (
                      <TextInput
                        key={index}
                        style={[
                          styles.codeInput,
                          digit && styles.codeInputFilled,
                          !isTimerActivate && styles.codeInputDisabled,
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
                      <ActivityIndicator size="large" color="#000B58" />
                      <Text style={styles.modalLoadingText}>Verifying code...</Text>
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

            <Modal
              animationType="fade"
              transparent={true}
              visible={resetPassModalVisible}
              onRequestClose={() => setResetPassModalVisible(false)}
            >
              <View style={styles.modalOverlay}>
                <TouchableWithoutFeedback onPress={() => setResetPassModalVisible(false)}>
                  <View style={styles.modalBackground} />
                </TouchableWithoutFeedback>

                <View style={styles.enhancedModalView}>
                  <View style={styles.modalIconContainer}>
                    <Icon name="lock-reset" size={40} color="#000B58" />
                  </View>
                  <Text style={styles.modalHeader}>Create New Password</Text>
                  <Text style={styles.modalText}>
                    Enter a strong password that you&apos;ll remember. Your password must be at least 8 characters long.
                  </Text>

                  <View style={styles.enhancedPassInputContainer}>
                    <Text style={styles.enhancedInputLabel}>New Password</Text>
                    <View style={styles.enhancedPasswordInputContainer}>
                      <Icon name="lock-outline" size={20} color="#6B7280" style={styles.inputIcon} />
                      <TextInput
                        value={newPass}
                        onChangeText={setNewPass}
                        placeholder="Enter new password"
                        placeholderTextColor="#9CA3AF"
                        style={styles.enhancedPasswordInput}
                        secureTextEntry={!showNewPassword}
                      />
                      <TouchableOpacity
                        style={styles.eyeIconButton}
                        onPress={() => setShowNewPassword(!showNewPassword)}
                      >
                        <Icon name={showNewPassword ? 'eye-off' : 'eye'} size={20} color="#6B7280" />
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View style={styles.enhancedPassInputContainer}>
                    <Text style={styles.enhancedInputLabel}>Confirm New Password</Text>
                    <View style={styles.enhancedPasswordInputContainer}>
                      <Icon name="lock-check-outline" size={20} color="#6B7280" style={styles.inputIcon} />
                      <TextInput
                        value={confirmNewPass}
                        onChangeText={setConfirmNewPass}
                        placeholder="Confirm new password"
                        placeholderTextColor="#9CA3AF"
                        style={styles.enhancedPasswordInput}
                        secureTextEntry={!showConfirmNewPassword}
                      />
                      <TouchableOpacity
                        style={styles.eyeIconButton}
                        onPress={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                      >
                        <Icon name={showConfirmNewPassword ? 'eye-off' : 'eye'} size={20} color="#6B7280" />
                      </TouchableOpacity>
                    </View>
                  </View>

                  {error.length > 0 && (
                    <View style={styles.errorContainer}>
                      <MaterialCommunityIcons name="alert-circle" size={18} color="#DC2626" />
                      <Text style={styles.errorMessage}>{error}</Text>
                    </View>
                  )}

                  <View style={styles.modalButtonContainer}>
                    <TouchableOpacity
                      style={[styles.primaryButton, resetPassLoading && styles.buttonDisabled]}
                      onPress={() => handleResetPass()}
                      disabled={resetPassLoading}
                    >
                      <View style={styles.buttonContent}>
                        {resetPassLoading ? (
                          <ActivityIndicator size="small" color="#FFF" />
                        ) : (
                          <Icon name="lock-reset" size={16} color="#FFF" />
                        )}
                        <Text style={styles.primaryButtonText}>
                          {resetPassLoading ? 'Resetting...' : 'Reset Password'}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
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
    backgroundColor: '#f2f4f7',
  },
  lowerBox: {
    width: '90%',
    alignSelf: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 20,
  },
  welcomeSection: {
    alignItems: 'center',
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  welcomeTitle: {
    fontSize: 28,
    fontFamily: 'HeaderBold',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: 16,
    fontFamily: 'BodyRegular',
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  formContainer: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'HeaderBold',
    color: '#1F2937',
    marginBottom: 16,
  },
  chooseButtonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  roleCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    position: 'relative',
    minHeight: 80,
    justifyContent: 'center',
  },
  roleCardText: {
    fontFamily: 'BodyRegular',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  selectedIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  authMethodContainer: {
    gap: 16,
    marginBottom: 24,
  },
  authMethodCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
  },
  authMethodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  authMethodTitle: {
    fontSize: 16,
    fontFamily: 'BodyBold',
    flex: 1,
    marginLeft: 12,
  },
  authMethodDescription: {
    fontSize: 14,
    fontFamily: 'BodyRegular',
    color: '#6B7280',
    marginBottom: 12,
    marginLeft: 36,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginLeft: 36,
  },
  inputIcon: {
    marginLeft: 12,
  },
  enhancedInput: {
    flex: 1,
    height: 44,
    paddingHorizontal: 12,
    fontSize: 16,
    borderRadius: 8,
    fontFamily: 'BodyRegular',
    color: '#1F2937',
  },
  enhancedSendButton: {
    backgroundColor: '#000B58',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000B58',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sendButtonDisabled: {
    backgroundColor: '#9CA3AF',
    shadowOpacity: 0,
    elevation: 0,
  },
  sendButtonText: {
    fontFamily: 'BodyBold',
    color: '#fff',
    fontSize: 16,
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
  enhancedModalView: {
    backgroundColor: '#FFF',
    width: '90%',
    maxWidth: 400,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  modalIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 60,
    backgroundColor: '#E0E7FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  modalHeader: {
    fontSize: 22,
    fontFamily: 'HeaderBold',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalText: {
    fontFamily: 'BodyRegular',
    color: '#555',
    marginBottom: 16,
    textAlign: 'center',
    lineHeight: 22,
    fontSize: 15,
  },
  enhancedCodeInputContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  codeInput: {
    width: 45,
    height: 55,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
    textAlign: 'center',
    fontSize: 20,
    fontFamily: 'HeaderBold',
    color: '#333',
    padding: 10,
  },
  codeInputFilled: {
    backgroundColor: '#E0E7FF',
    borderColor: '#000B58',
  },
  codeInputDisabled: {
    backgroundColor: '#F3F4F6',
    borderColor: '#D1D5DB',
    opacity: 0.6,
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  timerText: {
    fontSize: 14,
    fontFamily: 'BodyRegular',
    color: '#F59E0B',
  },
  timerTextReady: {
    color: '#10B981',
  },
  modalLoadingContainer: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 16,
  },
  modalLoadingText: {
    fontFamily: 'BodyRegular',
    fontSize: 14,
    color: '#6B7280',
    marginTop: 12,
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
  enhancedPassInputContainer: {
    width: '100%',
    marginBottom: 16,
  },
  enhancedInputLabel: {
    fontSize: 14,
    fontFamily: 'BodyBold',
    color: '#374151',
    marginBottom: 8,
  },
  enhancedPasswordInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    height: 48,
  },
  enhancedPasswordInput: {
    flex: 1,
    paddingHorizontal: 12,
    fontSize: 16,
    fontFamily: 'BodyRegular',
    color: '#1F2937',
  },
  eyeIconButton: {
    padding: 12,
  },
  modalButtonContainer: {
    width: '100%',
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#000B58',
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    fontFamily: 'BodyBold',
    color: '#fff',
    fontSize: 16,
  },
  secondaryButton: {
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  secondaryButtonText: {
    fontFamily: 'BodyBold',
    color: '#000B58',
    fontSize: 16,
  },
  buttonDisabled: {
    opacity: 0.6,
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
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    zIndex: 10,
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

export default ForgotPass;
