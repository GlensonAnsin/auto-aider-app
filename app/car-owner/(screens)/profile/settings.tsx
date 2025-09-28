import { Header } from '@/components/Header';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SettingsTab() {
  return (
    <SafeAreaView style={styles.container}>
      <Header headerTitle="Settings" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    backgroundColor: '#000B58',
    justifyContent: 'center',
    alignItems: 'center',
    height: 63,
  },
  arrowHeaderContainer: {
    flexDirection: 'row',
    width: '90%',
    alignItems: 'center',
    gap: 10,
  },
  arrowWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    color: '#FFF',
    fontFamily: 'HeaderBold',
    fontSize: 18,
  },
});
