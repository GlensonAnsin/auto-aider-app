import { Header } from '@/components/Header';
import { Loading } from '@/components/Loading';
import { setScanState } from '@/redux/slices/scanSlice';
import { setTabState } from '@/redux/slices/tabBarSlice';
import { addVehicleDiagnostic, getVehicle } from '@/services/backendApi';
import { codeMeaning, codePossibleCauses, codeRecommendedRepair, codeTechnicalDescription } from '@/services/geminiApi';
import { generateReference } from '@/services/generateReference';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useRouter } from 'expo-router';
import LottieView from 'lottie-react-native';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableHighlight, View } from 'react-native';
import { showMessage } from 'react-native-flash-message';
import { SafeAreaView } from 'react-native-safe-area-context';
import SelectDropdown from 'react-native-select-dropdown';
import { useDispatch } from 'react-redux';

const RunDiagnostics = () => {
    const router = useRouter();
    const dispatch = useDispatch();

    const [selectedCar, setSelectedCar] = useState<string>('');
    const [selectedCarID, setSelectedCarID] = useState<number | undefined>(undefined);
    const [vehicles, setVehicles] = useState<{ id: number, make: string, model: string, year: string }[]>([])
    const [DTC, setDTC] = useState<string[]>(['P1604', 'P0101']);
    const [scanLoading, setScanLoading] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    useEffect(() => {
        (async () => {
            try {
                setIsLoading(true);
                const res = await getVehicle();
                const vehicleInfo = res.map((v: { vehicle_id: number, make: string, model: string, year: string }) => ({
                    id: v.vehicle_id,
                    make: v.make,
                    model: v.model,
                    year: v.year
                }));
                setVehicles(vehicleInfo);

            } catch (e) {
                console.error('Error: ', e);

            } finally {
                setIsLoading(false);
            }
        })();
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

        try {
            dispatch(setTabState(false));
            setScanLoading(true);

            const scanReference = generateReference();
            dispatch(setScanState({
                vehicleID: selectedCarID ?? 0,
                scanReference: scanReference,
            }));

            for (const code of DTC) {
                const TD = await handleCodeTechnicalDescription(code);

                if (!TD) throw new Error("Failed to get technical description");

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
                    date: new Date(),
                    scan_reference: scanReference,
                    vehicle_issue_description: null,
                };

                await addVehicleDiagnostic(vehicleDiagnosticData);
            }

            setSelectedCarID(undefined);
            setSelectedCar('');
            setDTC([]);
            setScanLoading(false);
            router.navigate('./diagnosis');

        } catch (e) {
            console.error('Error: ', e);

        } finally {
            setScanLoading(false);
            dispatch(setTabState(true));
        }
    };

    if (isLoading) {
        return (
            <Loading />
        )
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
    )
    }

    return (
        <SafeAreaView style={styles.container}>
            <Header headerTitle='Diagnostic' link='/car-owner/(tabs)' />

            <View style={styles.lowerBox}>
                <View style={styles.selectCarButtonContainer}>
                    <View style={styles.selectCarContainer}>
                        <Text style={styles.dropdownLbl}>Vehicle</Text>
                        <SelectDropdown 
                            data={vehicles}
                            onSelect={(selectedItem) => {
                                setSelectedCar(`${selectedItem.year} ${selectedItem.make} ${selectedItem.model}`);
                                setSelectedCarID(selectedItem.id);
                            }}
                            renderButton={(selectedItem, isOpen) => (
                                <View style={styles.dropdownButtonStyle}>
                                    <Text style={styles.dropdownButtonTxtStyle}>
                                        {(selectedItem && `${selectedItem.make} ${selectedItem.model} ${selectedItem.year}`) || 'Select vehicle'}
                                    </Text>
                                    <MaterialCommunityIcons name={isOpen ? 'chevron-up' : 'chevron-down'} style={styles.dropdownButtonArrowStyle} />
                                </View>
                            )}
                            renderItem={(item, _index, isSelected) => (
                                <View
                                    style={{
                                    ...styles.dropdownItemStyle,
                                    ...(isSelected && { backgroundColor: '#D2D9DF' }),
                                    }}
                                >
                                    <Text style={styles.dropdownItemTxtStyle}>{`${item.make} ${item.model} ${item.year}`}</Text>
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
                                width: 300,
                                height: 300,
                                zIndex: 1,
                            }}
                        />
                    </View>
                </View>
            </View>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF',
    },
    lowerBox: {
        width: '90%',
        alignSelf: 'center',
        justifyContent: 'center',
        alignItems: 'center',
        flex: 1,
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
        marginTop: -10,
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
        fontFamily: 'LeagueSpartan',
        fontSize: 20,
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
        fontSize: 16,
        fontFamily: 'LeagueSpartan',
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
        fontSize: 16,
        fontFamily: 'LeagueSpartan',
    },
    dropdownMenuStyle: {
        backgroundColor: '#EAEAEA',
        borderRadius: 10,
        marginTop: -37,
    },
    buttonContainer: {
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#EAEAEA',
        height: 350,
        position: 'relative',
        borderBottomLeftRadius: 10,
        borderBottomRightRadius: 10,
    },
    scanButton: {
        width: 120,
        height: 120,
        borderRadius: 120,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'absolute',
        zIndex: 2
    },
    innerContainer: {
        backgroundColor: '#000B58',
        width: 120,
        height: 120,
        borderRadius: 120,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonTxt: {
        fontFamily: 'LeagueSpartan_Bold',
        color: '#FFF',
        fontSize: 24,
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
        fontFamily: 'LeagueSpartan_Bold',
        fontSize: 30,
        color: '#000B58',
    },
})

export default RunDiagnostics;