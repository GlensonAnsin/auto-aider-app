import { Header } from '@/components/Header';
import { Loading } from '@/components/Loading';
import { getVehicleDiagnostics } from '@/services/backendApi';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const DiagnosticHistory = () => {
    const [history, setHistory] = useState<{ vehicleID: number, vehicle: string, dtc: string, date: Date, scanReference: string }[]>([])
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const grouped = Object.values(
        history.reduce((acc, item) => {
            const ref = item.scanReference;

            if (!acc[ref]) {
                acc[ref] = {
                    vehicleID: item.vehicleID,
                    vehicle: item.vehicle,
                    scanReference: ref,
                    date: item.date,
                    dtc: [item.dtc],
                };
            } else {
                acc[ref].dtc.push(item.dtc);
            }

            return acc;
        }, {} as Record<string, { vehicleID: number, vehicle: string; scanReference: string; date: Date; dtc: string[]; }>)
    );

    useEffect(() => {
        (async () => {
            try {
                setIsLoading(true);
                const res1 = await getVehicleDiagnostics();

                setHistory(res1.map((item: any) => ({
                    vehicleID: item.vehicle_id,
                    vehicle: `${item.year} ${item.make} ${item.model}`,
                    dtc: item.dtc,
                    date: item.date,
                    scanReference: item.scan_reference,
                })));

            } catch (e) {
                console.error('Error: ', e);

            } finally {
                setIsLoading(false);
            }
        })();
    }, []);

    if (isLoading) {
        return (
            <Loading />
        )
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView>
                <Header headerTitle='History' link='/car-owner/(tabs)' />

                <View style={styles.lowerBox}>
                    <View style={styles.clearHistoryContainer}>
                        <Text style={styles.header2}>Scanned Cars</Text>
                        <TouchableOpacity style={styles.button} onPress={() => console.log(history)}>
                            <Text style={styles.buttonTxt}>Clear history</Text>
                        </TouchableOpacity>
                    </View>

                    {grouped.map((item) => (
                        <TouchableOpacity key={item.scanReference} style={styles.historyContainer}>
                            <Text style={styles.carDetails}>{item.vehicle}</Text>
                            <Text style={styles.date}>{new Date(item.date).toDateString()}</Text>
                            <Text style={styles.troubleCodes}>{item.dtc.join(', ')}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>
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
        marginBottom: 100,
        gap: 10,
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
        color: '#333',
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