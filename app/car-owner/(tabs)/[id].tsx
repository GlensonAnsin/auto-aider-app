import { getUserInfo } from '@/services/backendApi';
import { verifyCar } from '@/services/geminiApi';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import SelectDropdown from 'react-native-select-dropdown';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AddVehicleIcon from '../../../assets/images/add_vehicle.svg';
import DiagnosticHistoryIcon from '../../../assets/images/diagnostic_history.svg';
import ProfileIcon from '../../../assets/images/iconamoon_profile-fill.svg';
import LocationIcon from '../../../assets/images/subway_location-1.svg';
import RunDiagnosticIcon from '../../../assets/images/teenyicons_scan-outline.svg';

export default function Home() {
    const router = useRouter();

    const { id } = useLocalSearchParams<{ id: string }>();

    const [addVehicleModalVisible, isAddVehicleModalVisible] = useState(false);
    const [addSuccessModalVisible, isAddSuccessModalVisible] = useState(false);
    const [selectedMake, setSelectedMake] = useState<string>('');
    const [model, setModel] = useState<string>('');
    const [year, setYear] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [loading, isLoading] = useState(false);
    const [firstname, setFirstname] = useState<string>('');
    const [lastname, setLastname] = useState<string>('');

    const targetMakes = ['Acura', 'Audi', 'BMW', 'Chevrolet', 'Dodge', 'Chrysler', 'Jeep', 'Ford', 'Foton', 'Geely', 'Honda', 'Hyundai', 'Infiniti', 'Isuzu', 'Jaguar', 'Kia', 'Land Rover', 'Lexus', 'Mazda', 'Mercedes-Benz', 'MG', 'Mitsubishi', 'Nissan', 'RAM', 'Subaru', 'Suzuki', 'Toyota', 'Volkswagen']

    const handleCarVerification = async () => {
        if (!selectedMake || !model || !year) {
            setError('Please fill in all fields.')
            return;
        }
        setError('')
        try {
            isLoading(true);
            const result = await verifyCar(selectedMake, model, year);
            if (result === 'false') {
                setError('Invalid car details. Please check and try again.')
            } else {
                setSelectedMake('');
                setModel('');
                setYear('');
                setError('');
                isAddVehicleModalVisible(!addVehicleModalVisible);
                isAddSuccessModalVisible(true);
            }
        } catch (e) {
            setError('An error occurred while verifying the car.')
        } finally {
            isLoading(false);
        }
    }

    useEffect(() => {
        (async () => {
            try {
                const res = await getUserInfo(parseInt(id));
                const { userWithoutPassword } = res;

                const firstname = userWithoutPassword.firstname;
                const lastname = userWithoutPassword.lastname;
                
                setFirstname(firstname);
                setLastname(lastname);

            } catch (e) {
                console.error('Error: ', e);
            }
        })();
    }, []);

    return (
        <SafeAreaProvider>
            <SafeAreaView style={styles.container}>
                <ScrollView>
                    <Image
                        source={require('../../../assets/images/screen-design-2.png')}
                        style={styles.screenDesign}
                    />
                    <Image
                        source={require('../../../assets/images/logo.png')}
                        style={styles.logo}
                        width={200}
                        height={25}
                    />

                    <View style={styles.userContainer}>
                        <View style={styles.userNameContainer}>
                            <Text style={styles.header}>HELLO,</Text>
                            <Text style={styles.userName}>{`${firstname} ${lastname}`}</Text>
                        </View>

                        <TouchableOpacity style={styles.profileWrapper} onPress={() => router.push('/car-owner/(tabs)/(screens)/profile/profile')}>
                            <Text style={styles.userInitials}>GA</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.introTxtContainer}>
                        <Text style={styles.introHeader}>Let's Get Started</Text>
                        <Text style={styles.introBody}>Start your experience to easier vehicle maintenance.</Text>
                    </View>

                    <View style={styles.featuresContainer}>
                        <View style={styles.column}>
                            <TouchableOpacity style={styles.feature} onPress={() => router.push('/car-owner/(tabs)/(screens)/diagnostic-history/diagnostic-history')}>
                                <DiagnosticHistoryIcon width={50} height={50} />
                                <View style={styles.featureTxtWrapper}>
                                    <Text style={styles.featureHeader}>DIAGNOSTIC HISTORY</Text>
                                    <Text style={styles.featureDescription}>View past diagnostic checks and repair information</Text>
                                </View>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.feature} onPress={() => router.push('/car-owner/(tabs)/(screens)/run-diagnostics/run-diagnostics')}>
                                <RunDiagnosticIcon width={40} height={40} />
                                <View style={styles.featureTxtWrapper}>
                                    <Text style={styles.featureHeader}>RUN DIAGNOSTICS</Text>
                                    <Text style={styles.featureDescription}>Perform a quick system diagnostic</Text>
                                </View>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.feature}>
                                <LocationIcon width={50} height={50} />
                                <View style={styles.featureTxtWrapper}>
                                    <Text style={styles.featureHeader}>REPAIR SHOPS</Text>
                                    <Text style={styles.featureDescription}>Locate nearby repair shops</Text>
                                </View>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.column}>
                            <TouchableOpacity style={styles.feature} onPress={() => isAddVehicleModalVisible(true)}>
                                <AddVehicleIcon width={50} height={50} />
                                <View style={styles.featureTxtWrapper}>
                                    <Text style={styles.featureHeader}>ADD VEHICLE</Text>
                                    <Text style={styles.featureDescription}>Register or add a new vehicle</Text>
                                </View>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.feature} onPress={() => router.push('/car-owner/(tabs)/(screens)/profile/profile')}>
                                <ProfileIcon width={50} height={50} />
                                <View style={styles.featureTxtWrapper}>
                                    <Text style={styles.featureHeader}>MY PROFILE</Text>
                                    <Text style={styles.featureDescription}>Manage your account details and preferences</Text>
                                </View>
                            </TouchableOpacity>
                        </View>

                        <Modal
                            animationType='fade'
                            backdropColor={'rgba(0, 0, 0, 0.5)'}
                            visible={addVehicleModalVisible}
                            onRequestClose={() => {
                                isAddVehicleModalVisible(!addVehicleModalVisible);
                                setSelectedMake('');
                                setModel('');
                                setYear('');
                                setError('');
                            }}
                        >
                            <View style={styles.centeredView}>
                                <View style={styles.addCarModalView}>
                                    <Text style={styles.modalHeader}>ADD VEHICLE</Text>
                                    <View style={styles.textInputContainer}>
                                        <Text style={styles.textInputLbl}>Manufacturer</Text>
                                        <SelectDropdown 
                                            data={targetMakes}
                                            onSelect={(selectedItem) => setSelectedMake(selectedItem)}
                                            renderButton={(selectedItem, isOpen) => (
                                                <View style={styles.dropdownButtonStyle}>
                                                    <Text style={styles.dropdownButtonTxtStyle}>
                                                        {selectedItem || 'Select manufacturer'}
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
                                                    <Text style={styles.dropdownItemTxtStyle}>{item}</Text>
                                                </View>
                                            )}
                                            showsVerticalScrollIndicator={false}
                                            dropdownStyle={styles.dropdownMenuStyle}
                                        />
                                    </View>

                                    <View style={styles.textInputContainer}>
                                        <Text style={styles.textInputLbl}>Model</Text>
                                        <TextInput 
                                            value={model}
                                            onChangeText={setModel}
                                            style={styles.input}
                                            placeholder='Model'
                                            editable={!selectedMake ? false : true}
                                        />
                                    </View>

                                    <View style={styles.textInputContainer}>
                                        <Text style={styles.textInputLbl}>Year</Text>
                                        <TextInput 
                                            value={year}
                                            onChangeText={setYear}
                                            style={styles.input}
                                            keyboardType='numeric'
                                            placeholder='Year'
                                            maxLength={4}
                                            editable={!model ? false : true}
                                        />
                                    </View>

                                    {error.length > 0 && (
                                        <View style={styles.errorContainer}>
                                            <Text style={styles.errorMessage}>{error}</Text>
                                        </View>
                                    )}

                                    {loading === true && (
                                        <ActivityIndicator style={{ marginTop: 20 }} size='small' color='#fff' />
                                    )}

                                    <TouchableOpacity style={styles.addCarButton} onPress={() => {
                                        if (parseInt(year) < 1996) {
                                            setError('OBD2 scanners only support vehicles manufactured in 1996 and newer.');
                                        } else {
                                            handleCarVerification();
                                        }
                                    }}>
                                        <Text style={styles.addCarButtonTxt}>ADD</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </Modal>

                        <Modal
                            animationType='fade'
                            backdropColor={'rgba(0, 0, 0, 0.5)'}
                            visible={addSuccessModalVisible}
                            onRequestClose={() => isAddSuccessModalVisible(!addSuccessModalVisible)}
                        >
                            <View style={styles.centeredView}>
                                <View style={styles.addSuccessModalView}>
                                    <Text style={styles.modalTxt}>Car added successfully!</Text>
                                    <TouchableOpacity
                                        style={styles.addSuccessButton}
                                        onPress={() => {
                                        isAddSuccessModalVisible(!addSuccessModalVisible)
                                        }}>
                                            <Text style={styles.addSuccessButtonTxt}>OK</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </Modal>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </SafeAreaProvider> 
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    screenDesign: {
        width: '100%',
    },
    logo: {
        position: 'absolute',
        top: 35,
        left: 20,
    },
    userContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 20,
        width: '90%',
        alignSelf: 'center',
    },
    userNameContainer: {
        flexDirection: 'column',
        width: '70%'
    },
    header: {
        fontFamily: 'LeagueSpartan_Bold',
        fontSize: 30,
    },
    userName: {
        fontFamily: 'LeagueSpartan',
        fontSize: 24,
    },
    profileWrapper: {
        backgroundColor: 'green',
        width: 80,
        height: 80,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 80,
    },
    userInitials: {
        fontFamily: 'LeagueSpartan_Bold',
        fontSize: 30,
        color: '#fff',
    },
    introTxtContainer: {
        borderWidth: 2,
        borderColor: '#003161',
        width: '94%',
        borderRadius: 10,
        padding: 10,
        marginTop: 20,
        alignSelf: 'center',
    },
    introHeader: {
        fontFamily: 'LeagueSpartan',
        fontSize: 18,
        textAlign: 'center',
    },
    introBody: {
        fontFamily: 'LeagueSpartan',
        fontSize: 16,
        textAlign: 'center',
    },
    featuresContainer: {
        backgroundColor: '#EAEAEA',
        width: '94%',
        flexDirection: 'row',
        alignSelf: 'center',
        borderRadius: 8,
        marginTop: 20,
        marginBottom: 10,
        gap: 5,
        paddingTop: 5,
        paddingBottom: 5,
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    column: {
        width: '47%',
        gap: 5,
    },
    feature: {
        flexDirection: 'row',
        backgroundColor: '#000B58',
        width: '100%',
        height: 100,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 3,
        shadowColor: '#000',
        shadowOffset: {
        width: 0,
        height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    featureTxtWrapper: {
        flexDirection: 'column',
        width: '60%',
    },
    featureHeader: {
        color: '#fff',
        fontFamily: 'LeagueSpartan_Bold',
        fontSize: 14,
    },
    featureDescription: {
        color: '#fff',
        fontFamily: 'LeagueSpartan',
        fontSize: 10,
    },
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    addCarModalView: {
        backgroundColor: '#000B58',
        width: '85%',
        borderRadius: 20,
        padding: 35,
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
    modalHeader: {
        fontSize: 24,
        fontFamily: 'LeagueSpartan_Bold',
        color: '#fff',
    },
    textInputContainer: {
        gap: 10,
        marginTop: 10,
        width: '100%',
    },
    textInputLbl: {
        fontSize: 16,
        fontFamily: 'LeagueSpartan',
        color: '#fff',
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
    dropdownMenuStyle: {
        backgroundColor: '#EAEAEA',
        borderRadius: 10,
        marginTop: -1,
    },
    dropdownItemStyle: {
        width: '100%',
        flexDirection: 'row',
        paddingHorizontal: 10,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 8,
        borderRadius: 10,
    },
    dropdownItemTxtStyle: {
        flex: 1,
        fontSize: 16,
        fontFamily: 'LeagueSpartan',
    },
    input: {
        backgroundColor: '#EAEAEA',
        width: '100%',
        height: 45,
        borderRadius: 10,
        padding: 10,
        fontSize: 16,
        fontFamily: 'LeagueSpartan',
    },
    addCarButton: {
        width: '50%',
        height: 45,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 20,
        marginTop: 20,
    },
    addCarButtonTxt: {
        fontSize: 16,
        fontFamily: 'LeagueSpartan_Bold',
    },
    errorContainer: {
        backgroundColor: '#fff',
        borderRadius: 5,
        width: '100%',
        padding: 10,
        marginTop: 20,
    },
    errorMessage: {
        fontFamily: 'LeagueSpartan',
        color: 'red',
        textAlign: 'center',
    },
    addSuccessModalView: {
        backgroundColor: '#fff',
        width: '60%',
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
    modalTxt: {
        marginBottom: 15,
        textAlign: 'center',
        fontFamily: 'LeagueSpartan',
        fontSize: 16,
    },
    addSuccessButton: {
        width: '50%',
        height: 45,
        backgroundColor: '#000B58',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 20,
    },
    addSuccessButtonTxt: {
        fontSize: 16,
        fontFamily: 'LeagueSpartan_Bold',
        color: '#fff',
    },
});
