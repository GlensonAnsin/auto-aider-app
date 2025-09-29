import { Header } from '@/components/Header';
import { auth } from '@/config/firebaseConfig';
import { signInWithPhoneNumber } from 'firebase/auth';
import { useState } from 'react';
import { Button, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const ForgotPass = () => {
  const [phoneNum, setPhoneNum] = useState<string>('');
  const [confirm, setConfirm] = useState<any>(null);
  const [code, setCode] = useState<string>('');

  const sendVerification = async () => {
    const confirmation = await signInWithPhoneNumber(auth, phoneNum);
    setConfirm(confirmation);
  };

  const verifyCode = async () => {
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
        <TextInput placeholder="+63..." value={phoneNum} onChangeText={setPhoneNum} />
        <Button title="Send Code" onPress={() => sendVerification()} />
        <TextInput placeholder="Enter Code" value={code} onChangeText={setCode} />
        <Button title="Confirm Code" onPress={() => verifyCode()} />
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
});

export default ForgotPass;
