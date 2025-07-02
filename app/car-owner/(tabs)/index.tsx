import { Loading } from '@/components/Loading';
import { addVehicle, getUserInfo } from '@/services/backendApi';
import { verifyCar } from '@/services/geminiApi';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { showMessage } from 'react-native-flash-message';
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

    const [addVehicleModalVisible, isAddVehicleModalVisible] = useState(false);
    const [selectedMake, setSelectedMake] = useState<string>('');
    const [model, setModel] = useState<string>('');
    const [year, setYear] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isAddCarLoading, setIsAddCarLoading] = useState<boolean>(false);
    const [firstname, setFirstname] = useState<string>('');
    const [lastname, setLastname] = useState<string>('');
    const [profilePic, setProfilePic] = useState<string | null>(null)

    const targetMakes = ['Acura', 'Audi', 'BMW', 'Chevrolet', 'Dodge', 'Chrysler', 'Jeep', 'Ford', 'Foton', 'Geely', 'Honda', 'Hyundai', 'Infiniti', 'Isuzu', 'Jaguar', 'Kia', 'Land Rover', 'Lexus', 'Mazda', 'Mercedes-Benz', 'MG', 'Mitsubishi', 'Nissan', 'RAM', 'Subaru', 'Suzuki', 'Toyota', 'Volkswagen']

    const handleCarVerification = async () => {
        if (!selectedMake || !model || !year) {
            setError('Please fill in all fields.')
            return;
        }

        setError('')

        try {
            setIsAddCarLoading(true);
            const result = await verifyCar(selectedMake, model, year);
            if (result === 'false') {
                setError('Invalid car details. Please check and try again.')
            } else {
                handleAddCar();
            }

        } catch (e) {
            setError('An error occurred while verifying the car.')

        } finally {
            setIsAddCarLoading(false);
        }
    }

    useEffect(() => {
        (async () => {
            try {
                setIsLoading(true)
                const res = await getUserInfo();
                
                setFirstname(res.firstname);
                setLastname(res.lastname);
                setProfilePic(res.profile_pic);

            } catch (e) {
                console.error('Error: ', e);
            } finally {
                setIsLoading(true);
            }
        })();
    }, []);

    const handleAddCar = async () => {
        const vehicleInfo = {
            make: selectedMake.toUpperCase().trim(),
            model: model.toUpperCase().trim(),
            year: year.trim(),
            date_added: new Date()
        };

        try {
            await addVehicle(vehicleInfo)
            setSelectedMake('');
            setModel('');
            setYear('');
            setError('');
            isAddVehicleModalVisible(!addVehicleModalVisible);
            showMessage({
                message: 'Car added successfully!',
                type: 'success',
                floating: true,
                color: '#FFF',
                icon: 'success',
            });

        } catch (e) {
            setError('Server error')
        }
    }

    if (isLoading) {
        <Loading />
    }

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
                            <Text style={styles.header}>Hello,</Text>
                            <Text style={styles.userName}>{`${firstname} ${lastname}`}</Text>
                        </View>

                        <TouchableOpacity style={styles.profileWrapper} onPress={() => router.navigate('./profile/profile')}>
                            {profilePic === null && (
                                <Text style={styles.userInitials}>{`${firstname[0]}${lastname[0]}`}</Text>
                            )}

                            {profilePic !== null && (
                                <Image
                                    source={{ uri: profilePic }}
                                />
                            )}
                        </TouchableOpacity>
                    </View>

                    <View style={styles.introTxtContainer}>
                        <Text style={styles.introHeader}>Let's get started</Text>
                        <Text style={styles.introBody}>Start your experience to easier vehicle maintenance.</Text>
                    </View>

                    <View style={styles.featuresContainer}>
                        <View style={styles.column}>
                            <TouchableOpacity style={styles.feature} onPress={() => router.navigate('./diagnostic-history/diagnostic-history')} >
                                <DiagnosticHistoryIcon width={50} height={50} />
                                <View style={styles.featureTxtWrapper}>
                                    <Text style={styles.featureHeader}>Diagnostic History</Text>
                                    <Text style={styles.featureDescription}>View past diagnostic checks</Text>
                                </View>
                            </TouchableOpacity>
                         

                            <TouchableOpacity style={styles.feature} onPress={() => router.navigate('./run-diagnostics/run-diagnostics')} >
                                <RunDiagnosticIcon width={40} height={40} />
                                <View style={styles.featureTxtWrapper}>
                                    <Text style={styles.featureHeader}>Scan Car</Text>
                                    <Text style={styles.featureDescription}>Perform a quick system diagnostic</Text>
                                </View>
                            </TouchableOpacity>
                                
                           

              
                            <TouchableOpacity style={styles.feature}>
                                <LocationIcon width={50} height={50} />
                                <View style={styles.featureTxtWrapper}>
                                    <Text style={styles.featureHeader}>Repair Shops</Text>
                                    <Text style={styles.featureDescription}>Locate nearby repair shops</Text>
                                </View>
                            </TouchableOpacity>
                          
                        </View>

                        <View style={styles.column}>
                            <TouchableOpacity style={styles.feature} onPress={() => isAddVehicleModalVisible(true)}>
                                <AddVehicleIcon width={50} height={50} />
                                <View style={styles.featureTxtWrapper}>
                                    <Text style={styles.featureHeader}>Add Vehicle</Text>
                                    <Text style={styles.featureDescription}>Register or add a new vehicle</Text>
                                </View>
                            </TouchableOpacity>

                            
                            <TouchableOpacity style={styles.feature} onPress={() => router.navigate('./profile/profile')}>
                                <ProfileIcon width={50} height={50} />
                                <View style={styles.featureTxtWrapper}>
                                    <Text style={styles.featureHeader}>My Profile</Text>
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
                                    <Text style={styles.modalHeader}>Add Vehicle</Text>
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

                                    {isAddCarLoading === true && (
                                        <ActivityIndicator style={{ marginTop: 20 }} size='small' color='#000B58' />
                                    )}

                                    <TouchableOpacity style={styles.addCarButton} onPress={() => {
                                        if (parseInt(year) < 1996) {
                                            setError('OBD2 scanners only support vehicles manufactured in 1996 and newer.');
                                        } else {
                                            handleCarVerification();
                                        }
                                    }}>
                                        <Text style={styles.addCarButtonTxt}>Add</Text>
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
        backgroundColor: '#FFF',
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
        color: '#FFF',
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
        color: '#FFF',
        fontFamily: 'LeagueSpartan_Bold',
        fontSize: 16,
    },
    featureDescription: {
        color: '#FFF',
        fontFamily: 'LeagueSpartan',
        fontSize: 12,
    },
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    addCarModalView: {
        backgroundColor: '#FFF',
        width: '85%',
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
    modalHeader: {
        fontSize: 22,
        fontFamily: 'LeagueSpartan_Bold',
        color: '#333',
    },
    textInputContainer: {
        gap: 10,
        marginTop: 10,
        width: '100%',
    },
    textInputLbl: {
        fontSize: 16,
        fontFamily: 'LeagueSpartan',
        color: '#333',
    },
    dropdownButtonStyle: {
        width: '100%',
        height: 45,
        backgroundColor: '#EAEAEA',
        borderRadius: 5,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 10,
    },
    dropdownButtonTxtStyle: {
        flex: 1,
        fontSize: 16,
        color: '#333',
        fontFamily: 'LeagueSpartan',
    },
    dropdownButtonArrowStyle: {
        fontSize: 24,
        color: '#333',
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
        color: '#333',
        fontFamily: 'LeagueSpartan',
    },
    input: {
        backgroundColor: '#EAEAEA',
        width: '100%',
        height: 45,
        borderRadius: 5,
        padding: 10,
        fontSize: 16,
        color: '#333',
        fontFamily: 'LeagueSpartan',
    },
    addCarButton: {
        width: '50%',
        height: 45,
        backgroundColor: '#000B58',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 20,
        marginTop: 20,
    },
    addCarButtonTxt: {
        fontSize: 16,
        color: '#FFF',
        fontFamily: 'LeagueSpartan_Bold',
    },
    errorContainer: {
        backgroundColor: '#EAEAEA',
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
});
