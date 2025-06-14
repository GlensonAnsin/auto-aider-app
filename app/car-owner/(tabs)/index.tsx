import { useState } from 'react';
import { Image, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import SelectDropdown from 'react-native-select-dropdown';
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import AddVehicleIcon from "../../../assets/images/add_vehicle.svg";
import DiagnosticHistoryIcon from "../../../assets/images/diagnostic_history.svg";
import ProfileIcon from "../../../assets/images/iconamoon_profile-fill.svg";
import LocationIcon from "../../../assets/images/subway_location-1.svg";
import RunDiagnosticIcon from "../../../assets/images/teenyicons_scan-outline.svg";

export default function Home() {
    const [addVehicleModalVisible, isAddVehicleModalVisible] = useState(false);
    const [selectedMake, setSelectedMake] = useState<string>("");
    const [model, setModel] = useState<string>("");
    const [year, setYear] = useState<string>("");

    const targetMakes = ["Acura", "Audi", "BMW", "Chevrolet", "Dodge", "Chrysler", "Jeep", "Ford", "Foton", "Geely", "Honda", "Hyundai", "Infiniti", "Isuzu", "Jaguar", "Kia", "Land Rover", "Lexus", "Mazda", "Mercedes-Benz", "MG", "Mitsubishi", "Nissan", "RAM", "Subaru", "Suzuki", "Toyota", "Volkswagen"]

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

                        <TouchableOpacity style={styles.feature} onPress={() => isAddVehicleModalVisible(true)}>
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

                    <Modal
                        animationType="fade"
                        backdropColor={"rgba(0, 0, 0, 0.5)"}
                        visible={addVehicleModalVisible}
                        onRequestClose={() => {
                            isAddVehicleModalVisible(!addVehicleModalVisible);
                            setSelectedMake("");
                            setModel("");
                            setYear("");
                        }}
                    >
                        <View style={styles.centeredView}>
                            <View style={styles.modalView}>
                                <Text style={styles.modalHeader}>ADD VEHICLE</Text>

                                <View style={styles.textInputContainer}>
                                    <Text style={styles.textInputLbl}>Manufacturer</Text>
                                    <SelectDropdown 
                                        data={targetMakes}
                                        onSelect={(selectedItem) => setSelectedMake(selectedItem)}
                                        renderButton={(selectedItem, isOpen) => (
                                            <View style={styles.dropdownButtonStyle}>
                                                <Text style={styles.dropdownButtonTxtStyle}>
                                                    {selectedItem || "Select manufacturer"}
                                                </Text>
                                                <Icon name={isOpen ? "chevron-up" : "chevron-down"} style={styles.dropdownButtonArrowStyle} />
                                            </View>
                                        )}
                                        renderItem={(item, _index, isSelected) => (
                                            <View
                                                style={{
                                                    ...styles.dropdownItemStyle,
                                                    ...(isSelected && { backgroundColor: "#D2D9DF" }),
                                                }}
                                                >
                                                <Text style={styles.dropdownItemTxtStyle}>{item}</Text>
                                            </View>
                                        )}
                                    />
                                </View>

                                <View style={styles.textInputContainer}>
                                    <Text style={styles.textInputLbl}>Model</Text>
                                    <TextInput 
                                        value={model}
                                        onChangeText={setModel}
                                        style={styles.input}
                                        placeholder="Model"
                                        editable={!selectedMake ? false : true}
                                    />
                                </View>

                                <View style={styles.textInputContainer}>
                                    <Text style={styles.textInputLbl}>Model</Text>
                                    <TextInput 
                                        value={year}
                                        onChangeText={setYear}
                                        style={styles.input}
                                        keyboardType="numeric"
                                        placeholder="Year"
                                        maxLength={4}
                                        editable={!model ? false : true}
                                    />
                                </View>

                                <TouchableOpacity style={styles.button}>
                                    <Text style={styles.buttonTxt}>ADD</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </Modal>
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
    fontFamily: "LeagueSpartan",
    color: "#fff",
    fontWeight: "bold", 
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
  dropdownButtonStyle: {
    width: 250,
    height: 45,
    backgroundColor: "#EAEAEA",
    borderRadius: 10,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 10,
  },
  dropdownButtonTxtStyle: {
    flex: 1,
    fontSize: 16,
    fontFamily: "LeagueSpartan",
  },
  dropdownButtonArrowStyle: {
    fontSize: 24,
  },
  dropdownItemStyle: {
    width: "100%",
    flexDirection: "row",
    paddingHorizontal: 10,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 8,
  },
  dropdownItemTxtStyle: {
    flex: 1,
    fontSize: 16,
    fontFamily: "LeagueSpartan",
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
    fontFamily: "LeagueSpartan",
    fontWeight: "bold",
  },
});
