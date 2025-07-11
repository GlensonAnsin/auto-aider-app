import { Header } from '@/components/Header';
import { Loading } from '@/components/Loading';
import { getRepairShopInfo, getRepairShops, updateRepairShopInfo } from '@/services/backendApi';
import { AutoRepairShop, UpdateRepairShopInfo } from '@/types/autoRepairShop';
import Entypo from '@expo/vector-icons/Entypo';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useFocusEffect } from '@react-navigation/native';
import Checkbox from 'expo-checkbox';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Image, KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { showMessage } from 'react-native-flash-message';
import MapView, { Marker, Region } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';
import SelectDropdown from 'react-native-select-dropdown';
import { io, Socket } from 'socket.io-client';

const editShop = () => {
    const mapRef = useRef<MapView>(null);
    const [_socket, setSocket] = useState<Socket | null>(null);

    const [repShopID, setRepShopID] = useState<number>(0);
    const [repShopName, setRepShopName] = useState<string>('');
    const [ownerFirstname, setOwnerFirstname] = useState<string>('');
    const [ownerLastname, setOwnerLastname] = useState<string>('');
    const [gender, setGender] = useState<string>('');
    const [mobileNum, setMobileNum] = useState<string>('');
    const [email, setEmail] = useState<string | null>(null);
    const [servicesOffered, setServicesOffered] = useState<string[]>([]);
    const [region, setRegion] = useState<Region | undefined>(undefined);
    const [profilePic, setProfilePic] = useState<string | null>(null);
    const [shopImages, setShopImages] = useState<string[] | null>(null);
    const [currentPassword, setCurrentPassword] = useState<string>('');
    const [newPassword, setNewPassword] = useState<string>('');
    const [confirmPassword, setConfirmPassword] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isEditLocation, setIsEditLocation] = useState<boolean>(false);
    const [isEditServices, setIsEditServices] = useState<boolean>(false);
    const [edit, setEdit] = useState<string>('');
    const [modalVisible, setModalVisible] = useState<boolean>(false);
    const [mapModalVisible, setMapModalVisible] = useState<boolean>(false);
    const [imageModalVisible, setImageModalVisible] = useState<boolean>(false);
    const [imageSource, setImageSource] = useState<string>('');
    const [passwordError, setPasswordError] = useState<string>('');

    const [localRepShopName, setLocalRepShopName] = useState<string>('');
    const [localOwnerFirstname, setLocalOwnerFirstname] = useState<string>('');
    const [localOwnerLastname, setLocalOwnerLastname] = useState<string>('');
    const [localGender, setLocalGender] = useState<string>('');
    const [localMobileNum, setLocalMobileNum] = useState<string>('');
    const [localEmail, setLocalEmail] = useState<string | null>(null);
    const [localServicesOffered, setLocalServicesOffered] = useState<string[]>([]);
    const [localRegion, setLocalRegion] = useState<Region | undefined>(undefined);

    const genders = ['Male', 'Female'];

    const services = [
        { id: '1', label: 'Engine diagnostics and repair' },
        { id: '2', label: 'Transmission repair and overhaul' },
        { id: '3', label: 'Oil change and fluid replacement (engine oil, brake fluid, coolant, etc.)' },
        { id: '4', label: 'Brake system service (pads, discs, drums, ABS systems)' },
        { id: '5', label: 'Clutch system service' },
        { id: '6', label: 'Battery check and replacement' },
        { id: '7', label: 'Timing belt/chain replacement' },
        { id: '8', label: 'Alternator and starter motor repair' },
        { id: '9', label: 'Suspension and steering repair' },
        { id: '10', label: 'Wheel alignment and balancing' },
        { id: '11', label: 'Shock absorber and strut replacement' },
        { id: '12', label: 'CV joint and axle repair' },
        { id: '13', label: 'Radiator repair and replacement' },
        { id: '14', label: 'Fuel system service (cleaning, injector repair)' },
        { id: '15', label: 'Air conditioning system service and repair' },
        { id: '16', label: 'Computerized engine diagnostics (OBD scanning)' },
        { id: '17', label: 'Wiring and electrical system repair' },
        { id: '18', label: 'ECU reprogramming' },
        { id: '19', label: 'Sensor and fuse replacement' },
        { id: '20', label: 'Headlight, taillight, and signal light repairs' },
        { id: '21', label: 'Power window and central lock repair' },
        { id: '22', label: 'Dent removal (Paintless Dent Removal)' },
        { id: '23', label: 'Auto body repair and repainting' },
        { id: '24', label: 'Collision repair' },
        { id: '25', label: 'Rustproofing and undercoating' },
        { id: '26', label: 'Car detailing and polishing' },
        { id: '27', label: 'Headlight restoration' },
        { id: '28', label: 'Full car wash (interior and exterior)' },
        { id: '29', label: 'Engine wash' },
        { id: '30', label: 'Interior vacuuming and shampooing' },
        { id: '31', label: 'Ceramic coating or wax application' },
        { id: '32', label: 'Upholstery and leather care' },
        { id: '33', label: 'Tire replacement and sales' },
        { id: '34', label: 'Brake pads, rotors, and linings' },
        { id: '35', label: 'Filters (air, fuel, oil, cabin)' },
        { id: '36', label: 'Belts and hoses' },
        { id: '37', label: 'Spark plugs and ignition coils' },
        { id: '38', label: 'Accessories (car alarms, dashcams, LED lights, spoilers, etc.)' },
        { id: '39', label: 'Preventive maintenance service (PMS)' },
        { id: '40', label: 'LTO vehicle inspection assistance' },
        { id: '41', label: 'Emission testing assistance' },
        { id: '42', label: 'Vehicle pre-buy inspection' },
        { id: '43', label: 'Insurance claim estimates and repairs' },
        { id: '44', label: '24/7 towing service' },
        { id: '45', label: 'Roadside assistance' },
        { id: '46', label: 'Fleet maintenance (for companies with multiple vehicles)' },
        { id: '47', label: 'Car restoration (classic or vintage cars)' },
        { id: '48', label: 'Custom modifications and tuning' },
    ];

    useFocusEffect(
        useCallback(() => {
            let isActive = true;

            const fetchData = async () => {
                try {
                    setIsLoading(true);
                    const res = await getRepairShopInfo();

                    if (!isActive) return;

                    setRepShopID(res.repair_shop_id);
                    setRepShopName(res.shop_name);
                    setOwnerFirstname(res.owner_firstname);
                    setOwnerLastname(res.owner_lastname);
                    setGender(res.gender);
                    setMobileNum(res.mobile_num);
                    setEmail(res.email);
                    setServicesOffered(res.services_offered);
                    setRegion({
                        latitude: parseFloat(res.latitude),
                        longitude: parseFloat(res.longitude),
                        latitudeDelta: 0.01,
                        longitudeDelta: 0.01,
                    });
                    setProfilePic(res.profile_pic);
                    setShopImages(res.shop_images);

                    setLocalRepShopName(res.shop_name);
                    setLocalOwnerFirstname(res.owner_firstname);
                    setLocalOwnerLastname(res.owner_lastname);
                    setLocalGender(res.gender);
                    setLocalMobileNum(res.mobile_num);
                    setLocalEmail(res.email);
                    setLocalServicesOffered(res.services_offered);
                    setLocalRegion({
                        latitude: parseFloat(res.latitude),
                        longitude: parseFloat(res.longitude),
                        latitudeDelta: 0.01,
                        longitudeDelta: 0.01,
                    });

                } catch (e) {
                    console.error('Error: ', e);

                } finally {
                    if (isActive) setIsLoading(false);
                }
            };

            fetchData();

            return () => {
            isActive = false;
            setEdit('');
            setIsEditLocation(false);

            };
        }, [])
    );

    useEffect(() => {
        const newSocket = io(process.env.EXPO_PUBLIC_BACKEND_BASE_URL, {
          transports: ['websocket'],
        });
    
        setSocket(newSocket);
    
        newSocket.on('connect', () => {
          console.log('Connected to server: ', newSocket.id);
        });
    
        newSocket.on('updatedRepairShopInfo', ({ updatedRepairShopInfo }) => {
          setRepShopName(updatedRepairShopInfo.shop_name);
          setOwnerFirstname(updatedRepairShopInfo.owner_firstname);
          setOwnerLastname(updatedRepairShopInfo.owner_lastname);
          setGender(updatedRepairShopInfo.gender);
          setMobileNum(updatedRepairShopInfo.mobile_num);
          setEmail(updatedRepairShopInfo.email);
          setServicesOffered(updatedRepairShopInfo.services_offered);
          setRegion({
            latitude: parseFloat(updatedRepairShopInfo.latitude),
            longitude: parseFloat(updatedRepairShopInfo.longitude),
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          });
          setProfilePic(updatedRepairShopInfo.profile_pic);
          setShopImages(updatedRepairShopInfo.shop_images);
        });
    
        return () => {
          newSocket.off('updatedRepairShopInfo');
          newSocket.disconnect();
        };
    }, []);

    const handleRestoreInfo = (field: string) => {
        switch (field) {
            case 'rep-shop-name':
                setLocalRepShopName(repShopName);
                break;
            case 'firstname':
                setLocalOwnerFirstname(ownerFirstname);
                break;
            case 'lastname':
                setLocalOwnerLastname(ownerLastname);
                break;
            case 'gender':
                setLocalGender(gender);
                break;
            case 'mobile-num':
                setLocalMobileNum(mobileNum);
                break;
            case 'email':
                setLocalEmail(email);
                break;
            case 'services-offered':
                setLocalServicesOffered(servicesOffered);
                break;
            case 'region':
            default:
                setLocalRegion(region);
                break;
        }

        setEdit('');
    };

    const handleCancelChangePass = () => {
        setCurrentPassword(''),
        setNewPassword('');
        setConfirmPassword('');
        setPasswordError('');
        setModalVisible(!modalVisible);
    };

    const toggleCheckbox = (id: string) => {
        setLocalServicesOffered(prev => 
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
        setIsEditServices(true);
    };

    const handleDrag = (e: any) => {
        const { latitude, longitude } = e.nativeEvent.coordinate;

        const newRegion: Region = {
            ...localRegion!,
            latitude,
            longitude,
        };
        setLocalRegion(newRegion);
        mapRef.current?.animateToRegion(newRegion, 300);
    };

    const handleUpdateRepShopInfo = async (field: string) => {
        try {
            const repairShopData: UpdateRepairShopInfo = {
                owner_firstname: null,
                owner_lastname: null,
                gender: null,
                shop_name: null,
                mobile_num: null,
                email: null,
                currentPassword: null,
                newPassword: null,
                services_offered: null,
                longitude: null,
                latitude: null,
                profile_pic: null,
                shop_images: null,
                field: field,
            };

            const fetchedAutoRepairShops: AutoRepairShop[] = await getRepairShops();
            const userExcluded = fetchedAutoRepairShops.filter(repairShop => repairShop.repair_shop_id !== repShopID);

            switch (field) {
                case 'firstname':
                    repairShopData.owner_firstname = localOwnerFirstname.trim();
                    setOwnerFirstname(localOwnerFirstname);
                    break;
                case 'lastname':
                    repairShopData.owner_lastname = localOwnerLastname.trim();
                    setOwnerLastname(localOwnerLastname);
                    break;
                case 'gender':
                    repairShopData.gender = localGender.trim();
                    setGender(localGender);
                    break;
                case 'rep-shop-name':
                    repairShopData.shop_name = localRepShopName.trim();
                    setRepShopName(localRepShopName);
                    break;
                case 'mobile-num':
                    const mobileNumExists = userExcluded.some(repairShop => repairShop.mobile_num === localMobileNum.trim());

                    if (mobileNumExists) {
                        showMessage({
                            message: 'Mobile number is already used by another account.',
                            type: 'warning',
                            floating: true,
                            color: '#FFF',
                            icon: 'warning',
                        });
                        return;
                    };

                    repairShopData.mobile_num = localMobileNum.trim();
                    setMobileNum(localMobileNum);
                    break;
                case 'email':
                    const emailExists = userExcluded.some(repairShop => repairShop.email === localEmail !== null ? localEmail?.trim() : null);

                    if (emailExists) {
                        showMessage({
                            message: 'Email is already used by another account.',
                            type: 'warning',
                            floating: true,
                            color: '#FFF',
                            icon: 'warning',
                        });
                        return;
                    };

                    repairShopData.email = localEmail !== null ? localEmail.trim() : null;
                    setEmail(localEmail);
                    break;
                case 'change-password':
                    if (!currentPassword || !newPassword || !confirmPassword) {
                        setPasswordError('Please fill in all fields.');
                        return;
                    }

                    if (newPassword !== confirmPassword) {
                        setPasswordError("Password don't match.");
                        return;
                    }

                    if (newPassword.length < 8) {
                         setPasswordError('Password must be at least 8 characters.');
                        return;
                    }
                    
                    repairShopData.currentPassword = currentPassword.trim();
                    repairShopData.newPassword = newPassword.trim();
                    setModalVisible(false);
                    setCurrentPassword('');
                    setNewPassword('');
                    setConfirmPassword('');
                    setPasswordError('');
                    break;
                case 'services-offered':
                    repairShopData.services_offered = localServicesOffered;
                    setServicesOffered(localServicesOffered);
                    break;
                case 'region':
                    repairShopData.longitude = localRegion?.longitude !== undefined ? localRegion.longitude.toString() : '',
                    repairShopData.latitude = localRegion?.latitude !== undefined ? localRegion.latitude.toString() : '',
                    setRegion({
                        latitude: localRegion?.latitude !== undefined ? localRegion.latitude : 0,
                        longitude: localRegion?.longitude !== undefined ? localRegion.longitude : 0,
                        latitudeDelta: 0.01,
                        longitudeDelta: 0.01,
                    })
                    break;
                case 'profile':
                    repairShopData.profile_pic = profilePic;
                    break;
                case 'shop-images':
                    repairShopData.shop_images = shopImages;
                    break;
                default:
                    throw new Error('Unsupported field');
            };

            const res = await updateRepairShopInfo(repairShopData);

            if (res === '401') {
                setPasswordError('Wrong current password');
                return;
            }

            setEdit('');
            showMessage({
                message: 'Changes saved!',
                type: 'success',
                floating: true,
                color: '#FFF',
                icon: 'success',
            });

        } catch (e) {
            console.error('Eror:', e);
            showMessage({
                message: 'Something went wrong. Please try again.',
                type: 'danger',
                floating: true,
                color: '#FFF',
                icon: 'danger',
            });
        }
    };

    if (isLoading) {
        return <Loading />
    }

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior='padding'
                keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
                style={{ flex: 1 }}
            >
                <ScrollView
                    contentContainerStyle={{ flexGrow: 1 }}
                    keyboardShouldPersistTaps='handled' 
                >
                    <Header headerTitle='Edit Shop' link='/repair-shop/(tabs)' />

                    <View style={styles.lowerBox}>
                        <View style={styles.picRepNameContainer}>
                            <View style={styles.editPicContainer}>
                                <View style={styles.profilePicWrapper}>
                                    {profilePic === null && (
                                    <MaterialCommunityIcons name='car-wrench' size={50} color='#FFF' />
                                    )}

                                    {profilePic !== null && (
                                    <Image
                                        source={{ uri: profilePic }}
                                    />
                                    )}
                                </View>

                                <TouchableOpacity style={styles.editPicWrapper}>
                                    <MaterialCommunityIcons name='pencil' style={styles.editIcon} />
                                </TouchableOpacity>
                            </View>
                            
                            <View style={styles.infoEdit1}>
                                {edit === 'rep-shop-name' && (
                                    <>
                                        <TextInput
                                            style={styles.input1}
                                            value={localRepShopName}
                                            onChangeText={setLocalRepShopName}
                                        />

                                        {localRepShopName !== '' && (
                                            <TouchableOpacity onPress={() => handleUpdateRepShopInfo('rep-shop-name')}>
                                                <FontAwesome5 name='check' size={22} color='#22bb33' />
                                            </TouchableOpacity>
                                        )}
                                        
                                        {localRepShopName === '' && (
                                            <TouchableOpacity onPress={() => handleRestoreInfo('rep-shop-name')}>
                                                <Entypo name='cross' size={24} color='#780606' />
                                            </TouchableOpacity>
                                        )}
                                    </>
                                )}

                                {edit !== 'rep-shop-name' && (
                                    <>
                                        <Text style={styles.repShopName}>{localRepShopName}</Text>
                                        <TouchableOpacity onPress={() => setEdit('rep-shop-name')}>
                                            <MaterialIcons name='edit' size={22} color='#333' />
                                        </TouchableOpacity>
                                    </>
                                )}
                            </View>
                        </View>

                        <View style={styles.shopInfo}>
                            <Text style={styles.subHeader}>Owner Details</Text>
                            <View style={styles.row}>
                                <Text style={styles.infoLabel}>First Name:</Text>
                                <View style={styles.infoEdit2}>
                                    {edit === 'firstname' && (
                                        <>
                                            <TextInput 
                                                style={styles.input2}
                                                value={localOwnerFirstname}
                                                onChangeText={setLocalOwnerFirstname}
                                            />

                                            {localOwnerFirstname !== '' && (
                                                <TouchableOpacity onPress={() => handleUpdateRepShopInfo('firstname')}>
                                                    <FontAwesome5 name='check' size={16} color='#22bb33' />
                                                </TouchableOpacity>
                                            )}

                                            {localOwnerFirstname === '' && (
                                                <TouchableOpacity onPress={() => handleRestoreInfo('firstname')}>
                                                    <Entypo name='cross' size={18} color='#780606' />
                                                </TouchableOpacity>
                                            )}
                                        </>
                                    )}

                                    {edit !== 'firstname' && (
                                        <>
                                            <Text style={styles.infoText}>{localOwnerFirstname}</Text>
                                            <TouchableOpacity onPress={() => setEdit('firstname')}>
                                                <MaterialIcons name='edit' size={16} color='#555' />
                                            </TouchableOpacity> 
                                        </>
                                    )}        
                                </View>
                            </View>

                            <View style={styles.row}>
                                <Text style={styles.infoLabel}>Last Name:</Text>
                                <View style={styles.infoEdit2}>
                                    {edit === 'lastname' && (
                                        <>
                                            <TextInput 
                                                style={styles.input2}
                                                value={localOwnerLastname}
                                                onChangeText={setLocalOwnerLastname}
                                            />

                                            {localOwnerLastname !== '' && (
                                                <TouchableOpacity onPress={() => handleUpdateRepShopInfo('lastname')}>
                                                    <FontAwesome5 name='check' size={16} color='#22bb33' />
                                                </TouchableOpacity>
                                            )}

                                            {localOwnerLastname === '' && (
                                                <TouchableOpacity onPress={() => handleRestoreInfo('lastname')}>
                                                    <Entypo name='cross' size={18} color='#780606' />
                                                </TouchableOpacity>
                                            )}  
                                        </>
                                    )}

                                    {edit !== 'lastname' && (
                                        <>
                                            <Text style={styles.infoText}>{localOwnerLastname}</Text>
                                            <TouchableOpacity onPress={() => setEdit('lastname')}>
                                                <MaterialIcons name='edit' size={16} color='#555' />
                                            </TouchableOpacity> 
                                        </>
                                    )}
                                </View>
                            </View>

                            <View style={styles.row}>
                                <Text style={styles.infoLabel}>Gender:</Text>
                                <View style={styles.infoEdit2}>
                                    {edit === 'gender' && (
                                        <>
                                            <SelectDropdown
                                                data={genders}
                                                defaultValue={localGender}
                                                onSelect={(selectedItem) => setLocalGender(selectedItem)}
                                                renderButton={(selectedItem, isOpen) => (
                                                    <View style={styles.dropdownButtonStyle}>
                                                    <Text style={styles.dropdownButtonTxtStyle}>
                                                        {selectedItem || 'Select gender'}
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
                                                    <Text style={styles.dropdownItemTxtStyle}>{item}</Text>
                                                    </View>
                                                )}
                                                showsVerticalScrollIndicator={false}
                                                dropdownStyle={styles.dropdownMenuStyle}
                                            />
                                            <TouchableOpacity onPress={() => handleUpdateRepShopInfo('gender')}>
                                                <FontAwesome5 name='check' size={16} color='#22bb33' />
                                            </TouchableOpacity>
                                        </>
                                    )}

                                    {edit !== 'gender' && (
                                        <>
                                            <Text style={styles.infoText}>{localGender}</Text>
                                            <TouchableOpacity onPress={() => setEdit('gender')}>
                                                <MaterialIcons name='edit' size={16} color='#555' />
                                            </TouchableOpacity> 
                                        </>
                                    )}
                                </View>
                            </View>

                            <View style={styles.row}>
                                <Text style={styles.infoLabel}>Mobile Number:</Text>
                                <View style={styles.infoEdit2}>
                                    {edit === 'mobile-num' && (
                                        <>
                                            <TextInput 
                                                style={styles.input2}
                                                value={localMobileNum}
                                                onChangeText={setLocalMobileNum}
                                                keyboardType='number-pad'
                                            />

                                            {localMobileNum !== '' && (
                                                <TouchableOpacity onPress={() => handleUpdateRepShopInfo('mobile-num')}>
                                                    <FontAwesome5 name='check' size={16} color='#22bb33' />
                                                </TouchableOpacity>
                                            )}

                                            {localMobileNum === '' && (
                                                <TouchableOpacity onPress={() => handleRestoreInfo('mobile-num')}>
                                                    <Entypo name='cross' size={18} color='#780606' />
                                                </TouchableOpacity>
                                            )}
                                        </>
                                    )}

                                    {edit !== 'mobile-num' && (
                                        <>
                                            <Text style={styles.infoText}>{localMobileNum}</Text>
                                            <TouchableOpacity onPress={() => setEdit('mobile-num')}>
                                                <MaterialIcons name='edit' size={16} color='#555' />
                                            </TouchableOpacity> 
                                        </>
                                    )}
                                </View>
                            </View>

                            <View style={styles.row}>
                                <Text style={styles.infoLabel}>Email:</Text>
                                {localEmail === null && (
                                    <TouchableOpacity style={styles.editButton} onPress={() => {
                                        setLocalEmail('');
                                        setEdit('email');
                                    }}>
                                        <Text style={styles.editButtonText}>Add Email</Text>
                                    </TouchableOpacity>
                                )}
                                
                                {localEmail !== null && (
                                    <View style={styles.infoEdit2}>
                                        {edit === 'email' && (
                                        <>
                                            <TextInput 
                                                style={styles.input2}
                                                value={localEmail}
                                                onChangeText={setLocalEmail}
                                            />

                                            {localEmail !== '' && (
                                                <TouchableOpacity onPress={() => handleUpdateRepShopInfo('email')}>
                                                    <FontAwesome5 name='check' size={16} color='#22bb33' />
                                                </TouchableOpacity>
                                            )}  

                                            {localEmail === '' && (
                                                <TouchableOpacity onPress={() => handleRestoreInfo('email')}>
                                                    <Entypo name='cross' size={18} color='#780606' />
                                                </TouchableOpacity>
                                            )}                                            
                                        </>
                                    )}

                                    {edit !== 'email' && (
                                        <>
                                            <Text style={styles.infoText}>{localEmail}</Text>
                                            <TouchableOpacity onPress={() => setEdit('email')}>
                                                <MaterialIcons name='edit' size={16} color='#555' />
                                            </TouchableOpacity> 
                                        </>
                                    )}
                                    </View>
                                )}
                            </View>

                            <View style={styles.row}>
                                <Text style={styles.infoLabel}>Password:</Text>
                                <View style={styles.infoEdit2}>
                                    <TouchableOpacity style={styles.editButton} onPress={() => setModalVisible(true)}>
                                        <Text style={styles.editButtonText}>Change Password</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>

                        <View style={styles.servicesOffered}>
                            <Text style={styles.subHeader}>Services Offered</Text>
                            {services.map((item) => (
                                <View key={item.id} style={styles.checkboxContainer}>
                                    <Checkbox
                                        value={localServicesOffered.includes(item.label)}
                                        onValueChange={() => toggleCheckbox(item.label)}
                                        color={localServicesOffered.includes(item.label) ? '#000B58' : undefined}
                                    />
                                    <Text style={styles.checkboxTxt}>{item.label}</Text>
                                </View>
                            ))}

                            {isEditServices && (
                                <View style={styles.cancelSaveContainer}>
                                    <TouchableOpacity style={[styles.modalButton, { borderWidth: 1, borderColor: '#555' }]} onPress={() => {
                                        handleRestoreInfo('services-offered');
                                        setIsEditServices(false);
                                    }}>
                                        <Text style={[styles.modalButtonText, { color: '#555' }]}>Cancel</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity style={[styles.modalButton, { backgroundColor: '#000B58' }]} onPress={() => {
                                        handleUpdateRepShopInfo('services-offered');
                                        setIsEditServices(false);
                                    }}>
                                        <Text style={[styles.modalButtonText, { color: '#FFF' }]}>Save</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>

                        <View style={styles.shopImages}>
                            <Text style={styles.subHeader}>Shop Images</Text>
                            {shopImages === null && (
                                <TouchableOpacity style={styles.editButton2}>
                                    <MaterialCommunityIcons name='image-plus' size={16} color='#555' />
                                    <Text style={[styles.editButtonText, { color: '#555' }]}>Upload Image</Text>
                                </TouchableOpacity>
                            )}

                            {shopImages !== null && (
                                <>
                                    <View style={styles.imagesContainer}>
                                        {shopImages.map((item) => (
                                            <TouchableOpacity key={item} onPress={() => {
                                                setImageSource(item);
                                                setImageModalVisible(true);
                                            }}>
                                                <Image
                                                    key={item}
                                                    style={styles.image}
                                                    source={{ uri: item }}
                                                    width={100}
                                                    height={100}
                                                />
                                            </TouchableOpacity>
                                        ))}
                                        <TouchableOpacity style={styles.addImageButton}>
                                            <MaterialCommunityIcons name='image-plus' size={30} color='#555' />
                                        </TouchableOpacity>
                                    </View>
                                </>
                            )}
                        </View>

                        <View style={styles.shopLocation}>
                            <Text style={styles.subHeader}>Shop Location</Text>
                            {!isEditLocation && (
                                <TouchableOpacity style={styles.editButton2} onPress={() => setMapModalVisible(true)}>
                                    <Entypo name='location' size={16} color='#555' />
                                    <Text style={[styles.editButtonText, { color: '#555' }]}>Edit Location</Text>
                                </TouchableOpacity>
                            )}

                            {isEditLocation && (
                                <View style={styles.mapButtonContainer}>
                                    <View style={styles.mapView2}>
                                        <MapView
                                            style={styles.map2}
                                            ref={mapRef}
                                            mapType='hybrid'
                                            region={localRegion}
                                        >
                                            {region && (
                                                <Marker
                                                    coordinate={{
                                                        latitude: region.latitude,
                                                        longitude: region.longitude,
                                                    }}
                                                />
                                            )}
                                        </MapView>
                                    </View>

                                    <TouchableOpacity style={styles.editButton3} onPress={() => setMapModalVisible(true)}>
                                        <Entypo name='location' size={16} color='#555' />
                                        <Text style={[styles.editButtonText, { color: '#555' }]}>Edit Location</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>

                        <Modal
                            animationType='fade'
                            backdropColor={'rgba(0, 0, 0, 0.5)'}
                            visible={modalVisible}
                            onRequestClose={() => {
                                setModalVisible(!setModalVisible);
                                setCurrentPassword('');
                                setNewPassword('');
                                setConfirmPassword('');
                            }}
                        >
                            <View style={styles.centeredView}>
                                <View style={styles.modalView}>
                                    <Text style={styles.modalHeader}>Change Password</Text>
                                    <View style={styles.modalInputContainer}>
                                        <Text style={styles.modalInputLabel}>Current Password</Text>
                                        <TextInput
                                            value={currentPassword}
                                            onChangeText={setCurrentPassword}
                                            style={styles.modalInput}
                                            secureTextEntry
                                        />
                                    </View>
    
                                    <View style={styles.modalInputContainer}>
                                        <Text style={styles.modalInputLabel}>New Password</Text>
                                        <TextInput
                                            value={newPassword}
                                            onChangeText={setNewPassword}
                                            style={styles.modalInput}
                                            secureTextEntry
                                        />
                                    </View>
    
                                    <View style={styles.modalInputContainer}>
                                        <Text style={styles.modalInputLabel}>Confirm New Password</Text>
                                        <TextInput
                                            value={confirmPassword}
                                            onChangeText={setConfirmPassword}
                                            style={styles.modalInput}
                                            secureTextEntry
                                        />
                                    </View>

                                    {passwordError.length > 0 && (
                                        <View style={styles.errorContainer}>
                                            <Text style={styles.errorMessage}>{passwordError}</Text>
                                        </View>
                                    )}
    
                                    <View style={styles.cancelSaveContainer}>
                                        <TouchableOpacity style={[styles.modalButton, { borderWidth: 1, borderColor: '#555' }]} onPress={() => handleCancelChangePass()}>
                                            <Text style={[styles.modalButtonText, { color: '#555' }]}>Cancel</Text>
                                        </TouchableOpacity>
    
                                        <TouchableOpacity style={[styles.modalButton, { backgroundColor: '#000B58' }]} onPress={() => handleUpdateRepShopInfo('change-password')}>
                                            <Text style={[styles.modalButtonText, { color: '#FFF' }]}>Save</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        </Modal>

                        <Modal
                            animationType='fade'
                            backdropColor={'rgba(0, 0, 0, 0.5)'}
                            visible={mapModalVisible}
                            onRequestClose={() => {
                                setMapModalVisible(false);
                                handleRestoreInfo('region');
                            }}
                        >
                            <View style={styles.centeredView}>
                                <View style={styles.mapView}>
                                    <MapView
                                        style={styles.map}
                                        ref={mapRef}
                                        mapType='hybrid'
                                        initialRegion={localRegion}
                                        onRegionChangeComplete={(newRegion) => setLocalRegion(newRegion)}
                                    >
                                        {localRegion && (
                                            <Marker
                                                coordinate={{
                                                    latitude: localRegion.latitude,
                                                    longitude: localRegion.longitude,
                                                }}
                                                draggable
                                                onDragEnd={handleDrag}
                                            />
                                        )}
                                    </MapView>

                                    <View style={styles.cancelSaveContainer}>
                                        <TouchableOpacity style={[styles.modalButton, { borderWidth: 1, borderColor: '#555' }]} onPress={() => {
                                            setMapModalVisible(false);
                                            handleRestoreInfo('region');
                                        }}>
                                            <Text style={[styles.modalButtonText, { color: '#555' }]}>Cancel</Text>
                                        </TouchableOpacity>
    
                                        <TouchableOpacity style={[styles.modalButton, { backgroundColor: '#000B58' }]} onPress={() => {
                                            handleUpdateRepShopInfo('region');
                                            setMapModalVisible(false);
                                            setIsEditLocation(true);
                                        }}>
                                            <Text style={[styles.modalButtonText, { color: '#FFF' }]}>Save</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        </Modal>

                        <Modal
                            animationType='fade'
                            backdropColor={'rgba(0, 0, 0, 0.5)'}
                            visible={imageModalVisible}
                            onRequestClose={() => {
                                setImageModalVisible(false);
                                setImageSource('');
                            }}
                        >
                            <View style={styles.centeredView}>
                                <View style={styles.imageView}>
                                    <Image 
                                        width={300}
                                        height={300}
                                        style={styles.viewImage}
                                        source={{ uri: imageSource }}
                                    />
                                    
                                    <View style={styles.cancelSaveContainer}>
                                        <TouchableOpacity style={[styles.modalButton, { borderWidth: 1, borderColor: '#555' }]} onPress={() => {
                                            setImageModalVisible(false);
                                            setImageSource('');
                                        }}>
                                            <Text style={[styles.modalButtonText, { color: '#555' }]}>Cancel</Text>
                                        </TouchableOpacity>
    
                                        <TouchableOpacity style={[styles.modalButton, { backgroundColor: '#780606' }]}>
                                            <Text style={[styles.modalButtonText, { color: '#FFF' }]}>Delete</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        </Modal>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
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
        marginTop: 20,
        marginBottom: 100,
    },
    picRepNameContainer: {
        alignItems: 'center',
        gap: 10,
        width: '100%',
        borderBottomWidth: 1,
        borderColor: '#EAEAEA',
        paddingBottom: 20,
    },
    editPicContainer: {
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
    }, 
    profilePicWrapper: {
        backgroundColor: 'green',
        width: 120,
        height: 120,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 120,
        position: 'absolute',
        zIndex: 1,
    },   
    editPicWrapper: {
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
        width: 120,
        height: 120,
        borderRadius: 120,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 2,
    },
    editIcon: {
        fontSize: 30,
        color: '#000B58',
    },
    infoEdit1: {
        flexDirection: 'row',
        alignItems: 'center',
        maxWidth: '100%',
        gap: 10,
    },
    infoEdit2: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '62%',
        gap: 10,
    },
    repShopName: {
        fontFamily: 'LeagueSpartan_Bold',
        fontSize: 22,
        color: '#333',
        maxWidth: '90%',
    },
    shopInfo: {
        marginTop: 10,
        borderBottomWidth: 1,
        borderColor: '#EAEAEA',
        paddingBottom: 10,
    },
    subHeader: {
        fontFamily: 'LeagueSpartan_Bold',
        fontSize: 18,
        color: '#333',
        marginBottom: 10,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        width: '100%',
    },
    editButton: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    editButtonText: {
        fontFamily: 'LeagueSpartan',
        fontSize: 16,
        color: '#000B58'
    },
    infoLabel: {
        fontFamily: 'LeagueSpartan_Bold',
        fontSize: 16,
        width: '38%',
        color: '#555',
    },
    infoText: {
        fontFamily: 'LeagueSpartan',
        fontSize: 16,
        color: '#555',
        maxWidth: '85%',
    },
    servicesOffered: {
        marginTop: 10,
        borderBottomWidth: 1,
        borderColor: '#EAEAEA',
        paddingBottom: 10,
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 10,
        width: '90%',
    },
    checkboxTxt: {
        fontSize: 16,
        fontFamily: 'LeagueSpartan',
        color: '#555',
    },
    shopImages: {
        marginTop: 10,
        borderBottomWidth: 1,
        borderColor: '#EAEAEA',
        paddingBottom: 20,
    },
    editButton2: {
        backgroundColor: '#D9D9D9',
        minHeight: 100,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
        flexDirection: 'row',
        gap: 5,
    },
    imagesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        width: '100%',
        gap: 5,
    },
    image: {
        borderRadius: 5,
    },
     addImageButton: {
        width: 100,
        height: 100,
        borderRadius: 5,
        backgroundColor: '#D9D9D9',
        justifyContent: 'center',
        alignItems: 'center',
    },
    shopLocation: {
        marginTop: 10,
        paddingBottom: 20,
    },
    cancelSaveContainer: {
        marginTop: 10,
        flexDirection: 'row',
        justifyContent: 'center',
        width: '100%',
        gap: 10,
    },
    endingButton: {
        width: '30%',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 10,
        borderRadius: 5,
    },
    endingButtonText: {
        fontFamily: 'LeagueSpartan_Bold',
        fontSize: 16,
    },
    input1: {
        fontFamily: 'LeagueSpartan_Bold',
        fontSize: 22,
        color: '#333',
        padding: 0,
        borderBottomWidth: 1,
        borderColor: '#555',
        minWidth: 50,
        maxWidth: '90%',
    },
    input2: {
        fontFamily: 'LeagueSpartan',
        fontSize: 16,
        color: '#555',
        padding: 0,
        borderBottomWidth: 1,
        borderColor: '#555',
        minWidth: 30,
        maxWidth: '85%',
    },
    dropdownButtonStyle: {
        width: '50%',
        padding: 0,
        backgroundColor: '#EAEAEA',
        borderRadius: 5,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 5,
    },
    dropdownButtonTxtStyle: {
        flex: 1,
        fontSize: 16,
        color: '#555',
        fontFamily: 'LeagueSpartan',
    },
    dropdownButtonArrowStyle: {
        fontSize: 24,
        color: '#555',
    },
    dropdownMenuStyle: {
        backgroundColor: '#EAEAEA',
        borderRadius: 5,
        marginTop: -1,
    },
    dropdownItemStyle: {
        width: '100%',
        flexDirection: 'row',
        paddingHorizontal: 5,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 8,
    },
    dropdownItemTxtStyle: {
        flex: 1,
        fontSize: 16,
        color: '#555',
        fontFamily: 'LeagueSpartan',
    },
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalView: {
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
    modalInputContainer: {
        gap: 10,
        marginTop: 10,
        width: '100%',
    },
    modalInputLabel: {
        fontSize: 16,
        fontFamily: 'LeagueSpartan',
        color: '#333',
    },
    modalInput: {
        backgroundColor: '#EAEAEA',
        width: '100%',
        height: 45,
        borderRadius: 10,
        padding: 10,
        fontSize: 16,
        color: '#333',
        fontFamily: 'LeagueSpartan',
    },
    modalButton: {
        width: '30%',
        height: 45,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
    },
    modalButtonText: {
        fontSize: 16,
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
    mapView: {
        backgroundColor: '#FFF',
        width: '95%',
        borderRadius: 10,
        paddingBottom: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        overflow: 'hidden',
    },
    map: {
        width: '100%',
        height: 500,
        borderTopRightRadius: 10,
        borderTopLeftRadius: 10,
    },
    mapButtonContainer: {
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    mapView2: {
        minHeight: 100,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
        overflow: 'hidden',
        width: '100%',
        position: 'absolute',
        zIndex: 1,
    },
    map2: {
        width: '100%',
        height: 100,
    },
    editButton3: {
        backgroundColor: 'rgba(217, 217, 217, 0.8)',
        minHeight: 100,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
        flexDirection: 'row',
        width: '100%',
        gap: 5,
        zIndex: 2,
    },
    imageView: {
        backgroundColor: '#FFF',
        width: '85%',
        borderRadius: 10,
        paddingBottom: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        overflow: 'hidden',
    },
    viewImage: {
        width: '100%',
        borderTopRightRadius: 10,
        borderTopLeftRadius: 10,
    },
})

export default editShop;