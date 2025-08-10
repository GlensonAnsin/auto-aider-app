import { Header } from '@/components/Header';
import { Loading } from '@/components/Loading';
import { RootState } from '@/redux/store';
import { getRepairShops, getRequestsForCarOwner } from '@/services/backendApi';
import Entypo from '@expo/vector-icons/Entypo';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import LottieView from 'lottie-react-native';
import React, { useEffect, useState } from 'react';
import { Image, Modal, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';

const RequestDetails = () => {
  dayjs.extend(utc);
  const [requestDetails, setRequestDetails] = useState<{ repairShop: string, repairShopProfile: string | null, repairShopProfileBG: string, status: string, datetime: string, make: string, model: string, year: string, dtc: string | null, technicalDescription: string | null, meaning: string | null, possibleCauses: string | null, recommendedRepair: string | null, scanReference: string, vehicleIssue: string, repairProcedure: string | null }[]>([]);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [bulletPossibleCauses, setBulletPossibleCauses] = useState<string[][]>([]);
  const [bulletRecommendedRepair, setBulletRecommendedRepair] = useState<string[][]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const scanReference: string | null = useSelector((state: RootState) => state.scanReference.scanReference);

  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        const res1 = await getRequestsForCarOwner();
        const res2 = await getRepairShops();

        const requestDetailsData: { repairShop: string, repairShopProfile: string | null, repairShopProfileBG: string, status: string, datetime: string, make: string, model: string, year: string, dtc: string | null, technicalDescription: string | null, meaning: string | null, possibleCauses: string | null, recommendedRepair: string | null, scanReference: string, vehicleIssue: string, repairProcedure: string | null }[] = [];

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

  const selectedRequest = requestDetails.filter((item: any) => item.scanReference === scanReference);

  const grouped = Object.values(
    selectedRequest.reduce((acc, item) => {
      const ref = item.scanReference;
      const repProc = item.repairProcedure;

      if (!acc[ref]) {
        acc[ref] = {
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
          repairProcedure: repProc,
        }
      } else {
        acc[ref].dtc.push(item.dtc ?? '');
        acc[ref].technicalDescription.push(item.technicalDescription ?? '');
        acc[ref].meaning.push(item.meaning ?? '');
        acc[ref].possibleCauses.push(item.possibleCauses ?? '');
        acc[ref].recommendedRepair.push(item.recommendedRepair ?? '');
      }

      return acc;

    }, {} as Record<string, { repairShop: string; repairShopProfile: string | null; repairShopProfileBG: string; status: string; datetime: string; make: string; model: string; year: string; dtc: (string | null)[]; technicalDescription: (string | null)[]; meaning: (string | null)[]; possibleCauses: (string | null)[]; recommendedRepair: (string | null)[]; scanReference: string; vehicleIssue: string | null; repairProcedure: string | null }>)
  );

  const handleTransformText = (index: number) => {
    const bulletPossibleCauses = grouped.map((item) => {
      return (item.possibleCauses?.[index] ?? '')
        .split('\n')
        .map(cause => cause.replace(/^\*\s+/, ''))
        .filter(Boolean);
    });

    const bulletRecommendedRepair = grouped.map((item) => {
      return (item.recommendedRepair?.[index] ?? '')
        .split('\n')
        .map(repair => repair.replace(/^\*\s+/, ''))
        .filter(Boolean);
    });

    setBulletPossibleCauses(bulletPossibleCauses);
    setBulletRecommendedRepair(bulletRecommendedRepair);
  }

  if (isLoading) {
    return (
      <Loading />
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <Header headerTitle='Request Details' />

        {grouped.map((item, groupedIndex) => (
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

              <View>
                <Text style={styles.text}><Text style={styles.nestedText}>Requested: </Text>{item.datetime}</Text>
                <Text style={styles.text}><Text style={styles.nestedText}>Make: </Text>{item.make}</Text>
                <Text style={styles.text}><Text style={styles.nestedText}>Model: </Text>{item.model}</Text>
                <Text style={styles.text}><Text style={styles.nestedText}>Year: </Text>{item.year}</Text>
              </View>
            </View>

            <View style={styles.vehicleIssueContainer}>
              <Text style={styles.subHeader}>Vehicle Issue</Text>
              {item.vehicleIssue === null && (
                <>
                  {item.dtc.map((dtc, index) => (
                    <View key={`${item.scanReference}-${index}`}>
                      <TouchableOpacity style={styles.diagnosisButton} onPress={() => {
                        handleTransformText(index);
                        setSelectedIndex(index);
                        setModalVisible(true);
                      }}>
                        <Text style={styles.diagnosisButtonText1}>{dtc}</Text>
                        <Text style={styles.diagnosisButtonText2}>{item.technicalDescription[index]}</Text>
                      </TouchableOpacity>

                      <Modal
                        animationType='fade'
                        backdropColor={'rgba(0, 0, 0, 0.5)'}
                        visible={modalVisible}
                        onRequestClose={() => setModalVisible(false)}
                      >
                        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
                          <View style={styles.centeredView}>
                            <Pressable style={styles.modalView} onPress={() => { }}>
                              <TouchableOpacity style={styles.exitButton} onPress={() => setModalVisible(false)}>
                                <Entypo name='cross' size={20} color='#333' />
                              </TouchableOpacity>
                              <ScrollView showsVerticalScrollIndicator={false}>
                                <View onStartShouldSetResponder={() => true}>
                                  <View style={[styles.textContainer2, { borderBottomWidth: 1, borderColor: '#EAEAEA', paddingBottom: 20, }]}>
                                    <Text style={styles.troubleCode}>{item.dtc[selectedIndex]}</Text>
                                    <Text style={styles.technicalDescription}>{item.technicalDescription[selectedIndex]}</Text>
                                  </View>

                                  <View style={styles.textContainer2}>
                                    <Text style={styles.label}>Meaning</Text>
                                    <Text style={styles.text}>{item.meaning[selectedIndex]}</Text>
                                  </View>

                                  <View style={styles.textContainer2}>
                                    <Text style={styles.label}>Possible Causes</Text>
                                    {bulletPossibleCauses[groupedIndex]?.map((cause, index) => (
                                      <View key={index} style={styles.bulletView}>
                                        <Text style={styles.bullet}>{`\u2022`}</Text>
                                        <Text style={styles.bulletedText}>{cause}</Text>
                                      </View>
                                    ))}
                                  </View>

                                  <View style={styles.textContainer2}>
                                    <Text style={styles.label}>Recommended Solutions or Repairs</Text>
                                    {bulletRecommendedRepair[groupedIndex]?.map((repair, index) => (
                                      <View key={index} style={styles.bulletView}>
                                        <Text style={styles.bullet}>{`\u2022`}</Text>
                                        <Text style={styles.bulletedText}>{repair}</Text>
                                      </View>
                                    ))}
                                  </View>
                                </View>
                              </ScrollView>
                            </Pressable>
                          </View>
                        </TouchableWithoutFeedback>
                      </Modal>
                    </View>
                  ))}
                </>
              )}

              {item.vehicleIssue !== null && (
                <View style={[styles.textContainer, { minHeight: 150, marginBottom: 10, }]}>
                  <Text style={styles.text}>{item.vehicleIssue}</Text>
                </View>
              )}
            </View>

            {item.status === 'Completed' && (
              <>
                <View style={styles.repairProcedureContainer}>
                  <Text style={styles.subHeader}>Repair Procedure</Text>
                  {item.repairProcedure !== null && (
                    <View style={[styles.textContainer, { minHeight: 150, }]}>
                      <Text style={styles.text}>{item.repairProcedure}</Text>
                    </View>
                  )}

                  {item.repairProcedure === null && (
                    <View style={styles.textContainer}>
                      <Text style={[styles.text, { color: '#780606' }]}>Shop did not specify the repair procedure done.</Text>
                    </View>
                  )}
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
    width: '100%',
    marginTop: 10,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    marginBottom: 10,
  },
  status: {
    fontFamily: 'LeagueSpartan_Bold',
    color: '#333',
    fontSize: 20,
    lineHeight: 20,
    textAlignVertical: 'center',
  },
  text: {
    fontFamily: 'LeagueSpartan',
    color: '#333',
    fontSize: 16,
  },
  nestedText: {
    fontFamily: 'LeagueSpartan_Bold',
    color: '#333',
    fontSize: 16,
  },
  vehicleIssueContainer: {
    width: '100%',
    marginTop: 10,
  },
  subHeader: {
    fontFamily: 'LeagueSpartan_Bold',
    fontSize: 20,
    color: '#333',
    marginBottom: 10,
  },
  diagnosisButton: {
    backgroundColor: '#EAEAEA',
    width: '100%',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    borderRadius: 5,
    padding: 10,
  },
  diagnosisButtonText1: {
    fontFamily: 'LeagueSpartan_Bold',
    color: '#780606',
    fontSize: 16,
  },
  diagnosisButtonText2: {
    fontFamily: 'LeagueSpartan',
    color: '#555',
    fontSize: 14,
  },
  repairProcedureContainer: {
    width: '100%',
  },
  textContainer: {
    backgroundColor: '#EAEAEA',
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
  rateButton: {
    backgroundColor: '#FDCC0D',
    justifyContent: 'center',
    alignItems: 'center',
    width: 130,
    padding: 5,
    borderRadius: 10,
    alignSelf: 'center',
    marginTop: 30,
  },
  rateButtonText: {
    fontFamily: 'LeagueSpartan_Bold',
    color: '#FFF',
    fontSize: 16,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalView: {
    backgroundColor: '#FFF',
    width: '90%',
    maxHeight: 600,
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  exitButton: {
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-end',
  },
  troubleCode: {
    fontFamily: 'LeagueSpartan_Bold',
    fontSize: 22,
    color: '#333',
    textAlign: 'center',
  },
  technicalDescription: {
    fontFamily: 'LeagueSpartan',
    fontSize: 20,
    color: '#555',
    textAlign: 'center',
  },
  label: {
    fontFamily: 'LeagueSpartan_Bold',
    fontSize: 18,
    marginBottom: 10,
    color: '#333',
  },
  textContainer2: {
    marginBottom: 10,
  },
  bulletView: {
    width: '100%',
    flexDirection: 'row',
    gap: 10,
    paddingLeft: 5,
  },
  bullet: {
    fontFamily: 'LeagueSpartan_Bold',
    color: '#333',
    fontSize: 16,
  },
  bulletedText: {
    fontFamily: 'LeagueSpartan',
    color: '#333',
    fontSize: 16,
    maxWidth: '93%',
  },
});

export default RequestDetails