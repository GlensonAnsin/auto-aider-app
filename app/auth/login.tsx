import { useBackRoute } from '@/hooks/useBackRoute';
import { loginRepairShop, loginUser } from '@/services/backendApi';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { showMessage } from 'react-native-flash-message';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { SafeAreaView } from 'react-native-safe-area-context';
import SelectDropdown from 'react-native-select-dropdown';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function Login() {
  const router = useRouter();
  const backRoute = useBackRoute('/auth/login');
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [role, setRole] = useState<string>('');
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);

  const roles = [
    { title: 'Car Owner', icon: 'car-outline' },
    { title: 'Repair Shop', icon: 'tools' },
  ];

  const handleLogin = async () => {
    if (isLoggingIn) return; // Prevent multiple clicks

    if (!username || !password || !role) {
      showMessage({
        message: 'Please fill out all fields.',
        type: 'warning',
        floating: true,
        color: '#FFF',
        icon: 'warning',
      });
      return;
    }

    setIsLoggingIn(true);

    if (role === 'Car Owner') {
      const userData = {
        username: username.trim(),
        password: password.trim(),
      };

      try {
        const res = await loginUser(userData);

        if (res === '401') {
          showMessage({
            message: 'Invalid credentials.',
            type: 'warning',
            floating: true,
            color: '#FFF',
            icon: 'warning',
          });
          setIsLoggingIn(false);
          return;
        }

        showMessage({
          message: 'Login successful!',
          type: 'success',
          floating: true,
          color: '#FFF',
          icon: 'success',
        });

        setTimeout(() => {
          router.replace('/car-owner');

          setUsername('');
          setPassword('');
          setRole('');
          setIsLoggingIn(false);
        }, 1000);
      } catch {
        showMessage({
          message: 'Something went wrong. Please try again.',
          type: 'danger',
          floating: true,
          color: '#FFF',
          icon: 'danger',
        });
        setIsLoggingIn(false);
      }
    } else {
      const userData = {
        username: username.trim(),
        password: password.trim(),
      };

      try {
        const res = await loginRepairShop(userData);

        if (res === '401') {
          showMessage({
            message: 'Invalid credentials.',
            type: 'warning',
            floating: true,
            color: '#FFF',
            icon: 'warning',
          });
          setIsLoggingIn(false);
          return;
        }

        showMessage({
          message: 'Login successful!',
          type: 'success',
          floating: true,
          color: '#FFF',
          icon: 'success',
        });

        setTimeout(() => {
          router.replace('/repair-shop');

          setUsername('');
          setPassword('');
          setRole('');
          setIsLoggingIn(false);
        }, 1000);
      } catch {
        showMessage({
          message: 'Something went wrong. Please try again.',
          type: 'danger',
          floating: true,
          color: '#FFF',
          icon: 'danger',
        });
        setIsLoggingIn(false);
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAwareScrollView
        contentContainerStyle={{ flex: 1, backgroundColor: '#000B58' }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.screenDesignContainer}>
          <Image source={require('../../assets/images/screen-design-1.png')} />
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.header}>Log In</Text>
          <View style={styles.textInputContainer}>
            <Text style={styles.textInputLbl}>Username</Text>
            <TextInput value={username} onChangeText={setUsername} style={styles.input} />
          </View>

          <View style={styles.textInputContainer}>
            <Text style={styles.textInputLbl}>Password</Text>
            <TextInput value={password} onChangeText={setPassword} secureTextEntry style={styles.input} />
          </View>

          <View style={styles.textInputContainer}>
            <Text style={styles.textInputLbl}>Log In as</Text>
            <SelectDropdown
              data={roles}
              defaultValue={role}
              statusBarTranslucent={true}
              onSelect={(selectedItem) => setRole(selectedItem.title)}
              renderButton={(selectedItem, isOpen) => (
                <View style={styles.dropdownButtonStyle}>
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

            <TouchableOpacity
              onPress={() => {
                backRoute();
                router.replace('/forgot-pass/forgot-pass');
              }}
            >
              <Text style={styles.forgetPassLbl}>Forgot password?</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.signupContainer}>
            <Text style={styles.questionLbl}>Don&apos;t have an account?</Text>
            <TouchableOpacity
              onPress={() => {
                backRoute();
                router.replace('/auth/signup');
              }}
            >
              <Text style={styles.signupLbl}>Sign Up</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.button, isLoggingIn && styles.buttonDisabled]}
            onPress={() => handleLogin()}
            disabled={isLoggingIn}
          >
            {isLoggingIn ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <Text style={styles.buttonTxt}>Log In</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  screenDesignContainer: {
    backgroundColor: 'transparent',
  },
  formContainer: {
    backgroundColor: '#000B58',
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    gap: 10,
  },
  header: {
    color: '#FFF',
    fontSize: 24,
    fontFamily: 'HeaderBold',
  },
  textInputContainer: {
    gap: 10,
    width: '70%',
  },
  textInputLbl: {
    color: '#FFF',
    fontFamily: 'BodyRegular',
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
  dropdownButtonStyle: {
    width: '100%',
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
    color: '#333',
    fontFamily: 'BodyRegular',
  },
  dropdownButtonArrowStyle: {
    fontSize: 24,
    color: '#333',
  },
  dropdownButtonIconStyle: {
    fontSize: 24,
    marginRight: 8,
    color: '#333',
  },
  dropdownMenuStyle: {
    backgroundColor: '#EAEAEA',
    borderRadius: 10,
  },
  dropdownItemStyle: {
    width: '100%',
    height: 45,
    flexDirection: 'row',
    paddingHorizontal: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
  },
  dropdownItemTxtStyle: {
    flex: 1,
    color: '#333',
    fontFamily: 'BodyRegular',
  },
  dropdownItemIconStyle: {
    fontSize: 24,
    marginRight: 8,
    color: '#333',
  },
  forgetPassLbl: {
    color: '#FFF',
    fontSize: 12,
    fontFamily: 'BodyRegular',
    textDecorationLine: 'underline',
  },
  questionLbl: {
    color: '#FFF',
    fontSize: 12,
    fontFamily: 'BodyRegular',
  },
  signupLbl: {
    color: '#FFF',
    fontSize: 12,
    fontFamily: 'BodyBold',
    textDecorationLine: 'underline',
  },
  signupContainer: {
    flexDirection: 'column',
    gap: 5,
    alignItems: 'center',
  },
  button: {
    width: 120,
    padding: 10,
    backgroundColor: '#D9D9D9',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    marginTop: 20,
    marginBottom: 20,
  },
  buttonDisabled: {
    backgroundColor: '#999999',
    opacity: 0.6,
  },
  buttonTxt: {
    color: '#333',
    fontFamily: 'HeaderBold',
  },
});
