import { useRouter } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const DiagnosticHistory = () => {
    const router = useRouter();

    return (
        <SafeAreaProvider>
            <SafeAreaView style={styles.container}>
                <View style={styles.upperBox}>
                    <Text style={styles.header}>|  HISTORY</Text>
                    <TouchableOpacity style={styles.arrowWrapper} onPress={() => router.push('/car-owner/(tabs)')}>
                        <Icon name='arrow-left' style={styles.arrowBack} />
                    </TouchableOpacity>
                </View>

                <View style={styles.lowerBox}>
                    <View style={styles.clearHistoryContainer}>
                        <Text style={styles.header2}>Scanned Cars</Text>
                        <TouchableOpacity style={styles.button}>
                            <Text style={styles.buttonTxt}>Clear history</Text>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity style={styles.historyContainer}>
                        <Text style={styles.carDetails}>Toyota Fortuner 2025</Text>
                        <Text style={styles.date}>06/18/2025</Text>
                        <Text style={styles.troubleCodes}>P1100, P1120, P1121</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </SafeAreaProvider>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    upperBox: {
        backgroundColor: '#000B58',
        justifyContent: 'center',
        alignItems: 'flex-start',
        height: 63,
    },
    header: {
        color: '#fff',
        fontFamily: 'LeagueSpartan_Bold',
        fontSize: 24,
        marginLeft: 50,
    },
    arrowWrapper: {
        top: 21,
        right: 320,
        position: 'absolute',
    },
    arrowBack: {
        fontSize: 24,
        color: '#fff',
    },
    lowerBox: { 
        alignItems: 'center',
        flex: 1,
    },
    clearHistoryContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '90%',
        marginTop: 20,
    },
    header2: {
        fontFamily: 'LeagueSpartan_Bold',
        fontSize: 20,
        color: '#000B58'
    },
    button: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonTxt: {
        fontFamily: 'LeagueSpartan',
        color: '#000B58',
        fontSize: 20,
    },
    historyContainer: {
        width: '90%',
        backgroundColor: '#000B58',
        justifyContent: 'space-between',
        padding: 10,
        borderRadius: 4,
        marginTop: 20,
    },
    carDetails: {
        fontFamily: 'LeagueSpartan_Bold',
        color: '#fff',
        fontSize: 18,
    },
    troubleCodes: {
        fontFamily: 'LeagueSpartan_Bold',
        color: 'red',
        fontSize: 16,
    },
    date: {
        fontFamily: 'LeagueSpartan_Bold',
        color: '#fff',
        fontSize: 16,
    },

})

export default DiagnosticHistory