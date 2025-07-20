import { Header } from '@/components/Header';
import { Loading } from '@/components/Loading';
import { RootState } from '@/redux/store';
import { getOnSpecificVehicleDiagnostic } from '@/services/backendApi';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';

const DetailedReport = () => {
    const vehiclDiagID = useSelector((state: RootState) => state.vehicleDiagID.vehicleDiagID);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [dtc, setDtc] = useState<string>('');
    const [technicalDescription, setTechnicalDescription] = useState<string>('');
    const [meaning, setMeaning] = useState<string>('');
    const [possibleCauses, setPossibleCauses] = useState<string>('');
    const [recommendedRepair, setRecommendedRepair] = useState<string>('');

    const bulletPossibleCauses = possibleCauses
        .split('\n')
        .map(item => item.replace(/^\*\s+/, ''));
    
    const bulletRecommendedRepair = recommendedRepair
        .split('\n')
        .map(item => item.replace(/^\*\s+/, ''));

    useEffect(() => {
        (async () => {
            try {
                setIsLoading(true);
                const res = await getOnSpecificVehicleDiagnostic(vehiclDiagID ?? 0)
                if (res) {
                    setDtc(res.dtc);
                    setTechnicalDescription(res.technical_description);
                    setMeaning(res.meaning);
                    setPossibleCauses(res.possible_causes);
                    setRecommendedRepair(res.recommended_repair);
                }

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
                <Header headerTitle='Detailed Report' link='./diagnosis' />

                <View style={styles.lowerBox}>
                    <View style={styles.textContainer}>
                        <Text style={styles.troubleCode}>{dtc}</Text>
                        <Text style={styles.technicalDescription}>{technicalDescription}</Text>
                    </View>

                    <View style={styles.textContainer}>
                        <Text style={styles.label}>Meaning</Text>
                        <Text style={styles.text}>{meaning}</Text>
                    </View>

                    <View style={styles.textContainer}>
                        <Text style={styles.label}>Possible Causes</Text>
                        {bulletPossibleCauses.map((item, index) => (
                            <View key={index} style={styles.bulletView}>
                               <Text style={styles.bullet}>{`\u2022`}</Text>
                                <Text style={styles.bulletedText}>{item}</Text> 
                            </View>
                        ))}
                    </View>

                    <View style={styles.textContainer}>
                        <Text style={styles.label}>Recommended Solutions or Repairs</Text>
                        {bulletRecommendedRepair.map((item, index) => (
                            <View key={index} style={styles.bulletView}>
                                <Text style={styles.bullet}>{`\u2022`}</Text>
                                <Text style={styles.bulletedText}>{item}</Text> 
                            </View>
                        ))}
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    lowerBox: {
        alignSelf: 'center',
        marginTop: 20,
        marginBottom: 100,
        gap: 10,
        width: '90%',
    },
    textContainer: {
        backgroundColor: '#EAEAEA',
        borderRadius: 10,
        padding: 10,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
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
        marginBottom: 10,
        color: '#333',
    },
    text: {
        fontFamily: 'LeagueSpartan',
        fontSize: 16,
        color: '#333',
    },
    bulletView: {
      width: '100%',
      flexDirection: 'row',
      gap: 10,
      paddingLeft: 5,
    },
    bullet: {
      fontFamily: 'LeagueSpartan_Bold',
      color: '#333',
      fontSize: 16,
    },
    bulletedText: {
      fontFamily: 'LeagueSpartan',
      color: '#333',
      fontSize: 16,
      maxWidth: '93%',
    },
})

export default DetailedReport