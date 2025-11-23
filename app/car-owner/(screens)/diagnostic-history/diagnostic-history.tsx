import { Header } from '@/components/Header';
import { Loading } from '@/components/Loading';
import { useBackRoute } from '@/hooks/useBackRoute';
import { setScanState } from '@/redux/slices/scanSlice';
import { RootState } from '@/redux/store';
import { deleteAllVehicleDiagnostics, deleteVehicleDiagnostic, getVehicleDiagnostics } from '@/services/backendApi';
import socket from '@/services/socket';
import Entypo from '@expo/vector-icons/Entypo';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { showMessage } from 'react-native-flash-message';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';

const DiagnosticHistory = () => {
  dayjs.extend(utc);
  const router = useRouter();
  const dispatch = useDispatch();
  const backRoute = useBackRoute('/car-owner/(screens)/diagnostic-history/diagnostic-history');
  const [history, setHistory] = useState<
    {
      vehicleDiagID: number;
      vehicleID: number;
      vehicle: string;
      dtc: string;
      date: string;
      scanReference: string;
    }[]
  >([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedScanReference, setSelectedScanReference] = useState<string>('');
  const userID = useSelector((state: RootState) => state.role.ID);

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
        const res = await getVehicleDiagnostics();

        const historyData: {
          vehicleDiagID: number;
          vehicleID: number;
          vehicle: string;
          dtc: string;
          date: string;
          scanReference: string;
        }[] = [];

        res?.forEach((item: any) => {
          const scanDate = dayjs(item.date).utc(true);
          historyData.push({
            vehicleDiagID: item.vehicle_diagnostic_id,
            vehicleID: item.vehicle_id,
            vehicle: `${item.year} ${item.make} ${item.model}`,
            dtc: item.dtc,
            date: scanDate.format('ddd MMM DD YYYY'),
            scanReference: item.scan_reference,
          });
        });

        setHistory(historyData);
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
  }, [router]);

  useEffect(() => {
    if (!socket) return;

    socket.on(`vehicleDiagnosticDeleted-CO-${userID}`, ({ deletedVehicleDiag }) => {
      setHistory((prev) => prev.filter((v) => !deletedVehicleDiag.includes(v.scanReference)));
    });

    socket.on(`allVehicleDiagnosticDeleted-CO-${userID}`, ({ allDeletedVehicleDiag }) => {
      setHistory((prev) => prev.filter((v) => !allDeletedVehicleDiag.includes(v.scanReference)));
    });

    return () => {
      socket.off(`vehicleDiagnosticDeleted-CO-${userID}`);
      socket.off(`allVehicleDiagnosticDeleted-CO-${userID}`);
    };
  }, [userID]);

  const grouped = Object.values(
    history.reduce(
      (acc, item) => {
        const ref = item.scanReference;

        if (!acc[ref]) {
          acc[ref] = {
            vehicleDiagID: item.vehicleDiagID,
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
      },
      {} as Record<
        string,
        {
          vehicleDiagID: number;
          vehicleID: number;
          vehicle: string;
          scanReference: string;
          date: string;
          dtc: string[];
        }
      >
    )
  );

  const deleteVehicleDiagAlert = () => {
    Alert.alert('Delete Diagnostic', 'Are you sure you want to delete this diagnostic?', [
      {
        text: 'Cancel',
        onPress: () => {},
        style: 'cancel',
      },
      {
        text: 'Yes',
        onPress: () => handleDelete(),
      },
    ]);
  };

  const deleteAllVehicleDiagAlert = () => {
    if (grouped.length === 0) {
      return;
    }

    Alert.alert('Clear History', 'Are you sure you want to clear your history?', [
      {
        text: 'Cancel',
        onPress: () => {},
        style: 'cancel',
      },
      {
        text: 'Yes',
        onPress: () => handleDeleteAll(),
      },
    ]);
  };

  const handleDelete = async () => {
    try {
      await deleteVehicleDiagnostic(selectedScanReference);
      showMessage({
        message: 'Delete successful!',
        type: 'success',
        floating: true,
        color: '#fff',
        icon: 'success',
      });
    } catch {
      showMessage({
        message: 'Something went wrong. Please try again.',
        type: 'danger',
        floating: true,
        color: '#fff',
        icon: 'danger',
      });
    }
  };

  const handleDeleteAll = async () => {
    try {
      await deleteAllVehicleDiagnostics();
      showMessage({
        message: 'History cleared!',
        type: 'success',
        floating: true,
        color: '#fff',
        icon: 'success',
      });
    } catch {
      showMessage({
        message: 'Something went wrong. Please try again.',
        type: 'danger',
        floating: true,
        color: '#fff',
        icon: 'danger',
      });
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header headerTitle="History" />
      <View style={styles.lowerBox}>
        <View style={styles.clearHistoryContainer}>
          <Text style={styles.header2}>Scanned Cars</Text>
          <TouchableOpacity style={styles.button} onPress={() => deleteAllVehicleDiagAlert()}>
            <Text style={styles.buttonTxt}>Clear history</Text>
          </TouchableOpacity>
        </View>

        {grouped.length === 0 && (
          <View style={styles.noHistoryContainer}>
            <View style={styles.emptyStateIconContainer}>
              <MaterialCommunityIcons name="car-wrench" size={80} color="#C7D2FE" />
              <View style={styles.emptyStateIconOverlay}>
                <MaterialCommunityIcons name="file-document-outline" size={40} color="#818CF8" />
              </View>
            </View>
            <Text style={styles.emptyText}>No Diagnostic History</Text>
            <Text style={styles.emptySubtext}>
              Your vehicle scan history will appear here{'\n'}
              Start by scanning your car to see diagnostic reports
            </Text>
            <TouchableOpacity style={styles.emptyStateButton} onPress={() => router.back()}>
              <MaterialCommunityIcons name="arrow-left" size={20} color="#000B58" />
              <Text style={styles.emptyStateButtonText}>Go Back to Scan</Text>
            </TouchableOpacity>
          </View>
        )}

        {grouped.length !== 0 && (
          <FlatList
            data={grouped.sort((a, b) => b.vehicleDiagID - a.vehicleDiagID)}
            style={{ width: '100%' }}
            renderItem={({ item, index }) => {
              const severityInfo = getSeverityInfo(item.dtc);
              const formattedDate = formatDate(item.date);

              return (
                <TouchableOpacity
                  style={[styles.historyContainer, index === 0 && styles.firstChild]}
                  onPress={() => {
                    dispatch(
                      setScanState({
                        vehicleID: parseInt(String(item.vehicleID)),
                        scanReference: item.scanReference,
                      })
                    );
                    backRoute();
                    router.replace('./history-detailed-report');
                  }}
                  onLongPress={() => {
                    deleteVehicleDiagAlert();
                    setSelectedScanReference(item.scanReference);
                  }}
                >
                  <View style={styles.cardHeader}>
                    <View style={styles.vehicleInfo}>
                      <MaterialCommunityIcons name="car" size={24} color="#000B58" style={styles.carIcon} />
                      <View style={styles.vehicleDetails}>
                        <Text style={styles.carDetails}>{item.vehicle}</Text>
                        <Text style={styles.date}>{formattedDate}</Text>
                      </View>
                    </View>
                    <View style={[styles.severityBadge, { backgroundColor: severityInfo.bgColor }]}>
                      <MaterialCommunityIcons name={severityInfo.icon as any} size={16} color={severityInfo.color} />
                      <Text style={[styles.severityText, { color: severityInfo.color }]}>{severityInfo.label}</Text>
                    </View>
                  </View>

                  <View style={styles.codeSection}>
                    <View style={styles.codeHeader}>
                      <MaterialCommunityIcons name="alert-circle-outline" size={16} color="#780606" />
                      <Text style={styles.codeLabel}>Trouble Codes ({item.dtc.length})</Text>
                      <View style={[styles.severityIndicator, { backgroundColor: severityInfo.bgColor }]}>
                        <Text style={[styles.severityWeight, { color: severityInfo.color }]}>
                          Weight: {item.dtc.reduce((sum, code) => sum + getDTCWeight(code), 0)}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.troubleCodes} numberOfLines={2}>
                      {item.dtc.join(', ')}
                    </Text>
                    <Text style={styles.severityDescription}>{severityInfo.description}</Text>
                  </View>

                  <View style={styles.codeButtonContainer}>
                    <TouchableOpacity
                      style={styles.detailsButton}
                      onPress={() => {
                        dispatch(
                          setScanState({
                            vehicleID: parseInt(String(item.vehicleID)),
                            scanReference: item.scanReference,
                          })
                        );
                        backRoute();
                        router.replace('./history-detailed-report');
                      }}
                    >
                      <MaterialCommunityIcons name="file-document-outline" size={16} color="#000B58" />
                      <Text style={styles.detailsButtonText}>View Details</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.historyButton}
                      onPress={() => {
                        dispatch(
                          setScanState({
                            vehicleID: parseInt(String(item.vehicleID)),
                            scanReference: item.scanReference,
                          })
                        );
                        backRoute();
                        router.replace('/car-owner/(screens)/repair-shops/repair-shops');
                      }}
                    >
                      <Entypo name="location" size={16} color="#FFF" />
                      <Text style={styles.historyButtonText}>Find Repair</Text>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              );
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
    paddingBottom: 180,
    gap: 10,
  },
  clearHistoryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '90%',
    marginTop: 20,
  },
  header2: {
    fontFamily: 'HeaderBold',
    fontSize: 18,
    color: '#333',
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonTxt: {
    fontFamily: 'HeaderRegular',
    color: '#000B58',
    fontSize: 16,
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
  emptyStateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E0E7FF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    gap: 8,
  },
  emptyStateButtonText: {
    fontFamily: 'HeaderRegular',
    color: '#000B58',
    fontSize: 16,
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
  vehicleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  carIcon: {
    marginRight: 12,
  },
  vehicleDetails: {
    flex: 1,
  },
  carDetails: {
    fontFamily: 'BodyBold',
    color: '#333',
    fontSize: 16,
    marginBottom: 4,
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
  codeButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
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
  historyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000B58',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 6,
    minWidth: 120,
  },
  historyButtonText: {
    fontFamily: 'HeaderRegular',
    color: '#FFF',
    fontSize: 14,
  },
  noHistoriesText: {
    fontFamily: 'BodyRegular',
    color: '#555',
  },
});

export default DiagnosticHistory;
