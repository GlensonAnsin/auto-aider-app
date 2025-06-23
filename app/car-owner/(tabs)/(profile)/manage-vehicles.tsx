import { useRouter } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const ManageVehicles = () => {
  const router = useRouter();

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <View style={styles.upperBox}>
          <Text style={styles.header}>|  VEHICLES</Text>
          <TouchableOpacity style={styles.arrowWrapper} onPress={() => router.push('/car-owner/(tabs)/(profile)/profile')}>
            <Icon name='arrow-left' style={styles.arrowBack} />
          </TouchableOpacity>
        </View>

        <View style={styles.lowerBox}>
          <View style={styles.vehicleContainer}>
            <View style={styles.carDetailsContainer}>
              <Text style={styles.carDetail}>Toyota </Text>
              <Text style={styles.carDetail}>Fortuner </Text>
              <Text style={styles.carDetail}>2025</Text>
            </View>

            <TouchableOpacity style={styles.button}>
              <Text style={styles.buttonTxt}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  upperBox: {
    backgroundColor: '#000B58',
    justifyContent: 'center',
    alignItems: 'flex-start',
    height: 63,
  },
  header: {
    color: '#fff',
    fontFamily: 'LeagueSpartan_Bold',
    fontSize: 24,
    marginLeft: 50,
  },
  arrowWrapper: {
    top: 21,
    right: 320,
    position: 'absolute',
  },
  arrowBack: {
    fontSize: 24,
    color: '#fff',
  },
  lowerBox: {
    backgroundColor: '#fff',
    alignItems: 'center',
    flex: 1,
  },
  vehicleContainer: {
    backgroundColor: '#EAEAEA',
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 80,
    padding: 10,
    marginTop: 20,
    width: '90%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  carDetailsContainer: {
    flexDirection: 'row',
    width: '65%',
    flexWrap: 'wrap',
  },
  carDetail: {
    fontFamily: 'LeagueSpartan_Bold',
    fontSize: 20,
    color: '#000B58',
  },
  button: {
    width: 100,
    height: 45,
    backgroundColor: 'red',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonTxt: {
    fontSize: 16,
    fontFamily: 'LeagueSpartan_Bold',
    color: '#fff',
  },
})

export default ManageVehicles