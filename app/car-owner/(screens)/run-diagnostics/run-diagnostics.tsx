import { Header } from '@/components/Header';
import { Loading } from '@/components/Loading';
import { useBackRoute } from '@/hooks/useBackRoute';
import { setScanState } from '@/redux/slices/scanSlice';
import { setTabState } from '@/redux/slices/tabBarSlice';
import { addVehicleDiagnostic, getVehicle } from '@/services/backendApi';
import { codeMeaning, codePossibleCauses, codeRecommendedRepair, codeTechnicalDescription } from '@/services/geminiApi';
import { generateReference } from '@/services/generateReference';
import socket from '@/services/socket';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import dayjs from 'dayjs';
import { useRouter } from 'expo-router';
import LottieView from 'lottie-react-native';
import { useEffect, useState } from 'react';
import {
  FlatList,
  LogBox,
  ScrollView,
  StyleSheet,
  Text,
  TouchableHighlight,
  TouchableOpacity,
  View,
} from 'react-native';
import RNBluetoothClassic, { BluetoothDevice } from 'react-native-bluetooth-classic';
import { showMessage } from 'react-native-flash-message';
import { SafeAreaView } from 'react-native-safe-area-context';
import SelectDropdown from 'react-native-select-dropdown';
import { useDispatch } from 'react-redux';

LogBox.ignoreLogs([
  'VirtualizedLists should never be nested inside plain ScrollViews with the same orientation because it can break windowing and other functionality - use another VirtualizedList-backed container instead.',
]);

