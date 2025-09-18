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
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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
              const datetime = dayjs(request.request_datetime).utc(true).local().format('ddd MMM DD YYYY, h:mm A');
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
      } catch (e) {
        console.error('Error: ', e);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (!socket) return;

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
      <ScrollView>
        <Header headerTitle="Repair Requests" />

        <View style={styles.lowerBox}>
          <SelectDropdown
            data={buttons}
            defaultValue={activeButton}
            statusBarTranslucent={true}
            onSelect={(selectedItem) => setActiveButton(selectedItem)}
            renderButton={(selectedItem, isOpen) => (
              <View style={styles.dropdownButtonStyle}>
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
                  ...(isSelected && { backgroundColor: '#D2D9DF' }),
                }}
              >
                <Text style={styles.dropdownItemTxtStyle}>{item}</Text>
              </View>
            )}
            showsVerticalScrollIndicator={false}
            dropdownStyle={styles.dropdownMenuStyle}
          />

          {activeButton === 'All' && (
            <>
              {grouped.map((item, index) => (
                <View key={index}>
                  <TouchableOpacity
                    style={styles.requestButton}
                    onPress={() => {
                      backRoute();
                      dispatch(setScanReferenceState(item.scanReference));
                      router.replace('./repair-request-details');
                    }}
                  >
                    <View style={styles.vehicleCustomerContainer}>
                      <Text style={styles.vehicleName}>{item.vehicleName}</Text>
                      <Text style={styles.requestText}>{item.customer}</Text>
                      <Text style={styles.requestText}>{item.datetime}</Text>
                    </View>
                    <View style={styles.statusContainer}>
                      <Text style={styles.statusText}>{item.status}</Text>
                      {item.status === 'Pending' && (
                        <LottieView
                          source={require('@/assets/images/pending.json')}
                          autoPlay
                          loop
                          style={{
                            width: 26,
                            height: 26,
                          }}
                        />
                      )}
                      {item.status === 'Rejected' && (
                        <LottieView
                          source={require('@/assets/images/rejected.json')}
                          autoPlay
                          loop
                          style={{
                            width: 26,
                            height: 26,
                          }}
                        />
                      )}
                      {item.status === 'Ongoing' && (
                        <LottieView
                          source={require('@/assets/images/ongoing.json')}
                          autoPlay
                          loop
                          style={{
                            width: 26,
                            height: 26,
                          }}
                        />
                      )}
                      {item.status === 'Completed' && (
                        <LottieView
                          source={require('@/assets/images/completed.json')}
                          autoPlay
                          loop
                          style={{
                            width: 26,
                            height: 26,
                          }}
                        />
                      )}
                    </View>
                  </TouchableOpacity>
                </View>
              ))}

              {grouped.length === 0 && <Text style={styles.noRequestText}>-- No Requests --</Text>}
            </>
          )}

          {activeButton === 'Pending' && (
            <>
              {filterPending.map((item, index) => (
                <View key={index}>
                  <TouchableOpacity
                    style={styles.requestButton}
                    onPress={() => {
                      backRoute();
                      dispatch(setScanReferenceState(item.scanReference));
                      router.replace('./repair-request-details');
                    }}
                  >
                    <View style={styles.vehicleCustomerContainer}>
                      <Text style={styles.vehicleName}>{item.vehicleName}</Text>
                      <Text style={styles.requestText}>{item.customer}</Text>
                      <Text style={styles.requestText}>{item.datetime}</Text>
                    </View>
                    <View style={styles.statusContainer}>
                      <Text style={styles.statusText}>{item.status}</Text>
                      <LottieView
                        source={require('@/assets/images/pending.json')}
                        autoPlay
                        loop
                        style={{
                          width: 26,
                          height: 26,
                        }}
                      />
                    </View>
                  </TouchableOpacity>
                </View>
              ))}

              {filterPending.length === 0 && <Text style={styles.noRequestText}>-- No Requests --</Text>}
            </>
          )}

          {activeButton === 'Rejected' && (
            <>
              {filterRejected.map((item, index) => (
                <View key={index}>
                  <TouchableOpacity
                    style={styles.requestButton}
                    onPress={() => {
                      backRoute();
                      dispatch(setScanReferenceState(item.scanReference));
                      router.replace('./repair-request-details');
                    }}
                  >
                    <View style={styles.vehicleCustomerContainer}>
                      <Text style={styles.vehicleName}>{item.vehicleName}</Text>
                      <Text style={styles.requestText}>{item.customer}</Text>
                      <Text style={styles.requestText}>{item.datetime}</Text>
                    </View>
                    <View style={styles.statusContainer}>
                      <Text style={styles.statusText}>{item.status}</Text>
                      <LottieView
                        source={require('@/assets/images/rejected.json')}
                        autoPlay
                        loop
                        style={{
                          width: 26,
                          height: 26,
                        }}
                      />
                    </View>
                  </TouchableOpacity>
                </View>
              ))}

              {filterRejected.length === 0 && <Text style={styles.noRequestText}>-- No Requests --</Text>}
            </>
          )}

          {activeButton === 'Ongoing' && (
            <>
              {filterOngoing.map((item, index) => (
                <View key={index}>
                  <TouchableOpacity
                    style={styles.requestButton}
                    onPress={() => {
                      backRoute();
                      dispatch(setScanReferenceState(item.scanReference));
                      router.replace('./repair-request-details');
                    }}
                  >
                    <View style={styles.vehicleCustomerContainer}>
                      <Text style={styles.vehicleName}>{item.vehicleName}</Text>
                      <Text style={styles.requestText}>{item.customer}</Text>
                      <Text style={styles.requestText}>{item.datetime}</Text>
                    </View>
                    <View style={styles.statusContainer}>
                      <Text style={styles.statusText}>{item.status}</Text>
                      <LottieView
                        source={require('@/assets/images/ongoing.json')}
                        autoPlay
                        loop
                        style={{
                          width: 26,
                          height: 26,
                        }}
                      />
                    </View>
                  </TouchableOpacity>
                </View>
              ))}

              {filterOngoing.length === 0 && <Text style={styles.noRequestText}>-- No Requests --</Text>}
            </>
          )}

          {activeButton === 'Completed' && (
            <>
              {filterCompleted.map((item, index) => (
                <View key={index}>
                  <TouchableOpacity
                    style={styles.requestButton}
                    onPress={() => {
                      backRoute();
                      dispatch(setScanReferenceState(item.scanReference));
                      router.replace('./repair-request-details');
                    }}
                  >
                    <View style={styles.vehicleCustomerContainer}>
                      <Text style={styles.vehicleName}>{item.vehicleName}</Text>
                      <Text style={styles.requestText}>{item.customer}</Text>
                      <Text style={styles.requestText}>{item.datetime}</Text>
                    </View>
                    <View style={styles.statusContainer}>
                      <Text style={styles.statusText}>{item.status}</Text>
                      <LottieView
                        source={require('@/assets/images/completed.json')}
                        autoPlay
                        loop
                        style={{
                          width: 26,
                          height: 26,
                        }}
                      />
                    </View>
                  </TouchableOpacity>
                </View>
              ))}

              {filterCompleted.length === 0 && <Text style={styles.noRequestText}>-- No Requests --</Text>}
            </>
          )}
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
    width: '90%',
  },
  dropdownButtonStyle: {
    width: 120,
    height: 45,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
    marginBottom: 10,
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
    width: 120,
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
    backgroundColor: '#EAEAEA',
    borderRadius: 10,
  },
  requestButton: {
    width: '100%',
    backgroundColor: '#EAEAEA',
    flexDirection: 'row',
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
    marginBottom: 10,
  },
  vehicleCustomerContainer: {},
  vehicleName: {
    fontFamily: 'BodyBold',
    color: '#333',
    fontSize: 16,
  },
  requestText: {
    fontFamily: 'BodyRegular',
    color: '#555',
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  statusText: {
    fontFamily: 'BodyBold',
    color: '#555',
  },
  noRequestText: {
    fontFamily: 'BodyRegular',
    color: '#555',
    textAlign: 'center',
  },
});

export default RepairRequests;
