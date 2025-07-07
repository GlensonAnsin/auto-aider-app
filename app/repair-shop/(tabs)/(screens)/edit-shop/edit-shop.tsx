import { Header } from '@/components/Header';
import { Loading } from '@/components/Loading';
import { getRepairShopInfo } from '@/services/backendApi';
import AntDesign from '@expo/vector-icons/AntDesign';
import Entypo from '@expo/vector-icons/Entypo';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useEffect, useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Region } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';

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
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isEditLocation, setIsEditLocation] = useState<boolean>(false);

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
        })()
    }, []);

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
                                
                                <View style={styles.infoEdit}>
                                    <Text style={styles.repShopName}>{repShopName}</Text>
                                    <TouchableOpacity>
                                        <MaterialIcons name='edit' size={22} color='#333' />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <View style={styles.shopInfo}>
                                <Text style={styles.subHeader}>Owner Details</Text>
                                <View style={styles.row}>
                                    <Text style={styles.infoLabel}>First Name:</Text>
                                    <View style={styles.infoEdit}>
                                        <Text style={styles.infoText}>{ownerFirstname}</Text>
                                        <TouchableOpacity>
                                            <MaterialIcons name='edit' size={16} color='#555' />
                                        </TouchableOpacity>         
                                    </View>
                                </View>

                                <View style={styles.row}>
                                    <Text style={styles.infoLabel}>Last Name:</Text>
                                    <View style={styles.infoEdit}>
                                        <Text style={styles.infoText}>{ownerLastname}</Text>
                                        <TouchableOpacity>
                                            <MaterialIcons name='edit' size={16} color='#555' />
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                <View style={styles.row}>
                                    <Text style={styles.infoLabel}>Gender:</Text>
                                    <View style={styles.infoEdit}>
                                        <Text style={styles.infoText}>{gender}</Text>
                                        <TouchableOpacity>
                                            <MaterialIcons name='edit' size={16} color='#555' />
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                <View style={styles.row}>
                                    <Text style={styles.infoLabel}>Mobile Number:</Text>
                                    <View style={styles.infoEdit}>
                                        <Text style={styles.infoText}>{mobileNum}</Text>
                                        <TouchableOpacity>
                                            <MaterialIcons name='edit' size={16} color='#555' />
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                <View style={styles.row}>
                                    <Text style={styles.infoLabel}>Email:</Text>
                                    {email === null && (
                                        <TouchableOpacity style={styles.editButton}>
                                            <Text style={styles.editButtonText}>Add Email</Text>
                                        </TouchableOpacity>
                                    )}
                                    
                                    {email !== null && (
                                        <View style={styles.infoEdit}>
                                            <Text style={styles.infoText}>{email}</Text>
                                            <TouchableOpacity>
                                                <MaterialIcons name='edit' size={16} color='#555' />
                                            </TouchableOpacity>
                                        </View>
                                    )}
                                </View>

                                <View style={styles.row}>
                                    <Text style={styles.infoLabel}>Password:</Text>
                                    <View style={styles.infoEdit}>
                                        <TouchableOpacity style={styles.editButton}>
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
    infoEdit: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
    },
    repShopName: {
        fontFamily: 'LeagueSpartan_Bold',
        fontSize: 22,
        color: '#333',
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
        width: '50%',
        color: '#555',
    },
    infoText: {
        fontFamily: 'LeagueSpartan',
        fontSize: 16,
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
})

export default editShop;