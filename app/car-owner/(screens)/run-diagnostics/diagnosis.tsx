import { Header } from '@/components/Header';
import { Loading } from '@/components/Loading';
import { useBackRoute } from '@/hooks/useBackRoute';
import { clearDeviceState } from '@/redux/slices/deviceSlice';
import { popRouteState } from '@/redux/slices/routeSlice';
import { setVehicleDiagIDState } from '@/redux/slices/vehicleDiagIDSlice';
import { RootState } from '@/redux/store';
import { getOnVehicleDiagnostic, getScannedVehicle } from '@/services/backendApi';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Device } from 'react-native-ble-plx';
import { showMessage } from 'react-native-flash-message';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useDispatch, useSelector } from 'react-redux';

const Diagnosis = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const backRoute = useBackRoute('/car-owner/(screens)/run-diagnostics/diagnosis');
  const [codeInterpretation, setCodeInterpretation] = useState<
    { vehicleDiagnosticID: number; dtc: string; technicalDescription: string }[]
  >([]);
  const [scannedVehicle, setScannedVehicle] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const vehicleID: number | null = useSelector((state: RootState) => state.scan.vehicleID);
  const scanReference: string | null = useSelector((state: RootState) => state.scan.scanReference);
  const connectedDevice: Device | null = useSelector((state: RootState) => state.device.device);
  const routes: any[] = useSelector((state: RootState) => state.route.route);

  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);

        const res1 = await getScannedVehicle(vehicleID ?? 0);
        setScannedVehicle(`${res1.year} ${res1.make} ${res1.model}`);

        const res2 = await getOnVehicleDiagnostic(vehicleID ?? 0, scanReference ?? '');
        if (res2) {
          setCodeInterpretation(
            res2.map((item: any) => ({
              vehicleDiagnosticID: item.vehicle_diagnostic_id,
              dtc: item.dtc,
              technicalDescription: item.technical_description,
            }))
          );
        }
      } catch (e) {
        console.error('Error: ', e);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [vehicleID, scanReference]);

  const disconnectToDevice = async () => {
    try {
      if (connectedDevice) {
        try {
          await connectedDevice.cancelConnection();
        } catch {}
      }
      dispatch(clearDeviceState());
      console.log('Disconnected!');
      router.replace(routes[routes.length - 1]);
      dispatch(popRouteState());
    } catch {
      showMessage({
        message: 'Something went wrong. Please try again.',
        type: 'danger',
        floating: true,
        color: '#FFF',
        icon: 'danger',
      });
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header headerTitle="Diagnosis" />
      <ScrollView>
        <View style={styles.lowerBox}>
          <View style={styles.buttonContainer}>
            <Text style={styles.car}>{scannedVehicle}</Text>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: '#780606' }]}
              onPress={() => disconnectToDevice()}
            >
              <Icon name="close-circle-outline" style={styles.buttonIcon} />
              <Text style={styles.buttonText}>Disconnect</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: '#000B58' }]}
              onPress={() => {
                router.replace(routes[routes.length - 1]);
                dispatch(popRouteState());
              }}
            >
              <Icon name="radiobox-marked" style={styles.buttonIcon} />
              <Text style={styles.buttonText}>Start another diagnosis</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.troubleCodesContainer}>
            <Text style={styles.troubleCodesLbl}>Detected Trouble Codes</Text>

            {[...codeInterpretation]
              .sort((a, b) => a.vehicleDiagnosticID - b.vehicleDiagnosticID)
              .map((item) => (
                <TouchableOpacity
                  key={item.vehicleDiagnosticID}
                  style={styles.troubleCodeButton}
                  onPress={() => {
                    dispatch(setVehicleDiagIDState(item.vehicleDiagnosticID));
                    backRoute();
                    router.replace('./detailed-report');
                  }}
                >
                  <Text style={styles.troubleCodeText}>{item.dtc}</Text>
                  <Text style={styles.troubleCodeText2}>{item.technicalDescription}</Text>
                </TouchableOpacity>
              ))}
          </View>

          <TouchableOpacity
            style={styles.findShopButton}
            onPress={() => {
              backRoute();
              router.replace('/car-owner/(screens)/repair-shops/repair-shops');
            }}
          >
            <Text style={styles.findShopButtonText}>Find Repair Shop</Text>
          </TouchableOpacity>
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
    alignItems: 'center',
    marginTop: 30,
    flex: 1,
    marginBottom: 80,
  },
  buttonContainer: {
    width: '90%',
    gap: 10,
  },
  car: {
    fontFamily: 'BodyBold',
    fontSize: 20,
    color: '#333',
    textAlign: 'center',
  },
  button: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 20,
    borderRadius: 8,
  },
  buttonIcon: {
    fontSize: 30,
    color: '#FFF',
  },
  buttonText: {
    color: '#FFF',
    fontFamily: 'BodyBold',
    fontSize: 16,
  },
  troubleCodesContainer: {
    width: '90%',
    marginTop: 40,
  },
  labelContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  troubleCodesLbl: {
    fontFamily: 'BodyBold',
    fontSize: 16,
    color: '#333',
  },
  clearButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearButtonText: {
    fontFamily: 'BodyRegular',
    color: '#000B58',
    fontSize: 16,
  },
  troubleCodeButton: {
    backgroundColor: '#fff',
    width: '100%',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    borderRadius: 5,
    padding: 10,
  },
  troubleCodeText: {
    fontFamily: 'BodyBold',
    color: '#780606',
  },
  troubleCodeText2: {
    fontFamily: 'BodyRegular',
    color: '#555',
  },
  findShopButton: {
    width: 150,
    padding: 10,
    backgroundColor: '#000B58',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    marginTop: 10,
    marginBottom: 20,
  },
  findShopButtonText: {
    fontFamily: 'HeaderBold',
    color: '#FFF',
  },
});

export default Diagnosis;
