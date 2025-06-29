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
                    <Text style={styles.header}>|  History</Text>
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
                        <Text style={styles.carDetails}>NISSAN NAVARA 2017</Text>
                        <Text style={styles.date}>2025-06-29</Text>
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
        backgroundColor: '#FFF',
    },
    upperBox: {
        backgroundColor: '#000B58',
        justifyContent: 'center',
        alignItems: 'flex-start',
        height: 63,
    },
    header: {
        color: '#FFF',
        fontFamily: 'LeagueSpartan_Bold',
        fontSize: 22,
        marginLeft: 50,
    },
    arrowWrapper: {
        top: 23,
        right: 320,
        position: 'absolute',
    },
    arrowBack: {
        fontSize: 22,
        color: '#FFF',
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
        color: '#333'
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
        backgroundColor: '#EAEAEA',
        justifyContent: 'space-between',
        padding: 10,
        borderRadius: 4,
        marginTop: 20,
    },
    carDetails: {
        fontFamily: 'LeagueSpartan_Bold',
        color: '#333',
        fontSize: 18,
    },
    troubleCodes: {
        fontFamily: 'LeagueSpartan_Bold',
        color: '#780606',
        fontSize: 14,
    },
    date: {
        fontFamily: 'LeagueSpartan_Bold',
        color: '#555',
        fontSize: 14,
    },

})

export default DiagnosticHistory