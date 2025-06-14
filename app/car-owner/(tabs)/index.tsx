import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import AddVehicleIcon from "../../../assets/images/add_vehicle.svg";
import DiagnosticHistoryIcon from "../../../assets/images/diagnostic_history.svg";
import ProfileIcon from "../../../assets/images/iconamoon_profile-fill.svg";
import LocationIcon from "../../../assets/images/subway_location-1.svg";
import RunDiagnosticIcon from "../../../assets/images/teenyicons_scan-outline.svg";

export default function HomeTab() {
    return (
        <SafeAreaProvider>
            <SafeAreaView style={styles.container}>
                <Image
                    source={require("../../../assets/images/screen-design-2.png")}
                    style={styles.screenDesign}
                />
                <Image
                    source={require("../../../assets/images/logo.png")}
                    style={styles.logo}
                    width={200}
                    height={25}
                />

                <View style={styles.userContainer}>
                    <View style={styles.userNameContainer}>
                        <Text style={styles.header}>HELLO,</Text>
                        <Text style={styles.userName}>Glenson Ansin</Text>
                    </View>

                    <TouchableOpacity style={styles.profileWrapper}>
                        <Text style={styles.userInitials}>GA</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.introTxtContainer}>
                    <Text style={styles.introHeader}>Let's Get Started</Text>
                    <Text style={styles.introBody}>Start your experience to easier vehicle maintenance.</Text>
                </View>

                <View style={styles.featuresContainer}>
                    <View style={styles.row}>
                        <TouchableOpacity style={styles.feature}>
                            <DiagnosticHistoryIcon width={50} height={50} color="#fff" />
                            <View style={styles.featureTxtWrapper}>
                                <Text style={styles.featureHeader}>DIAGNOSTIC HISTORY</Text>
                                <Text style={styles.featureDescription}>View past diagnostic checks and repair information</Text>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.feature}>
                            <AddVehicleIcon width={50} height={50} color="#fff" />
                            <View style={styles.featureTxtWrapper}>
                                <Text style={styles.featureHeader}>ADD VEHICLE</Text>
                                <Text style={styles.featureDescription}>Register or add a new vehicle</Text>
                            </View>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.row}>
                        <TouchableOpacity style={styles.feature}>
                            <RunDiagnosticIcon width={40} height={40} color="#fff" />
                            <View style={styles.featureTxtWrapper}>
                                <Text style={styles.featureHeader}>RUN DIAGNOSTICS</Text>
                                <Text style={styles.featureDescription}>Perform a quick system diagnostic</Text>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.feature}>
                            <ProfileIcon width={50} height={50} color="#fff" />
                            <View style={styles.featureTxtWrapper}>
                                <Text style={styles.featureHeader}>MY PROFILE</Text>
                                <Text style={styles.featureDescription}>Manage your account details and preferences</Text>
                            </View>
                        </TouchableOpacity>
                    </View>

                    <View style={[styles.row, {alignSelf: "flex-start", marginLeft: 5}]}>
                        <TouchableOpacity style={styles.feature}>
                            <LocationIcon width={50} height={50} color="#fff" />
                            <View style={styles.featureTxtWrapper}>
                                <Text style={styles.featureHeader}>REPAIR SHOPS</Text>
                                <Text style={styles.featureDescription}>Locate nearby repair shops</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
            </SafeAreaView>
        </SafeAreaProvider> 
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    screenDesign: {
        width: "100%",
    },
    logo: {
        position: "absolute",
        top: 35,
        left: 20,
    },
    userContainer: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 100,
        marginTop: 20,
        marginLeft: 10,
        marginRight: 10,
    },
    userNameContainer: {
        flexDirection: "column",
    },
    header: {
        fontFamily: "LeagueSpartan",
        fontSize: 30,
        fontWeight: "bold",
    },
    userName: {
        fontFamily: "LeagueSpartan",
        fontSize: 24,
    },
    profileWrapper: {
        backgroundColor: "green",
        width: 80,
        height: 80,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 80,
    },
    userInitials: {
        fontFamily: "LeagueSpartan",
        fontSize: 30,
        fontWeight: "bold",
        color: "#fff",
    },
    introTxtContainer: {
        borderWidth: 2,
        borderColor: "#003161",
        marginLeft: 10,
        marginRight: 10,
        borderRadius: 10,
        padding: 10,
        marginTop: 20,
    },
    introHeader: {
        fontFamily: "LeagueSpartan",
        fontSize: 18,
        textAlign: "center",
    },
    introBody: {
        fontFamily: "LeagueSpartan",
        fontSize: 16,
        textAlign: "center",
    },
    featuresContainer: {
        backgroundColor: "#EAEAEA",
        marginLeft: 10,
        marginRight: 10,
        borderRadius: 10,
        alignItems: "center",
        paddingTop: 5,
        paddingBottom: 5,
        gap: 10,
        marginTop: 20,
    },
    row: {
        flexDirection: "row",
        gap: 10,
    },
    feature: {
        flexDirection: "row",
        backgroundColor: "#000B58",
        width: 160,
        height: 100,
        borderRadius: 10,
        justifyContent: "center",
        alignItems: "center",
        gap: 3,
    },
    featureTxtWrapper: {
        flexDirection: "column",
        width: 100,
    },
    featureHeader: {
        color: "#fff",
        fontFamily: "LeagueSpartan",
        fontSize: 14,
        fontWeight: "bold",
    },
    featureDescription: {
        color: "#fff",
        fontFamily: "LeagueSpartan",
        fontSize: 10,
    },
});
