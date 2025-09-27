import { Header } from '@/components/Header';
import { Loading } from '@/components/Loading';
import { useBackRoute } from '@/hooks/useBackRoute';
import { setDeviceState } from '@/redux/slices/deviceSlice';
import { setScanState } from '@/redux/slices/scanSlice';
import { setTabState } from '@/redux/slices/tabBarSlice';
import { RootState } from '@/redux/store';
import { addVehicleDiagnostic, getVehicle } from '@/services/backendApi';
import { codeMeaning, codePossibleCauses, codeRecommendedRepair, codeTechnicalDescription } from '@/services/geminiApi';
import { generateReference } from '@/services/generateReference';
import socket from '@/services/socket';
import AntDesign from '@expo/vector-icons/AntDesign';
import Feather from '@expo/vector-icons/Feather';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import dayjs from 'dayjs';
import { useRouter } from 'expo-router';
import LottieView from 'lottie-react-native';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
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
import { useDispatch, useSelector } from 'react-redux';

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
  const [scanLoading, setScanLoading] = useState<boolean>(false);
  const [interpretLoading, setInterpretLoading] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [connectLoading, setConnectLoading] = useState<boolean>(false);
  const [noCodeDetected, setIsNoCodeDetected] = useState<boolean>(false);
  const [devices, setDevices] = useState<BluetoothDevice[]>([]);
  const [connectedDevice, setConnectedDevice] = useState<BluetoothDevice | null>(null);
  const [log, setLog] = useState<string[]>([]);
  const userID = useSelector((state: RootState) => state.role.ID);

  RNBluetoothClassic.onBluetoothDisabled(() => {
    setDevices([]);
    setConnectedDevice(null);
  });

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

    socket.on(`updatedVehicleList-CO-${userID}`, ({ updatedVehicleList }) => {
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
      socket.off(`updatedVehicleList-CO-${userID}`);
    };
  }, [userID]);

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

  const handleCodeInterpretation = async (DTC: string[]) => {
    try {
      setScanLoading(false);
      setInterpretLoading(true);

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
      setInterpretLoading(false);
      backRoute();
      router.replace('./diagnosis');
    } catch (e) {
      console.error('Error: ', e);
    } finally {
      setInterpretLoading(false);
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
      setConnectLoading(true);
      await device.connect();
      setConnectedDevice(device);
      dispatch(setDeviceState(device));

      device.onDataReceived((event: any) => {
        setLog((prev) => [...prev, `RX: ${event.data.trim()}`]);
      });

      console.log('Connected!');
      await sendCommand('ATZ');
      await sendCommand('ATE0');
      await sendCommand('ATS0');
      await sendCommand('ATH0');
    } catch {
      showMessage({
        message: 'Connection failed. Please ensure the device is an OBD2 scanner and properly paired.',
        type: 'danger',
        floating: true,
        color: '#FFF',
        icon: 'danger',
        duration: 5000,
      });
    } finally {
      setConnectLoading(false);
    }
  };

  const sendCommand = async (cmd: string) => {
    if (!connectedDevice) return;
    await connectedDevice?.write(`${cmd}\r`);
    setLog((prev) => [...prev, `TX: ${cmd}`]);
  };

  const readCodes = async () => {
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

    dispatch(setTabState(false));
    setScanLoading(true);
    await sendCommand('03');

    setTimeout(async () => {
      const res = await connectedDevice.read();
      if (res) {
        const parsed = parseDTCResponse(res.toString());
        handleCodeInterpretation(parsed);
      } else {
        setScanLoading(false);
        setIsNoCodeDetected(true);
      }
    }, 1000);
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

  if (interpretLoading) {
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
        <Text style={styles.loadingText}>INTERPRETING</Text>
      </View>
    );
  }

  if (noCodeDetected) {
    return (
      <View style={styles.updateLoadingContainer}>
        <AntDesign name="Safety" size={100} color="#17B978" />
        <Text style={[styles.loadingText, { fontSize: 22 }]}>NO CODES DETECTED</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            setIsNoCodeDetected(false);
            dispatch(setTabState(true));
          }}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header headerTitle="Diagnostic" />
      <View style={[styles.connectionStatus, { backgroundColor: connectedDevice ? '#17B978' : '#780606' }]}>
        {connectLoading && <ActivityIndicator size="small" color="#fff" />}

        {!connectLoading && (
          <Text style={styles.connectionStatusText}>{connectedDevice ? 'Connected' : 'Not Connected'}</Text>
        )}
      </View>

      <ScrollView>
        <View style={styles.lowerBox}>
          <View style={styles.obd2Container}>
            <TouchableOpacity style={styles.scanDevButton} onPress={() => discoverDevices()}>
              <Text style={styles.scanDevButtonText}>Discover Devices</Text>
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

          <View style={styles.buttonContainer}>
            <TouchableHighlight style={styles.scanButton} onPress={() => readCodes()}>
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

          <View style={styles.infoContainer}>
            <Feather name="info" size={24} color="#333" style={styles.infoIcon} />
            <View style={styles.bulletView}>
              <Text style={styles.bullet}>{'\u2022'}</Text>
              <Text style={styles.bulletedText}>Plugin in the device. Turn on car ignition.</Text>
            </View>
            <View style={styles.bulletView}>
              <Text style={styles.bullet}>{'\u2022'}</Text>
              <Text style={styles.bulletedText}>Turn on Bluetooth and pair the device.</Text>
            </View>
            <View style={styles.bulletView}>
              <Text style={styles.bullet}>{'\u2022'}</Text>
              <Text style={styles.bulletedText}>You may also refer to the device&apos;s manual.</Text>
            </View>
            <View style={styles.bulletView}>
              <Text style={styles.bullet}>{'\u2022'}</Text>
              <Text style={styles.bulletedText}>
                Select a car to scan. Make sure that the car details are correct as this will affect result&apos;s
                accuracy.
              </Text>
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
  connectionStatus: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 2,
  },
  connectionStatusText: {
    fontFamily: 'BodyRegular',
    color: '#FFF',
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
    padding: 8,
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
    marginTop: 10,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
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
  backButton: {
    backgroundColor: '#000B58',
    padding: 5,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontFamily: 'BodyRegular',
    color: '#fff',
  },
  infoContainer: {
    marginTop: 10,
    padding: 20,
  },
  infoIcon: {
    alignSelf: 'center',
    marginBottom: 10,
  },
  bulletView: {
    width: '100%',
    flexDirection: 'row',
    gap: 10,
    paddingLeft: 5,
  },
  bullet: {
    fontFamily: 'BodyRegular',
    color: '#333',
  },
  bulletedText: {
    fontFamily: 'BodyRegular',
    color: '#333',
  },
});

export default RunDiagnostics;
