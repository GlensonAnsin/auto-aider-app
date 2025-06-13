import { Image, StyleSheet } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

const coDashboard = () => {
  return (
    <SafeAreaProvider>
        <SafeAreaView style={styles.container}>
            <Image
                source={require("../../assets/images/screen-design-2.png")}
                style={styles.screenDesign}
            />
            <Image
                source={require("../../assets/images/logo.png")}
                style={styles.logo}
                width={200}
                height={25}
            />

            
        </SafeAreaView>
    </SafeAreaProvider> 
  )
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
        top: 65,
        left: 20,
    },
})

export default coDashboard