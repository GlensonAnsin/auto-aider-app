import { Header } from '@/components/Header';
import { Loading } from '@/components/Loading';
import { RootState } from '@/redux/store';
import { getRepairShops, getRequestsForCarOwner } from '@/services/backendApi';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import LottieView from 'lottie-react-native';
import React, { useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';

const RequestDetails = () => {
  dayjs.extend(utc);
  const [requestDetails, setRequestDetails] = useState<{ requestID: number, repairShop: string, repairShopProfile: string | null, repairShopProfileBG: string, status: string, datetime: string, make: string, model: string, year: string, dtc: string | null, technicalDescription: string | null, meaning: string | null, possibleCauses: string | null, recommendedRepair: string | null, scanReference: string, vehicleIssue: string, repairProcedure: string | null }[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const requestID: number | null = useSelector((state: RootState) => state.requestID.requestID);

  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        const res1 = await getRequestsForCarOwner();
        const res2 = await getRepairShops();

        const requestDetailsData: { requestID: number, repairShop: string, repairShopProfile: string | null, repairShopProfileBG: string, status: string, datetime: string, make: string, model: string, year: string, dtc: string | null, technicalDescription: string | null, meaning: string | null, possibleCauses: string | null, recommendedRepair: string | null, scanReference: string, vehicleIssue: string, repairProcedure: string | null }[] = [];

        if (res1) {
          res1.vehicles.forEach((vehicle: any) => {
            if (vehicle) {
              const make = vehicle.make;
              const model = vehicle.model;
              const year = vehicle.year;
              if (vehicle.vehicle_diagnostics) {
                vehicle.vehicle_diagnostics.forEach((diagnostic: any) => {
                  if (diagnostic) {
                    const dtc = diagnostic.dtc;
                    const technicalDescription = diagnostic.technical_description;
                    const meaning = diagnostic.meaning;
                    const possibleCauses = diagnostic.possible_causes;
                    const recommendedRepair = diagnostic.recommended_repair;
                    const scanReference = diagnostic.scan_reference;
                    const vehicleIssue = diagnostic.vehicle_issue_description;
                    if (diagnostic.mechanic_requests) {
                      diagnostic.mechanic_requests.forEach((request: any) => {
                        const repairShop = res2.find((shop: any) => shop.repair_shop_id === request.repair_shop_id);
                        if (repairShop) {
                          requestDetailsData.push({
                            requestID: request.mechanic_request_id,
                            repairShop: repairShop.shop_name,
                            repairShopProfile: repairShop.profile_pic,
                            repairShopProfileBG: repairShop.profile_bg,
                            status: request.status,
                            datetime: dayjs(request.request_datetime).utc(true).local().format('ddd MMM DD YYYY, h:mm A'),
                            make: make,
                            model: model,
                            year: year,
                            dtc: dtc,
                            technicalDescription: technicalDescription,
                            meaning: meaning,
                            possibleCauses: possibleCauses,
                            recommendedRepair: recommendedRepair,
                            scanReference: scanReference,
                            vehicleIssue: vehicleIssue,
                            repairProcedure: request.repair_procedure,
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

        setRequestDetails(requestDetailsData);

      } catch (e) {
        console.error('Error: ', e);

      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const selectedRequest = requestDetails.filter((item: any) => item.requestID === requestID);

  const grouped = Object.values(
    selectedRequest.reduce((acc, item) => {
      const ref = item.scanReference;

      if (!acc[ref]) {
        acc[ref] = {
          requestID: item.requestID,
          repairShop: item.repairShop,
          repairShopProfile: item.repairShopProfile,
          repairShopProfileBG: item.repairShopProfileBG,
          status: item.status,
          datetime: item.datetime,
          make: item.make,
          model: item.model,
          year: item.year,
          dtc: [item.dtc ?? ''],
          technicalDescription: [item.technicalDescription ?? ''],
          meaning: [item.meaning ?? ''],
          possibleCauses: [item.possibleCauses ?? ''],
          recommendedRepair: [item.recommendedRepair ?? ''],
          scanReference: ref,
          vehicleIssue: item.vehicleIssue,
          repairProcedure: item.repairProcedure,
        }
      } else {
        acc[ref].dtc.push(item.dtc ?? '');
        acc[ref].technicalDescription.push(item.technicalDescription ?? '');
        acc[ref].meaning.push(item.meaning ?? '');
        acc[ref].possibleCauses.push(item.possibleCauses ?? '');
        acc[ref].recommendedRepair.push(item.recommendedRepair ?? '');
      }

      return acc;

    }, {} as Record<string, { requestID: number; repairShop: string; repairShopProfile: string | null; repairShopProfileBG: string; status: string; datetime: string; make: string; model: string; year: string; dtc: (string | null)[]; technicalDescription: (string | null)[]; meaning: (string | null)[]; possibleCauses: (string | null)[]; recommendedRepair: (string | null)[]; scanReference: string; vehicleIssue: string | null; repairProcedure: string | null }>)
  );

  if (isLoading) {
    return (
      <Loading />
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <Header headerTitle='Request Details' />

        {grouped.map((item) => (
          <View key={item.scanReference} style={styles.lowerBox}>
            <View style={styles.shopProfileContainer}>
              {item.repairShopProfile === null && (
                <View style={[styles.profilePicWrapper, { backgroundColor: item.repairShopProfileBG }]}>
                  <MaterialCommunityIcons name='car-wrench' size={50} color='#FFF' />
                </View>
              )}

              {item.repairShopProfile !== null && (
                <View style={styles.profilePicWrapper}>
                  <Image
                    style={styles.profilePic}
                    source={{ uri: item.repairShopProfile ?? '' }}
                    width={100}
                    height={100}
                  />
                </View>
              )}

              <Text style={styles.shopName}>{item.repairShop}</Text>
            </View>

            <View style={styles.statusVehicleContainer}>
              <View style={styles.statusContainer}>
                <Text style={styles.status}>{item.status}</Text>
                {item.status === 'Pending' && (
                  <LottieView
                    source={require('@/assets/images/pending.json')}
                    autoPlay
                    loop
                    style={{
                      width: 30,
                      height: 30,
                    }}
                  />
                )}
                {item.status === 'Rejected' && (
                  <LottieView
                    source={require('@/assets/images/rejected.json')}
                    autoPlay
                    loop
                    style={{
                      width: 30,
                      height: 30,
                    }}
                  />
                )}
                {item.status === 'Ongoing' && (
                  <LottieView
                    source={require('@/assets/images/ongoing.json')}
                    autoPlay
                    loop
                    style={{
                      width: 30,
                      height: 30,
                    }}
                  />
                )}
                {item.status === 'Completed' && (
                  <LottieView
                    source={require('@/assets/images/completed.json')}
                    autoPlay
                    loop
                    style={{
                      width: 30,
                      height: 30,
                    }}
                  />
                )}
              </View>

              <View style={styles.vehicleContainer}>
                <Text style={styles.text}>{`Request Datetime: ${item.datetime}`}</Text>
                <Text style={styles.text}>{`Make: ${item.make}`}</Text>
                <Text style={styles.text}>{`Model: ${item.model}`}</Text>
                <Text style={styles.text}>{`Year: ${item.year}`}</Text>
              </View>
            </View>

            <View style={styles.vehcileIssueContainer}>
              <Text style={styles.label}>Vehicle Issue</Text>
              {item.vehicleIssue === null && (
                <>
                  {item.dtc.map((dtc, index) => (
                    <View key={`${item.scanReference}-${index}`} style={styles.diagnosisButtonContainer}>
                      <TouchableOpacity style={styles.diagnosisButton}>
                        <Text style={styles.diagnosisButtonText1}>{dtc}</Text>
                        <Text style={styles.diagnosisButtonText2}>{item.technicalDescription[index]}</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </>
              )}

              {item.vehicleIssue !== null && (
                <Text style={styles.text}>{item.vehicleIssue}</Text>
              )}
            </View>

            {item.status === 'Completed' && (
              <>
                <View style={styles.repairProcedureContainer}>
                  <Text style={styles.label}>Repair Procedure</Text>
                  <Text style={styles.text}>{item.repairProcedure}</Text>
                </View>

                <TouchableOpacity style={styles.rateButton}>
                  <Text style={styles.rateButtonText}>Rate Shop</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  )
}

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
  shopProfileContainer: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: '#EAEAEA',
    paddingBottom: 20,
  },
  profilePicWrapper: {
    width: 100,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 100,
  },
  profilePic: {
    borderRadius: 100,
  },
  shopName: {
    fontFamily: 'LeagueSpartan_Bold',
    color: '#333',
    fontSize: 22,
  },
  statusVehicleContainer: {
    marginTop: 10,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  status: {
    fontFamily: 'LeagueSpartan',
    color: '#333',
    fontSize: 20,
  },
  vehicleContainer: {},
  text: {
    fontFamily: 'LeagueSpartan',
    color: '#333',
    fontSize: 16,
  },
  vehcileIssueContainer: {},
  label: {},
  diagnosisButtonContainer: {},
  diagnosisButton: {},
  diagnosisButtonText1: {},
  diagnosisButtonText2: {},
  repairProcedureContainer: {},
  rateButton: {},
  rateButtonText: {},
});

export default RequestDetails