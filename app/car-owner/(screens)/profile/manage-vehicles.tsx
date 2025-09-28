import { Header } from '@/components/Header';
import { Loading } from '@/components/Loading';
import { RootState } from '@/redux/store';
import { deleteVehicle, getVehicle } from '@/services/backendApi';
import socket from '@/services/socket';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { useEffect, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { showMessage } from 'react-native-flash-message';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';

const ManageVehicles = () => {
  dayjs.extend(utc);
  const [vehicles, setVehicles] = useState<
    {
      vehicleID: number;
      make: string;
      model: string;
      year: string;
      dateAdded: string;
    }[]
  >([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const userID = useSelector((state: RootState) => state.role.ID);

  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        const res = await getVehicle();

        const vehicleData: {
          vehicleID: number;
          make: string;
          model: string;
          year: string;
          dateAdded: string;
        }[] = [];

        res?.forEach((item: any) => {
          vehicleData.push({
            vehicleID: item.vehicle_id,
            make: item.make,
            model: item.model,
            year: item.year,
            dateAdded: dayjs(item.date_added).utc(true).local().format('ddd MMM DD YYYY'),
          });
        });

        setVehicles(vehicleData);
      } catch (e) {
        console.error('Error: ', e);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.on(`vehicleDeleted-CO-${userID}`, ({ vehicleID }) => {
      setVehicles((prev) => prev.filter((v) => v.vehicleID !== vehicleID));
    });

    return () => {
      socket.off(`vehicleDeleted-CO-${userID}`);
    };
  }, [userID]);

  const handleDelete = async (vehicleID: number) => {
    try {
      await deleteVehicle(vehicleID);
      setVehicles((prev) => prev.filter((v) => v.vehicleID !== vehicleID));
      showMessage({
        message: 'Delete successful!',
        type: 'success',
        floating: true,
        color: '#fff',
        icon: 'success',
      });
    } catch {
      showMessage({
        message: 'Something went wrong. Please try again.',
        type: 'danger',
        floating: true,
        color: '#fff',
        icon: 'danger',
      });
    }
  };

  const deleteVehicleAlert = (vehicleID: number) => {
    Alert.alert('Delete Vehicle', 'Are you sure you want to delete this vehicle?', [
      {
        text: 'Cancel',
        onPress: () => {},
        style: 'cancel',
      },
      {
        text: 'Yes',
        onPress: () => handleDelete(vehicleID),
      },
    ]);
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header headerTitle="Vehicles" />
      <View style={styles.lowerBox}>
        {vehicles.length === 0 && (
          <View style={styles.noHistoryContainer}>
            <MaterialCommunityIcons name="file-document-outline" size={150} color="#EAEAEA" />
            <Text style={styles.emptyText}>Empty</Text>
          </View>
        )}

        {vehicles.length !== 0 && (
          <FlatList
            data={vehicles}
            renderItem={({ item }) => (
              <View style={styles.vehicleContainer}>
                <View style={styles.carDetailsContainer}>
                  <Text style={styles.carDetail}>{`${item.year} ${item.make} ${item.model}`} </Text>
                  <Text style={styles.dateAdded}>{`Date added: ${item.dateAdded}`}</Text>
                </View>

                <View style={styles.buttonContainer}>
                  <TouchableOpacity style={[styles.button, { backgroundColor: '#000B58' }]}>
                    <Text style={styles.buttonTxt}>View</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.button, { backgroundColor: '#780606' }]}
                    onPress={() => deleteVehicleAlert(item.vehicleID)}
                  >
                    <Text style={styles.buttonTxt}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
            keyExtractor={(item) => item.vehicleID.toString()}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  lowerBox: {
    width: '90%',
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 20,
    flex: 1,
    marginBottom: 100,
  },
  noHistoryContainer: {
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: 'BodyRegular',
    color: '#EAEAEA',
    fontSize: 30,
  },
  vehicleContainer: {
    backgroundColor: '#EAEAEA',
    borderRadius: 10,
    minHeight: 80,
    padding: 10,
    marginBottom: 10,
    width: '100%',
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
    fontFamily: 'BodyBold',
    fontSize: 16,
    color: '#333',
  },
  dateAdded: {
    fontFamily: 'BodyRegular',
    fontSize: 14,
    color: '#555',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 5,
    alignSelf: 'flex-end',
    marginTop: 10,
  },
  button: {
    width: 70,
    padding: 5,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonTxt: {
    fontFamily: 'HeaderRegular',
    color: '#fff',
  },
});

export default ManageVehicles;
