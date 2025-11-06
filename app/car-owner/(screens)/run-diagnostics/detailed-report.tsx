import { Header } from '@/components/Header';
import { Loading } from '@/components/Loading';
import { RootState } from '@/redux/store';
import { getOnSpecificVehicleDiagnostic } from '@/services/backendApi';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { showMessage } from 'react-native-flash-message';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';

const DetailedReport = () => {
  const router = useRouter();
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
      } catch {
        showMessage({
          message: 'Something went wrong. Please try again.',
          type: 'danger',
          floating: true,
          color: '#FFF',
          icon: 'danger',
        });
        setTimeout(() => {
          router.push('/error/server-error');
        }, 2000);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [router, vehiclDiagID]);

  if (isLoading) {
    return <Loading />;
  }

  // Helper function to get DTC category info
  const getDTCCategoryInfo = (dtcCode: string) => {
    const code = dtcCode.toUpperCase().trim();

    if (code.startsWith('P0')) {
      return {
        category: 'Powertrain (Generic)',
        icon: 'engine-outline',
        color: '#DC2626',
        bgColor: '#FEE2E2',
        weight: 3,
      };
    } else if (code.startsWith('P1')) {
      return {
        category: 'Powertrain (Manufacturer)',
        icon: 'engine',
        color: '#F59E0B',
        bgColor: '#FEF3C7',
        weight: 2,
      };
    } else if (code.startsWith('C0')) {
      return {
        category: 'Chassis',
        icon: 'car-brake-abs',
        color: '#F59E0B',
        bgColor: '#FEF3C7',
        weight: 2,
      };
    } else if (code.startsWith('B0')) {
      return {
        category: 'Body',
        icon: 'car-door',
        color: '#3B82F6',
        bgColor: '#DBEAFE',
        weight: 1,
      };
    } else if (code.startsWith('U0')) {
      return {
        category: 'Network',
        icon: 'network-outline',
        color: '#3B82F6',
        bgColor: '#DBEAFE',
        weight: 1,
      };
    }

    return {
      category: 'Other',
      icon: 'alert-circle-outline',
      color: '#6B7280',
      bgColor: '#F3F4F6',
      weight: 1,
    };
  };

  // Helper function to get severity level
  const getSeverityLevel = (dtcCode: string) => {
    const categoryInfo = getDTCCategoryInfo(dtcCode);

    if (categoryInfo.weight >= 3) {
      return { level: 'Critical', icon: 'alert-octagon', color: '#DC2626' };
    } else if (categoryInfo.weight >= 2) {
      return { level: 'Warning', icon: 'alert-circle', color: '#F59E0B' };
    } else {
      return { level: 'Info', icon: 'information', color: '#3B82F6' };
    }
  };

  const categoryInfo = getDTCCategoryInfo(dtc);
  const severityInfo = getSeverityLevel(dtc);

  return (
    <SafeAreaView style={styles.container}>
      <Header headerTitle="Detailed Report" />
      <ScrollView>
        <View style={styles.lowerBox}>
          <View style={styles.textContainer}>
            <View style={styles.troubleCodeHeader}>
              <MaterialCommunityIcons name={categoryInfo.icon as any} size={24} color={categoryInfo.color} />
              <View style={styles.troubleCodeInfo}>
                <Text style={styles.troubleCode}>{dtc}</Text>
                <View style={[styles.categoryBadge, { backgroundColor: categoryInfo.bgColor }]}>
                  <Text style={[styles.categoryText, { color: categoryInfo.color }]}>{categoryInfo.category}</Text>
                </View>
              </View>
              <MaterialCommunityIcons name={severityInfo.icon as any} size={20} color={severityInfo.color} />
            </View>
            <Text style={styles.technicalDescription}>{technicalDescription}</Text>
          </View>

          <View style={styles.textContainer}>
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons name="information-outline" size={20} color="#000B58" />
              <Text style={styles.label}>Meaning</Text>
            </View>
            <Text style={styles.text}>{meaning}</Text>
          </View>

          <View style={styles.textContainer}>
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons name="alert-circle-outline" size={20} color="#F59E0B" />
              <Text style={styles.label}>Possible Causes</Text>
            </View>
            {bulletPossibleCauses.map((item, index) => (
              <View key={index} style={styles.bulletView}>
                <MaterialCommunityIcons name="chevron-right" size={16} color="#F59E0B" style={styles.bulletIcon} />
                <Text style={styles.bulletedText}>{item}</Text>
              </View>
            ))}
          </View>

          <View style={styles.textContainer}>
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons name="wrench-outline" size={20} color="#10B981" />
              <Text style={styles.label}>Recommended Solutions</Text>
            </View>
            {bulletRecommendedRepair.map((item, index) => (
              <View key={index} style={styles.bulletView}>
                <MaterialCommunityIcons
                  name="check-circle-outline"
                  size={16}
                  color="#10B981"
                  style={styles.bulletIcon}
                />
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
  textContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  troubleCodeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  troubleCodeInfo: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 16,
  },
  troubleCode: {
    fontFamily: 'BodyBold',
    fontSize: 24,
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  categoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  categoryText: {
    fontFamily: 'BodyBold',
    fontSize: 12,
    textAlign: 'center',
  },
  technicalDescription: {
    fontFamily: 'BodyRegular',
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    lineHeight: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  label: {
    fontFamily: 'BodyBold',
    fontSize: 18,
    color: '#333',
  },
  text: {
    fontFamily: 'BodyRegular',
    color: '#333',
    fontSize: 15,
    lineHeight: 22,
  },
  bulletView: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    paddingLeft: 5,
    marginBottom: 8,
  },
  bulletIcon: {
    marginTop: 2,
  },
  bulletedText: {
    fontFamily: 'BodyRegular',
    color: '#333',
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
  },
});

export default DetailedReport;
