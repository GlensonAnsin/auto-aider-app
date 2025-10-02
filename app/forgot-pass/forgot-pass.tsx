import { Header } from '@/components/Header';
import { getAuth, signInWithPhoneNumber } from '@react-native-firebase/auth';
import { Checkbox } from 'expo-checkbox';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const ForgotPass = () => {
  const [selectedAuthType, setSelectedAuthType] = useState<string>('sms');
  const [phoneNum, setPhoneNum] = useState<string>('');
  const [confirm, setConfirm] = useState<any>(null);
  const [code, setCode] = useState<string>('');

  const authType = ['sms', 'email'];

  const sendSMSVerification = async () => {
    try {
      const confirmation = await signInWithPhoneNumber(getAuth(), phoneNum);
      setConfirm(confirmation);
      console.log('Verification sent!');
    } catch (e) {
      console.error('Failed to send verification:', e);
    }
  };

  const verifySMSCode = async () => {
    try {
      await confirm.confirm(code);
      console.log('Phone number verified!');
    } catch {
      console.log('Invalid code');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header headerTitle="Account Recovery" />
      <View style={styles.lowerBox}>
        <Text style={styles.subHeader}>Select ways to reset your password:</Text>
        <Checkbox
          value={selectedAuthType.includes('sms')}
          onValueChange={() => {}}
          color={authType ? '#000B58' : undefined}
        />
        <Text style={styles.checkboxTxt}>SMS</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  lowerBox: {},
  subHeader: {},
  checkboxTxt: {},
});

export default ForgotPass;
