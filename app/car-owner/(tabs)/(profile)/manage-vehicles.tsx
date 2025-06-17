import { useRouter } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

const manageVehicles = () => {
  const router = useRouter();

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <View style={styles.upperBox}>
          <Text style={styles.header}>VEHICLES</Text>
          <TouchableOpacity style={styles.arrowWrapper} onPress={() => router.push("/car-owner/(tabs)/(profile)/profile")}>
            <Icon name="arrow-left" style={styles.arrowBack} />
          </TouchableOpacity>
        </View>

        <View style={styles.lowerBox}></View>
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
})

export default manageVehicles