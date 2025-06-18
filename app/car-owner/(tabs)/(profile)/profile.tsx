import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

const Profile = () => {
    const router = useRouter();

    const [currentPassword, setCurrentPassword] = useState<string>("");
    const [newPassword, setNewPassword] = useState<string>("");
    const [confirmPassword, setConfirmPassword] = useState<string>("");
    const [modalVisible, isModalVisible] = useState<boolean>(false);
    
    return (
        <SafeAreaProvider>
            <SafeAreaView style={styles.container}>
                <View style={styles.upperBox}>
                    <Text style={styles.header}>|  PROFILE</Text>
                    <TouchableOpacity style={styles.arrowWrapper} onPress={() => router.push("/car-owner/(tabs)")}>
                        <Icon name="arrow-left" style={styles.arrowBack} />
                    </TouchableOpacity>
                </View>

                <View style={styles.lowerBox}>
                    <View style={styles.userContainer}>
                        <View style={styles.profilePicWrapper}>
                            <Text style={styles.userInitials}>GA</Text>
                        </View>

                        <View style={styles.userNameContainer}>
                            <Text style={styles.userName}>Glenson Ansin</Text>
                            <Text style={styles.userContact}>09056122650</Text>
                            <Text style={styles.userContact}>ansin.glenson01@gmail.com</Text>
                        </View>
                    </View>

                    <View style={styles.profileTabContainer}>
                        <TouchableOpacity style={styles.profileTab} onPress={() => router.push("/car-owner/(tabs)/(profile)/edit-profile")}>
                            <Icon
                                name="account-edit-outline"
                                style={styles.icon}
                            />
                            <Text style={styles.tabName}>Edit Profile</Text>
                            <Icon
                                name="arrow-right-thin"
                                style={styles.forwardIcon}
                            />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.profileTab} onPress={() => router.push("/car-owner/(tabs)/(profile)/manage-vehicles")}>
                            <Icon
                                name="car-outline"
                                style={styles.icon}
                            />
                            <Text style={styles.tabName}>Manage Connected Vehicles</Text>
                            <Icon
                                name="arrow-right-thin"
                                style={styles.forwardIcon}
                            />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.profileTab} onPress={() => isModalVisible(true)}>
                            <Icon
                                name="lock-outline"
                                style={styles.icon}
                            />
                            <Text style={styles.tabName}>Change Password</Text>
                            <Icon
                                name="arrow-right-thin"
                                style={styles.forwardIcon}
                            />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.profileTab} onPress={() => router.push("/(auth)/login")}>
                            <Icon
                                name="logout"
                                style={[styles.icon, {color: "red"}]}
                            />
                            <Text style={[styles.tabName, {color: "red"}]}>Logout</Text>
                            <Icon
                                name="arrow-right-thin"
                                style={[styles.forwardIcon, {color: "red"}]}
                            />
                        </TouchableOpacity>

                        <Modal
                            animationType="fade"
                            backdropColor={"rgba(0, 0, 0, 0.5)"}
                            visible={modalVisible}
                            onRequestClose={() => {
                                isModalVisible(!isModalVisible);
                                setCurrentPassword("");
                                setNewPassword("");
                                setConfirmPassword("");
                            }}
                        >
                            <View style={styles.centeredView}>
                                <View style={styles.modalView}>
                                    <Text style={styles.modalHeader}>CHANGE PASSWORD</Text>
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
                                        <Text style={styles.buttonTxt}>CHANGE</Text>
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
    },
    upperBox: {
        flex: 1,
        backgroundColor: "#000B58",
        justifyContent: "center",
        alignItems: "flex-start",
    },
    header: {
        color: "#fff",
        fontFamily: "LeagueSpartan_Bold",
        fontSize: 24,
        marginLeft: 50,
    },
    arrowWrapper: {
        top: 21,
        right: 320,
        position: "absolute",
    },
    arrowBack: {
        fontSize: 24,
        color: "#fff",
    },
    lowerBox: {
        flex: 9,
        backgroundColor: "#fff",
        alignItems: "center",
    },
    userContainer: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 20,
        marginTop: 50,
    },
    userNameContainer: {
        flexDirection: "column",
        maxWidth: 220,
        minWidth: 220,
    },
    userName: {
        fontFamily: "LeagueSpartan_Bold",
        fontSize: 24,
        color: "#000B58",
    },
    userContact: {
        fontFamily: "LeagueSpartan",
        fontSize: 14,
        color: "#000B58",
    },
    profilePicWrapper: {
        backgroundColor: "green",
        width: 100,
        height: 100,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 100,
    },
    userInitials: {
        fontFamily: "LeagueSpartan_Bold",
        fontSize: 30,
        color: "#fff",
    },
    profileTabContainer: {
        width: "100%",
        marginTop: 30,
        gap: 5,
    },
    profileTab: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#EAEAEA",
        padding: 20,
        gap: 25,
    },
    icon: {
        fontSize: 35,
        color: "#000B58",
    },
    tabName: {
        color: "#000B58",
        fontFamily: "LeagueSpartan_Bold",
        fontSize: 16,
        width: 200,
    },
    forwardIcon: {
        fontSize: 35,
        color: "#000B58",
    },
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalView: {
        margin: 20,
        backgroundColor: '#000B58',
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
        fontFamily: "LeagueSpartan_Bold",
        color: "#fff",
    },
    textInputContainer: {
        gap: 10,
        marginTop: 10,
    },
    textInputLbl: {
        fontSize: 16,
        fontFamily: "LeagueSpartan",
        color: "#fff",
    },
    input: {
        backgroundColor: "#EAEAEA",
        width: 250,
        height: 45,
        borderRadius: 10,
        padding: 10,
        fontSize: 16,
        fontFamily: "LeagueSpartan",
    },
    button: {
        width: 150,
        height: 45,
        backgroundColor: "#fff",
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 20,
        marginTop: 20,
    },
    buttonTxt: {
        fontSize: 16,
        fontFamily: "LeagueSpartan_Bold",
    },
})

export default Profile