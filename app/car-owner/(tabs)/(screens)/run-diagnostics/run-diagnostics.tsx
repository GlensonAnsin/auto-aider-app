import { Header } from '@/components/Header';
import { getVehicle } from '@/services/backendApi';
import { codeMeaning, codePossibleCauses, codeRecommendedRepair, codeTechnicalDescription } from '@/services/geminiApi';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { showMessage } from 'react-native-flash-message';
import { SafeAreaView } from 'react-native-safe-area-context';
import SelectDropdown from 'react-native-select-dropdown';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const RunDiagnostics = () => {
    const router = useRouter()

    const [selectedCar, setSelectedCar] = useState<string>('');
    const [vehicles, setVehicles] = useState<{ id: number, make: string, model: string, year: string }[]>([])
    const [technicalDescription, setTechnicalDescription] = useState<string>('');
    const [meaning, setMeaning] = useState<string>('');
    const [possibleCauses, setPossibleCauses] = useState<string>('');
    const [recommendedRepair, setRecommendedRepair] = useState<string>('');

    const handleCodeTechnicalDescription = async () => {
        try {
            const res = await codeTechnicalDescription('P1604', selectedCar);
            console.log(`TD: ${res}`);
            if (res) {
                setTechnicalDescription(res);
            };
            return res;

        } catch (e) {
            console.error('Error getting technical description: ', e);
        }
    };

    const handleCodeMeaning = async (TD: string) => {
        try {
            const res = await codeMeaning('P1604', TD, selectedCar);
            console.log(`M: ${res}`);
            if (res) {
                setMeaning(res);
            };

        } catch (e) {
            console.error('Error code meaning: ', e);
        }
    };

    const handleCodePossibleCauses = async (TD: string) => {
        try {
            const res = await codePossibleCauses('P1604', TD, selectedCar);
            console.log(`PC: ${res}`);
            if (res) {
                setPossibleCauses(res);
            };

        } catch (e) {
            console.error('Error getting possible causes: ', e);
        }
    };

    const handleRecommendedRepair = async (TD: string) => {
        try {
            const res = await codeRecommendedRepair('P1604', TD, selectedCar);
            console.log(`RR: ${res}`);
            if (res) {
                setRecommendedRepair(res);
            };

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
        };
        
        let sequence = 1;

        switch (sequence) {
            case 1:
                const res = await handleCodeTechnicalDescription();
                sequence + 1
            case 2:
                if (res) {
                    await handleCodeMeaning(res);
                };
                sequence + 1
            case 3:
                if (res) {
                    await handleCodePossibleCauses(res);
                };
                sequence + 1
            case 4:
                if (res) {
                    await handleRecommendedRepair(res);
                };
                sequence = 1;
                break;
            default:
                break;
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
                        onSelect={(selectedItem) => setSelectedCar(`${selectedItem.year} ${selectedItem.make} ${selectedItem.model}`)}
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

                <TouchableOpacity onPress={() => {
                    console.log(technicalDescription);
                    console.log(meaning);
                    console.log(possibleCauses);
                    console.log(recommendedRepair);
                }}>
                    <Text>Console</Text>
                </TouchableOpacity>
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
})

export default RunDiagnostics