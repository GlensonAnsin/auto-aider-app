import { Header } from '@/components/Header';
import { getRequestsForCarOwner } from '@/services/backendApi';
import { useEffect } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const RequestStatus = () => {

    useEffect(() => {
        (async () => {
            try {
                const res = await getRequestsForCarOwner();
                console.log(res);

            } catch (e) {
                console.error('Error: ', e);
            }
        })();
    }, []);

    return (
        <SafeAreaView style={styles.container}>
        <ScrollView>
            <Header headerTitle='Request Status' link='/car-owner/(tabs)' />

            <View style={styles.lowerBox}></View>
        </ScrollView>
        </SafeAreaView>
    )
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF',
    },
    lowerBox: {
        alignSelf: 'center',
        marginTop: 20,
        marginBottom: 100,
        width: '90%',
    },
})

export default RequestStatus;