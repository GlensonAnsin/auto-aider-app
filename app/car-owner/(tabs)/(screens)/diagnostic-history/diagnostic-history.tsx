import { Header } from '@/components/Header';
import { Loading } from '@/components/Loading';
import { setScanState } from '@/redux/slices/scanSlice';
import { getVehicleDiagnostics } from '@/services/backendApi';
import Entypo from '@expo/vector-icons/Entypo';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch } from 'react-redux';

const DiagnosticHistory = () => {
    const router = useRouter();
    const dispatch = useDispatch();

    const [history, setHistory] = useState<{ vehicleID: number, vehicle: string, dtc: string, date: Date, scanReference: string }[]>([])
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [modalVisible, setModalVisible] = useState<boolean>(false);

    useEffect(() => {
        (async () => {
            try {
                setIsLoading(true);
                const res1 = await getVehicleDiagnostics();

                setHistory(res1.map((item: any) => ({
                    vehicleID: item.vehicle_id,
                    vehicle: `${item.year} ${item.make} ${item.model}`,
                    dtc: item.dtc,
                    date: item.date,
                    scanReference: item.scan_reference,
                })));

            } catch (e) {
                console.error('Error: ', e);

            } finally {
                setIsLoading(false);
            }
        })();
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
        }, {} as Record<string, { vehicleID: number, vehicle: string; scanReference: string; date: Date; dtc: string[]; }>)
    );

    if (isLoading) {
        return (
            <Loading />
        )
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView>
                <Header headerTitle='History' link='/car-owner/(tabs)' />

                <View style={styles.lowerBox}>
                    <View style={styles.clearHistoryContainer}>
                        <Text style={styles.header2}>Scanned Cars</Text>
                        <TouchableOpacity style={styles.button} onPress={() => console.log(history)}>
                            <Text style={styles.buttonTxt}>Clear history</Text>
                        </TouchableOpacity>
                    </View>

                    {grouped.map((item) => (
                        <View style={{ width: '100%' }} key={item.scanReference}>
                            <TouchableOpacity 
                                style={styles.historyContainer} 
                                onPress={() => {
                                    dispatch(setScanState({
                                        vehicleID: parseInt(String(item.vehicleID)),
                                        scanReference: item.scanReference,
                                    }));
                                    router.navigate('./history-detailed-report');
                                }}
                                onLongPress={() => setModalVisible(true)}
                            >
                                <Text style={styles.carDetails}>{item.vehicle}</Text>
                                <Text style={styles.date}>{new Date(item.date).toDateString()}</Text>
                                <View style={styles.codeButtonContainer}>
                                    <Text style={styles.troubleCodes}>{item.dtc.join(', ')}</Text>
                                    <TouchableOpacity 
                                        style={styles.historyButton}
                                        onPress={() => {
                                            dispatch(setScanState({
                                                vehicleID: parseInt(String(item.vehicleID)),
                                                scanReference: item.scanReference,
                                            }));
                                            router.navigate('/car-owner/(tabs)/(screens)/repair-shops/repair-shops');
                                        }}
                                    >
                                        <Entypo name='location' size={16} color='#FFF' />
                                    </TouchableOpacity>
                                </View>
                            </TouchableOpacity>

                            <Modal
                                animationType='fade'
                                backdropColor={'rgba(0, 0, 0, 0.1)'}
                                visible={modalVisible}
                                onRequestClose={() => setModalVisible(false)}
                            >
                                <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
                                    <View style={styles.centeredView}>
                                        <Pressable style={styles.modalView} onPress={() => {}}>
                                            <View style={styles.cancelSaveContainer}>
                                                <TouchableOpacity style={[styles.modalButton, { borderWidth: 1, borderColor: '#555' }]} onPress={() => setModalVisible(false)}>
                                                    <Text style={[styles.modalButtonText, { color: '#555' }]}>Cancel</Text>
                                                </TouchableOpacity>
        
                                                <TouchableOpacity style={[styles.modalButton, { backgroundColor: '#780606' }]} onPress={() => {}}>
                                                    <Text style={[styles.modalButtonText, { color: '#FFF' }]}>Delete</Text>
                                                </TouchableOpacity>
                                            </View>
                                        </Pressable>
                                    </View>
                                </TouchableWithoutFeedback>
                            </Modal>
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
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalView: {
        backgroundColor: '#FFF',
        borderRadius: 10,
        padding: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
        width: 0,
        height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    cancelSaveContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 10,
    },
    modalButton: {
        width: 100,
        height: 45,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
    },
    modalButtonText: {
        fontSize: 16,
        fontFamily: 'LeagueSpartan_Bold',
    },
})

export default DiagnosticHistory