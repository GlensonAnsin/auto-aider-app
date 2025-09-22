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

  const bulletPossibleCauses = possibleCauses.split('\n').map((item) => item.replace(/^\*\s+/, ''));
  const bulletRecommendedRepair = recommendedRepair.split('\n').map((item) => item.replace(/^\*\s+/, ''));

  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        const res = await getOnSpecificVehicleDiagnostic(vehiclDiagID ?? 0);
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
  }, [vehiclDiagID]);

  if (isLoading) {
    return <Loading />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header headerTitle="Detailed Report" />
      <ScrollView>
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
                <Text style={styles.bullet}>{'\u2022'}</Text>
                <Text style={styles.bulletedText}>{item}</Text>
              </View>
            ))}
          </View>

          <View style={styles.textContainer}>
            <Text style={styles.label}>Recommended Solutions</Text>
            {bulletRecommendedRepair.map((item, index) => (
              <View key={index} style={styles.bulletView}>
                <Text style={styles.bullet}>{'\u2022'}</Text>
                <Text style={styles.bulletedText}>{item}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
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
    fontFamily: 'BodyBold',
    fontSize: 20,
    color: '#333',
    textAlign: 'center',
  },
  technicalDescription: {
    fontFamily: 'BodyRegular',
    fontSize: 18,
    color: '#555',
    textAlign: 'center',
  },
  label: {
    fontFamily: 'BodyBold',
    fontSize: 16,
    marginBottom: 10,
    color: '#333',
  },
  text: {
    fontFamily: 'BodyRegular',
    color: '#333',
  },
  bulletView: {
    width: '100%',
    flexDirection: 'row',
    gap: 10,
    paddingLeft: 5,
  },
  bullet: {
    fontFamily: 'BodyRegular',
    color: '#333',
  },
  bulletedText: {
    fontFamily: 'BodyRegular',
    color: '#333',
    maxWidth: '93%',
  },
});

export default DetailedReport;
