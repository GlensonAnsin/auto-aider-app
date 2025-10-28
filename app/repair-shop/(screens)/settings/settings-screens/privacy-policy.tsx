import { Header } from '@/components/Header';
import PrivacyPolicyComp from '@/components/PrivacyPolicyComp';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const PrivacyPolicy = () => {
  return (
    <SafeAreaView style={styles.container}>
      <Header headerTitle="Privacy Policy" />
      <ScrollView>
        <View style={styles.lowerBox}>
          <PrivacyPolicyComp />
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
    alignSelf: 'center',
    marginTop: 20,
    marginBottom: 80,
    width: '90%',
  },
});

export default PrivacyPolicy;
