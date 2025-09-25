import { Header } from '@/components/Header';
import { Loading } from '@/components/Loading';
import { useBackRoute } from '@/hooks/useBackRoute';
import { setSenderReceiverState } from '@/redux/slices/senderReceiverSlice';
import { RootState } from '@/redux/store';
import { getRepairShops, getRequestsForCarOwner, updateRatings } from '@/services/backendApi';
import socket from '@/services/socket';
import Entypo from '@expo/vector-icons/Entypo';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { useRouter } from 'expo-router';
import LottieView from 'lottie-react-native';
import React, { useEffect, useRef, useState } from 'react';
import {
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { showMessage } from 'react-native-flash-message';
import MapView, { Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import { Rating } from 'react-native-ratings';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';

const RequestDetails = () => {
  dayjs.extend(utc);
  const backRoute = useBackRoute('/car-owner/(screens)/request-status/request-details');
  const router = useRouter();
  const dispatch = useDispatch();
  const [requestDetails, setRequestDetails] = useState<
    {
      userID: number;
      requestID: number;
      repairShopID: number;
      repairShop: string;
      repairShopNum: string;
      repairShopEmail: string | null;
      repairShopProfile: string | null;
      repairShopProfileBG: string;
      status: string;
      datetime: string;
      make: string;
      model: string;
      year: string;
      dtc: string | null;
      technicalDescription: string | null;
      meaning: string | null;
      possibleCauses: string | null;
      recommendedRepair: string | null;
      scanReference: string;
      vehicleIssue: string;
      repairProcedure: string | null;
      completedOn: string | null;
      reasonRejected: string | null;
      isRated: boolean;
      score: number | null;
    }[]
  >([]);
  const mapRef = useRef<MapView | null>(null);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [ratingModalVisible, setRatingModalVisible] = useState<boolean>(false);
  const [mapModalVisible, setMapModalVisible] = useState<boolean>(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [bulletPossibleCauses, setBulletPossibleCauses] = useState<string[][]>([]);
  const [bulletRecommendedRepair, setBulletRecommendedRepair] = useState<string[][]>([]);
  const [customerRegion, setCustomerRegion] = useState<Region | undefined>(undefined);
  const [shopRegion, setShopRegion] = useState<Region | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [rating, setRating] = useState<number>(0);
  const scanReference: string | null = useSelector((state: RootState) => state.scanReference.scanReference);
  const userID = useSelector((state: RootState) => state.role.ID);

  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        const res1 = await getRequestsForCarOwner();
        const res2 = await getRepairShops();

        const requestDetailsData: {
          userID: number;
          requestID: number;
          repairShopID: number;
          repairShop: string;
          repairShopNum: string;
          repairShopEmail: string | null;
          repairShopProfile: string | null;
          repairShopProfileBG: string;
          status: string;
          datetime: string;
          make: string;
          model: string;
          year: string;
          dtc: string | null;
          technicalDescription: string | null;
          meaning: string | null;
          possibleCauses: string | null;
          recommendedRepair: string | null;
          scanReference: string;
          vehicleIssue: string;
          repairProcedure: string | null;
          completedOn: string | null;
          reasonRejected: string | null;
          isRated: boolean;
          score: number | null;
        }[] = [];

        if (res1) {
          const userID = res1.user_id;
          if (res1.vehicles) {
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
                          const longitude = parseFloat(request.longitude);
                          const latitude = parseFloat(request.latitude);
                          const repairShop = res2.find((shop: any) => shop.repair_shop_id === request.repair_shop_id);
                          if (repairShop) {
                            requestDetailsData.push({
                              userID: userID,
                              requestID: request.mechanic_request,
                              repairShopID: repairShop.repair_shop_id,
                              repairShop: repairShop.shop_name,
                              repairShopNum: repairShop.mobile_num,
                              repairShopEmail: repairShop.email,
                              repairShopProfile: repairShop.profile_pic,
                              repairShopProfileBG: repairShop.profile_bg,
                              status: request.status,
                              datetime: dayjs(request.request_datetime)
                                .utc(true)
                                .local()
                                .format('ddd MMM DD YYYY, h:mm A'),
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
                              completedOn: dayjs(request.completed_on)
                                .utc(true)
                                .local()
                                .format('ddd MMM DD YYYY, h:mm A'),
                              reasonRejected: request.reason_rejected,
                              isRated: request.is_rated,
                              score: request.score,
                            });

                            setCustomerRegion({
                              latitude: latitude,
                              longitude: longitude,
                              latitudeDelta: 0.01,
                              longitudeDelta: 0.01,
                            });

                            setShopRegion({
                              latitude: parseFloat(repairShop.latitude),
                              longitude: parseFloat(repairShop.longitude),
                              latitudeDelta: 0.01,
                              longitudeDelta: 0.01,
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

        setRequestDetails(requestDetailsData);
      } catch (e) {
        console.error('Error: ', e);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.on(`requestRejected-CO-${userID}`, ({ requestIDs, reason_rejected }) => {
      for (const id of requestIDs) {
        setRequestDetails((prev) =>
          prev.map((r) => (r.requestID === id ? { ...r, status: 'Rejected', reasonRejected: reason_rejected } : r))
        );
      }
    });

    socket.on(`requestAccepted-CO-${userID}`, ({ requestIDs }) => {
      for (const id of requestIDs) {
        setRequestDetails((prev) => prev.map((r) => (r.requestID === id ? { ...r, status: 'Ongoing' } : r)));
      }
    });

    socket.on(`requestCompleted-CO-${userID}`, ({ requestIDs, repair_procedure, completed_on }) => {
      for (const id of requestIDs) {
        setRequestDetails((prev) =>
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
      socket.off(`requestRejected-CO-${userID}`);
      socket.off(`requestAccepted-CO-${userID}`);
      socket.off(`requestCompleted-CO-${userID}`);
    };
  }, [userID]);

  const selectedRequest = requestDetails.filter((item: any) => item.scanReference === scanReference);

  const grouped = Object.values(
    selectedRequest.reduce(
      (acc, item) => {
        const ref = item.scanReference;

        if (!acc[ref]) {
          acc[ref] = {
            userID: item.userID,
            requestID: [item.requestID],
            repairShopID: item.repairShopID,
            repairShop: item.repairShop,
            repairShopNum: item.repairShopNum,
            repairShopEmail: item.repairShopEmail,
            repairShopProfile: item.repairShopProfile,
            repairShopProfileBG: item.repairShopProfileBG,
            status: item.status,
            datetime: item.datetime,
            make: item.make,
            model: item.model,
            year: item.year,
            dtc: [item.dtc],
            technicalDescription: [item.technicalDescription],
            meaning: [item.meaning],
            possibleCauses: [item.possibleCauses],
            recommendedRepair: [item.recommendedRepair],
            scanReference: ref,
            vehicleIssue: item.vehicleIssue,
            repairProcedure: item.repairProcedure,
            completedOn: item.completedOn,
            reasonRejected: item.reasonRejected,
            isRated: item.isRated,
            score: item.score,
          };
        } else {
          acc[ref].requestID.push(item.requestID);
          acc[ref].dtc.push(item.dtc);
          acc[ref].technicalDescription.push(item.technicalDescription);
          acc[ref].meaning.push(item.meaning);
          acc[ref].possibleCauses.push(item.possibleCauses);
          acc[ref].recommendedRepair.push(item.recommendedRepair);
        }

        return acc;
      },
      {} as Record<
        string,
        {
          userID: number;
          requestID: number[];
          repairShopID: number;
          repairShop: string;
          repairShopNum: string;
          repairShopEmail: string | null;
          repairShopProfile: string | null;
          repairShopProfileBG: string;
          status: string;
          datetime: string;
          make: string;
          model: string;
          year: string;
          dtc: (string | null)[];
          technicalDescription: (string | null)[];
          meaning: (string | null)[];
          possibleCauses: (string | null)[];
          recommendedRepair: (string | null)[];
          scanReference: string;
          vehicleIssue: string | null;
          repairProcedure: string | null;
          completedOn: string | null;
          reasonRejected: string | null;
          isRated: boolean;
          score: number | null;
        }
      >
    )
  );

  const fitToCoord = () => {
    setMapModalVisible(true);
    const allCoords = [shopRegion, customerRegion]
      .filter(
        (coord): coord is Region =>
          coord !== undefined && typeof coord.latitude === 'number' && typeof coord.longitude === 'number'
      )
      .map((coord) => ({
        latitude: coord.latitude,
        longitude: coord.longitude,
      }));

    console.log(allCoords);

    mapRef.current?.fitToCoordinates(allCoords, {
      edgePadding: { top: 10, right: 10, bottom: 10, left: 10 },
      animated: true,
    });
  };

  const handleTransformText = (index: number) => {
    const bulletPossibleCauses = grouped.map((item) => {
      return (item.possibleCauses?.[index] ?? '')
        .split('\n')
        .map((cause) => cause.replace(/^\*\s+/, ''))
        .filter(Boolean);
    });

    const bulletRecommendedRepair = grouped.map((item) => {
      return (item.recommendedRepair?.[index] ?? '')
        .split('\n')
        .map((repair) => repair.replace(/^\*\s+/, ''))
        .filter(Boolean);
    });

    setBulletPossibleCauses(bulletPossibleCauses);
    setBulletRecommendedRepair(bulletRecommendedRepair);
  };

  const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const R = 6371;

    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return (R * c).toFixed(2);
  };

  const handleUpdateRating = async (shopID: number, requestID: number[]) => {
    try {
      await updateRatings(shopID, requestID, rating);

      showMessage({
        message: 'Rating submitted!',
        type: 'success',
        floating: true,
        color: '#FFF',
        icon: 'success',
      });

      setRatingModalVisible(false);

      for (const id of requestID) {
        setRequestDetails((prev) =>
          prev.map((r) =>
            r.requestID === id
              ? {
                  ...r,
                  isRated: true,
                  score: rating,
                }
              : r
          )
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
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header headerTitle="Request Details" />
      <ScrollView>
        {grouped.map((item, groupedIndex) => (
          <View key={item.scanReference} style={styles.lowerBox}>
            <View style={styles.shopProfileContainer}>
              {item.repairShopProfile === null && (
                <View style={[styles.profilePicWrapper, { backgroundColor: item.repairShopProfileBG }]}>
                  <MaterialCommunityIcons name="car-wrench" size={50} color="#FFF" />
                </View>
              )}

              {item.repairShopProfile !== null && (
                <View style={styles.profilePicWrapper}>
                  <Image style={styles.profilePic} source={{ uri: item.repairShopProfile }} width={100} height={100} />
                </View>
              )}

              <Text style={styles.shopName}>{item.repairShop}</Text>
              <Text style={[styles.text, { color: '#555' }]}>{item.repairShopNum}</Text>
              {item.repairShopEmail !== null && (
                <Text style={[styles.text, { color: '#555' }]}>{item.repairShopEmail}</Text>
              )}
              <TouchableOpacity
                style={styles.chatButton}
                onPress={() => {
                  backRoute();
                  dispatch(
                    setSenderReceiverState({
                      senderID: item.userID,
                      receiverID: item.repairShopID,
                      role: 'car-owner',
                    })
                  );
                  router.replace('/chat-room/chat-room');
                }}
              >
                <Text style={[styles.buttonText, { fontSize: 14, fontFamily: 'LeagueSpartan' }]}>Chat</Text>
              </TouchableOpacity>
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
                <Text style={styles.text}>
                  <Text style={styles.nestedText}>Requested: </Text>
                  {item.datetime}
                </Text>
                {item.status === 'Completed' && (
                  <Text style={styles.text}>
                    <Text style={styles.nestedText}>Completed: </Text>
                    {item.completedOn}
                  </Text>
                )}
                <Text style={styles.text}>
                  <Text style={styles.nestedText}>Make: </Text>
                  {item.make}
                </Text>
                <Text style={styles.text}>
                  <Text style={styles.nestedText}>Model: </Text>
                  {item.model}
                </Text>
                <Text style={styles.text}>
                  <Text style={styles.nestedText}>Year: </Text>
                  {item.year}
                </Text>
                {item.isRated && (
                  <Text style={styles.text}>
                    <Text style={styles.nestedText}>Rating: </Text>
                    {`${item.score}/5`}
                  </Text>
                )}
              </View>
            </View>

            <View style={styles.locationContainer}>
              <Text style={styles.subHeader}>Location</Text>
              <View style={styles.mapButtonContainer}>
                <View style={styles.mapView}>
                  <MapView style={styles.map} mapType="hybrid" region={shopRegion} provider={PROVIDER_GOOGLE}>
                    {shopRegion && (
                      <Marker
                        coordinate={{
                          latitude: shopRegion.latitude,
                          longitude: shopRegion.longitude,
                        }}
                      />
                    )}
                  </MapView>
                </View>

                <TouchableOpacity style={styles.mapButton} onPress={() => fitToCoord()}></TouchableOpacity>
              </View>

              <Modal
                animationType="fade"
                backdropColor={'rgba(0, 0, 0, 0.5)'}
                visible={mapModalVisible}
                onRequestClose={() => setMapModalVisible(false)}
              >
                <View style={styles.centeredView}>
                  <View style={styles.mapView2}>
                    <MapView
                      style={styles.map2}
                      ref={mapRef}
                      mapType="hybrid"
                      initialRegion={customerRegion}
                      provider={PROVIDER_GOOGLE}
                    >
                      {customerRegion && (
                        <Marker
                          coordinate={{
                            latitude: customerRegion.latitude,
                            longitude: customerRegion.longitude,
                          }}
                          image={require('../../../../assets/images/circle-marker.png')}
                          title="You"
                        />
                      )}

                      {shopRegion && (
                        <Marker
                          coordinate={{
                            latitude: shopRegion.latitude,
                            longitude: shopRegion.longitude,
                          }}
                          title="Shop"
                        />
                      )}
                    </MapView>

                    <TouchableOpacity style={styles.exitButton2} onPress={() => setMapModalVisible(false)}>
                      <Entypo name="cross" size={20} color="#FFF" />
                    </TouchableOpacity>
                    <Text
                      style={styles.text}
                    >{`${getDistance(shopRegion?.latitude ?? 0, shopRegion?.longitude ?? 0, customerRegion?.latitude ?? 0, customerRegion?.longitude ?? 0)}KM Away`}</Text>
                  </View>
                </View>
              </Modal>
            </View>

            <View style={styles.vehicleIssueContainer}>
              <Text style={styles.subHeader}>Vehicle Issue</Text>
              {item.vehicleIssue === null && (
                <>
                  {item.dtc.map((dtc, index) => (
                    <View key={`${item.scanReference}-${index}`}>
                      <TouchableOpacity
                        style={styles.diagnosisButton}
                        onPress={() => {
                          handleTransformText(index);
                          setSelectedIndex(index);
                          setModalVisible(true);
                        }}
                      >
                        <Text style={styles.diagnosisButtonText1}>{dtc}</Text>
                        <Text style={styles.diagnosisButtonText2}>{item.technicalDescription[index]}</Text>
                      </TouchableOpacity>

                      <Modal
                        animationType="fade"
                        backdropColor={'rgba(0, 0, 0, 0.5)'}
                        visible={modalVisible}
                        onRequestClose={() => setModalVisible(false)}
                      >
                        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
                          <View style={styles.centeredView}>
                            <Pressable style={styles.modalView} onPress={() => {}}>
                              <TouchableOpacity style={styles.exitButton} onPress={() => setModalVisible(false)}>
                                <Entypo name="cross" size={20} color="#333" />
                              </TouchableOpacity>
                              <ScrollView showsVerticalScrollIndicator={false}>
                                <View onStartShouldSetResponder={() => true}>
                                  <View
                                    style={[
                                      styles.textContainer2,
                                      {
                                        borderBottomWidth: 1,
                                        borderColor: '#EAEAEA',
                                        paddingBottom: 20,
                                      },
                                    ]}
                                  >
                                    <Text style={styles.troubleCode}>{item.dtc[selectedIndex]}</Text>
                                    <Text style={styles.technicalDescription}>
                                      {item.technicalDescription[selectedIndex]}
                                    </Text>
                                  </View>

                                  <View style={styles.textContainer2}>
                                    <Text style={styles.label}>Meaning</Text>
                                    <Text style={styles.text}>{item.meaning[selectedIndex]}</Text>
                                  </View>

                                  <View style={styles.textContainer2}>
                                    <Text style={styles.label}>Possible Causes</Text>
                                    {bulletPossibleCauses[groupedIndex]?.map((cause, index) => (
                                      <View key={index} style={styles.bulletView}>
                                        <Text style={styles.bullet}>{'\u2022'}</Text>
                                        <Text style={styles.bulletedText}>{cause}</Text>
                                      </View>
                                    ))}
                                  </View>

                                  <View style={styles.textContainer2}>
                                    <Text style={styles.label}>Recommended Solutions</Text>
                                    {bulletRecommendedRepair[groupedIndex]?.map((repair, index) => (
                                      <View key={index} style={styles.bulletView}>
                                        <Text style={styles.bullet}>{'\u2022'}</Text>
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
                <View style={[styles.textContainer, { minHeight: 150, marginBottom: 10 }]}>
                  <Text style={styles.text}>{item.vehicleIssue}</Text>
                </View>
              )}
            </View>

            {item.status === 'Rejected' && (
              <View style={styles.reasonRejectedContainer}>
                <Text style={styles.subHeader}>Reason For Rejection</Text>
                <View style={styles.textContainer}>
                  <Text style={[styles.text, { color: '#780606' }]}>{item.reasonRejected}</Text>
                </View>
              </View>
            )}

            {item.status === 'Completed' && (
              <>
                <View style={styles.repairProcedureContainer}>
                  <Text style={styles.subHeader}>Repair Procedure</Text>
                  {item.repairProcedure !== null && (
                    <>
                      {item.repairProcedure !== 'Repair unsuccessful' && (
                        <View style={[styles.textContainer, { minHeight: 150 }]}>
                          <Text style={styles.text}>{item.repairProcedure}</Text>
                        </View>
                      )}

                      {item.repairProcedure === 'Repair unsuccessful' && (
                        <View style={styles.textContainer}>
                          <Text style={[styles.text, { color: '#780606' }]}>{item.repairProcedure}</Text>
                        </View>
                      )}
                    </>
                  )}

                  {item.repairProcedure === null && (
                    <View style={styles.textContainer}>
                      <Text style={[styles.text, { color: '#780606' }]}>
                        Shop did not specify the repair procedure done.
                      </Text>
                    </View>
                  )}
                </View>

                <TouchableOpacity
                  style={[styles.rateButton, { backgroundColor: item.isRated ? '#808080' : '#FDCC0D' }]}
                  onPress={() => setRatingModalVisible(true)}
                  disabled={item.isRated ? true : false}
                >
                  <Text style={styles.rateButtonText}>Rate Shop</Text>
                </TouchableOpacity>

                <Modal
                  animationType="fade"
                  backdropColor={'rgba(0, 0, 0, 0.5)'}
                  visible={ratingModalVisible}
                  onRequestClose={() => setRatingModalVisible(false)}
                >
                  <TouchableWithoutFeedback onPress={() => setRatingModalVisible(false)}>
                    <View style={styles.centeredView}>
                      <Pressable style={styles.modalView} onPress={() => {}}>
                        <TouchableOpacity style={styles.exitButton} onPress={() => setRatingModalVisible(false)}>
                          <Entypo name="cross" size={20} color="#333" />
                        </TouchableOpacity>

                        <Rating
                          type="star"
                          ratingCount={5}
                          imageSize={40}
                          showRating
                          startingValue={1}
                          minValue={1}
                          onFinishRating={setRating}
                        />

                        <TouchableOpacity
                          style={styles.submitButton}
                          onPress={() => handleUpdateRating(item.repairShopID, item.requestID)}
                        >
                          <Text style={styles.submitButtonText}>Submit Rating</Text>
                        </TouchableOpacity>
                      </Pressable>
                    </View>
                  </TouchableWithoutFeedback>
                </Modal>
              </>
            )}
          </View>
        ))}
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
    fontFamily: 'BodyBold',
    color: '#333',
    fontSize: 20,
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
    fontFamily: 'BodyBold',
    color: '#333',
    fontSize: 18,
  },
  text: {
    fontFamily: 'BodyRegular',
    color: '#333',
  },
  nestedText: {
    fontFamily: 'BodyBold',
    color: '#333',
  },
  locationContainer: {
    width: '100%',
    marginTop: 10,
  },
  mapButtonContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  mapView: {
    minHeight: 100,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    overflow: 'hidden',
    width: '100%',
    position: 'absolute',
    zIndex: 1,
  },
  map: {
    width: '100%',
    height: 100,
  },
  mapButton: {
    backgroundColor: 'rgba(217, 217, 217, 0.2)',
    minHeight: 100,
    borderRadius: 10,
    width: '100%',
    zIndex: 2,
  },
  vehicleIssueContainer: {
    width: '100%',
    marginTop: 10,
  },
  subHeader: {
    fontFamily: 'BodyBold',
    fontSize: 18,
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
    fontFamily: 'BodyRegular',
    color: '#780606',
  },
  diagnosisButtonText2: {
    fontFamily: 'BodyRegular',
    color: '#555',
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
    justifyContent: 'center',
    alignItems: 'center',
    width: 100,
    padding: 5,
    borderRadius: 10,
    alignSelf: 'center',
    marginTop: 30,
  },
  rateButtonText: {
    fontFamily: 'BodyRegular',
    color: '#FFF',
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
    fontFamily: 'BodyBold',
    fontSize: 20,
    color: '#333',
    textAlign: 'center',
  },
  technicalDescription: {
    fontFamily: 'BodyRegular',
    fontSize: 18,
    color: '#555',
    textAlign: 'center',
  },
  label: {
    fontFamily: 'BodyBold',
    fontSize: 16,
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
    fontFamily: 'BodyRegular',
    color: '#333',
  },
  bulletedText: {
    fontFamily: 'BodyRegular',
    color: '#333',
    maxWidth: '93%',
  },
  reasonRejectedContainer: {
    width: '100%',
    marginTop: 10,
  },
  chatButton: {
    width: 70,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    borderRadius: 5,
    backgroundColor: '#000B58',
    padding: 5,
  },
  buttonText: {
    color: '#FFF',
    fontFamily: 'BodyRegular',
  },
  submitButton: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000B58',
    padding: 8,
    borderRadius: 5,
    marginTop: 10,
  },
  submitButtonText: {
    fontFamily: 'BodyRegular',
    color: '#fff',
  },
  mapView2: {
    backgroundColor: '#FFF',
    width: '95%',
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    overflow: 'hidden',
    position: 'relative',
  },
  map2: {
    width: '100%',
    height: 500,
  },
  exitButton2: {
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-end',
    position: 'absolute',
    padding: 10,
  },
});

export default RequestDetails;
