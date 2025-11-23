import { Header } from '@/components/Header';
import { Loading } from '@/components/Loading';
import { RootState } from '@/redux/store';
import { deleteVehicle, getVehicle } from '@/services/backendApi';
import socket from '@/services/socket';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { showMessage } from 'react-native-flash-message';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';

const ManageVehicles = () => {
  const router = useRouter();
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
            dateAdded: dayjs(item.date_added).utc(true).format('ddd MMM DD YYYY'),
          });
        });

        setVehicles(vehicleData);
      } catch {
        showMessage({
          message: 'Something went wrong. Please try again.',
          type: 'danger',
          floating: true,
          color: '#FFF',
          icon: 'danger',
        });
        setTimeout(() => {
          router.push('/error/server-error');
        }, 2000);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [router]);

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
            <View style={styles.emptyIconContainer}>
              <MaterialCommunityIcons name="car-off" size={80} color="#9CA3AF" />
            </View>
            <Text style={styles.emptyText}>No Vehicles</Text>
            <Text style={styles.emptySubtext}>You haven&apos;t added any vehicles yet</Text>
          </View>
        )}

        {vehicles.length !== 0 && (
          <>
            <View style={styles.headerInfoContainer}>
              <MaterialCommunityIcons name="information-outline" size={18} color="#6B7280" />
              <Text style={styles.headerInfoText}>
                {vehicles.length} {vehicles.length === 1 ? 'vehicle' : 'vehicles'} registered
              </Text>
            </View>

            <FlatList
              data={vehicles.sort((a, b) => b.vehicleID - a.vehicleID)}
              style={{ width: '100%' }}
              renderItem={({ item, index }) => (
                <View
                  style={[
                    styles.vehicleContainer,
                    index === 0 && styles.firstChild,
                    index === vehicles.length - 1 && styles.lastChild,
                  ]}
                >
                  <View style={styles.vehicleHeader}>
                    <View style={styles.vehicleIconWrapper}>
                      <MaterialCommunityIcons name="car" size={24} color="#000B58" />
                    </View>
                    <View style={styles.vehicleHeaderInfo}>
                      <Text style={styles.vehicleTitle}>
                        {item.year} {item.make}
                      </Text>
                      <Text style={styles.vehicleModel}>{item.model}</Text>
                    </View>
                  </View>

                  <View style={styles.carDetailsContainer}>
                    <View style={styles.detailRow}>
                      <MaterialCommunityIcons name="calendar-check" size={16} color="#6B7280" />
                      <Text style={styles.dateAdded}>Added on {item.dateAdded}</Text>
                    </View>
                  </View>

                  <View style={styles.actionContainer}>
                    <TouchableOpacity
                      style={[styles.button, { backgroundColor: '#DC2626' }]}
                      onPress={() => deleteVehicleAlert(item.vehicleID)}
                    >
                      <MaterialCommunityIcons name="delete-outline" size={18} color="#FFF" />
                      <Text style={styles.buttonTxt}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
              keyExtractor={(item) => item.vehicleID.toString()}
            />
          </>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f4f7',
  },
  lowerBox: {
    width: '100%',
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 10,
    flex: 1,
    paddingBottom: 60,
  },
  noHistoryContainer: {
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    backgroundColor: '#F3F4F6',
    borderRadius: 80,
    width: 140,
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyText: {
    fontFamily: 'HeaderBold',
    color: '#6B7280',
    fontSize: 24,
    marginBottom: 8,
  },
  emptySubtext: {
    fontFamily: 'BodyRegular',
    color: '#9CA3AF',
    fontSize: 15,
    textAlign: 'center',
  },
  headerInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#E0E7FF',
    borderRadius: 10,
    marginBottom: 12,
    alignSelf: 'center',
  },
  headerInfoText: {
    fontFamily: 'BodyBold',
    fontSize: 14,
    color: '#000B58',
  },
  vehicleContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    minHeight: 80,
    padding: 16,
    marginBottom: 12,
    width: '90%',
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  firstChild: {
    marginTop: 10,
  },
  lastChild: {
    marginBottom: 10,
  },
  vehicleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  vehicleIconWrapper: {
    backgroundColor: '#E0E7FF',
    borderRadius: 12,
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  vehicleHeaderInfo: {
    flex: 1,
  },
  vehicleTitle: {
    fontFamily: 'HeaderBold',
    fontSize: 18,
    color: '#111827',
    marginBottom: 2,
  },
  vehicleModel: {
    fontFamily: 'BodyRegular',
    fontSize: 15,
    color: '#6B7280',
  },
  carDetailsContainer: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 6,
  },
  dateAdded: {
    fontFamily: 'BodyRegular',
    fontSize: 14,
    color: '#6B7280',
  },
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
    minWidth: 100,
  },
  buttonTxt: {
    fontFamily: 'BodyBold',
    color: '#fff',
    fontSize: 14,
  },
});

export default ManageVehicles;
