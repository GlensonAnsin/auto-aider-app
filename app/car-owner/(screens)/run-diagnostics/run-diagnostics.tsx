import { Header } from '@/components/Header';
import { Loading } from '@/components/Loading';
import { useBackRoute } from '@/hooks/useBackRoute';
import { clearDeviceState, setDeviceState } from '@/redux/slices/deviceSlice';
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
import { Buffer } from 'buffer';
import dayjs from 'dayjs';
import { useRouter } from 'expo-router';
import LottieView from 'lottie-react-native';
import { useEffect, useRef, useState } from 'react';
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
import { BleManager, Characteristic, Device } from 'react-native-ble-plx';
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
  const [devices, setDevices] = useState<Device[]>([]);
  const [connectedDevice, setConnectedDevice] = useState<Device | null>(null);
  const [log, setLog] = useState<string[]>([]);
  const [scannedDevicesVisibile, setScannedDevicesVisible] = useState<boolean>(true);
  const [discoveringDevices, setDiscoveringDevices] = useState<boolean>(false);
  const userID = useSelector((state: RootState) => state.role.ID);

  // BLE manager
  const managerRef = useRef(new BleManager());
  const stateSubscriptionRef = useRef<any>(null);
  // Notification subscription for current characteristic
  const notifySubscriptionRef = useRef<any>(null);

  // Command queue guard to prevent overlapping commands
  const commandLockRef = useRef(false);

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

  // Listen for Bluetooth state changes
  useEffect(() => {
    const manager = managerRef.current;
    stateSubscriptionRef.current = manager.onStateChange((state) => {
      if (state === 'PoweredOff') {
        setDevices([]);
        setConnectedDevice(null);
        setLog((p) => [...p, 'Bluetooth turned off']);
      }
    }, true);

    return () => {
      // Cleanup subscriptions and destroy manager
      try {
        stateSubscriptionRef.current?.remove?.();
      } catch {}
      try {
        notifySubscriptionRef.current?.remove?.();
      } catch {}
      // You may choose to destroy the manager on unmount in certain apps:
      // managerRef.current.destroy();
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

  // --- BLE helpers ---
  // Discover devices (scan)
  const discoverDevices = async () => {
    setScannedDevicesVisible(false);
    setDiscoveringDevices(true);
    const manager = managerRef.current;

    setDevices([]);
    setConnectLoading(true);
    setLog((p) => [...p, 'Scanning for BLE devices...']);

    const foundDevicesMap = new Map<string, Device>();

    // Setup scan callback
    manager.startDeviceScan(null, { allowDuplicates: false }, (error, device) => {
      if (error) {
        setConnectLoading(false);
        setLog((p) => [...p, `Scan error: ${error.message || error}`]);
        return;
      }
      if (!device) return;

      // Heuristic: many OBD BLE adapters include 'OBD' in name or 'ELM'
      const name = device.name ?? '';
      if (
        name.toUpperCase().includes('OBD') ||
        name.toUpperCase().includes('ELM') ||
        name.toUpperCase().includes('VEEPEAK')
      ) {
        if (!foundDevicesMap.has(device.id)) {
          foundDevicesMap.set(device.id, device);
          setDevices(Array.from(foundDevicesMap.values()));
        }
      }
      // Optionally include all devices:
      // if (!foundDevicesMap.has(device.id)) { foundDevicesMap.set(device.id, device); setDevices([...foundDevicesMap.values()]); }
    });

    setTimeout(() => {
      manager.stopDeviceScan();
      setConnectLoading(false);
      setLog((p) => [...p, `Scan finished. ${foundDevicesMap.size} device(s) found.`]);
      if (foundDevicesMap.size === 0) {
        showMessage({
          message: 'No OBD BLE devices found. Make sure the adapter is powered and near the phone.',
          type: 'warning',
          floating: true,
          color: '#FFF',
          icon: 'warning',
          duration: 5000,
        });
      }
      setScannedDevicesVisible(true);
      setDiscoveringDevices(false);
    }, 8000);
  };

  // Utility: find a writable & notifiable characteristic pair
  const findReadWriteCharacteristics = async (device: Device) => {
    // returns { serviceUUID, writeUUID, notifyUUID } or null
    try {
      const services = await device.services();
      for (const svc of services) {
        const characteristics = await svc.characteristics();
        let writeChar: Characteristic | null = null;
        let notifyChar: Characteristic | null = null;

        for (const ch of characteristics) {
          if (!writeChar && (ch.isWritableWithResponse || ch.isWritableWithoutResponse)) {
            writeChar = ch;
          }
          if (!notifyChar && ch.isNotifiable) {
            notifyChar = ch;
          }
        }

        if (writeChar && notifyChar) {
          console.log(`SVC: ${svc.uuid}`);
          console.log(`writeChar: ${writeChar.uuid}`);
          console.log(`notifyChar: ${notifyChar.uuid}`);
          return {
            serviceUUID: svc.uuid,
            writeUUID: writeChar.uuid,
            notifyUUID: notifyChar.uuid,
          };
        }
      }
      return null;
    } catch (e) {
      console.error('findReadWriteCharacteristics error', e);
      return null;
    }
  };

  // Connect to device (BLE)
  const connectToDevice = async (device: Device) => {
    const manager = managerRef.current;
    try {
      setConnectLoading(true);
      setLog((p) => [...p, `Connecting to ${device.name ?? device.id}...`]);
      const connected = await device.connect();
      // Discover services & characteristics
      await connected.discoverAllServicesAndCharacteristics();
      setConnectedDevice(connected);
      dispatch(setDeviceState(connected)); // adapt type to your slice

      // Find usable characteristics
      const pair = await findReadWriteCharacteristics(connected);
      if (!pair) {
        showMessage({
          message: 'Could not find suitable characteristics (write/notify).',
          type: 'danger',
          floating: true,
          color: '#FFF',
          icon: 'danger',
        });
        setConnectLoading(false);
        return;
      }

      // Subscribe to notifications using device.monitorCharacteristicForService
      const { serviceUUID, notifyUUID } = pair;
      // Clear previous subscription if any
      try {
        notifySubscriptionRef.current?.remove?.();
      } catch {}
      notifySubscriptionRef.current = manager.monitorCharacteristicForDevice(
        connected.id,
        serviceUUID,
        notifyUUID,
        (error, char) => {
          if (error) {
            setLog((p) => [...p, `Notify error: ${error.message || error}`]);
            return;
          }
          if (!char?.value) return;
          const chunk = Buffer.from(char.value, 'base64').toString('ascii');
          setLog((p) => [...p, `RX: ${chunk.trim()}`]);
          // Store incoming data into a temporary rx buffer on the device object for reads
          // Attach rxBuffer to device (works but be careful with types)
          // @ts-ignore
          connected.rxBuffer = (connected.rxBuffer ?? '') + chunk;
        }
      );

      // Initialize ELM-like adapter
      await sendCommand('ATZ');
      await sendCommand('ATE0');
      await sendCommand('ATS0');
      await sendCommand('ATH0');

      setLog((p) => [...p, 'Connected!']);
    } catch (e) {
      console.error('Connection failed:', e);
      showMessage({
        message: 'Connection failed. Please ensure the device is an OBD2 BLE adapter and in range.',
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

  // Send ASCII command and wait for a response that contains '>' prompt or newline.
  // It will use the first writable characteristic it finds for the connected device.
  const sendCommand = async (cmd: string, timeout = 2000): Promise<string | null> => {
    if (!connectedDevice) return null;

    // Simple lock to avoid overlapping commands
    while (commandLockRef.current) {
      await new Promise((r) => setTimeout(r, 20));
    }
    commandLockRef.current = true;

    try {
      // Ensure services & characteristics discovered
      await connectedDevice.discoverAllServicesAndCharacteristics();
      const pair = await findReadWriteCharacteristics(connectedDevice);
      if (!pair) throw new Error('No writable/notifiable characteristic pair found.');

      const { serviceUUID, writeUUID } = pair;
      // Write command (ELM expects CR terminated)
      const toSend = `${cmd}\r`;
      const base64cmd = Buffer.from(toSend, 'ascii').toString('base64');

      setLog((p) => [...p, `TX: ${cmd}`]);

      // Clear rxBuffer
      // @ts-ignore
      connectedDevice.rxBuffer = '';

      // Write
      await connectedDevice.writeCharacteristicWithResponseForService(serviceUUID, writeUUID, base64cmd);

      // Wait for response until '>' prompt or timeout
      const start = Date.now();
      while (Date.now() - start < timeout) {
        // @ts-ignore
        const rx = connectedDevice.rxBuffer ?? '';
        if (rx.includes('>')) {
          // Return full buffer
          const result = rx;
          // Clear rxBuffer
          // @ts-ignore
          connectedDevice.rxBuffer = '';
          return result;
        }
        await new Promise((r) => setTimeout(r, 50));
      }

      // timed out: return whatever we have (may be empty)
      // @ts-ignore
      const leftover = connectedDevice.rxBuffer ?? '';
      // Clear rxBuffer
      // @ts-ignore
      connectedDevice.rxBuffer = '';
      return leftover || null;
    } catch (e) {
      console.error('sendCommand error', e);
      return null;
    } finally {
      commandLockRef.current = false;
    }
  };

  // Read Codes flow: send '03', wait, parse, interpret
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

    try {
      await sendCommand('03', 3000); // Request stored DTCs
      // Wait a short while and then read rxBuffer content (sendCommand already consumed buffer but in case)
      // As fallback, try to call sendCommand('03') and inspect reply returned
      const res = await sendCommand('03', 3000);
      if (res) {
        console.log(`Raw: ${res}`);
        const converted = res.toString();
        console.log(`Converted: ${converted}`);
        const parsed = await parseDTCResponse(converted);
        console.log(`Parsed: ${parsed}`);
        if (parsed?.length === 0) {
          setScanLoading(false);
          setIsNoCodeDetected(true);
        } else {
          await handleCodeInterpretation(parsed);
        }
      } else {
        setScanLoading(false);
        setIsNoCodeDetected(true);
      }
    } catch (e) {
      console.error('readCodes error', e);
      showMessage({
        message: 'Failed to read codes.',
        type: 'danger',
        floating: true,
        color: '#FFF',
        icon: 'danger',
      });
    } finally {
      setScanLoading(false);
    }
  };

  const parseDTCResponse = async (raw: string): Promise<string[]> => {
    const clean = raw.replace(/\s|\r|\n|>/g, '');

    if (clean.includes('NODATA')) {
      console.log('No DTCs available.');
      return []; // Return an empty array to indicate no data
    }

    const clean2 = clean.slice(2);

    console.log(`Clean: ${clean2}`);

    if (!clean2.startsWith('43')) return [];

    const dtcBytes = clean2.slice(2);

    const dtcs: string[] = [];
    for (let i = 0; i < dtcBytes.length; i += 4) {
      const chunk = dtcBytes.slice(i, i + 4);
      if (chunk.length < 4 || chunk === '0000') continue;
      console.log(`Chunk: ${chunk}`);
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

  const disconnectToDevice = async () => {
    try {
      setConnectLoading(true);
      if (connectedDevice) {
        try {
          await connectedDevice.cancelConnection();
        } catch {}
      }
      setConnectedDevice(null);
      dispatch(clearDeviceState());
      setLog((p) => [...p, 'Disconnected!']);
    } catch {
      showMessage({
        message: 'Something went wrong. Please try again.',
        type: 'danger',
        floating: true,
        color: '#FFF',
        icon: 'danger',
      });
    } finally {
      setConnectLoading(false);
    }
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
            {connectedDevice && (
              <TouchableOpacity
                style={[styles.scanDevButton, { backgroundColor: '#780606' }]}
                onPress={() => disconnectToDevice()}
              >
                <Text style={styles.scanDevButtonText}>Disconnect</Text>
              </TouchableOpacity>
            )}

            {!connectedDevice && (
              <>
                <TouchableOpacity
                  style={styles.scanDevButton}
                  onPress={() => discoverDevices()}
                  disabled={discoveringDevices}
                >
                  <Text style={styles.scanDevButtonText}>Discover Devices</Text>
                </TouchableOpacity>

                {scannedDevicesVisibile && (
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
                        <Text style={styles.noDevicesText}>No devices</Text>
                      </View>
                    )}
                    keyExtractor={(item) => item.id}
                  />
                )}
              </>
            )}
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
              <Text style={styles.bulletedText}>
                A BLE OBD-II device is required to use this feature. We recommend using the Veepeak OBDCheck BLE.
              </Text>
            </View>
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
                Select a car to scan. Make sure that the car details are correct as this will affect result&apos;s the
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
