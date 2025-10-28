import { Header } from '@/components/Header';
import TermsOfServiceComp from '@/components/TermsOfServiceComp';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const TermsOfService = () => {
  return (
    <SafeAreaView style={styles.container}>
      <Header headerTitle="Terms of Service" />
      <ScrollView>
        <View style={styles.lowerBox}>
          <TermsOfServiceComp />
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

export default TermsOfService;
