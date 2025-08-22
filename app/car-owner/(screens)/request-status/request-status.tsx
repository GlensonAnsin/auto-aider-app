import { Header } from '@/components/Header';
import { Loading } from '@/components/Loading';
import { useBackRoute } from '@/hooks/useBackRoute';
import { setScanReferenceState } from '@/redux/slices/scanReferenceSlice';
import { getRepairShops, getRequestsForCarOwner } from '@/services/backendApi';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { useRouter } from 'expo-router';
import LottieView from 'lottie-react-native';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import SelectDropdown from 'react-native-select-dropdown';
import { useDispatch } from 'react-redux';

const RequestStatus = () => {
  dayjs.extend(utc);
  const dispatch = useDispatch();
  const router = useRouter();
  const backRoute = useBackRoute('/car-owner/(screens)/request-status/request-status');
  const [requestStatus, setRequestStatus] = useState<
    {
      vehicleName: string;
      repairShop: string;
      scanReference: string;
      datetime: string;
      status: string;
    }[]
  >([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeButton, setActiveButton] = useState<string>('All');

  const buttons: string[] = ['All', 'Pending', 'Rejected', 'Ongoing', 'Completed'];

  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        const res1 = await getRequestsForCarOwner();
        const res2 = await getRepairShops();
        const statusData: {
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
                            vehicleName,
                            repairShop: repairShop.shop_name,
                            scanReference,
                            datetime: dayjs(request.request_datetime)
                              .utc(true)
                              .local()
                              .format('ddd MMM DD YYYY, h:mm A'),
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

  const grouped = Object.values(
    requestStatus.reduce(
      (acc, item) => {
        const ref = item.scanReference;

        if (!acc[ref]) {
          acc[ref] = {
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
        { vehicleName: string; repairShop: string; scanReference: string; datetime: string; status: string }
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
        <Header headerTitle="Request Status" />

        <View style={styles.lowerBox}>
          <SelectDropdown
            data={buttons}
            defaultValue={activeButton}
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
    fontSize: 16,
    fontFamily: 'LeagueSpartan',
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
    fontSize: 16,
    fontFamily: 'LeagueSpartan',
    color: '#333',
  },
  dropdownMenuStyle: {
    backgroundColor: '#EAEAEA',
    borderRadius: 10,
    marginTop: -37,
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
  vehicleShopContainer: {},
  vehicleName: {
    fontFamily: 'LeagueSpartan_Bold',
    color: '#333',
    fontSize: 18,
  },
  requestText: {
    fontFamily: 'LeagueSpartan',
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
    fontFamily: 'LeagueSpartan_Bold',
    color: '#555',
    fontSize: 14,
  },
  noRequestText: {
    fontFamily: 'LeagueSpartan',
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
  },
});

export default RequestStatus;
