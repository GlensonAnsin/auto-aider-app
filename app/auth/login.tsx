import api from '@/services/interceptor';
import { storeTokens } from '@/services/tokenStorage';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { showMessage } from "react-native-flash-message";
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import SelectDropdown from 'react-native-select-dropdown';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function Login() {
  const router = useRouter();

  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [role, setRole] = useState<string>('');
  
  const roles = [
    { title: 'Car Owner', icon: 'car-outline' },
    { title: 'Repair Shop', icon: 'tools' },
  ];

  const handleLogin = async () => {
    if (!username || !password || !role) {
      showMessage({
        message: 'Please fill in all fields.',
        type: 'warning',
        floating: true,
        color: '#FFF',
        icon: 'warning',
      });
      return;
    }

    if (role === 'Car Owner') {
      try {
        const res = await api.post('user/login', { username, password });

        const { accessToken, refreshToken } = res.data;
        await storeTokens(accessToken, refreshToken);

        showMessage({
          message: 'Login successful!',
          type: 'success',
          floating: true,
          color: '#FFF',
          icon: 'success',
        });

        setTimeout(() => {
          router.push('/car-owner/(tabs)');
          setUsername('');
          setPassword('');
          setRole('');
        }, 2000);

      } catch (e: any) {
        if (e.response?.status === 401) {
          showMessage({
            message: 'Invalid credentials',
            type: 'warning',
            floating: true,
            color: '#FFF',
            icon: 'warning',
          });

        } else {
          showMessage({
            message: 'Something went wrong. Please try again.',
            type: 'danger',
            floating: true,
            color: '#FFF',
            icon: 'danger',
          });
          console.log('Login error:', e.message);
        }
      }

    } else {
      return;
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
            <Image 
              source={require('../../assets/images/screen-design-1.png')}
              style={styles.screenDesign}
            />

            <View style={styles.formContainer}>
              <Text style={styles.header}>Log In</Text>
              <View style={styles.textInputContainer}>
                <Text style={styles.textInputLbl}>Username</Text>
                <TextInput
                  value={username}
                  onChangeText={setUsername}
                  style={styles.input}
                />
              </View>

              <View style={styles.textInputContainer}>
                <Text style={styles.textInputLbl}>Password</Text>
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  style={styles.input}
                />
              </View>

              <View style={styles.textInputContainer}>
                <Text style={styles.textInputLbl}>Log In as</Text>
                <SelectDropdown
                  data={roles}
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
                
                <TouchableOpacity>
                  <Text style={styles.forgetPassLbl}>Forgot password?</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.signupContainer}>
                <Text style={styles.questionLbl}>Don't have an account?</Text>
                <TouchableOpacity onPress={() => router.push('/auth/signup')}>
                  <Text style={styles.signupLbl}>Sign Up</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.button}
                onPress={() => handleLogin()}
              >
                <Text style={styles.buttonTxt}>Log In</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  screenDesign: {
    backgroundColor: '#000B58',
    width: '100%',
    height: 150,
  },
  formContainer: {
    flex: 1,
    backgroundColor: '#000B58',
    alignItems: 'center',
    gap: 20,
  },
  header: {
    color: '#FFF',
    fontSize: 28,
    fontFamily: 'LeagueSpartan_Bold',
  },
  textInputContainer: {
    gap: 10,
    width: '70%',
  },
  textInputLbl: {
    color: '#FFF',
    fontSize: 16,
    fontFamily: 'LeagueSpartan',
  },
  input: {
    backgroundColor: '#EAEAEA',
    width: '100%',
    height: 45,
    borderRadius: 10,
    padding: 10,
    fontSize: 16,
    color: '#333',
    fontFamily: 'LeagueSpartan',
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
    fontSize: 16,
    color: '#333',
    fontFamily: 'LeagueSpartan',
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
  dropdownItemIconStyle: {
    fontSize: 24,
    marginRight: 8,
    color: '#333',
  },
  forgetPassLbl: {
    color: '#FFF',
    fontSize: 14,
    fontFamily: 'LeagueSpartan',
    textDecorationLine: 'underline',
  },
  questionLbl: {
    color: '#FFF',
    fontSize: 14,
    fontFamily: 'LeagueSpartan',
  },
  signupLbl: {
    color: '#FFF',
    fontSize: 14,
    fontFamily: 'LeagueSpartan_Bold',
    textDecorationLine: 'underline',
  },
  signupContainer: {
    flexDirection: 'column',
    gap: 5,
    alignItems: 'center',
  },
  button: {
    width: '40%',
    height: 45,
    backgroundColor: '#D9D9D9',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    marginTop: 20,
    marginBottom: 20,
  },
  buttonTxt: {
    fontSize: 16,
    color: '#333',
    fontFamily: 'LeagueSpartan_Bold',
  },
})
