import { Header } from '@/components/Header';
import { getUserInfo } from '@/services/backendApi';
import { Link, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Image, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const Profile = () => {
    const router = useRouter();

    const [currentPassword, setCurrentPassword] = useState<string>('');
    const [newPassword, setNewPassword] = useState<string>('');
    const [confirmPassword, setConfirmPassword] = useState<string>('');
    const [modalVisible, isModalVisible] = useState<boolean>(false);
    const [firstname, setFirstname] = useState<string>('');
    const [lastname, setLastname] = useState<string>('');
    const [mobileNum, setMobileNum] = useState<string>('');
    const [email, setEmail] = useState<string | null>(null);
    const [profilePic, setProfilePic] = useState<string | null>(null);

    useEffect(() => {
        (async () => {
            try {
                const res = await getUserInfo();
                
                setFirstname(res.firstname);
                setLastname(res.lastname);
                setMobileNum(res.mobile_num);
                setEmail(res.email);
                setProfilePic(res.profile_pic);

            } catch (e) {
                console.error('Error: ', e);
            }
        })();
    }, []);
    
    return (
        <SafeAreaProvider>
            <SafeAreaView style={styles.container}>
                <Header headerTitle='Profile' link='/car-owner/(tabs)' />

                <View style={styles.lowerBox}>
                    <View style={styles.userContainer}>
                        <View style={styles.profilePicWrapper}>
                            {profilePic === null && (
                                <Text style={styles.userInitials}>{`${firstname[0]}${lastname[0]}`}</Text>
                            )}

                            {profilePic !== null && (
                                <Image
                                    source={{ uri: profilePic }}
                                />
                            )}
                        </View>

                        <View style={styles.userNameContainer}>
                            <Text style={styles.userName}>{`${firstname} ${lastname}`}</Text>
                            <Text style={styles.userContact}>{`${mobileNum}`}</Text>
                            {email !== null && (
                                <Text style={styles.userContact}>{`${email}`}</Text>
                            )}
                        </View>
                    </View>

                    <View style={styles.profileTabContainer}>
                        <Link href='/car-owner/(tabs)/(screens)/profile/edit-profile' style={styles.profileTab} asChild>
                            <TouchableOpacity>
                                <Icon
                                    name='account-edit-outline'
                                    style={styles.icon}
                                />
                                <Text style={styles.tabName}>Edit Profile</Text>
                                <Icon
                                    name='arrow-right-thin'
                                    style={styles.forwardIcon}
                                />
                            </TouchableOpacity>
                        </Link>

                        <Link href='/car-owner/(tabs)/(screens)/profile/manage-vehicles' style={styles.profileTab} asChild>
                            <TouchableOpacity>
                                <Icon
                                    name='car-outline'
                                    style={styles.icon}
                                />
                                <Text style={styles.tabName}>Manage Connected Vehicles</Text>
                                <Icon
                                    name='arrow-right-thin'
                                    style={styles.forwardIcon}
                                />
                            </TouchableOpacity>
                        </Link>

                        <TouchableOpacity style={styles.profileTab} onPress={() => isModalVisible(true)}>
                            <Icon
                                name='lock-outline'
                                style={styles.icon}
                            />
                            <Text style={styles.tabName}>Change Password</Text>
                            <Icon
                                name='arrow-right-thin'
                                style={styles.forwardIcon}
                            />
                        </TouchableOpacity>

                        <Link href='/auth/login' style={styles.profileTab} asChild>
                            <TouchableOpacity>
                                <Icon
                                    name='logout'
                                    style={[styles.icon, {color: 'red'}]}
                                />
                                <Text style={[styles.tabName, {color: 'red'}]}>Logout</Text>
                                <Icon
                                    name='arrow-right-thin'
                                    style={[styles.forwardIcon, {color: 'red'}]}
                                />
                            </TouchableOpacity>
                        </Link>

                        <Modal
                            animationType='fade'
                            backdropColor={'rgba(0, 0, 0, 0.5)'}
                            visible={modalVisible}
                            onRequestClose={() => {
                                isModalVisible(!isModalVisible);
                                setCurrentPassword('');
                                setNewPassword('');
                                setConfirmPassword('');
                            }}
                        >
                            <View style={styles.centeredView}>
                                <View style={styles.modalView}>
                                    <Text style={styles.modalHeader}>Change Password</Text>
                                    <View style={styles.textInputContainer}>
                                        <Text style={styles.textInputLbl}>Current Password</Text>
                                        <TextInput
                                            value={currentPassword}
                                            onChangeText={setCurrentPassword}
                                            style={styles.input}
                                            secureTextEntry
                                        />
                                    </View>

                                    <View style={styles.textInputContainer}>
                                        <Text style={styles.textInputLbl}>New Password</Text>
                                        <TextInput
                                            value={newPassword}
                                            onChangeText={setNewPassword}
                                            style={styles.input}
                                            secureTextEntry
                                        />
                                    </View>

                                    <View style={styles.textInputContainer}>
                                        <Text style={styles.textInputLbl}>Confirm New Password</Text>
                                        <TextInput
                                            value={confirmPassword}
                                            onChangeText={setConfirmPassword}
                                            style={styles.input}
                                            secureTextEntry
                                        />
                                    </View>

                                    <TouchableOpacity style={styles.button} onPress={() => isModalVisible(!modalVisible)}>
                                        <Text style={styles.buttonTxt}>Save</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </Modal>
                    </View>
                </View>
            </SafeAreaView>
        </SafeAreaProvider>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF',
    },
    lowerBox: {
        alignItems: 'center',
        flex: 1,
    },
    userContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 50,
        width: '90%',
    },
    userNameContainer: {
        flexDirection: 'column',
        width: '65%',
    },
    userName: {
        fontFamily: 'LeagueSpartan_Bold',
        fontSize: 22,
        color: '#333',
    },
    userContact: {
        fontFamily: 'LeagueSpartan',
        fontSize: 16,
        color: '#555',
    },
    profilePicWrapper: {
        backgroundColor: 'green',
        width: 100,
        height: 100,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 100,
    },
    userInitials: {
        fontFamily: 'LeagueSpartan_Bold',
        fontSize: 30,
        color: '#FFF',
    },
    profileTabContainer: {
        width: '100%',
        marginTop: 30,
        gap: 5,
    },
    profileTab: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#EAEAEA',
        padding: 10,
        gap: 35,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    icon: {
        fontSize: 35,
        color: '#000B58',
    },
    tabName: {
        color: '#000B58',
        fontFamily: 'LeagueSpartan',
        fontSize: 16,
        width: 200,
    },
    forwardIcon: {
        fontSize: 35,
        color: '#000B58',
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
    input: {
        backgroundColor: '#EAEAEA',
        width: '100%',
        height: 45,
        borderRadius: 10,
        padding: 10,
        fontSize: 16,
        color: '#333',
        fontFamily: 'LeagueSpartan',
    },
    button: {
        width: '50%',
        height: 45,
        backgroundColor: '#000B58',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 20,
        marginTop: 20,
    },
    buttonTxt: {
        fontSize: 16,
        color: '#FFF',
        fontFamily: 'LeagueSpartan_Bold',
    },
})

export default Profile