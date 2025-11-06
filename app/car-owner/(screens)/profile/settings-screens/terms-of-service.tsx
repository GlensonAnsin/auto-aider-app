import { Header } from '@/components/Header';
import TermsOfServiceComp from '@/components/TermsOfServiceComp';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const TermsOfService = () => {
  return (
    <SafeAreaView style={styles.container}>
      <Header headerTitle="Terms of Service" />
      <ScrollView>
        <View style={styles.lowerBox}>
          <View style={styles.introCard}>
            <View style={styles.iconContainer}>
              <MaterialCommunityIcons name="file-document-outline" size={32} color="#000B58" />
            </View>
            <Text style={styles.introTitle}>Legal Agreement</Text>
            <Text style={styles.introText}>
              Please read these terms and conditions carefully before using the Auto AIDER application
            </Text>
          </View>

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
  introCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E0E7FF',
  },
  iconContainer: {
    backgroundColor: '#E0E7FF',
    borderRadius: 50,
    width: 70,
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  introTitle: {
    fontFamily: 'HeaderBold',
    fontSize: 20,
    color: '#111827',
    marginBottom: 8,
  },
  introText: {
    fontFamily: 'BodyRegular',
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default TermsOfService;
