import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

const Diagnosis = () => {
    const router = useRouter();

    return (
        <SafeAreaProvider>
            <SafeAreaView style={styles.container}>
                <View style={styles.upperBox}>
                    <Text style={styles.header}>|  DIAGNOSIS</Text>
                    <TouchableOpacity style={styles.arrowWrapper} onPress={() => router.push("/car-owner/(tabs)/(run-diagnostics)/run-diagnostics")}>
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
        backgroundColor: "#fff",
    },
    upperBox: {
        backgroundColor: "#000B58",
        justifyContent: "center",
        alignItems: "flex-start",
        height: 63,
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
        alignItems: "center",
    },
})

export default Diagnosis