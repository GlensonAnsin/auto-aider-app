import { Header } from '@/components/Header';
import { Loading } from '@/components/Loading';
import { useBackRoute } from '@/hooks/useBackRoute';
import { setScanState } from '@/redux/slices/scanSlice';
import { RootState } from '@/redux/store';
import { getRecentScansRS } from '@/services/backendApi';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { showMessage } from 'react-native-flash-message';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';

const RecentScans = () => {
  const router = useRouter();
  const backRoute = useBackRoute('/repair-shop/repair-requests/recent-scans');
  const dispatch = useDispatch();
  dayjs.extend(utc);
  const [recentScan, setRecentScan] = useState<
    {
      vehicleDiagID: number;
      dtc: string | null;
      noCodes: string | null;
      date: string;
      scanReference: string;
    }[]
  >([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const vehicleID = useSelector((state: RootState) => state.vehicleID.vehicleID);
  const vehicleName = useSelector((state: RootState) => state.vehicleID.vehicleName);

  // Helper function to calculate DTC weight based on code type
  const getDTCWeight = (dtcCode: string) => {
    const code = dtcCode.toUpperCase().trim();

    // Powertrain codes
    if (code.startsWith('P0')) {
      return 3; // Critical powertrain issues
    } else if (code.startsWith('P1')) {
      return 2; // Manufacturer-specific powertrain issues
    }
    // Chassis codes
    else if (code.startsWith('C0')) {
      return 2; // Chassis/suspension issues
    }
    // Body codes
    else if (code.startsWith('B0')) {
      return 1; // Body/comfort systems
    }
    // Network/communication codes
    else if (code.startsWith('U0')) {
      return 1; // Network communication issues
    }

    // Default weight for other codes (P2, P3, C1, B1, U1, etc.)
    return 1;
  };

  // Helper function to get severity indicator based on weighted DTC scoring
  const getSeverityInfo = (dtcCodes: string[]) => {
    const totalWeight = dtcCodes.reduce((sum, code) => sum + getDTCWeight(code), 0);

    if (totalWeight >= 6) {
      return {
        color: '#DC2626',
        icon: 'alert-octagon',
        label: 'Severe',
        bgColor: '#FEE2E2',
        description: 'Urgent - may affect safety or drivability',
      };
    } else if (totalWeight >= 3) {
      return {
        color: '#F59E0B',
        icon: 'alert-circle',
        label: 'Moderate',
        bgColor: '#FEF3C7',
        description: 'Needs attention soon',
      };
    } else if (totalWeight >= 1) {
      return {
        color: '#3B82F6',
        icon: 'information',
        label: 'Minor',
        bgColor: '#DBEAFE',
        description: 'Non-critical or intermittent',
      };
    }

    return {
      color: '#10B981',
      icon: 'check-circle',
      label: 'Good',
      bgColor: '#D1FAE5',
      description: 'No issues detected',
    };
  };

  // Helper function to format date more elegantly
  const formatDate = (dateString: string) => {
    const date = dayjs(dateString);
    const now = dayjs();
    const diffDays = now.diff(date, 'day');

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.format('MMM DD, YYYY');
  };

  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        const res = await getRecentScansRS(vehicleID ?? 0);

        const recentScanData: {
          vehicleDiagID: number;
          dtc: string | null;
          noCodes: string | null;
          date: string;
          scanReference: string;
        }[] = [];

        res?.forEach((item: any) => {
          const scanDate = dayjs(item.date).utc(true);
          recentScanData.push({
            vehicleDiagID: item.vehicle_diagnostic_id,
            dtc: item.dtc,
            noCodes: item.vehicle_issue_description,
            date: scanDate.format('ddd MMM DD YYYY'),
            scanReference: item.scan_reference,
          });
        });

        setRecentScan(recentScanData);
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
  }, []);

  const grouped = Object.values(
    recentScan.reduce(
      (acc, item) => {
        const ref = item.scanReference;

        if (!acc[ref]) {
          acc[ref] = {
            vehicleDiagID: item.vehicleDiagID,
            scanReference: ref,
            date: item.date,
            dtc: item.dtc ? [item.dtc] : [],
            noCodes: item.noCodes,
          };
        } else {
          if (item.dtc) {
            acc[ref].dtc.push(item.dtc);
          }
        }

        return acc;
      },
      {} as Record<
        string,
        {
          vehicleDiagID: number;
          scanReference: string;
          date: string;
          dtc: string[];
          noCodes: string | null;
        }
      >
    )
  );

  if (isLoading) {
    return <Loading />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header headerTitle="Recent Scans" />
      <View style={styles.lowerBox}>
        <View style={styles.headerInfoContainer}>
          <Text style={styles.headerInfoText}>{vehicleName}</Text>
        </View>

        {grouped.length === 0 && (
          <View style={styles.noHistoryContainer}>
            <View style={styles.emptyStateIconContainer}>
              <MaterialCommunityIcons name="car-wrench" size={80} color="#C7D2FE" />
              <View style={styles.emptyStateIconOverlay}>
                <MaterialCommunityIcons name="file-document-outline" size={40} color="#818CF8" />
              </View>
            </View>
            <Text style={styles.emptyText}>No Recent Scans</Text>
            <Text style={styles.emptySubtext}>Your vehicle's recent scans will appear here</Text>
          </View>
        )}

        {grouped.length !== 0 && (
          <FlatList
            data={grouped.sort((a, b) => b.vehicleDiagID - a.vehicleDiagID)}
            style={{ width: '100%' }}
            renderItem={({ item, index }) => {
              let severityInfo;
              if (item.dtc) {
                severityInfo = getSeverityInfo(item.dtc);
              }
              const formattedDate = formatDate(item.date);

              if (item.noCodes) {
                return (
                  <View style={[styles.historyContainer, index === 0 && styles.firstChild]}>
                    <View style={styles.cardHeader}>
                      <Text style={styles.date}>{formattedDate}</Text>
                      <View style={[styles.severityBadge, { backgroundColor: severityInfo?.bgColor }]}>
                        <MaterialCommunityIcons
                          name={severityInfo?.icon as any}
                          size={16}
                          color={severityInfo?.color}
                        />
                        <Text style={[styles.severityText, { color: severityInfo?.color }]}>{severityInfo?.label}</Text>
                      </View>
                    </View>

                    <View style={styles.codeSection}>
                      <View style={styles.codeHeader}>
                        <MaterialCommunityIcons name="alert-circle-outline" size={16} color="#780606" />
                        <Text style={styles.codeLabel}>Trouble Codes ({item.dtc.length})</Text>
                        <View style={[styles.severityIndicator, { backgroundColor: severityInfo?.bgColor }]}>
                          <Text style={[styles.severityWeight, { color: severityInfo?.color }]}>
                            Weight: {item.dtc.reduce((sum, code) => sum + getDTCWeight(code), 0)}
                          </Text>
                        </View>
                      </View>
                      <Text style={styles.troubleCodes} numberOfLines={2}>
                        {item.dtc.join(', ')}
                      </Text>
                      <Text style={styles.severityDescription}>{severityInfo?.description}</Text>
                    </View>
                  </View>
                );
              } else {
                return (
                  <TouchableOpacity
                    style={[styles.historyContainer, index === 0 && styles.firstChild]}
                    onPress={() => {
                      dispatch(
                        setScanState({
                          vehicleID: parseInt(String(vehicleID)),
                          scanReference: item.scanReference,
                        })
                      );
                      backRoute();
                      router.replace('/repair-shop/(screens)/repair-requests/scan-detailed-report');
                    }}
                  >
                    <View style={styles.cardHeader}>
                      <Text style={styles.date}>{formattedDate}</Text>
                      <View style={[styles.severityBadge, { backgroundColor: severityInfo?.bgColor }]}>
                        <MaterialCommunityIcons
                          name={severityInfo?.icon as any}
                          size={16}
                          color={severityInfo?.color}
                        />
                        <Text style={[styles.severityText, { color: severityInfo?.color }]}>{severityInfo?.label}</Text>
                      </View>
                    </View>

                    <View style={styles.codeSection}>
                      <View style={styles.codeHeader}>
                        <MaterialCommunityIcons name="alert-circle-outline" size={16} color="#780606" />
                        <Text style={styles.codeLabel}>Trouble Codes ({item.dtc.length})</Text>
                        <View style={[styles.severityIndicator, { backgroundColor: severityInfo?.bgColor }]}>
                          <Text style={[styles.severityWeight, { color: severityInfo?.color }]}>
                            Weight: {item.dtc.reduce((sum, code) => sum + getDTCWeight(code), 0)}
                          </Text>
                        </View>
                      </View>
                      <Text style={styles.troubleCodes} numberOfLines={2}>
                        {item.dtc.join(', ')}
                      </Text>
                      <Text style={styles.severityDescription}>{severityInfo?.description}</Text>
                    </View>

                    <View>
                      <TouchableOpacity
                        style={styles.detailsButton}
                        onPress={() => {
                          dispatch(
                            setScanState({
                              vehicleID: parseInt(String(vehicleID)),
                              scanReference: item.scanReference,
                            })
                          );
                          backRoute();
                          router.replace('/repair-shop/(screens)/repair-requests/scan-detailed-report');
                        }}
                      >
                        <MaterialCommunityIcons name="file-document-outline" size={16} color="#000B58" />
                        <Text style={styles.detailsButtonText}>View Details</Text>
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                );
              }
            }}
            keyExtractor={(item) => item.scanReference}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f4f7',
  },
  lowerBox: {
    alignItems: 'center',
    width: '100%',
    alignSelf: 'center',
    flex: 1,
    paddingBottom: 60,
    gap: 10,
  },
  headerInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#E0E7FF',
    borderRadius: 10,
    marginVertical: 12,
    alignSelf: 'center',
  },
  headerInfoText: {
    fontFamily: 'BodyBold',
    fontSize: 14,
    color: '#000B58',
  },
  noHistoryContainer: {
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyStateIconContainer: {
    position: 'relative',
    marginBottom: 24,
  },
  emptyStateIconOverlay: {
    position: 'absolute',
    top: -10,
    right: -10,
    backgroundColor: '#fff',
    borderRadius: 25,
    padding: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  emptyText: {
    fontFamily: 'HeaderBold',
    color: '#374151',
    fontSize: 24,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontFamily: 'BodyRegular',
    color: '#6B7280',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  historyContainer: {
    width: '90%',
    marginBottom: 12,
    alignSelf: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
    borderLeftWidth: 4,
    borderLeftColor: '#000B58',
  },
  firstChild: {
    marginTop: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  date: {
    fontFamily: 'BodyRegular',
    color: '#6B7280',
    fontSize: 14,
  },
  severityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  severityText: {
    fontFamily: 'BodyBold',
    fontSize: 12,
  },
  codeSection: {
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  codeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 6,
    justifyContent: 'space-between',
  },
  codeLabel: {
    fontFamily: 'BodyBold',
    color: '#374151',
    fontSize: 14,
    flex: 1,
  },
  severityIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  severityWeight: {
    fontFamily: 'BodyBold',
    fontSize: 12,
  },
  severityDescription: {
    fontFamily: 'BodyRegular',
    color: '#6B7280',
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 4,
  },
  troubleCodes: {
    fontFamily: 'BodyRegular',
    color: '#780606',
    fontSize: 14,
    lineHeight: 20,
  },
  detailsButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E0E7FF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 6,
  },
  detailsButtonText: {
    fontFamily: 'HeaderRegular',
    color: '#000B58',
    fontSize: 14,
  },
});

export default RecentScans;