const RunDiagnostics = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const backRoute = useBackRoute('/car-owner/(screens)/run-diagnostics/run-diagnostics');
  const [selectedCar, setSelectedCar] = useState<string>('');
  const [selectedCarID, setSelectedCarID] = useState<number | undefined>(undefined);
  const [vehicles, setVehicles] = useState<{ id: number; make: string; model: string; year: string }[]>([]);
  const [DTC, setDTC] = useState<string[]>([]);
  const [scanLoading, setScanLoading] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [devices, setDevices] = useState<BluetoothDevice[]>([]);
  const [connectedDevice, setConnectedDevice] = useState<BluetoothDevice | null>(null);
  const [log, setLog] = useState<string[]>([]);

  RNBluetoothClassic.onBluetoothDisabled(() => setDevices([]));

  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        const res = await getVehicle();
        const vehicleInfo = res.map((v: { vehicle_id: number; make: string; model: string; year: string }) => ({
          id: v.vehicle_id,
          make: v.make,
          model: v.model,
          year: v.year,
        }));
        setVehicles(vehicleInfo);
      } catch (e) {
        console.error('Error: ', e);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.on('updatedVehicleList', ({ updatedVehicleList }) => {
      const vehicleInfo = updatedVehicleList.map(
        (v: { vehicle_id: number; make: string; model: string; year: string }) => ({
          id: v.vehicle_id,
          make: v.make,
          model: v.model,
          year: v.year,
        })
      );
      setVehicles(vehicleInfo);
    });

    return () => {
      socket.off('updatedVehicleList');
    };
  }, []);

  const handleCodeTechnicalDescription = async (code: string) => {
    try {
      const res = await codeTechnicalDescription(code, selectedCar);
      console.log(`TD: ${res}`);
      return res;
    } catch (e) {
      console.error('Error getting technical description: ', e);
    }
  };

  const handleCodeMeaning = async (code: string, TD: string) => {
    try {
      const res = await codeMeaning(code, TD, selectedCar);
      console.log(`M: ${res}`);
      return res;
    } catch (e) {
      console.error('Error code meaning: ', e);
    }
  };

  const handleCodePossibleCauses = async (code: string, TD: string) => {
    try {
      const res = await codePossibleCauses(code, TD, selectedCar);
      console.log(`PC: ${res}`);
      return res;
    } catch (e) {
      console.error('Error getting possible causes: ', e);
    }
  };

  const handleRecommendedRepair = async (code: string, TD: string) => {
    try {
      const res = await codeRecommendedRepair(code, TD, selectedCar);
      console.log(`RR: ${res}`);
      return res;
    } catch (e) {
      console.error('Error getting recommended repair: ', e);
    }
  };

  const handleCodeInterpretation = async () => {
    if (selectedCar === '') {
      showMessage({
        message: 'Please select a car.',
        type: 'warning',
        floating: true,
        color: '#FFF',
        icon: 'warning',
      });
      return;
    }

    if (!connectedDevice) {
      showMessage({
        message: 'OBD2 connection is required.',
        type: 'warning',
        floating: true,
        color: '#FFF',
        icon: 'warning',
      });
      return;
    }

    try {
      dispatch(setTabState(false));
      setScanLoading(true);

      const scanReference = generateReference();
      dispatch(
        setScanState({
          vehicleID: parseInt(String(selectedCarID ?? 0)),
          scanReference: scanReference,
        })
      );

      const date = dayjs().format();
      for (const code of DTC) {
        const TD = await handleCodeTechnicalDescription(code);

        if (!TD) throw new Error('Failed to get technical description');

        const M = await handleCodeMeaning(code, TD);
        const PC = await handleCodePossibleCauses(code, TD);
        const RR = await handleRecommendedRepair(code, TD);

        const vehicleDiagnosticData = {
          vehicle_diagnostic_id: null,
          vehicle_id: selectedCarID ?? 0,
          dtc: code,
          technical_description: TD ?? '',
          meaning: M ?? '',
          possible_causes: PC ?? '',
          recommended_repair: RR ?? '',
          date: date,
          scan_reference: scanReference,
          vehicle_issue_description: null,
          is_deleted: false,
        };

        await addVehicleDiagnostic(vehicleDiagnosticData);
      }

      setSelectedCarID(undefined);
      setSelectedCar('');
      setDTC([]);
      setScanLoading(false);
      backRoute();
      router.replace('./diagnosis');
    } catch (e) {
      console.error('Error: ', e);
    } finally {
      setScanLoading(false);
      dispatch(setTabState(true));
    }
  };

  const discoverDevices = async () => {
    const bluetoothStatus = await RNBluetoothClassic.isBluetoothEnabled();
    if (!bluetoothStatus) {
      showMessage({
        message: 'Bluetooth is off.',
        type: 'warning',
        floating: true,
        color: '#FFF',
        icon: 'warning',
      });
      return;
    }

    try {
      const bonded = await RNBluetoothClassic.getBondedDevices();
      console.log(bonded);
      setDevices(bonded);
    } catch (e) {
      console.error('Discovery failed:', e);
    }
  };

  const connectToDevice = async (device: BluetoothDevice) => {
    try {
      await device.connect();
      setConnectedDevice(device);

      device.onDataReceived((event: any) => {
        setLog((prev) => [...prev, `RX: ${event.data.trim()}`]);
      });

      console.log('Connected!');
      await sendCommand('ATZ');
      await sendCommand('ATE0');
      await sendCommand('ATS0');
      await sendCommand('ATH0');
    } catch (e) {
      console.error('Connection failed', e);
    }
  };

  const sendCommand = async (cmd: string) => {
    if (!connectedDevice) return;
    await connectedDevice?.write(`${cmd}\r`);
    setLog((prev) => [...prev, `TX: ${cmd}`]);
  };

  const readCodes = async () => {
    if (!connectedDevice) return;
    await sendCommand('03');

    setTimeout(async () => {
      const res = await connectedDevice.read();
      if (res) {
        const parsed = parseDTCResponse(res.toString());
        setDTC(parsed);
      }
    }, 1000);
  };

  const clearCodes = async () => {
    if (!connectedDevice) return;
    await sendCommand('04');
    setDTC([]);
  };

  const parseDTCResponse = (raw: string): string[] => {
    const clean = raw.replace(/\s|\r|\n|>/g, '');
    if (!clean.startsWith('43')) return [];

    const dtcBytes = clean.slice(2);

    const dtcs: string[] = [];
    for (let i = 0; i < dtcBytes.length; i += 4) {
      const chunk = dtcBytes.slice(i, i + 4);
      if (chunk.length < 4 || chunk === '0000') continue;
      dtcs.push(decodeDTC(chunk));
    }
    return dtcs;
  };

  const decodeDTC = (hex: string): string => {
    const b1 = parseInt(hex.slice(0, 2), 16);
    const b2 = parseInt(hex.slice(2, 4), 16);

    const firstCharIndex = (b1 & 0xc0) >> 6;
    const chars = ['P', 'C', 'B', 'U'];
    const firstChar = chars[firstCharIndex];

    const firstDigit = (b1 & 0x30) >> 4;
    const secondDigit = b1 & 0x0f;
    const thirdDigit = (b2 & 0xf0) >> 4;
    const fourthDigit = b2 & 0x0f;

    return `${firstChar}${firstDigit}${secondDigit}${thirdDigit}${fourthDigit}`;
  };

  if (isLoading) {
    return <Loading />;
  }

  if (scanLoading) {
    return (
      <View style={styles.updateLoadingContainer}>
        <LottieView
          source={require('@/assets/images/scanning.json')}
          autoPlay
          loop
          style={{
            width: 200,
            height: 200,
          }}
        />
        <Text style={styles.loadingText}>SCANNING</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <Header headerTitle="Diagnostic" />

        <View style={styles.lowerBox}>
          <View style={styles.obd2Container}>
            <TouchableOpacity style={styles.scanDevButton} onPress={() => discoverDevices()}>
              <Text style={styles.scanDevButtonText}>Scan Paired Devices</Text>
            </TouchableOpacity>
            <FlatList
              data={devices}
              style={styles.devicesContainer}
              nestedScrollEnabled={true}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.selectDeviceButton} onPress={() => connectToDevice(item)}>
                  <Text style={styles.selectDeviceButtonText}>{item.name}</Text>
                </TouchableOpacity>
              )}
              ListEmptyComponent={() => (
                <View style={styles.noDevicesContainer}>
                  <Text style={styles.noDevicesText}>Paired devices empty</Text>
                </View>
              )}
              keyExtractor={(item) => item.address}
            />
          </View>
          <View style={styles.selectCarButtonContainer}>
            <View style={styles.selectCarContainer}>
              <Text style={styles.dropdownLbl}>Vehicle</Text>
              <SelectDropdown
                data={vehicles}
                statusBarTranslucent={true}
                onSelect={(selectedItem) => {
                  setSelectedCar(`${selectedItem.year} ${selectedItem.make} ${selectedItem.model}`);
                  setSelectedCarID(selectedItem.id);
                }}
                renderButton={(selectedItem, isOpen) => (
                  <View style={styles.dropdownButtonStyle}>
                    <Text style={styles.dropdownButtonTxtStyle}>
                      {(selectedItem && `${selectedItem.year} ${selectedItem.make} ${selectedItem.model}`) ||
                        'Select vehicle'}
                    </Text>
                    <MaterialCommunityIcons
                      name={isOpen ? 'chevron-up' : 'chevron-down'}
                      style={styles.dropdownButtonArrowStyle}
                    />
                  </View>
                )}
                renderItem={(item, _index, isSelected) => (
                  <View
                    style={{
                      ...styles.dropdownItemStyle,
                      ...(isSelected && { backgroundColor: '#D2D9DF' }),
                    }}
                  >
                    <Text style={styles.dropdownItemTxtStyle}>{`${item.year} ${item.make} ${item.model}`}</Text>
                  </View>
                )}
                showsVerticalScrollIndicator={false}
                dropdownStyle={styles.dropdownMenuStyle}
              />
            </View>

            <View style={styles.buttonContainer}>
              <TouchableHighlight style={styles.scanButton} onPress={() => handleCodeInterpretation()}>
                <View style={styles.innerContainer}>
                  <Text style={styles.buttonTxt}>Scan</Text>
                </View>
              </TouchableHighlight>

              <LottieView
                source={require('@/assets/images/scan.json')}
                autoPlay
                loop
                style={{
                  width: 180,
                  height: 180,
                  zIndex: 1,
                }}
              />
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  lowerBox: {
    width: '90%',
    alignSelf: 'center',
    marginTop: 20,
    marginBottom: 100,
  },
  obd2Container: {
    width: '100%',
  },
  scanDevButton: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000B58',
    width: 180,
    padding: 10,
    borderRadius: 10,
    alignSelf: 'center',
    marginBottom: 10,
  },
  scanDevButtonText: {
    fontFamily: 'BodyRegular',
    color: '#FFF',
  },
  devicesContainer: {
    backgroundColor: '#EAEAEA',
    marginBottom: 10,
    borderRadius: 5,
    height: 120,
  },
  selectDeviceButton: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 5,
  },
  selectDeviceButtonText: {
    fontFamily: 'BodyRegular',
    color: '#333',
  },
  noDevicesContainer: {
    width: '100%',
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noDevicesText: {
    fontFamily: 'BodyRegular',
    color: '#555',
  },
  selectCarButtonContainer: {
    width: '100%',
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
  selectCarContainer: {
    width: '100%',
    alignItems: 'center',
    backgroundColor: '#000B58',
    padding: 10,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  dropdownLbl: {
    fontFamily: 'BodyRegular',
    color: '#FFF',
    marginBottom: 10,
  },
  dropdownButtonStyle: {
    width: '100%',
    height: 45,
    backgroundColor: '#EAEAEA',
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  dropdownButtonTxtStyle: {
    flex: 1,
    fontFamily: 'BodyRegular',
  },
  dropdownButtonArrowStyle: {
    fontSize: 24,
  },
  dropdownItemStyle: {
    width: '100%',
    flexDirection: 'row',
    paddingHorizontal: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
  },
  dropdownItemTxtStyle: {
    flex: 1,
    fontFamily: 'BodyRegular',
  },
  dropdownMenuStyle: {
    backgroundColor: '#EAEAEA',
    borderRadius: 10,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EAEAEA',
    height: 200,
    position: 'relative',
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  scanButton: {
    width: 100,
    height: 100,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    zIndex: 2,
  },
  innerContainer: {
    backgroundColor: '#000B58',
    width: 100,
    height: 100,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonTxt: {
    fontFamily: 'BodyBold',
    color: '#FFF',
    fontSize: 22,
  },
  updateLoadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: '#FFF',
    zIndex: 10,
  },
  loadingText: {
    fontFamily: 'BodyBold',
    fontSize: 28,
    color: '#000B58',
  },
});

export default RunDiagnostics;
