import { useRouter } from "expo-router";
import { useState } from "react";
import { Image, Keyboard, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import SelectDropdown from "react-native-select-dropdown";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";


export default function Login() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [_role, setRole] = useState("");
  
  const roles = [
    { title: "Car Owner", icon: "car-outline" },
    { title: "Repair Shop", icon: "tools" },
  ];

  return (
    <SafeAreaProvider>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <SafeAreaView style={styles.container}>
          <Image 
            source={require("../../assets/images/screen-design.png")}
            style={styles.screenDesign}
          />

          <View style={styles.formContainer}>
            <Text style={styles.header}>LOG IN</Text>

            <View style={styles.textInputContainer}>
              <Text style={styles.textInputLbl}>Username</Text>
              <TextInput
                value={username}
                onChangeText={setUsername}
                style={styles.input}
              />
            </View>

            <View style={styles.textInputContainer}>
              <Text style={styles.textInputLbl}>Password</Text>
              <TextInput
                value={password}
                onChangeText={setPassword}
                secureTextEntry={true}
                style={styles.input}
              />
            </View>

            <View style={styles.textInputContainer}>
              <Text style={styles.textInputLbl}>Log In as</Text>

              <SelectDropdown
                data={roles}
                onSelect={(selectedItem) => setRole(selectedItem.title)}
                renderButton={(selectedItem, isOpen) => (
                  <View style={styles.dropdownButtonStyle}>
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
              
              <TouchableOpacity>
                <Text style={styles.forgetPassLbl}>Forget password?</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.signupContainer}>
              <Text style={styles.questionLbl}>Don't have an account?</Text>
              <TouchableOpacity onPress={() => router.push("/(auth)/signup")}>
                <Text style={styles.signupLbl}>Sign Up</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.loginBtn}>
              <Text style={styles.loginBtnTxt}>LOG IN</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </TouchableWithoutFeedback>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  screenDesign: {
    backgroundColor: "#000B58",
    width: "100%",
    height: "20%",
  },
  formContainer: {
    flex: 1,
    backgroundColor: "#000B58",
    alignItems: "center",
    gap: 20,
  },
  header: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
    fontFamily: "LeagueSpartan",
  },
  textInputContainer: {
    gap: 10,
  },
  textInputLbl: {
    color: "#fff",
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
  dropdownButtonIconStyle: {
    fontSize: 24,
    marginRight: 8,
  },
  dropdownMenuStyle: {
    backgroundColor: "#EAEAEA",
    borderRadius: 10,
    marginTop: -37,
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
  forgetPassLbl: {
    color: "#fff",
    fontSize: 14,
    fontFamily: "LeagueSpartan",
    textDecorationLine: "underline",
  },
  questionLbl: {
    color: "#fff",
    fontSize: 14,
    fontFamily: "LeagueSpartan",
  },
  signupLbl: {
    color: "#fff",
    fontSize: 14,
    fontFamily: "LeagueSpartan",
    fontWeight: "bold",
    textDecorationLine: "underline",
  },
  signupContainer: {
    flexDirection: "column",
    gap: 5,
    alignItems: "center",
  },
  loginBtn: {
    width: 150,
    height: 45,
    backgroundColor: "#D9D9D9",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
    marginTop: 20,
  },
  loginBtnTxt: {
    fontSize: 16,
    fontFamily: "LeagueSpartan",
    fontWeight: "bold",
  },
})