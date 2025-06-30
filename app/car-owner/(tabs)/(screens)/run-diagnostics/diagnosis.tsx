import { Header } from '@/components/Header';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const Diagnosis = () => {
    const router = useRouter();

    return (
        <SafeAreaProvider>
            <SafeAreaView style={styles.container}>
                <Header headerTitle='Diagnosis' link='/car-owner/(tabs)/(screens)/run-diagnostics/run-diagnostics' />
                
                <View style={styles.lowerBox}>
                    <View style={styles.buttonContainer}>
                        <Text style={styles.car}>Honda Civic 2017</Text>
                        <TouchableOpacity style={[styles.button, {backgroundColor: '#780606'}]}>
                            <Icon name='close-circle-outline' style={styles.buttonIcon} />
                            <Text style={styles.buttonText}>Disconnect</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.button, {backgroundColor: '#000B58'}]}>
                            <Icon name='radiobox-marked' style={styles.buttonIcon} />
                            <Text style={styles.buttonText}>Start another diagnosis</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.troubleCodesContainer}>
                        <View style={styles.labelContainer}>
                            <Text style={styles.troubleCodesLbl}>Detected Trouble Codes</Text>
                            <TouchableOpacity style={styles.clearButton}>
                                <Text style={styles.clearButtonText}>Clear codes</Text>
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity style={styles.troubleCodeButton} onPress={() => router.push('/car-owner/(tabs)/(screens)/run-diagnostics/detailed-report')}>
                            <Text style={styles.troubleCodeText}>P1456</Text>
                            <Text style={styles.troubleCodeText2}>Evaporative Emissions Control System Leakage - Fuel Tank (Small Leak)</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.troubleCodeButton}>
                            <Text style={styles.troubleCodeText}>P1162</Text>
                            <Text style={styles.troubleCodeText2}>Primary HO2S (Sensor 1) Circuit Malfunction</Text>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity style={styles.findShopButton}>
                        <Text style={styles.findShopButtonText}>Find Repair Shop</Text>
                    </TouchableOpacity>
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
        marginTop: 30,
        flex: 1,
    },
    buttonContainer: {
        width: '90%',
        gap: 10,
    },
    car: {
        fontFamily: 'LeagueSpartan_Bold',
        fontSize: 22,
        color: '#333',
        textAlign: 'center',
    },
    button: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        padding: 20,
        borderRadius: 8,
    },
    buttonIcon: {
        fontSize: 30,
        color: '#FFF',
    },
    buttonText: {
        color: '#FFF',
        fontFamily: 'LeagueSpartan_Bold',
        fontSize: 20,
    },
    troubleCodesContainer: {
        width: '90%',
        marginTop: 40,
    },
    labelContainer: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    troubleCodesLbl: {
        fontFamily: 'LeagueSpartan_Bold',
        fontSize: 18,
        color: '#333'
    },
    clearButton: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    clearButtonText: {
        fontFamily: 'LeagueSpartan',
        color: '#000B58',
        fontSize: 18,
    },
    troubleCodeButton: {
        backgroundColor: '#EAEAEA',
        width: '100%',
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        borderRadius: 5,
        padding: 10,
    },
    troubleCodeText: {
        fontFamily: 'LeagueSpartan_Bold',
        color: '#333',
        fontSize: 16,
    },
    troubleCodeText2: {
        fontFamily: 'LeagueSpartan',
        color: '#555',
        fontSize: 14,
    },
    findShopButton: {
        width: '45%',
        height: 45,
        backgroundColor: '#000B58',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 20,
        marginTop: 50,
    },
    findShopButtonText: {
        fontSize: 16,
        fontFamily: 'LeagueSpartan_Bold',
        color: '#FFF',
    },
})

export default Diagnosis