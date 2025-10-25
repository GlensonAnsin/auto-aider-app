import { Header } from '@/components/Header';
import { Loading } from '@/components/Loading';
import { clearScanState } from '@/redux/slices/scanSlice';
import { RootState } from '@/redux/store';
import { getOnVehicleDiagnostic } from '@/services/backendApi';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';

const HistoryDetailedReport = () => {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [codes, setCodes] = useState<
    {
      vehicleDiagID: number;
      dtc: string;
      technicalDescription: string;
      meaning: string;
      possibleCauses: string;
      recommendedRepair: string;
    }[]
  >([]);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);

  const vehicleID: number | null = useSelector((state: RootState) => state.scan.vehicleID);
  const scanReference: string | null = useSelector((state: RootState) => state.scan.scanReference);

  const bulletPossibleCauses =
    codes[selectedIndex]?.possibleCauses?.split('\n').map((item) => item.replace(/^\*\s+/, '')) || [];

  const bulletRecommendedRepair =
    codes[selectedIndex]?.recommendedRepair?.split('\n').map((item) => item.replace(/^\*\s+/, '')) || [];

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const fetchData = async () => {
        try {
          setIsLoading(true);
          const res = await getOnVehicleDiagnostic(vehicleID ?? 0, scanReference ?? '');

          if (!isActive) return;

          if (res) {
            setCodes(
              res.map((item: any) => ({
                vehicleDiagID: item.vehicle_diagnostic_id,
                dtc: item.dtc,
                technicalDescription: item.technical_description,
                meaning: item.meaning,
                possibleCauses: item.possible_causes,
                recommendedRepair: item.recommended_repair,
              }))
            );
          }
        } catch (e) {
          console.error('Error: ', e);
        } finally {
          if (isActive) setIsLoading(false);
        }
      };

      fetchData();

      return () => {
        isActive = false;
        dispatch(clearScanState());
      };
    }, [dispatch, scanReference, vehicleID])
  );

  if (isLoading || codes.length === 0) {
    return <Loading />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header headerTitle="Report Details" />
      <ScrollView>
        <View style={styles.lowerBox}>
          <View style={styles.codeContainer}>
            <>
              {codes?.map((item, index) => (
                <TouchableOpacity
                  style={[styles.codeButton, selectedIndex === index && { backgroundColor: '#000B58' }]}
                  key={index}
                  onPress={() => setSelectedIndex(index)}
                >
                  <Text style={[styles.codeButtonText, selectedIndex === index && { color: '#FFF' }]}>{item.dtc}</Text>
                </TouchableOpacity>
              ))}
            </>
          </View>

          <View style={styles.textContainer}>
            <Text style={styles.troubleCode}>{codes[selectedIndex].dtc}</Text>
            <Text style={styles.technicalDescription}>{codes[selectedIndex].technicalDescription}</Text>
          </View>

          <View style={styles.textContainer}>
            <Text style={styles.label}>Meaning</Text>
            <Text style={styles.text}>{codes[selectedIndex].meaning}</Text>
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
    backgroundColor: '#f2f4f7',
  },
  lowerBox: {
    alignSelf: 'center',
    marginTop: 20,
    marginBottom: 80,
    gap: 10,
    width: '90%',
  },
  codeContainer: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  codeButton: {
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderRadius: 10,
  },
  codeButtonText: {
    fontFamily: 'HeaderBold',
    color: '#780606',
  },
  textContainer: {
    backgroundColor: '#fff',
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

export default HistoryDetailedReport;
