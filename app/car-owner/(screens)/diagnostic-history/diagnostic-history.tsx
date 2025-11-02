import { Header } from '@/components/Header';
import { Loading } from '@/components/Loading';
import { useBackRoute } from '@/hooks/useBackRoute';
import { setScanState } from '@/redux/slices/scanSlice';
import { RootState } from '@/redux/store';
import { deleteAllVehicleDiagnostics, deleteVehicleDiagnostic, getVehicleDiagnostics } from '@/services/backendApi';
import socket from '@/services/socket';
import Entypo from '@expo/vector-icons/Entypo';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { showMessage } from 'react-native-flash-message';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';

const DiagnosticHistory = () => {
  dayjs.extend(utc);
  const router = useRouter();
  const dispatch = useDispatch();
  const backRoute = useBackRoute('/car-owner/(screens)/diagnostic-history/diagnostic-history');
  const [history, setHistory] = useState<
    {
      vehicleDiagID: number;
      vehicleID: number;
      vehicle: string;
      dtc: string;
      date: string;
      scanReference: string;
    }[]
  >([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedScanReference, setSelectedScanReference] = useState<string>('');
  const userID = useSelector((state: RootState) => state.role.ID);

  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        const res = await getVehicleDiagnostics();

        const historyData: {
          vehicleDiagID: number;
          vehicleID: number;
          vehicle: string;
          dtc: string;
          date: string;
          scanReference: string;
        }[] = [];

        res?.forEach((item: any) => {
          historyData.push({
            vehicleDiagID: item.vehicle_diagnostic_id,
            vehicleID: item.vehicle_id,
            vehicle: `${item.year} ${item.make} ${item.model}`,
            dtc: item.dtc,
            date: dayjs(item.date).utc(true).format('ddd MMM DD YYYY'),
            scanReference: item.scan_reference,
          });
        });

        setHistory(historyData);
      } catch (e) {
        console.error('Error: ', e);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.on(`vehicleDiagnosticDeleted-CO-${userID}`, ({ deletedVehicleDiag }) => {
      setHistory((prev) => prev.filter((v) => !deletedVehicleDiag.includes(v.scanReference)));
    });

    socket.on(`allVehicleDiagnosticDeleted-CO-${userID}`, ({ allDeletedVehicleDiag }) => {
      setHistory((prev) => prev.filter((v) => !allDeletedVehicleDiag.includes(v.scanReference)));
    });

    return () => {
      socket.off(`vehicleDiagnosticDeleted-CO-${userID}`);
      socket.off(`allVehicleDiagnosticDeleted-CO-${userID}`);
    };
  }, [userID]);

  const grouped = Object.values(
    history.reduce(
      (acc, item) => {
        const ref = item.scanReference;

        if (!acc[ref]) {
          acc[ref] = {
            vehicleDiagID: item.vehicleDiagID,
            vehicleID: item.vehicleID,
            vehicle: item.vehicle,
            scanReference: ref,
            date: item.date,
            dtc: [item.dtc],
          };
        } else {
          acc[ref].dtc.push(item.dtc);
        }

        return acc;
      },
      {} as Record<
        string,
        {
          vehicleDiagID: number;
          vehicleID: number;
          vehicle: string;
          scanReference: string;
          date: string;
          dtc: string[];
        }
      >
    )
  );

  const deleteVehicleDiagAlert = () => {
    Alert.alert('Delete Diagnostic', 'Are you sure you want to delete this diagnostic?', [
      {
        text: 'Cancel',
        onPress: () => {},
        style: 'cancel',
      },
      {
        text: 'Yes',
        onPress: () => handleDelete(),
      },
    ]);
  };

  const deleteAllVehicleDiagAlert = () => {
    if (grouped.length === 0) {
      return;
    }

    Alert.alert('Clear History', 'Are you sure you want to clear your history?', [
      {
        text: 'Cancel',
        onPress: () => {},
        style: 'cancel',
      },
      {
        text: 'Yes',
        onPress: () => handleDeleteAll(),
      },
    ]);
  };

  const handleDelete = async () => {
    try {
      await deleteVehicleDiagnostic(selectedScanReference);
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

  const handleDeleteAll = async () => {
    try {
      await deleteAllVehicleDiagnostics();
      showMessage({
        message: 'History cleared!',
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

  if (isLoading) {
    return <Loading />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header headerTitle="History" />
      <View style={styles.lowerBox}>
        <View style={styles.clearHistoryContainer}>
          <Text style={styles.header2}>Scanned Cars</Text>
          <TouchableOpacity style={styles.button} onPress={() => deleteAllVehicleDiagAlert()}>
            <Text style={styles.buttonTxt}>Clear history</Text>
          </TouchableOpacity>
        </View>

        {grouped.length === 0 && (
          <View style={styles.noHistoryContainer}>
            <MaterialCommunityIcons name="file-document-outline" size={150} color="#EAEAEA" />
            <Text style={styles.emptyText}>Empty</Text>
          </View>
        )}

        {grouped.length !== 0 && (
          <FlatList
            data={grouped.sort((a, b) => b.vehicleDiagID - a.vehicleDiagID)}
            style={{ width: '100%' }}
            renderItem={({ item, index }) => (
              <TouchableOpacity
                style={[styles.historyContainer, index === 0 && styles.firstChild]}
                onPress={() => {
                  dispatch(
                    setScanState({
                      vehicleID: parseInt(String(item.vehicleID)),
                      scanReference: item.scanReference,
                    })
                  );
                  backRoute();
                  router.replace('./history-detailed-report');
                }}
                onLongPress={() => {
                  deleteVehicleDiagAlert();
                  setSelectedScanReference(item.scanReference);
                }}
              >
                <Text style={styles.carDetails}>{item.vehicle}</Text>
                <Text style={styles.date}>{item.date}</Text>
                <View style={styles.codeButtonContainer}>
                  <Text style={styles.troubleCodes}>{item.dtc.join(', ')}</Text>
                  <TouchableOpacity
                    style={styles.historyButton}
                    onPress={() => {
                      dispatch(
                        setScanState({
                          vehicleID: parseInt(String(item.vehicleID)),
                          scanReference: item.scanReference,
                        })
                      );
                      backRoute();
                      router.replace('/car-owner/(screens)/repair-shops/repair-shops');
                    }}
                  >
                    <Entypo name="location" size={16} color="#FFF" />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            )}
            keyExtractor={(item) => item.scanReference}
          />
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
    alignItems: 'center',
    width: '100%',
    alignSelf: 'center',
    flex: 1,
    marginBottom: 80,
    gap: 10,
  },
  clearHistoryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '90%',
    marginTop: 20,
  },
  header2: {
    fontFamily: 'HeaderBold',
    fontSize: 18,
    color: '#333',
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonTxt: {
    fontFamily: 'HeaderRegular',
    color: '#000B58',
    fontSize: 16,
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
  historyContainer: {
    width: '90%',
    marginBottom: 10,
    alignSelf: 'center',
    backgroundColor: '#fff',
    justifyContent: 'space-between',
    padding: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  firstChild: {
    marginTop: 10,
  },
  carDetails: {
    fontFamily: 'BodyBold',
    color: '#333',
    fontSize: 16,
  },
  troubleCodes: {
    fontFamily: 'BodyRegular',
    color: '#780606',
    fontSize: 14,
  },
  date: {
    fontFamily: 'BodyRegular',
    color: '#555',
    fontSize: 14,
  },
  codeButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  historyButton: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 5,
    borderRadius: 5,
    backgroundColor: '#000B58',
  },
  noHistoriesText: {
    fontFamily: 'BodyRegular',
    color: '#555',
  },
});

export default DiagnosticHistory;
