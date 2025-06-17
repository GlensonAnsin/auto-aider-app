import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import SelectDropdown from "react-native-select-dropdown";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

const editProfile = () => {
  const router = useRouter();

  const [firstname, setFirstname] = useState<string>("Glenson");
  const [lastname, setLastname] = useState<string>("Ansin");
  const [gender, setGender] = useState<string>("");
  const [mobileNum, setMobileNum] = useState<string>("09056122650");
  const [email, setEmail] = useState<string>("ansin.glenson01@gmail.com");

  const genders = ["Male", "Female"];

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <View style={styles.upperBox}>
          <Text style={styles.header}>EDIT PROFILE</Text>
          <TouchableOpacity style={styles.arrowWrapper} onPress={() => router.push("/car-owner/(tabs)/(profile)/profile")}>
            <Icon name="arrow-left" style={styles.arrowBack} />
          </TouchableOpacity>
        </View>

        <View style={styles.lowerBox}>
          <View style={styles.editPicContainer}>
            <View style={styles.profilePicWrapper}>
              <Text style={styles.userInitials}>GA</Text>
            </View>

            <TouchableOpacity style={styles.editPicWrapper}>
              <Icon
                name="pencil"
                style={styles.editIcon}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.editInfoContainer}>
            <View style={styles.row}>
              <Text style={styles.textInputLbl}>First Name</Text>
              <TextInput
                value={firstname}
                onChangeText={setFirstname}
                style={styles.input}
              />
            </View>

            <View style={styles.row}>
              <Text style={styles.textInputLbl}>Last Name</Text>
              <TextInput
                value={lastname}
                onChangeText={setLastname}
                style={styles.input}
              />
            </View>

            <View style={styles.row}>
              <Text style={styles.textInputLbl}>Gender</Text>
              <SelectDropdown
                data={genders}
                onSelect={(selectedItem) => setGender(selectedItem)}
                renderButton={(selectedItem, isOpen) => (
                  <View style={styles.dropdownButtonStyle}>
                    <Text style={styles.dropdownButtonTxtStyle}>
                      {selectedItem || "Select gender"}
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
                showsVerticalScrollIndicator={false}
                dropdownStyle={styles.dropdownMenuStyle}
              />
            </View>

            <View style={styles.row}>
              <Text style={styles.textInputLbl}>Mobile Number</Text>
              <TextInput
                value={mobileNum}
                onChangeText={setMobileNum}
                style={styles.input}
                keyboardType="number-pad"
              />
            </View>

            <View style={styles.row}>
              <Text style={styles.textInputLbl}>Email</Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                style={styles.input}
              />
            </View>
          </View>

          <TouchableOpacity style={styles.button} onPress={() => router.push("/car-owner/(tabs)/(profile)/profile")}>
            <Text style={styles.buttonTxt}>UPDATE</Text>
          </TouchableOpacity>
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
    alignItems: "center",
  },
  header: {
    color: "#fff",
    fontFamily: "LeagueSpartan_Bold",
    fontSize: 24,
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
  editPicContainer: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 100,
  },
  profilePicWrapper: {
    backgroundColor: "green",
    width: 120,
    height: 120,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 120,
    position: "absolute",
    zIndex: 1,
  },
  editPicWrapper: {
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    width: 120,
    height: 120,
    borderRadius: 120,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    zIndex: 2,
  },
  userInitials: {
    fontFamily: "LeagueSpartan_Bold",
    fontSize: 30,
    color: "#fff",
  },
  editIcon: {
    fontSize: 30,
    color: "#000B58",
  },
  editInfoContainer: {
    gap: 10,
    marginTop: 100,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  textInputLbl: {
    fontSize: 16,
    fontFamily: "LeagueSpartan_Bold",
    color: "#000B58",
    width: 120,
  },
  input: {
    backgroundColor: "#EAEAEA",
    width: 200,
    height: 45,
    borderRadius: 10,
    padding: 10,
    fontSize: 16,
    fontFamily: "LeagueSpartan",
  },
  dropdownButtonStyle: {
    width: 200,
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
  button: {
    width: 150,
    height: 45,
    backgroundColor: "#000B58",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
    marginTop: 30,
  },
  buttonTxt: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "LeagueSpartan_Bold",
  },
})

export default editProfile