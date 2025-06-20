import Checkbox from "expo-checkbox";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { FlatList, Image, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import MapView, { Marker, Region } from "react-native-maps";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import SelectDropdown from "react-native-select-dropdown";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

const Signup = () => {
  const router = useRouter();

  const [firstname, setFirstname] = useState<string>("");
  const [lastname, setLastname] = useState<string>("");
  const [_gender, setGender] = useState<string>("");
  const [mobileNum, setMobileNum] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [_role, setRole] = useState<string>("");
  const [shopName, setShopName] = useState<string>("");
  const [page, setPage] = useState<string>("");
  const [region, setRegion] = useState<Region | undefined>(undefined);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [carOwnerModalVisible, isCarOwnerModalVisible] = useState<boolean>(false);
  const [repairShopModalVisible, isRepairShopModalVisible] = useState<boolean>(false);

  const roles = [
    { title: "Car Owner", icon: "car-outline" },
    { title: "Repair Shop", icon: "tools" },
  ];
  const genders = [
    { title: "Male", icon: "gender-male" },
    { title: "Female", icon: "gender-female" },
  ];
  const services = [
    { id: "1", label: "Engine diagnostics and repair" },
    { id: "2", label: "Transmission repair and overhaul" },
    { id: "3", label: "Oil change and fluid replacement (engine oil, brake fluid, coolant, etc.)" },
    { id: "4", label: "Brake system service (pads, discs, drums, ABS systems)" },
    { id: "5", label: "Clutch system service" },
    { id: "6", label: "Battery check and replacement" },
    { id: "7", label: "Timing belt/chain replacement" },
    { id: "8", label: "Alternator and starter motor repair" },
    { id: "9", label: "Suspension and steering repair" },
    { id: "10", label: "Wheel alignment and balancing" },
    { id: "11", label: "Shock absorber and strut replacement" },
    { id: "12", label: "CV joint and axle repair" },
    { id: "13", label: "Radiator repair and replacement" },
    { id: "14", label: "Fuel system service (cleaning, injector repair)" },
    { id: "15", label: "Air conditioning system service and repair" },
    { id: "16", label: "Computerized engine diagnostics (OBD scanning)" },
    { id: "17", label: "Wiring and electrical system repair" },
    { id: "18", label: "ECU reprogramming" },
    { id: "19", label: "Sensor and fuse replacement" },
    { id: "20", label: "Headlight, taillight, and signal light repairs" },
    { id: "21", label: "Power window and central lock repair" },
    { id: "22", label: "Dent removal (Paintless Dent Removal)" },
    { id: "23", label: "Auto body repair and repainting" },
    { id: "24", label: "Collision repair" },
    { id: "25", label: "Rustproofing and undercoating" },
    { id: "26", label: "Car detailing and polishing" },
    { id: "27", label: "Headlight restoration" },
    { id: "28", label: "Full car wash (interior and exterior)" },
    { id: "29", label: "Engine wash" },
    { id: "30", label: "Interior vacuuming and shampooing" },
    { id: "31", label: "Ceramic coating or wax application" },
    { id: "32", label: "Upholstery and leather care" },
    { id: "33", label: "Tire replacement and sales" },
    { id: "34", label: "Brake pads, rotors, and linings" },
    { id: "35", label: "Filters (air, fuel, oil, cabin)" },
    { id: "36", label: "Belts and hoses" },
    { id: "37", label: "Spark plugs and ignition coils" },
    { id: "38", label: "Accessories (car alarms, dashcams, LED lights, spoilers, etc.)" },
    { id: "39", label: "Preventive maintenance service (PMS)" },
    { id: "40", label: "LTO vehicle inspection assistance" },
    { id: "41", label: "Emission testing assistance" },
    { id: "42", label: "Vehicle pre-buy inspection" },
    { id: "43", label: "Insurance claim estimates and repairs" },
    { id: "44", label: "24/7 towing service" },
    { id: "45", label: "Roadside assistance" },
    { id: "46", label: "Fleet maintenance (for companies with multiple vehicles)" },
    { id: "47", label: "Car restoration (classic or vintage cars)" },
    { id: "48", label: "Custom modifications and tuning" },
  ];

  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.warn("Permission to access location was denied");
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    })();
  }, []);

  const handleDrag = (e: any) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;

    const newRegion: Region = {
      ...region!,
      latitude,
      longitude,
    };
    setRegion(newRegion);
    mapRef.current?.animateToRegion(newRegion, 300);
  };

  const toggleCheckbox = (id: string) => {
    setSelectedServices(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <View style={styles.upperBox}>
          <Text style={styles.welcomeTxt}>WELCOME TO</Text>
          <Image 
            source={require("../../assets/images/logo.png")}
          />

          <View style={styles.textInputContainer1}>
            <Text style={styles.upperTextInputLbl}>Register as</Text>
            <SelectDropdown
              data={roles}
              onSelect={(selectedItem) => {
                setRole(selectedItem.title);
                setPage(selectedItem.title);
              }}
              renderButton={(selectedItem, isOpen) => (
                <View style={styles.upperDropdownButtonStyle}>
                  {selectedItem && <Icon name={selectedItem.icon} style={styles.dropdownButtonIconStyle} />}
                  <Text style={styles.dropdownButtonTxtStyle}>
                    {(selectedItem && selectedItem.title) || "Select role"}
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
                  <Icon name={item.icon} style={styles.dropdownItemIconStyle} />
                  <Text style={styles.dropdownItemTxtStyle}>{item.title}</Text>
                </View>
              )}
              showsVerticalScrollIndicator={false}
              dropdownStyle={styles.dropdownMenuStyle}
            />
          </View>
        </View>

        <View style={styles.lowerBox}>
          {page === "Car Owner" && (
            <>
              <Text style={styles.header}>CREATE ACCOUNT</Text>
              <View style={styles.row}>
                <View style={styles.textInputContainer2}>
                  <Text style={styles.textInputLbl}>First Name</Text>
                  <TextInput
                    value={firstname}
                    onChangeText={setFirstname}
                    style={styles.input}
                  />
                </View>

                <View style={styles.textInputContainer2}>
                  <Text style={styles.textInputLbl}>Last Name</Text>
                  <TextInput
                    value={lastname}
                    onChangeText={setLastname}
                    style={styles.input}
                  />
                </View>
              </View>

              <View style={styles.row}>
                <View style={styles.textInputContainer2}>
                  <Text style={styles.textInputLbl}>Gender</Text>
                  <SelectDropdown
                    data={genders}
                    onSelect={(selectedItem) => setGender(selectedItem.title)}
                    renderButton={(selectedItem, isOpen) => (
                      <View style={styles.dropdownButtonStyle}>
                        {selectedItem && <Icon name={selectedItem.icon} style={styles.dropdownButtonIconStyle} />}
                        <Text style={styles.dropdownButtonTxtStyle}>
                          {(selectedItem && selectedItem.title) || "Select gender"}
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
                        <Icon name={item.icon} style={styles.dropdownItemIconStyle} />
                        <Text style={styles.dropdownItemTxtStyle}>{item.title}</Text>
                      </View>
                    )}
                    showsVerticalScrollIndicator={false}
                    dropdownStyle={styles.dropdownMenuStyle}
                  />
                </View>

                <View style={styles.textInputContainer2}>
                  <Text style={styles.textInputLbl}>Mobile Number</Text>
                  <TextInput
                    value={mobileNum}
                    onChangeText={setMobileNum}
                    style={styles.input}
                  />
                </View>
              </View>

              <View style={styles.row}>
                <View style={styles.textInputContainer2}>
                  <Text style={styles.textInputLbl}>Password</Text>
                  <TextInput
                    value={password}
                    onChangeText={setPassword}
                    style={styles.input}
                    secureTextEntry
                  />
                </View>

                <View style={styles.textInputContainer2}>
                  <Text style={styles.textInputLbl}>Confirm Password</Text>
                  <TextInput
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    style={styles.input}
                    secureTextEntry
                  />
                </View>
              </View>

              <View style={styles.loginContainer}>
                <Text style={styles.questionLbl}>Have an account?</Text>
                <TouchableOpacity onPress={() => router.push("/auth/login")}>
                  <Text style={styles.loginLbl}>Log In</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.button} onPress={() => isCarOwnerModalVisible(true)}>
                <Text style={styles.buttonTxt}>SIGN UP</Text>
              </TouchableOpacity>

              <Modal
                animationType="fade"
                backdropColor={"rgba(0, 0, 0, 0.5)"}
                visible={carOwnerModalVisible}
                onRequestClose={() => isCarOwnerModalVisible(!carOwnerModalVisible)}
              >
                <View style={styles.centeredView}>
                  <View style={styles.modalView}>
                    <Text style={styles.modalTxt}>Account created successfully. Thank you for registering!</Text>
                    <TouchableOpacity
                      style={styles.modalButton}
                      onPress={() => {
                        isCarOwnerModalVisible(!carOwnerModalVisible)
                        router.push("/auth/login");
                      }}>
                      <Text style={styles.buttonTxt}>OK</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Modal>
            </>
          )}

          {page === "Repair Shop" && (
            <>
              <Text style={styles.header}>CREATE ACCOUNT</Text>
              <View style={styles.row}>
                <View style={styles.textInputContainer2}>
                  <Text style={styles.textInputLbl}>First Name</Text>
                  <TextInput
                    value={firstname}
                    onChangeText={setFirstname}
                    style={styles.input}
                  />
                </View>

                <View style={styles.textInputContainer2}>
                  <Text style={styles.textInputLbl}>Last Name</Text>
                  <TextInput
                    value={lastname}
                    onChangeText={setLastname}
                    style={styles.input}
                  />
                </View>
              </View>

              <View style={styles.row}>
                <View style={styles.textInputContainer2}>
                  <Text style={styles.textInputLbl}>Gender</Text>
                  <SelectDropdown
                    data={genders}
                    onSelect={(selectedItem) => setGender(selectedItem.title)}
                    renderButton={(selectedItem, isOpen) => (
                      <View style={styles.dropdownButtonStyle}>
                        {selectedItem && <Icon name={selectedItem.icon} style={styles.dropdownButtonIconStyle} />}
                        <Text style={styles.dropdownButtonTxtStyle}>
                          {(selectedItem && selectedItem.title) || "Select gender"}
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
                        <Icon name={item.icon} style={styles.dropdownItemIconStyle} />
                        <Text style={styles.dropdownItemTxtStyle}>{item.title}</Text>
                      </View>
                    )}
                    showsVerticalScrollIndicator={false}
                    dropdownStyle={styles.dropdownMenuStyle}
                  />
                </View>

                <View style={styles.textInputContainer2}>
                  <Text style={styles.textInputLbl}>Mobile Number</Text>
                  <TextInput
                    value={mobileNum}
                    onChangeText={setMobileNum}
                    style={styles.input}
                  />
                </View>
              </View>

              <View style={styles.row}>
                <View style={styles.textInputContainer2}>
                  <Text style={styles.textInputLbl}>Password</Text>
                  <TextInput
                    value={password}
                    onChangeText={setPassword}
                    style={styles.input}
                    secureTextEntry
                  />
                </View>

                <View style={styles.textInputContainer2}>
                  <Text style={styles.textInputLbl}>Confirm Password</Text>
                  <TextInput
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    style={styles.input}
                    secureTextEntry
                  />
                </View>
              </View>

              <View style={styles.textInputContainer3}>
                <Text style={styles.textInputLbl}>Shop Name</Text>
                <TextInput
                  value={shopName}
                  onChangeText={setShopName}
                  style={styles.shopNameInput}
                />
              </View>

              <TouchableOpacity style={styles.button} onPress={() => setPage("Location")}>
                <Text style={styles.buttonTxt}>NEXT</Text>
              </TouchableOpacity>
            </>
          )}

          {page === "Location" && (
            <>
              <TouchableOpacity style={styles.arrowWrapper} onPress={() => setPage("Repair Shop")}>
                <Icon name="arrow-left" style={styles.arrowBack} />
              </TouchableOpacity>

              <Text style={styles.header}>LOCATION</Text>
              <Text style={styles.textInputLbl}>Please set up your shop location on the map.</Text>

              <MapView
                style={styles.map}
                ref={mapRef}
                mapType="hybrid"
                initialRegion={region}
                onRegionChangeComplete={(newRegion) => setRegion(newRegion)}
              >
                {region && (
                  <Marker
                    coordinate={{
                      latitude: region.latitude,
                      longitude: region.longitude,
                    }}
                    draggable
                    onDragEnd={handleDrag}
                  />
                )}
              </MapView>
              
              <TouchableOpacity style={styles.button} onPress={() => setPage("Services Offered")}>
                <Text style={styles.buttonTxt}>NEXT</Text>
              </TouchableOpacity>
            </>
          )}

          {page === "Services Offered" && (
            <>
              <TouchableOpacity style={styles.arrowWrapper} onPress={() => setPage("Location")}>
                <Icon name="arrow-left" style={styles.arrowBack} />
              </TouchableOpacity>

              <Text style={styles.header}>SERVICES OFFERED</Text>
              <FlatList
                style={styles.servicesList}
                data={services}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <View style={styles.checkboxContainer}>
                    <Checkbox
                      value={selectedServices.includes(item.id)}
                      onValueChange={() => toggleCheckbox(item.id)}
                      color={selectedServices.includes(item.id) ? "#000B58" : undefined}
                    />
                    <Text style={styles.checkboxTxt}>{item.label}</Text>
                  </View>
                )}
              />

              <TouchableOpacity style={styles.button} onPress={() => isRepairShopModalVisible(true)}>
                <Text style={styles.buttonTxt}>SUBMIT</Text>
              </TouchableOpacity>

              <Modal
                animationType="fade"
                backdropColor={"rgba(0, 0, 0, 0.5)"}
                visible={repairShopModalVisible}
                onRequestClose={() => isRepairShopModalVisible(!repairShopModalVisible)}
              >
                <View style={styles.centeredView}>
                  <View style={styles.modalView}>
                    <Text style={styles.modalTxt}>Thank you for registering! Please wait for admin approval. An update will be sent via SMS.</Text>
                    <TouchableOpacity
                      style={styles.modalButton}
                      onPress={() => {
                        isRepairShopModalVisible(!repairShopModalVisible)
                        router.push("/auth/login");
                      }}>
                      <Text style={styles.buttonTxt}>OK</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Modal>
            </>
          )}
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  upperBox: {
    backgroundColor: "#000B58",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    padding: 10,
  },
  welcomeTxt: {
    color: "#fff",
    fontSize: 30,
    fontFamily: "LeagueSpartan_Bold",
    marginBottom: 10,
  },
  upperTextInputLbl: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "LeagueSpartan",
  },
  upperDropdownButtonStyle: {
    width: "100%",
    height: 45,
    backgroundColor: "#EAEAEA",
    borderRadius: 10,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 10,
  },
  lowerBox: {
    alignItems: "center",
  },
  header: {
    color: "#000B58",
    fontSize: 24,
    fontFamily: "LeagueSpartan_Bold",
    marginTop: 10,
  },
  textInputContainer1: {
    gap: 10,
    marginTop: 10,
    width: "50%",
  },
  textInputContainer2: {
    gap: 10,
    marginTop: 10,
    width: "45%",
  },
  textInputContainer3: {
    gap: 10,
    marginTop: 10,
    width: "93%",
  },
  row: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-evenly",
  },
  textInputLbl: {
    fontSize: 16,
    fontFamily: "LeagueSpartan",
  },
  input: {
    backgroundColor: "#EAEAEA",
    width: "100%",
    height: 45,
    borderRadius: 10,
    padding: 10,
    fontSize: 16,
    fontFamily: "LeagueSpartan",
  },
  dropdownButtonStyle: {
    width: "100%",
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
  dropdownButtonIconStyle: {
    fontSize: 24,
    marginRight: 8,
  },
  dropdownMenuStyle: {
    backgroundColor: "#EAEAEA",
    borderRadius: 10,
    marginTop: -1,
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
  dropdownItemIconStyle: {
    fontSize: 24,
    marginRight: 8,
  },
  questionLbl: {
    fontSize: 14,
    fontFamily: "LeagueSpartan",
  },
  loginLbl: {
    fontSize: 14,
    fontFamily: "LeagueSpartan_Bold",
    textDecorationLine: "underline",
  },
  loginContainer: {
    flexDirection: "column",
    gap: 5,
    alignItems: "center",
    marginTop: 30,
  },
  button: {
    width: "40%",
    height: 45,
    backgroundColor: "#000B58",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
    marginTop: 20,
  },
  buttonTxt: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "LeagueSpartan_Bold",
  },
  shopNameInput: {
    backgroundColor: "#EAEAEA",
    width: "100%",
    height: 45,
    borderRadius: 10,
    padding: 10,
    fontSize: 16,
    fontFamily: "LeagueSpartan",
  },
  map: {
    width: "100%",
    height: 350,
    borderRadius: 10,
  },
  arrowWrapper: {
    top: 15,
    right: 320,
    position: "absolute",
  },
  arrowBack: {
    fontSize: 24,
    color: "#000B58",
  },
  servicesList: {
    width: "100%",
    paddingHorizontal: 20,
    marginTop: 20,
    height: 350,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
    gap: 10,
  },
  checkboxTxt: {
    fontSize: 16,
    fontFamily: "LeagueSpartan",
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalView: {
    backgroundColor: "#fff",
    width: "70%",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTxt: {
    textAlign: "center",
    fontFamily: "LeagueSpartan",
    fontSize: 16,
  },
  modalButton: {
    width: "50%",
    height: 45,
    backgroundColor: "#000B58",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
    marginTop: 10,
  },
})

export default Signup