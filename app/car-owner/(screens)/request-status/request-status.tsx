import { Header } from '@/components/Header';
import { Loading } from '@/components/Loading';
import { useBackRoute } from '@/hooks/useBackRoute';
import { setScanReferenceState } from '@/redux/slices/scanReferenceSlice';
import { RootState } from '@/redux/store';
import { getRepairShops, getRequestsForCarOwner } from '@/services/backendApi';
import socket from '@/services/socket';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { useRouter } from 'expo-router';
import LottieView from 'lottie-react-native';
import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import SelectDropdown from 'react-native-select-dropdown';
import { useDispatch, useSelector } from 'react-redux';

const RequestStatus = () => {
  dayjs.extend(utc);
  const dispatch = useDispatch();
  const router = useRouter();
  const backRoute = useBackRoute('/car-owner/(screens)/request-status/request-status');
  const [requestStatus, setRequestStatus] = useState<
    {
      requestID: number;
      vehicleName: string;
      repairShop: string;
      scanReference: string;
      datetime: string;
      status: string;
    }[]
  >([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeButton, setActiveButton] = useState<string>('All');
  const userID = useSelector((state: RootState) => state.role.ID);
  const buttons: string[] = ['All', 'Pending', 'Rejected', 'Ongoing', 'Completed'];

  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        const res1 = await getRequestsForCarOwner();
        const res2 = await getRepairShops();
        const statusData: {
          requestID: number;
          vehicleName: string;
          repairShop: string;
          scanReference: string;
          datetime: string;
          status: string;
        }[] = [];

        if (res1) {
          res1.vehicles.forEach((vehicle: any) => {
            if (vehicle) {
              const vehicleName = `${vehicle.year} ${vehicle.make} ${vehicle.model}`;
              if (vehicle.vehicle_diagnostics) {
                vehicle.vehicle_diagnostics.forEach((diagnostic: any) => {
                  if (diagnostic) {
                    const scanReference = diagnostic.scan_reference;
                    if (diagnostic.mechanic_requests) {
                      diagnostic.mechanic_requests.forEach((request: any) => {
                        const repairShop = res2.find((shop: any) => shop.repair_shop_id === request.repair_shop_id);
                        if (repairShop) {
                          statusData.push({
                            requestID: request.mechanic_request,
                            vehicleName,
                            repairShop: repairShop.shop_name,
                            scanReference,
                            datetime: dayjs(request.request_datetime).utc(true).format('ddd MMM DD YYYY, h:mm A'),
                            status: request.status,
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

    socket.on(`newRequest-CO-${userID}`, async ({ userRequest }) => {
      const statusData: {
        requestID: number;
        vehicleName: string;
        repairShop: string;
        scanReference: string;
        datetime: string;
        status: string;
      }[] = [];

      const res2 = await getRepairShops();

      if (userRequest) {
        userRequest.vehicles.forEach((vehicle: any) => {
          if (vehicle) {
            const vehicleName = `${vehicle.year} ${vehicle.make} ${vehicle.model}`;
            if (vehicle.vehicle_diagnostics) {
              vehicle.vehicle_diagnostics.forEach((diagnostic: any) => {
                if (diagnostic) {
                  const scanReference = diagnostic.scan_reference;
                  if (diagnostic.mechanic_requests) {
                    diagnostic.mechanic_requests.forEach((request: any) => {
                      const repairShop = res2.find((shop: any) => shop.repair_shop_id === request.repair_shop_id);
                      if (repairShop) {
                        statusData.push({
                          requestID: request.request_id,
                          vehicleName,
                          repairShop: repairShop.shop_name,
                          scanReference,
                          datetime: dayjs(request.request_datetime).utc(true).format('ddd MMM DD YYYY, h:mm A'),
                          status: request.status,
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

      setRequestStatus(statusData);
    });

    socket.on(`requestRejected-CO-${userID}`, ({ requestIDs, reason_rejected }) => {
      for (const id of requestIDs) {
        setRequestStatus((prev) =>
          prev.map((r) => (r.requestID === id ? { ...r, status: 'Rejected', reasonRejected: reason_rejected } : r))
        );
      }
    });

    socket.on(`requestAccepted-CO-${userID}`, ({ requestIDs }) => {
      for (const id of requestIDs) {
        setRequestStatus((prev) => prev.map((r) => (r.requestID === id ? { ...r, status: 'Ongoing' } : r)));
      }
    });

    socket.on(`requestCompleted-CO-${userID}`, ({ requestIDs, repair_procedure, completed_on }) => {
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
      socket.off(`newRequest-CO-${userID}`);
      socket.off(`requestRejected-CO-${userID}`);
      socket.off(`requestAccepted-CO-${userID}`);
      socket.off(`requestCompleted-CO-${userID}`);
    };
  }, [userID]);

  const grouped = Object.values(
    requestStatus.reduce(
      (acc, item) => {
        const ref = item.scanReference;

        if (!acc[ref]) {
          acc[ref] = {
            requestID: item.requestID,
            vehicleName: item.vehicleName,
            repairShop: item.repairShop,
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
          repairShop: string;
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
      <Header headerTitle="Request Status" />
      <View style={styles.lowerBox}>
        <View style={{ width: '90%', alignSelf: 'center' }}>
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
        </View>

        {activeButton === 'All' && (
          <>
            {grouped.length === 0 && (
              <View style={styles.noHistoryContainer}>
                <MaterialCommunityIcons name="file-document-outline" size={150} color="#EAEAEA" />
                <Text style={styles.emptyText}>Empty</Text>
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
                      router.replace('./request-details');
                    }}
                  >
                    <View style={styles.vehicleShopContainer}>
                      <Text style={styles.vehicleName}>{item.vehicleName}</Text>
                      <Text style={styles.requestText}>{item.repairShop}</Text>
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
                <MaterialCommunityIcons name="file-document-outline" size={150} color="#EAEAEA" />
                <Text style={styles.emptyText}>Empty</Text>
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
                      router.replace('./request-details');
                    }}
                  >
                    <View style={styles.vehicleShopContainer}>
                      <Text style={styles.vehicleName}>{item.vehicleName}</Text>
                      <Text style={styles.requestText}>{item.repairShop}</Text>
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
                <MaterialCommunityIcons name="file-document-outline" size={150} color="#EAEAEA" />
                <Text style={styles.emptyText}>Empty</Text>
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
                      router.replace('./request-details');
                    }}
                  >
                    <View style={styles.vehicleShopContainer}>
                      <Text style={styles.vehicleName}>{item.vehicleName}</Text>
                      <Text style={styles.requestText}>{item.repairShop}</Text>
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
                <MaterialCommunityIcons name="file-document-outline" size={150} color="#EAEAEA" />
                <Text style={styles.emptyText}>Empty</Text>
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
                      router.replace('./request-details');
                    }}
                  >
                    <View style={styles.vehicleShopContainer}>
                      <Text style={styles.vehicleName}>{item.vehicleName}</Text>
                      <Text style={styles.requestText}>{item.repairShop}</Text>
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
                <MaterialCommunityIcons name="file-document-outline" size={150} color="#EAEAEA" />
                <Text style={styles.emptyText}>Empty</Text>
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
                      router.replace('./request-details');
                    }}
                  >
                    <View style={styles.vehicleShopContainer}>
                      <Text style={styles.vehicleName}>{item.vehicleName}</Text>
                      <Text style={styles.requestText}>{item.repairShop}</Text>
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
    width: 120,
    height: 45,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#eaeaea',
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
  firstChild: {
    marginTop: 10,
  },
  vehicleShopContainer: {},
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
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
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
  },
});

export default RequestStatus;
