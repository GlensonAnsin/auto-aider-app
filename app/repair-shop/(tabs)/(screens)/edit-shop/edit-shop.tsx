import { Header } from '@/components/Header';
import { Loading } from '@/components/Loading';
import { getRepairShopInfo } from '@/services/backendApi';
import AntDesign from '@expo/vector-icons/AntDesign';
import Entypo from '@expo/vector-icons/Entypo';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useEffect, useState } from 'react';
import { Image, KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Region } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';
import SelectDropdown from 'react-native-select-dropdown';

const editShop = () => {
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
    const [edit, setEdit] = useState<string>('');
    const [modalVisible, setModalVisible] = useState<boolean>(false);
    const [restore, setRestore] = useState<number>(0);

    const genders = ['Male', 'Female'];

    useEffect(() => {
        (async () => {
            try {
                setIsLoading(true);
                const res = await getRepairShopInfo();

                setRepShopID(res.repair_shop_id);
                setRepShopName(res.shop_name);
                setOwnerFirstname(res.owner_firstname);
                setOwnerLastname(res.owner_lastname);
                setGender(res.gender);
                setMobileNum(res.mobile_num);
                setEmail(res.email);
                setServicesOffered(res.services_offered);
                setRegion({
                    latitude: res.latitude,
                    longitude: res.longitude,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                });
                setProfilePic(res.profile_pic);
                setShopImages(res.shop_images);

            } catch (e) {
                console.error('Error: ', e);

            } finally {
                setIsLoading(false);
            }
        })();
    }, [restore]);

    const handleRestoreInfo = () => {
        setRestore(restore + 1);
        setEdit('');
    };

    const handleCancelChangePass = () => {
        setCurrentPassword(''),
        setNewPassword('');
        setConfirmPassword('');
        setModalVisible(!modalVisible);
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
                        <Header headerTitle='Edit Shop' link='../' />

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
                                                value={repShopName}
                                                onChangeText={setRepShopName}
                                            />

                                            {repShopName !== '' && (
                                                <TouchableOpacity onPress={() => setEdit('')}>
                                                    <FontAwesome5 name='check' size={22} color='#22bb33' />
                                                </TouchableOpacity>
                                            )}
                                            
                                            {repShopName === '' && (
                                                <TouchableOpacity onPress={() => handleRestoreInfo()}>
                                                    <Entypo name='cross' size={24} color='#780606' />
                                                </TouchableOpacity>
                                            )}
                                        </>
                                    )}

                                    {edit !== 'rep-shop-name' && (
                                        <>
                                            <Text style={styles.repShopName}>{repShopName}</Text>
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
                                                    value={ownerFirstname}
                                                    onChangeText={setOwnerFirstname}
                                                />

                                                {ownerFirstname !== '' && (
                                                    <TouchableOpacity onPress={() => setEdit('')}>
                                                        <FontAwesome5 name='check' size={16} color='#22bb33' />
                                                    </TouchableOpacity>
                                                )}

                                                {ownerFirstname === '' && (
                                                    <TouchableOpacity onPress={() => handleRestoreInfo()}>
                                                        <Entypo name='cross' size={18} color='#780606' />
                                                    </TouchableOpacity>
                                                )}
                                            </>
                                        )}

                                        {edit !== 'firstname' && (
                                            <>
                                                <Text style={styles.infoText}>{ownerFirstname}</Text>
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
                                                    value={ownerLastname}
                                                    onChangeText={setOwnerLastname}
                                                />

                                                {ownerLastname !== '' && (
                                                    <TouchableOpacity onPress={() => setEdit('')}>
                                                        <FontAwesome5 name='check' size={16} color='#22bb33' />
                                                    </TouchableOpacity>
                                                )}

                                                {ownerLastname === '' && (
                                                    <TouchableOpacity onPress={() => handleRestoreInfo()}>
                                                        <Entypo name='cross' size={18} color='#780606' />
                                                    </TouchableOpacity>
                                                )}  
                                            </>
                                        )}

                                        {edit !== 'lastname' && (
                                            <>
                                                <Text style={styles.infoText}>{ownerLastname}</Text>
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
                                                    defaultValue={gender}
                                                    onSelect={(selectedItem) => setGender(selectedItem)}
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
                                                <TouchableOpacity onPress={() => setEdit('')}>
                                                    <FontAwesome5 name='check' size={16} color='#22bb33' />
                                                </TouchableOpacity>
                                            </>
                                        )}

                                        {edit !== 'gender' && (
                                            <>
                                                <Text style={styles.infoText}>{gender}</Text>
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
                                                    value={mobileNum}
                                                    onChangeText={setMobileNum}
                                                    keyboardType='number-pad'
                                                />

                                                {mobileNum !== '' && (
                                                    <TouchableOpacity onPress={() => setEdit('')}>
                                                        <FontAwesome5 name='check' size={16} color='#22bb33' />
                                                    </TouchableOpacity>
                                                )}

                                                {mobileNum === '' && (
                                                    <TouchableOpacity onPress={() => handleRestoreInfo()}>
                                                        <Entypo name='cross' size={18} color='#780606' />
                                                    </TouchableOpacity>
                                                )}
                                            </>
                                        )}

                                        {edit !== 'mobile-num' && (
                                            <>
                                                <Text style={styles.infoText}>{mobileNum}</Text>
                                                <TouchableOpacity onPress={() => setEdit('mobile-num')}>
                                                    <MaterialIcons name='edit' size={16} color='#555' />
                                                </TouchableOpacity> 
                                            </>
                                        )}
                                    </View>
                                </View>

                                <View style={styles.row}>
                                    <Text style={styles.infoLabel}>Email:</Text>
                                    {email === null && (
                                        <TouchableOpacity style={styles.editButton} onPress={() => {
                                            setEmail('');
                                            setEdit('email');
                                        }}>
                                            <Text style={styles.editButtonText}>Add Email</Text>
                                        </TouchableOpacity>
                                    )}
                                    
                                    {email !== null && (
                                        <View style={styles.infoEdit2}>
                                            {edit === 'email' && (
                                            <>
                                                <TextInput 
                                                    style={styles.input2}
                                                    value={email}
                                                    onChangeText={setEmail}
                                                />

                                                {email !== '' && (
                                                    <TouchableOpacity onPress={() => setEdit('')}>
                                                        <FontAwesome5 name='check' size={16} color='#22bb33' />
                                                    </TouchableOpacity>
                                                )}  

                                                {email === '' && (
                                                    <TouchableOpacity onPress={() => handleRestoreInfo()}>
                                                        <Entypo name='cross' size={18} color='#780606' />
                                                    </TouchableOpacity>
                                                )}                                            
                                            </>
                                        )}

                                        {edit !== 'email' && (
                                            <>
                                                <Text style={styles.infoText}>{email}</Text>
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

                            <View style={styles.shopImages}>
                                <Text style={styles.subHeader}>Shop Images</Text>
                                {shopImages === null && (
                                    <TouchableOpacity style={styles.editButton2}>
                                        <AntDesign name='plussquareo' size={16} color='#000B58' />
                                        <Text style={styles.editButtonText}>Upload Image</Text>
                                    </TouchableOpacity>
                                )}
                            </View>

                            <View style={styles.shopLocation}>
                                <Text style={styles.subHeader}>Shop Location</Text>
                                {!isEditLocation && (
                                    <TouchableOpacity style={styles.editButton2}>
                                        <Entypo name='location' size={16} color='#000B58' />
                                        <Text style={styles.editButtonText}>Edit Location</Text>
                                    </TouchableOpacity>
                                )}
                            </View>

                            <View style={styles.cancelSaveContainer}>
                                <TouchableOpacity style={[styles.endingButton, { borderWidth: 1, borderColor: '#555' }]}>
                                    <Text style={[styles.endingButtonText, { color: '#555' }]}>Cancel</Text>
                                </TouchableOpacity>

                                 <TouchableOpacity style={[styles.endingButton, { backgroundColor: '#000B58' }]}>
                                    <Text style={[styles.endingButtonText, { color: '#FFF' }]}>Save</Text>
                                </TouchableOpacity>
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
        
                                        <View style={styles.cancelSaveContainer}>
                                            <TouchableOpacity style={[styles.modalButton, { borderWidth: 1, borderColor: '#555' }]} onPress={() => handleCancelChangePass()}>
                                                <Text style={[styles.modalButtonText, { color: '#555' }]}>Cancel</Text>
                                            </TouchableOpacity>
        
                                            <TouchableOpacity style={[styles.modalButton, { backgroundColor: '#000B58' }]}>
                                                <Text style={[styles.modalButtonText, { color: '#FFF' }]}>Save</Text>
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
        zIndex: 1,
    },   
    editPicWrapper: {
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
        width: 120,
        height: 120,
        borderRadius: 120,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
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
})

export default editShop;