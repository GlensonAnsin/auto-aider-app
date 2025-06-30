import { Header } from '@/components/Header';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

const DetailedReport = () => {
    return (
        <SafeAreaProvider>
            <SafeAreaView style={styles.container}>
                <ScrollView>
                    <Header headerTitle='Detailed Report' link='/car-owner/(tabs)/(screens)/run-diagnostics/diagnosis' />

                    <View style={styles.lowerBox}>
                        <Text style={styles.troubleCode}>P1456</Text>
                        <Text style={styles.technicalDescription}>Evaporative Emissions Control System Leakage - Fuel Tank (Small Leak)</Text>
                        <Text style={styles.label}>Meaning</Text>
                        <Text style={styles.text}>
                            The Powertrain Control Module (PCM) has detected a small leak in the Evaporative Emission Control (EVAP) system, specifically on the fuel tank side. The EVAP system is designed to prevent fuel vapors from escaping into the atmosphere by capturing and storing them, then routing them back to the engine to be burned. This code indicates that the system is not maintaining the proper pressure/vacuum, suggesting a leak.
                        </Text>
                        <Text style={styles.label}>Possible Causes</Text>
                        <Text style={styles.text}>
                            Missing, loose, or faulty fuel filler cap: This is the most common and often easiest fix.
                            Debris in the fuel filler cap seal: Dirt or foreign objects can prevent a proper seal.
                            Malfunctioning EVAP two-way valve: This valve controls vapor flow between the fuel tank and the EVAP canister.
                            Bad EVAP bypass solenoid valve: This valve plays a role in the leak detection process.
                            Faulty EVAP canister: The canister stores fuel vapors.
                            Cracked or damaged EVAP hoses/lines: Leaks can occur anywhere in the EVAP system's plumbing.
                            Damaged or leaking fuel tank or filler neck: Physical damage to these components can lead to leaks.
                            Faulty Fuel Tank Pressure (FTP) sensor: While less common, a bad sensor could inaccurately report a leak.
                        </Text>
                        <Text style={styles.label}>Recommended Solutions or Repairs</Text>
                        <Text style={styles.text}>
                            Check and tighten/replace the fuel cap: This is the first and most frequent solution. Ensure the cap clicks at least three times to ensure a proper seal. If the cap is old, damaged, or aftermarket, consider replacing it with an OEM (Original Equipment Manufacturer) cap.
                            Inspect the fuel filler neck: Look for any cracks, rust, or damage to the sealing surface.
                            Inspect EVAP hoses and lines: Visually check for any cracks, disconnections, or signs of damage.
                            Diagnose EVAP system components: This often requires specialized tools like a smoke machine to pinpoint the exact location of the leak. A mechanic can use a diagnostic scanner to monitor Fuel Tank Pressure (FTP) sensor readings and activate EVAP solenoids to test their function.
                            Replace faulty components: Depending on the diagnosis, this could include the EVAP two-way valve, bypass solenoid valve, EVAP canister, or any leaking hoses.
                            Clear the DTC: After any repair, the diagnostic trouble code should be cleared from the PCM using an OBD-II scanner. A drive cycle may be necessary to confirm the repair and ensure the EVAP monitor runs and passes.
                        </Text>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </SafeAreaProvider>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    lowerBox: {
        alignSelf: 'center',
        marginTop: 30,
        marginBottom: 30,
        width: '95%',
        flex: 1,
    },
    troubleCode: {
        fontFamily: 'LeagueSpartan_Bold',
        fontSize: 22,
        color: '#333',
        textAlign: 'center',

    },
    technicalDescription: {
        fontFamily: 'LeagueSpartan',
        fontSize: 20,
        color: '#555',
        textAlign: 'center',
    },
    label: {
        fontFamily: 'LeagueSpartan_Bold',
        fontSize: 18,
        color: '#333',
        marginTop: 10,
    },
    text: {
        fontFamily: 'LeagueSpartan',
        fontSize: 16,
        color: '#333',
    },
})

export default DetailedReport