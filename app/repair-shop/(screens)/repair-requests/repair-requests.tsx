import { Header } from '@/components/Header';
import { Loading } from '@/components/Loading';
import { useBackRoute } from '@/hooks/useBackRoute';
import { setScanReferenceState } from '@/redux/slices/scanReferenceSlice';
import { RootState } from '@/redux/store';
import { getRequestsForRepairShop } from '@/services/backendApi';
import socket from '@/services/socket';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { useRouter } from 'expo-router';
import LottieView from 'lottie-react-native';
import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { showMessage } from 'react-native-flash-message';
import { SafeAreaView } from 'react-native-safe-area-context';
import SelectDropdown from 'react-native-select-dropdown';
import { useDispatch, useSelector } from 'react-redux';

const RepairRequests = () => {
  dayjs.extend(utc);
  const router = useRouter();
  const backRoute = useBackRoute('/repair-shop/(screens)/repair-requests/repair-requests');
  const dispatch = useDispatch();
  const [activeButton, setActiveButton] = useState<string>('All');
  const [requestStatus, setRequestStatus] = useState<
    {
      requestID: number;
      vehicleName: string;
      customer: string;
      scanReference: string;
      datetime: string;
      status: string;
    }[]
  >([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const shopID = useSelector((state: RootState) => state.role.ID);
  const buttons: string[] = ['All', 'Pending', 'Rejected', 'Ongoing', 'Completed'];

  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        const res = await getRequestsForRepairShop();
        const statusData: {
          requestID: number;
          vehicleName: string;
          customer: string;
          scanReference: string;
          datetime: string;
          status: string;
        }[] = [];

        if (res) {
          res.mechanic_requests.forEach((request: any) => {
            if (request) {
              const requestID = request.request_id;
              const datetime = dayjs(request.request_datetime).utc(true).format('ddd MMM DD YYYY, h:mm A');
              const status = request.status;
              if (request.vehicle_diagnostic) {
                const diagnostics = Array.isArray(request.vehicle_diagnostic)
                  ? request.vehicle_diagnostic
                  : [request.vehicle_diagnostic];
                diagnostics.forEach((diagnostic: any) => {
                  if (diagnostic) {
                    const scanReference = diagnostic.scan_reference;
                    if (diagnostic.vehicle) {
                      const vehicles = Array.isArray(diagnostic.vehicle) ? diagnostic.vehicle : [diagnostic.vehicle];
                      vehicles.forEach((vehicle: any) => {
                        if (vehicle) {
                          const vehicleName = `${vehicle.year} ${vehicle.make} ${vehicle.model}`;
                          if (vehicle.user) {
                            const users = Array.isArray(vehicle.user) ? vehicle.user : [vehicle.user];
                            users.forEach((customer: any) => {
                              if (customer) {
                                statusData.push({
                                  requestID,
                                  vehicleName,
                                  customer: `${customer.firstname} ${customer.lastname}`,
                                  scanReference,
                                  datetime,
                                  status,
                                });
                              }
                            });
                          }
                        }
                      });
                    }
                  }
                });
              }
            }
          });
        }

        setRequestStatus(statusData);
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

    socket.on(`newRequest-RS-${shopID}`, ({ shopRequest }) => {
      const statusData: {
        requestID: number;
        vehicleName: string;
        customer: string;
        scanReference: string;
        datetime: string;
        status: string;
      }[] = [];

      if (shopRequest) {
        shopRequest.mechanic_requests.forEach((request: any) => {
          if (request) {
            const requestID = request.request_id;
            const datetime = dayjs(request.request_datetime).utc(true).format('ddd MMM DD YYYY, h:mm A');
            const status = request.status;
            if (request.vehicle_diagnostic) {
              const diagnostics = Array.isArray(request.vehicle_diagnostic)
                ? request.vehicle_diagnostic
                : [request.vehicle_diagnostic];
              diagnostics.forEach((diagnostic: any) => {
                if (diagnostic) {
                  const scanReference = diagnostic.scan_reference;
                  if (diagnostic.vehicle) {
                    const vehicles = Array.isArray(diagnostic.vehicle) ? diagnostic.vehicle : [diagnostic.vehicle];
                    vehicles.forEach((vehicle: any) => {
                      if (vehicle) {
                        const vehicleName = `${vehicle.year} ${vehicle.make} ${vehicle.model}`;
                        if (vehicle.user) {
                          const users = Array.isArray(vehicle.user) ? vehicle.user : [vehicle.user];
                          users.forEach((customer: any) => {
                            if (customer) {
                              statusData.push({
                                requestID,
                                vehicleName,
                                customer: `${customer.firstname} ${customer.lastname}`,
                                scanReference,
                                datetime,
                                status,
                              });
                            }
                          });
                        }
                      }
                    });
                  }
                }
              });
            }
          }
        });
      }

      setRequestStatus(statusData);
    });

    socket.on(`requestRejected-RS-${shopID}`, ({ requestIDs, reason_rejected }) => {
      for (const id of requestIDs) {
        setRequestStatus((prev) =>
          prev.map((r) => (r.requestID === id ? { ...r, status: 'Rejected', reasonRejected: reason_rejected } : r))
        );
      }
    });

    socket.on(`requestAccepted-RS-${shopID}`, ({ requestIDs }) => {
      for (const id of requestIDs) {
        setRequestStatus((prev) => prev.map((r) => (r.requestID === id ? { ...r, status: 'Ongoing' } : r)));
      }
    });

    socket.on(`requestCompleted-RS-${shopID}`, ({ requestIDs, repair_procedure, completed_on }) => {
      for (const id of requestIDs) {
        setRequestStatus((prev) =>
          prev.map((r) =>
            r.requestID === id
              ? {
                  ...r,
                  status: 'Completed',
                  repairProcedure: repair_procedure,
                  completedOn: dayjs(completed_on).utc(true).format('ddd MMM DD YYYY, h:mm A'),
                }
              : r
          )
        );
      }
    });

    return () => {
      socket.off(`newRequest-RS-${shopID}`);
      socket.off(`requestRejected-RS-${shopID}`);
      socket.off(`requestAccepted-RS-${shopID}`);
      socket.off(`requestCompleted-RS-${shopID}`);
    };
  }, [shopID]);

  const grouped = Object.values(
    requestStatus.reduce(
      (acc, item) => {
        const ref = item.scanReference;

        if (!acc[ref]) {
          acc[ref] = {
            requestID: item.requestID,
            vehicleName: item.vehicleName,
            customer: item.customer,
            scanReference: ref,
            datetime: item.datetime,
            status: item.status,
          };
        }

        return acc;
      },
      {} as Record<
        string,
        {
          requestID: number;
          vehicleName: string;
          customer: string;
          scanReference: string;
          datetime: string;
          status: string;
        }
      >
    )
  );

  const filterPending = grouped.filter((item) => item.status === 'Pending');
  const filterRejected = grouped.filter((item) => item.status === 'Rejected');
  const filterOngoing = grouped.filter((item) => item.status === 'Ongoing');
  const filterCompleted = grouped.filter((item) => item.status === 'Completed');

  if (isLoading) {
    return <Loading />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header headerTitle="Repair Requests" />

      <View style={styles.lowerBox}>
        <View style={styles.filterContainer}>
          <View style={styles.filterLabelContainer}>
            <MaterialCommunityIcons name="filter-variant" size={18} color="#000B58" />
            <Text style={styles.filterLabel}>Filter by Status</Text>
          </View>
          <SelectDropdown
            data={buttons}
            defaultValue={activeButton}
            statusBarTranslucent={true}
            onSelect={(selectedItem) => setActiveButton(selectedItem)}
            renderButton={(selectedItem, isOpen) => (
              <View style={styles.dropdownButtonStyle}>
                <MaterialCommunityIcons name="format-list-bulleted" size={18} color="#000B58" />
                <Text style={styles.dropdownButtonTxtStyle}>{selectedItem}</Text>
                <MaterialCommunityIcons
                  name={isOpen ? 'chevron-up' : 'chevron-down'}
                  style={styles.dropdownButtonArrowStyle}
                />
              </View>
            )}
            renderItem={(item, _index, isSelected) => (
              <View
                style={{
                  ...styles.dropdownItemStyle,
                  ...(isSelected && { backgroundColor: '#E0E7FF' }),
                }}
              >
                <Text style={styles.dropdownItemTxtStyle}>{item}</Text>
                {isSelected && <MaterialCommunityIcons name="check" size={18} color="#000B58" />}
              </View>
            )}
            showsVerticalScrollIndicator={false}
            dropdownStyle={styles.dropdownMenuStyle}
          />
        </View>

        {activeButton === 'All' && (
          <>
            {grouped.length === 0 && (
              <View style={styles.noHistoryContainer}>
                <View style={styles.emptyIconContainer}>
                  <MaterialCommunityIcons name="clipboard-text-off-outline" size={80} color="#9CA3AF" />
                </View>
                <Text style={styles.emptyText}>No Requests</Text>
                <Text style={styles.emptySubtext}>No repair requests have been received yet</Text>
              </View>
            )}

            {grouped.length !== 0 && (
              <FlatList
                data={grouped.sort((a, b) => b.requestID - a.requestID)}
                style={{ width: '100%' }}
                renderItem={({ item, index }) => (
                  <TouchableOpacity
                    style={[styles.requestButton, index === 0 && styles.firstChild]}
                    onPress={() => {
                      backRoute();
                      dispatch(setScanReferenceState(item.scanReference));
                      router.replace('./repair-request-details');
                    }}
                  >
                    <View style={styles.requestContent}>
                      <View style={styles.requestIconWrapper}>
                        <MaterialCommunityIcons name="account-wrench" size={24} color="#000B58" />
                      </View>
                      <View style={styles.vehicleCustomerContainer}>
                        <Text style={styles.vehicleName}>{item.vehicleName}</Text>
                        <View style={styles.requestInfoRow}>
                          <MaterialCommunityIcons name="account" size={14} color="#6B7280" />
                          <Text style={styles.requestText}>{item.customer}</Text>
                        </View>
                        <View style={styles.requestInfoRow}>
                          <MaterialCommunityIcons name="clock-outline" size={14} color="#6B7280" />
                          <Text style={styles.requestText}>{item.datetime}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.statusContainer}>
                      <View
                        style={[
                          styles.statusBadge,
                          item.status === 'Pending' && styles.statusPending,
                          item.status === 'Rejected' && styles.statusRejected,
                          item.status === 'Ongoing' && styles.statusOngoing,
                          item.status === 'Completed' && styles.statusCompleted,
                        ]}
                      >
                        <Text style={styles.statusText}>{item.status}</Text>
                        {item.status === 'Pending' && (
                          <LottieView
                            source={require('@/assets/images/pending.json')}
                            autoPlay
                            loop
                            style={{
                              width: 20,
                              height: 20,
                            }}
                          />
                        )}
                        {item.status === 'Rejected' && (
                          <LottieView
                            source={require('@/assets/images/rejected.json')}
                            autoPlay
                            loop
                            style={{
                              width: 20,
                              height: 20,
                            }}
                          />
                        )}
                        {item.status === 'Ongoing' && (
                          <LottieView
                            source={require('@/assets/images/ongoing.json')}
                            autoPlay
                            loop
                            style={{
                              width: 20,
                              height: 20,
                            }}
                          />
                        )}
                        {item.status === 'Completed' && (
                          <LottieView
                            source={require('@/assets/images/completed.json')}
                            autoPlay
                            loop
                            style={{
                              width: 20,
                              height: 20,
                            }}
                          />
                        )}
                      </View>
                      <MaterialCommunityIcons name="chevron-right" size={20} color="#9CA3AF" />
                    </View>
                  </TouchableOpacity>
                )}
                keyExtractor={(item) => item.scanReference}
              />
            )}
          </>
        )}

        {activeButton === 'Pending' && (
          <>
            {filterPending.length === 0 && (
              <View style={styles.noHistoryContainer}>
                <View style={styles.emptyIconContainer}>
                  <MaterialCommunityIcons name="clock-alert-outline" size={80} color="#FEF3C7" />
                </View>
                <Text style={styles.noRequestText}>No Pending Requests</Text>
                <Text style={styles.emptySubtext}>No pending requests at the moment</Text>
              </View>
            )}

            {filterPending.length !== 0 && (
              <FlatList
                data={filterPending.sort((a, b) => b.requestID - a.requestID)}
                style={{ width: '100%' }}
                renderItem={({ item, index }) => (
                  <TouchableOpacity
                    style={[styles.requestButton, index === 0 && styles.firstChild]}
                    onPress={() => {
                      backRoute();
                      dispatch(setScanReferenceState(item.scanReference));
                      router.replace('./repair-request-details');
                    }}
                  >
                    <View style={styles.requestContent}>
                      <View style={styles.requestIconWrapper}>
                        <MaterialCommunityIcons name="account-wrench" size={24} color="#000B58" />
                      </View>
                      <View style={styles.vehicleCustomerContainer}>
                        <Text style={styles.vehicleName}>{item.vehicleName}</Text>
                        <View style={styles.requestInfoRow}>
                          <MaterialCommunityIcons name="account" size={14} color="#6B7280" />
                          <Text style={styles.requestText}>{item.customer}</Text>
                        </View>
                        <View style={styles.requestInfoRow}>
                          <MaterialCommunityIcons name="clock-outline" size={14} color="#6B7280" />
                          <Text style={styles.requestText}>{item.datetime}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.statusContainer}>
                      <View style={[styles.statusBadge, styles.statusPending]}>
                        <Text style={styles.statusText}>{item.status}</Text>
                        <LottieView
                          source={require('@/assets/images/pending.json')}
                          autoPlay
                          loop
                          style={{
                            width: 20,
                            height: 20,
                          }}
                        />
                      </View>
                      <MaterialCommunityIcons name="chevron-right" size={20} color="#9CA3AF" />
                    </View>
                  </TouchableOpacity>
                )}
                keyExtractor={(item) => item.scanReference}
              />
            )}
          </>
        )}

        {activeButton === 'Rejected' && (
          <>
            {filterRejected.length === 0 && (
              <View style={styles.noHistoryContainer}>
                <View style={styles.emptyIconContainer}>
                  <MaterialCommunityIcons name="close-circle-outline" size={80} color="#FECACA" />
                </View>
                <Text style={styles.noRequestText}>No Rejected Requests</Text>
                <Text style={styles.emptySubtext}>No rejected requests</Text>
              </View>
            )}

            {filterRejected.length !== 0 && (
              <FlatList
                data={filterRejected.sort((a, b) => b.requestID - a.requestID)}
                style={{ width: '100%' }}
                renderItem={({ item, index }) => (
                  <TouchableOpacity
                    style={[styles.requestButton, index === 0 && styles.firstChild]}
                    onPress={() => {
                      backRoute();
                      dispatch(setScanReferenceState(item.scanReference));
                      router.replace('./repair-request-details');
                    }}
                  >
                    <View style={styles.requestContent}>
                      <View style={styles.requestIconWrapper}>
                        <MaterialCommunityIcons name="account-wrench" size={24} color="#000B58" />
                      </View>
                      <View style={styles.vehicleCustomerContainer}>
                        <Text style={styles.vehicleName}>{item.vehicleName}</Text>
                        <View style={styles.requestInfoRow}>
                          <MaterialCommunityIcons name="account" size={14} color="#6B7280" />
                          <Text style={styles.requestText}>{item.customer}</Text>
                        </View>
                        <View style={styles.requestInfoRow}>
                          <MaterialCommunityIcons name="clock-outline" size={14} color="#6B7280" />
                          <Text style={styles.requestText}>{item.datetime}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.statusContainer}>
                      <View style={[styles.statusBadge, styles.statusRejected]}>
                        <Text style={styles.statusText}>{item.status}</Text>
                        <LottieView
                          source={require('@/assets/images/rejected.json')}
                          autoPlay
                          loop
                          style={{
                            width: 20,
                            height: 20,
                          }}
                        />
                      </View>
                      <MaterialCommunityIcons name="chevron-right" size={20} color="#9CA3AF" />
                    </View>
                  </TouchableOpacity>
                )}
                keyExtractor={(item) => item.scanReference}
              />
            )}
          </>
        )}

        {activeButton === 'Ongoing' && (
          <>
            {filterOngoing.length === 0 && (
              <View style={styles.noHistoryContainer}>
                <View style={styles.emptyIconContainer}>
                  <MaterialCommunityIcons name="progress-wrench" size={80} color="#DBEAFE" />
                </View>
                <Text style={styles.noRequestText}>No Ongoing Requests</Text>
                <Text style={styles.emptySubtext}>No ongoing requests</Text>
              </View>
            )}

            {filterOngoing.length !== 0 && (
              <FlatList
                data={filterOngoing.sort((a, b) => b.requestID - a.requestID)}
                style={{ width: '100%' }}
                renderItem={({ item, index }) => (
                  <TouchableOpacity
                    style={[styles.requestButton, index === 0 && styles.firstChild]}
                    onPress={() => {
                      backRoute();
                      dispatch(setScanReferenceState(item.scanReference));
                      router.replace('./repair-request-details');
                    }}
                  >
                    <View style={styles.requestContent}>
                      <View style={styles.requestIconWrapper}>
                        <MaterialCommunityIcons name="account-wrench" size={24} color="#000B58" />
                      </View>
                      <View style={styles.vehicleCustomerContainer}>
                        <Text style={styles.vehicleName}>{item.vehicleName}</Text>
                        <View style={styles.requestInfoRow}>
                          <MaterialCommunityIcons name="account" size={14} color="#6B7280" />
                          <Text style={styles.requestText}>{item.customer}</Text>
                        </View>
                        <View style={styles.requestInfoRow}>
                          <MaterialCommunityIcons name="clock-outline" size={14} color="#6B7280" />
                          <Text style={styles.requestText}>{item.datetime}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.statusContainer}>
                      <View style={[styles.statusBadge, styles.statusOngoing]}>
                        <Text style={styles.statusText}>{item.status}</Text>
                        <LottieView
                          source={require('@/assets/images/ongoing.json')}
                          autoPlay
                          loop
                          style={{
                            width: 20,
                            height: 20,
                          }}
                        />
                      </View>
                      <MaterialCommunityIcons name="chevron-right" size={20} color="#9CA3AF" />
                    </View>
                  </TouchableOpacity>
                )}
                keyExtractor={(item) => item.scanReference}
              />
            )}
          </>
        )}

        {activeButton === 'Completed' && (
          <>
            {filterCompleted.length === 0 && (
              <View style={styles.noHistoryContainer}>
                <View style={styles.emptyIconContainer}>
                  <MaterialCommunityIcons name="check-circle-outline" size={80} color="#BBF7D0" />
                </View>
                <Text style={styles.noRequestText}>No Completed Requests</Text>
                <Text style={styles.emptySubtext}>No completed requests yet</Text>
              </View>
            )}

            {filterCompleted.length !== 0 && (
              <FlatList
                data={filterCompleted.sort((a, b) => b.requestID - a.requestID)}
                style={{ width: '100%' }}
                renderItem={({ item, index }) => (
                  <TouchableOpacity
                    style={[styles.requestButton, index === 0 && styles.firstChild]}
                    onPress={() => {
                      backRoute();
                      dispatch(setScanReferenceState(item.scanReference));
                      router.replace('./repair-request-details');
                    }}
                  >
                    <View style={styles.requestContent}>
                      <View style={styles.requestIconWrapper}>
                        <MaterialCommunityIcons name="account-wrench" size={24} color="#000B58" />
                      </View>
                      <View style={styles.vehicleCustomerContainer}>
                        <Text style={styles.vehicleName}>{item.vehicleName}</Text>
                        <View style={styles.requestInfoRow}>
                          <MaterialCommunityIcons name="account" size={14} color="#6B7280" />
                          <Text style={styles.requestText}>{item.customer}</Text>
                        </View>
                        <View style={styles.requestInfoRow}>
                          <MaterialCommunityIcons name="clock-outline" size={14} color="#6B7280" />
                          <Text style={styles.requestText}>{item.datetime}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.statusContainer}>
                      <View style={[styles.statusBadge, styles.statusCompleted]}>
                        <Text style={styles.statusText}>{item.status}</Text>
                        <LottieView
                          source={require('@/assets/images/completed.json')}
                          autoPlay
                          loop
                          style={{
                            width: 20,
                            height: 20,
                          }}
                        />
                      </View>
                      <MaterialCommunityIcons name="chevron-right" size={20} color="#9CA3AF" />
                    </View>
                  </TouchableOpacity>
                )}
                keyExtractor={(item) => item.scanReference}
              />
            )}
          </>
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
    alignSelf: 'center',
    marginTop: 20,
    marginBottom: 80,
    width: '100%',
  },
  dropdownButtonStyle: {
    width: 150,
    height: 45,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#EAEAEA',
  },
  dropdownButtonTxtStyle: {
    flex: 1,
    fontFamily: 'BodyRegular',
    color: '#333',
  },
  dropdownButtonArrowStyle: {
    fontSize: 24,
    color: '#333',
  },
  dropdownItemStyle: {
    width: 150,
    flexDirection: 'row',
    paddingHorizontal: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
  },
  dropdownItemTxtStyle: {
    flex: 1,
    fontFamily: 'BodyRegular',
    color: '#333',
  },
  dropdownMenuStyle: {
    backgroundColor: '#fff',
    borderRadius: 10,
  },
  noHistoryContainer: {
    height: '85%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: 'BodyRegular',
    color: '#EAEAEA',
    fontSize: 30,
  },
  requestButton: {
    width: '90%',
    alignSelf: 'center',
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    marginBottom: 10,
  },
  firstChild: {
    marginTop: 10,
  },
  vehicleCustomerContainer: {
    flex: 1,
  },
  vehicleName: {
    fontFamily: 'BodyBold',
    color: '#333',
    fontSize: 16,
  },
  requestText: {
    fontFamily: 'BodyRegular',
    color: '#555',
    fontSize: 14,
  },
  statusContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-end',
    gap: 8,
  },
  statusText: {
    fontFamily: 'BodyBold',
    color: '#555',
    fontSize: 12,
  },
  noRequestText: {
    fontFamily: 'BodyRegular',
    color: '#555',
    textAlign: 'center',
    fontSize: 16,
  },
  // Filter section styles
  filterContainer: {
    width: '90%',
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 5,
  },
  filterLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 6,
  },
  filterLabel: {
    fontFamily: 'BodyBold',
    fontSize: 14,
    color: '#333',
  },
  // Empty state styles
  emptyIconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  emptySubtext: {
    fontFamily: 'BodyRegular',
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 4,
  },
  // Request card styles
  requestContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
    marginRight: 8,
  },
  requestIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F0F4FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  requestInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  // Status badge styles
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    gap: 4,
    flexShrink: 0,
  },
  statusPending: {
    backgroundColor: '#FEF3C7',
  },
  statusRejected: {
    backgroundColor: '#FECACA',
  },
  statusOngoing: {
    backgroundColor: '#DBEAFE',
  },
  statusCompleted: {
    backgroundColor: '#BBF7D0',
  },
});

export default RepairRequests;
