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
  }, [vehicleID, scanReference, router]);

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
          <View style={styles.vehicleInfoCard}>
            <Icon name="car" size={32} color="#000B58" />
            <View style={styles.vehicleInfoTextContainer}>
              <Text style={styles.vehicleLabel}>Scanned Vehicle</Text>
              <Text style={styles.car}>{scannedVehicle}</Text>
            </View>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={[styles.button, styles.disconnectButton]} onPress={() => disconnectToDevice()}>
              <Icon name="close-circle-outline" style={styles.buttonIcon} />
              <Text style={styles.buttonText}>Disconnect</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.primaryButton]}
              onPress={() => {
                router.replace(routes[routes.length - 1]);
                dispatch(popRouteState());
              }}
            >
              <Icon name="radar" style={styles.buttonIcon} />
              <Text style={styles.buttonText}>Start another diagnosis</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.troubleCodesContainer}>
            <View style={styles.troubleCodesHeader}>
              <Icon name="alert-circle" size={24} color="#DC2626" />
              <Text style={styles.troubleCodesLbl}>Detected Trouble Codes</Text>
              <View style={styles.troubleCodeBadge}>
                <Text style={styles.troubleCodeCount}>{codeInterpretation.length}</Text>
              </View>
            </View>

            {[...codeInterpretation]
              .sort((a, b) => a.vehicleDiagnosticID - b.vehicleDiagnosticID)
              .map((item, index) => (
                <TouchableOpacity
                  key={item.vehicleDiagnosticID}
                  style={styles.troubleCodeButton}
                  onPress={() => {
                    dispatch(setVehicleDiagIDState(item.vehicleDiagnosticID));
                    backRoute();
                    router.replace('./detailed-report');
                  }}
                >
                  <View style={styles.troubleCodeHeader}>
                    <View style={styles.troubleCodeNumberBadge}>
                      <Text style={styles.troubleCodeNumber}>{index + 1}</Text>
                    </View>
                    <Text style={styles.troubleCodeText}>{item.dtc}</Text>
                    <Icon name="chevron-right" size={20} color="#9CA3AF" style={styles.chevronIcon} />
                  </View>
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
            <Icon name="store-search" size={20} color="#FFF" />
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
    marginTop: 20,
    flex: 1,
    marginBottom: 80,
  },
  buttonContainer: {
    width: '90%',
    gap: 10,
    marginTop: 16,
  },
  car: {
    fontFamily: 'BodyBold',
    fontSize: 18,
    color: '#1F2937',
  },
  button: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 16,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
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
    marginTop: 24,
  },
  troubleCodesLbl: {
    fontFamily: 'BodyBold',
    fontSize: 18,
    color: '#1F2937',
  },
  troubleCodeButton: {
    backgroundColor: '#fff',
    width: '100%',
    marginBottom: 10,
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
    borderRadius: 10,
    padding: 14,
    borderLeftWidth: 4,
    borderLeftColor: '#DC2626',
  },
  troubleCodeText: {
    fontFamily: 'BodyBold',
    color: '#DC2626',
    fontSize: 15,
  },
  troubleCodeText2: {
    fontFamily: 'BodyRegular',
    color: '#6B7280',
    fontSize: 14,
    marginTop: 6,
    lineHeight: 20,
  },
  findShopButton: {
    width: 180,
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#000B58',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    borderRadius: 25,
    marginTop: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  findShopButtonText: {
    fontFamily: 'HeaderBold',
    color: '#FFF',
    fontSize: 15,
  },
  vehicleInfoCard: {
    width: '90%',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  vehicleInfoTextContainer: {
    flex: 1,
  },
  vehicleLabel: {
    fontFamily: 'BodyRegular',
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  disconnectButton: {
    backgroundColor: '#DC2626',
  },
  primaryButton: {
    backgroundColor: '#000B58',
  },
  troubleCodesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  troubleCodeBadge: {
    backgroundColor: '#FEE2E2',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginLeft: 'auto',
  },
  troubleCodeCount: {
    fontFamily: 'BodyBold',
    fontSize: 12,
    color: '#DC2626',
  },
  troubleCodeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 6,
  },
  troubleCodeNumberBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  troubleCodeNumber: {
    fontFamily: 'BodyBold',
    fontSize: 12,
    color: '#DC2626',
  },
  chevronIcon: {
    marginLeft: 'auto',
  },
});

export default Diagnosis;
