import { Header } from '@/components/Header';
import { addVehicleDiagnostic, getVehicle } from '@/services/backendApi';
import { codeMeaning, codePossibleCauses, codeRecommendedRepair, codeTechnicalDescription } from '@/services/geminiApi';
import { generateReference } from '@/services/generateReference';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { showMessage } from 'react-native-flash-message';
import { SafeAreaView } from 'react-native-safe-area-context';
import SelectDropdown from 'react-native-select-dropdown';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const RunDiagnostics = () => {
    const router = useRouter();

    const [selectedCar, setSelectedCar] = useState<string>('');
    const [selectedCarID, setSelectedCarID] = useState<number | undefined>(undefined);
    const [vehicles, setVehicles] = useState<{ id: number, make: string, model: string, year: string }[]>([])
    const [DTC, setDTC] = useState<string[]>(['P1604', 'P0101']);
    const [scanLoading, setScanLoading] = useState<boolean>(false);

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
            setScanLoading(true);

            const scanReference = generateReference();

            for (const code of DTC) {
                const TD = await handleCodeTechnicalDescription(code);

                if (!TD) throw new Error("Failed to get technical description");

                const M = await handleCodeMeaning(code, TD);
                const PC = await handleCodePossibleCauses(code, TD);
                const RR = await handleRecommendedRepair(code, TD);

                const vehicleDiagnosticData = {
                    vehicle_id: selectedCarID ?? 0,
                    dtc: code,
                    technical_description: TD ?? '',
                    meaning: M ?? '',
                    possible_causes: PC ?? '',
                    recommended_repair: RR ?? '',
                    datetime: new Date(),
                    scan_reference: scanReference,
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
        }
    };

    useEffect(() => {
        (async () => {
          try {
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
          }
        })();
      }, []);

    return (
        <SafeAreaView style={styles.container}>
            <Header headerTitle='Diagnostic' link='/car-owner/(tabs)' />

            <View style={styles.lowerBox}>
                <View style={styles.selectCarContainer}>
                    <Text style={styles.dropdownLbl}>Car to scan</Text>
                    <SelectDropdown 
                        data={vehicles}
                        onSelect={(selectedItem) => {
                            setSelectedCar(`${selectedItem.year} ${selectedItem.make} ${selectedItem.model}`);
                            setSelectedCarID(selectedItem.id);
                        }}
                        renderButton={(selectedItem, isOpen) => (
                            <View style={styles.dropdownButtonStyle}>
                                <Text style={styles.dropdownButtonTxtStyle}>
                                    {(selectedItem && `${selectedItem.make} ${selectedItem.model} ${selectedItem.year}`) || 'Select car'}
                                </Text>
                                <Icon name={isOpen ? 'chevron-up' : 'chevron-down'} style={styles.dropdownButtonArrowStyle} />
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
                    <TouchableOpacity style={styles.scanButton} onPress={() => handleCodeInterpretation()}>
                        <View style={styles.innerContainer}>
                            <Text style={styles.buttonTxt}>Scan</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </View>
            {scanLoading && (
                <View style={styles.updateLoadingContainer}>
                <ActivityIndicator size='large' color='#000B58'  />
                </View>
            )}
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
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        alignSelf: 'center',
        marginTop: 100,
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
        height: 300,
        borderBottomLeftRadius: 10,
        borderBottomRightRadius: 10,
    },
    scanButton: {
        width: 190,
        height: 190,
        borderRadius: 190,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#000B58',
        
    },
    innerContainer: {
        backgroundColor: '#000B58',
        width: 140,
        height: 140,
        borderRadius: 170,
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
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 10,
    },
})

export default RunDiagnostics;