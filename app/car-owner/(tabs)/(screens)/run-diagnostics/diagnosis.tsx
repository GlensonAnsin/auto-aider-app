import { Header } from '@/components/Header';
import { Loading } from '@/components/Loading';
import { setVehicleDiagIDArrState } from '@/redux/slices/vehicleDiagIDArrSlice';
import { setVehicleDiagIDState } from '@/redux/slices/vehicleDiagIDSlice';
import { getOnVehicleDiagnostic, getScannedVehicle } from '@/services/backendApi';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useDispatch } from 'react-redux';

const Diagnosis = () => {
    const router = useRouter();
    const dispatch = useDispatch();

    const [codeInterpretation, setCodeInterpretation] = useState<{ vehicleDiagnosticID: number, dtc: string, technicalDescription: string }[]>([]);
    const [scannedVehicle, setScannedVehicle] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    // const vehicleID = useSelector((state: RootState) => state.scan.vehicleID);
    // const scanReference = useSelector((state: RootState) => state.scan.scanReference);

    const vehicleID: number = 25;
    const scanReference: string = '1752999650802549';

    useEffect(() => {
        (async () => {
            try {
                setIsLoading(true);

                const res1 = await getScannedVehicle(vehicleID);
                setScannedVehicle(`${res1.year} ${res1.make} ${res1.model}`);

                const res2 = await getOnVehicleDiagnostic(vehicleID ?? 0, scanReference ?? '');
                if (res2) {
                    setCodeInterpretation(res2.map((item: any) => ({
                        vehicleDiagnosticID: item.vehicle_diagnostic_id,
                        dtc: item.dtc,
                        technicalDescription: item.technical_description,
                    })));
                }

            } catch (e) {
                console.error('Error: ', e);

            } finally {
                setIsLoading(false);
            }
        })();
    }, [vehicleID, scanReference]);

    const handleStoreIDToRedux = () => {
        const ids = codeInterpretation.map((item) => item.vehicleDiagnosticID);
        dispatch(setVehicleDiagIDArrState(ids));

        router.navigate('/car-owner/(tabs)/(screens)/repair-shops/repair-shops');
    };

    if (isLoading) {
        return <Loading />
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView>
                <Header headerTitle='Diagnosis' link='./run-diagnostics' />
            
                <View style={styles.lowerBox}>
                    <View style={styles.buttonContainer}>
                        <Text style={styles.car}>{scannedVehicle}</Text>
                        <TouchableOpacity style={[styles.button, {backgroundColor: '#780606'}]}>
                            <Icon name='close-circle-outline' style={styles.buttonIcon} />
                            <Text style={styles.buttonText}>Disconnect</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.button, {backgroundColor: '#000B58'}]}>
                            <Icon name='radiobox-marked' style={styles.buttonIcon} />
                            <Text style={styles.buttonText}>Start another diagnosis</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.troubleCodesContainer}>
                        <View style={styles.labelContainer}>
                            <Text style={styles.troubleCodesLbl}>Detected Trouble Codes</Text>
                            <TouchableOpacity style={styles.clearButton}>
                                <Text style={styles.clearButtonText}>Clear codes</Text>
                            </TouchableOpacity>
                        </View>

                        {[...codeInterpretation]
                            .sort((a, b) => a.vehicleDiagnosticID - b.vehicleDiagnosticID)
                            .map((item) => (
                                <TouchableOpacity
                                    key={item.vehicleDiagnosticID}
                                    style={styles.troubleCodeButton}
                                    onPress={() => {
                                        dispatch(setVehicleDiagIDState(item.vehicleDiagnosticID))
                                        router.navigate('./detailed-report')
                                    }}
                                >
                                    <Text style={styles.troubleCodeText}>{item.dtc}</Text>
                                    <Text style={styles.troubleCodeText2}>{item.technicalDescription}</Text>
                                </TouchableOpacity>
                        ))}
                    </View>

                    <TouchableOpacity style={styles.findShopButton} onPress={() => handleStoreIDToRedux()}>
                        <Text style={styles.findShopButtonText}>Find Repair Shop</Text>
                    </TouchableOpacity>
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
        marginTop: 30,
        flex: 1,
        marginBottom: 100,
    },
    buttonContainer: {
        width: '90%',
        gap: 10,
    },
    car: {
        fontFamily: 'LeagueSpartan_Bold',
        fontSize: 22,
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
        fontFamily: 'LeagueSpartan_Bold',
        fontSize: 20,
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
        fontFamily: 'LeagueSpartan_Bold',
        fontSize: 18,
        color: '#333'
    },
    clearButton: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    clearButtonText: {
        fontFamily: 'LeagueSpartan',
        color: '#000B58',
        fontSize: 18,
    },
    troubleCodeButton: {
        backgroundColor: '#EAEAEA',
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
        fontFamily: 'LeagueSpartan_Bold',
        color: '#333',
        fontSize: 16,
    },
    troubleCodeText2: {
        fontFamily: 'LeagueSpartan',
        color: '#555',
        fontSize: 14,
    },
    findShopButton: {
        width: '45%',
        height: 45,
        backgroundColor: '#000B58',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 20,
        marginTop: 10,
        marginBottom: 20,
    },
    findShopButtonText: {
        fontSize: 16,
        fontFamily: 'LeagueSpartan_Bold',
        color: '#FFF',
    },
})

export default Diagnosis