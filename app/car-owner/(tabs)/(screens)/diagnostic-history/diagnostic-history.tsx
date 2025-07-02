import { Header } from '@/components/Header';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const DiagnosticHistory = () => {
    return (
        <SafeAreaView style={styles.container}>
            <Header headerTitle='History' link='/car-owner/(tabs)' />

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
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF',
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
        borderRadius: 10,
        marginTop: 20,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
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