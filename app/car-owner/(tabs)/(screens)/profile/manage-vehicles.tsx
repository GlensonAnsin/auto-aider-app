import { deleteVehicle, getVehicle } from '@/services/backendApi';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { showMessage } from 'react-native-flash-message';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { io, Socket } from 'socket.io-client';

const ManageVehicles = () => {
  const router = useRouter();

  const [_socket, setSocket] = useState<Socket | null>(null);
  const [vehicles, setVehicles] = useState<{ id: number, make: string, model: string, year: string, dateAdded: string }[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await getVehicle();
        const vehicleInfo = res.map((v: { vehicle_id: number, make: string, model: string, year: string, date_added: string }) => ({
          id: v.vehicle_id,
          make: v.make,
          model: v.model,
          year: v.year,
          dateAdded: v.date_added
        }));
        setVehicles(vehicleInfo)

      } catch (e) {
        console.error('Error: ', e);
      }
    })();
  }, []);

  useEffect(() => {
    const newSocket = io(process.env.EXPO_PUBLIC_BACKEND_BASE_URL, {
      transports: ['websocket'],
    });

    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Connected to server: ', newSocket.id);
    });

    newSocket.on('vehicleDeleted', ({ vehicleID }) => {
      setVehicles((prev) => prev.filter((v) => v.id !== vehicleID));
    });

    return () => {
      newSocket.off('vehicleDeleted');
      newSocket.disconnect();
    };
  }, []);

  const handleDelete = async (vehicleID: number) => {
    try {
      await deleteVehicle(vehicleID);
      setVehicles((prev) => prev.filter((v) => v.id !== vehicleID));
      showMessage({
        message: 'Delete successful!',
        type: 'success',
        floating: true,
        color: '#fff',
        icon: 'success',
      });

    } catch (e) {
      showMessage({
        message: 'Server error',
        type: 'danger',
        floating: true,
        color: '#fff',
        icon: 'danger',
      });
    }
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <ScrollView>
          <View style={styles.upperBox}>
            <Text style={styles.header}>|  Vehicles</Text>
            <TouchableOpacity style={styles.arrowWrapper} onPress={() => router.push('/car-owner/(tabs)/(screens)/profile/profile')}>
              <Icon name='arrow-left' style={styles.arrowBack} />
            </TouchableOpacity>
          </View>

          <View style={styles.lowerBox}>
            {vehicles.length === 0 && (
              <Text style={styles.noVehiclesTxt}>-- No vehicles added --</Text>
            )}
            {vehicles?.map((item) => (
              <View key={item.id} style={styles.vehicleContainer}>
                <View style={styles.carDetailsContainer}>
                  <Text style={styles.carDetail}>{item.make} </Text>
                  <Text style={styles.carDetail}>{item.model} </Text>
                  <Text style={styles.carDetail}>{item.year}</Text>
                </View>

                <View style={styles.buttonDateContainer}>
                  <Text style={styles.dateAdded}>{`Date added: ${item.dateAdded}`}</Text>
                  <View style={styles.buttonContainer}>
                    <TouchableOpacity style={[styles.button, { backgroundColor: '#000B58' }]}>
                      <Text style={styles.buttonTxt}>View</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.button, { backgroundColor: '#780606' }]} onPress={() => handleDelete(item.id)}>
                      <Text style={styles.buttonTxt}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
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
    fontSize: 22,
    marginLeft: 50,
  },
  arrowWrapper: {
    top: 23,
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
    marginTop: 20,
    flex: 1,
  },
  noVehiclesTxt: {
    fontFamily: 'LeagueSpartan',
    fontSize: 16,
    color: '#555',
  },
  vehicleContainer: {
    backgroundColor: '#EAEAEA',
    borderRadius: 10,
    minHeight: 80,
    padding: 10,
    marginBottom: 10,
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
    flexWrap: 'wrap',
  },
  carDetail: {
    fontFamily: 'LeagueSpartan_Bold',
    fontSize: 18,
    color: '#333',
  },
  buttonDateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateAdded: {
    fontFamily: 'LeagueSpartan',
    fontSize: 14,
    color: '#555',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 5,
  },
  button: {
    width: 70,
    padding: 5,
    borderRadius: 5,
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