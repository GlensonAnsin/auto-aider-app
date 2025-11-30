import { Header } from '@/components/Header';
import { Loading } from '@/components/Loading';
import { clearScanState } from '@/redux/slices/scanSlice';
import { RootState } from '@/redux/store';
import { getOnVehicleDiagnosticRS } from '@/services/backendApi';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { showMessage } from 'react-native-flash-message';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';

const ScanDetailedReport = () => {
  const router = useRouter();
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
          const res = await getOnVehicleDiagnosticRS(vehicleID ?? 0, scanReference ?? '');

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
          if (isActive) setIsLoading(false);
        }
      };

      fetchData();

      return () => {
        isActive = false;
        dispatch(clearScanState());
      };
    }, [dispatch, router, scanReference, vehicleID])
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
              {codes?.map((item, index) => {
                const categoryInfo = getDTCCategoryInfo(item.dtc);
                const severityInfo = getSeverityLevel(item.dtc);
                const isSelected = selectedIndex === index;

                return (
                  <TouchableOpacity
                    style={[
                      styles.codeButton,
                      isSelected && {
                        backgroundColor: '#000B58',
                        borderLeftWidth: 4,
                        borderLeftColor: categoryInfo.color,
                      },
                      !isSelected && { borderLeftWidth: 4, borderLeftColor: categoryInfo.color },
                    ]}
                    key={index}
                    onPress={() => setSelectedIndex(index)}
                  >
                    <View style={styles.codeButtonContent}>
                      <MaterialCommunityIcons
                        name={categoryInfo.icon as any}
                        size={16}
                        color={isSelected ? '#FFF' : categoryInfo.color}
                        style={styles.codeIcon}
                      />
                      <Text style={[styles.codeButtonText, isSelected && { color: '#FFF' }]}>{item.dtc}</Text>
                      <MaterialCommunityIcons
                        name={severityInfo.icon as any}
                        size={12}
                        color={isSelected ? '#FFF' : severityInfo.color}
                      />
                    </View>
                  </TouchableOpacity>
                );
              })}
            </>
          </View>

          <View style={styles.textContainer}>
            <View style={styles.troubleCodeHeader}>
              <MaterialCommunityIcons
                name={getDTCCategoryInfo(codes[selectedIndex].dtc).icon as any}
                size={24}
                color={getDTCCategoryInfo(codes[selectedIndex].dtc).color}
              />
              <View style={styles.troubleCodeInfo}>
                <Text style={styles.troubleCode}>{codes[selectedIndex].dtc}</Text>
                <View
                  style={[
                    styles.categoryBadge,
                    { backgroundColor: getDTCCategoryInfo(codes[selectedIndex].dtc).bgColor },
                  ]}
                >
                  <Text style={[styles.categoryText, { color: getDTCCategoryInfo(codes[selectedIndex].dtc).color }]}>
                    {getDTCCategoryInfo(codes[selectedIndex].dtc).category}
                  </Text>
                </View>
              </View>
              <MaterialCommunityIcons
                name={getSeverityLevel(codes[selectedIndex].dtc).icon as any}
                size={20}
                color={getSeverityLevel(codes[selectedIndex].dtc).color}
              />
            </View>
            <Text style={styles.technicalDescription}>{codes[selectedIndex].technicalDescription}</Text>
          </View>

          <View style={styles.textContainer}>
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons name="information-outline" size={20} color="#000B58" />
              <Text style={styles.label}>Meaning</Text>
            </View>
            <Text style={styles.text}>{codes[selectedIndex].meaning}</Text>
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
    padding: 12,
    borderRadius: 12,
    minWidth: 80,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  codeButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  codeIcon: {
    marginRight: 4,
  },
  codeButtonText: {
    fontFamily: 'HeaderBold',
    color: '#780606',
    fontSize: 14,
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

export default ScanDetailedReport;
