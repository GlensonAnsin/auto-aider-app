import { Header } from '@/components/Header';
import { Loading } from '@/components/Loading';
import { setScanState } from '@/redux/slices/scanSlice';
import { deleteAllVehicleDiagnostics, deleteVehicleDiagnostic, getVehicleDiagnostics } from '@/services/backendApi';
import Entypo from '@expo/vector-icons/Entypo';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { showMessage } from 'react-native-flash-message';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch } from 'react-redux';
import { io, Socket } from 'socket.io-client';

const DiagnosticHistory = () => {
    dayjs.extend(utc);
    const router = useRouter();
    const dispatch = useDispatch();

    const [_socket, setSocket] = useState<Socket | null>(null);

    const [history, setHistory] = useState<{ vehicleID: number, vehicle: string, dtc: string, date: string, scanReference: string }[]>([])
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [selectedScanReference, setSelectedScanReference] = useState<string>('');

    useEffect(() => {
        (async () => {
            try {
                setIsLoading(true);
                const res = await getVehicleDiagnostics();

                const historyData: { vehicleID: number, vehicle: string, dtc: string, date: string, scanReference: string }[] = [];

                res?.forEach((item: any) => {
                    historyData.push({
                        vehicleID: item.vehicle_id,
                        vehicle: `${item.year} ${item.make} ${item.model}`,
                        dtc: item.dtc,
                        date: dayjs(item.date).utc(true).local().format('ddd MMM DD YYYY'),
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
        const newSocket = io(process.env.EXPO_PUBLIC_BACKEND_BASE_URL, {
            transports: ['websocket'],
        });

        setSocket(newSocket);

        newSocket.on('connect', () => {
            console.log('Connected to server: ', newSocket.id);
        });

        newSocket.on('vehicleDiagnosticDeleted', ({ deletedVehicleDiag }) => {
            setHistory((prev) => 
                prev.filter((v) => !deletedVehicleDiag.includes(v.scanReference))
            );
        });

        newSocket.on('allVehicleDiagnosticDeleted', ({ allDeletedVehicleDiag }) => {
            setHistory((prev) =>
                prev.filter((v) => !allDeletedVehicleDiag.includes(v.scanReference))
            );
        });

        return () => {
            newSocket.off('vehicleDiagnosticDeleted');
            newSocket.off('allVehicleDiagnosticDeleted');
            newSocket.disconnect();
        };
  }, []);

    const grouped = Object.values(
        history.reduce((acc, item) => {
            const ref = item.scanReference;

            if (!acc[ref]) {
                acc[ref] = {
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
        }, {} as Record<string, { vehicleID: number, vehicle: string; scanReference: string; date: string; dtc: string[]; }>)
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

        } catch (e) {
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

        } catch (e) {
            showMessage({
                message: 'Something went wrong. Please try again.',
                type: 'danger',
                floating: true,
                color: '#fff',
                icon: 'danger',
            });
        }
    }

    if (isLoading) {
        return (
            <Loading />
        )
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView>
                <Header headerTitle='History' />

                <View style={styles.lowerBox}>
                    <View style={styles.clearHistoryContainer}>
                        <Text style={styles.header2}>Scanned Cars</Text>
                        <TouchableOpacity style={styles.button} onPress={() => deleteAllVehicleDiagAlert()}>
                            <Text style={styles.buttonTxt}>Clear history</Text>
                        </TouchableOpacity>
                    </View>

                    {grouped.length === 0 && (
                        <Text style={styles.noHistoriesText}>-- No Histories --</Text>
                    )}

                    {grouped.map((item) => (
                        <View style={{ width: '100%' }} key={item.scanReference}>
                            <TouchableOpacity 
                                style={styles.historyContainer} 
                                onPress={() => {
                                    dispatch(setScanState({
                                        vehicleID: parseInt(String(item.vehicleID)),
                                        scanReference: item.scanReference,
                                    }));
                                    router.push('./history-detailed-report');
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
                                            dispatch(setScanState({
                                                vehicleID: parseInt(String(item.vehicleID)),
                                                scanReference: item.scanReference,
                                            }));
                                            router.push('/car-owner/(tabs)/(screens)/repair-shops/repair-shops');
                                        }}
                                    >
                                        <Entypo name='location' size={16} color='#FFF' />
                                    </TouchableOpacity>
                                </View>
                            </TouchableOpacity>
                        </View>
                    ))}
                </View>
            </ScrollView>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF',
    },
    lowerBox: { 
        alignItems: 'center',
        width: '90%',
        alignSelf: 'center',
        flex: 1,
        marginBottom: 100,
        gap: 10,
    },
    clearHistoryContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginTop: 20,
    },
    header2: {
        fontFamily: 'LeagueSpartan_Bold',
        fontSize: 20,
        color: '#333',
    },
    button: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonTxt: {
        fontFamily: 'LeagueSpartan',
        color: '#000B58',
        fontSize: 20,
    },
    historyContainer: {
        width: '100%',
        backgroundColor: '#EAEAEA',
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
    carDetails: {
        fontFamily: 'LeagueSpartan_Bold',
        color: '#333',
        fontSize: 18,
    },
    troubleCodes: {
        fontFamily: 'LeagueSpartan_Bold',
        color: '#780606',
        fontSize: 14,
    },
    date: {
        fontFamily: 'LeagueSpartan_Bold',
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
        backgroundColor: '#000B58'
    },
    noHistoriesText: {
        fontFamily: 'LeagueSpartan',
        fontSize: 16,
        color: '#555',
    },
})

export default DiagnosticHistory