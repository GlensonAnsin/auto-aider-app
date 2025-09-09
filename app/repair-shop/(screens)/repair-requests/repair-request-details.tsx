import { Header } from '@/components/Header';
import { Loading } from '@/components/Loading';
import { useBackRoute } from '@/hooks/useBackRoute';
import { setSenderReceiverState } from '@/redux/slices/senderReceiverSlice';
import { RootState } from '@/redux/store';
import {
  acceptRequest,
  getRepairShopInfo,
  getRequestsForRepairShop,
  rejectRequest,
  requestCompleted,
} from '@/services/backendApi';
import socket from '@/services/socket';
import Entypo from '@expo/vector-icons/Entypo';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { Checkbox } from 'expo-checkbox';
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
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { showMessage } from 'react-native-flash-message';
import MapView, { Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';

const RepairRequestDetails = () => {
  dayjs.extend(utc);
  const backRoute = useBackRoute('/repair-shop/repair-requests/repair-request-details');
  const router = useRouter();
  const dispatch = useDispatch();
  const mapRef = useRef<MapView | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [requestDetails, setRequestDetails] = useState<
    {
      userID: number;
      requestID: number;
      repairShopID: number;
      customer: string;
      customerNum: string;
      customerEmail: string | null;
      customerProfile: string | null;
      customerProfileBG: string;
      status: string;
      datetime: string;
      completedOn: string | null;
      make: string;
      model: string;
      year: string;
      longitude: number;
      latitude: number;
      dtc: string | null;
      technicalDescription: string | null;
      meaning: string | null;
      possibleCauses: string | null;
      recommendedRepair: string | null;
      scanReference: string;
      vehicleIssue: string;
      repairProcedure: string | null;
      reasonRejected: string | null;
    }[]
  >([]);
  const [customerRegion, setCustomerRegion] = useState<Region | undefined>(undefined);
  const [shopRegion, setShopRegion] = useState<Region | undefined>(undefined);
  const [bulletPossibleCauses, setBulletPossibleCauses] = useState<string[][]>([]);
  const [bulletRecommendedRepair, setBulletRecommendedRepair] = useState<string[][]>([]);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [mapModalVisible, setMapModalVisible] = useState<boolean>(false);
  const [rejectedModalVisible, setRejectedModalVisible] = useState<boolean>(false);
  const [completedModalVisible, setCompletedModalVisible] = useState<boolean>(false);
  const [otherReason, setOtherReason] = useState<string>('');
  const [selectedReason, setSelectedReason] = useState<string>('');
  const [repairProcedure, setRepairProcedure] = useState<string>('');
  const [selectedOptCompleted, setSelectedOptCompleted] = useState<string>('');
  const scanReference: string | null = useSelector((state: RootState) => state.scanReference.scanReference);

  const reasons = [
    'Overbooked / No Available Slot',
    'Lack of Parts / Supplies',
    'Specialty Limitation',
    'Vehicle Type Not Supported',
    'Severe Damage Beyond Capability',
    'Old / Rare Vehicle',
    'Previous Payment Issues',
    'Others',
  ];

  const completed = ['Repair unsuccessful', 'Prefer not to say'];

  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        const res1 = await getRequestsForRepairShop();
        const res2 = await getRepairShopInfo();

        const statusData: {
          userID: number;
          requestID: number;
          repairShopID: number;
          customer: string;
          customerNum: string;
          customerEmail: string | null;
          customerProfile: string | null;
          customerProfileBG: string;
          status: string;
          datetime: string;
          completedOn: string | null;
          make: string;
          model: string;
          year: string;
          longitude: number;
          latitude: number;
          dtc: string | null;
          technicalDescription: string | null;
          meaning: string | null;
          possibleCauses: string | null;
          recommendedRepair: string | null;
          scanReference: string;
          vehicleIssue: string;
          repairProcedure: string | null;
          reasonRejected: string | null;
        }[] = [];

        if (res1) {
          if (res1.mechanic_requests) {
            res1.mechanic_requests.forEach((request: any) => {
              if (request) {
                const requestID = request.mechanic_request_id;
                const datetime = dayjs(request.request_datetime).utc(true).local().format('ddd MMM DD YYYY, h:mm A');
                const completedOn = dayjs(request.completed_on).utc(true).local().format('ddd MMM DD YYYY, h:mm A');
                const longitude = parseFloat(request.longitude);
                const latitude = parseFloat(request.latitude);
                const status = request.status;
                const repairProcedure = request.repair_procedure;
                const reasonRejected = request.reason_rejected;
                if (request.vehicle_diagnostic) {
                  const diagnostics = Array.isArray(request.vehicle_diagnostic)
                    ? request.vehicle_diagnostic
                    : [request.vehicle_diagnostic];
                  diagnostics.forEach((diagnostic: any) => {
                    if (diagnostic) {
                      const scanReference = diagnostic.scan_reference;
                      const dtc = diagnostic.dtc;
                      const technicalDescription = diagnostic.technical_description;
                      const meaning = diagnostic.meaning;
                      const possibleCauses = diagnostic.possible_causes;
                      const recommendedRepair = diagnostic.recommended_repair;
                      const vehicleIssue = diagnostic.vehicle_issue_description;
                      if (diagnostic.vehicle) {
                        const vehicles = Array.isArray(diagnostic.vehicle) ? diagnostic.vehicle : [diagnostic.vehicle];
                        vehicles.forEach((vehicle: any) => {
                          if (vehicle) {
                            const make = vehicle.make;
                            const model = vehicle.model;
                            const year = vehicle.year;
                            if (vehicle.user) {
                              const users = Array.isArray(vehicle.user) ? vehicle.user : [vehicle.user];
                              users.forEach((customer: any) => {
                                if (customer) {
                                  statusData.push({
                                    userID: customer.user_id,
                                    requestID: requestID,
                                    repairShopID: res2.repair_shop_id,
                                    customer: `${customer.firstname} ${customer.lastname}`,
                                    customerNum: customer.mobile_num,
                                    customerEmail: customer.email,
                                    customerProfile: customer.profile_pic,
                                    customerProfileBG: customer.user_initials_bg,
                                    status: status,
                                    datetime: datetime,
                                    completedOn: completedOn,
                                    make: make,
                                    model: model,
                                    year: year,
                                    longitude: longitude,
                                    latitude: latitude,
                                    dtc: dtc,
                                    technicalDescription: technicalDescription,
                                    meaning: meaning,
                                    possibleCauses: possibleCauses,
                                    recommendedRepair: recommendedRepair,
                                    scanReference: scanReference,
                                    vehicleIssue: vehicleIssue,
                                    repairProcedure: repairProcedure,
                                    reasonRejected: reasonRejected,
                                  });

                                  setCustomerRegion({
                                    latitude: latitude,
                                    longitude: longitude,
                                    latitudeDelta: 0.001,
                                    longitudeDelta: 0.001,
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
        }

        setRequestDetails(statusData);
        setShopRegion({
          latitude: parseFloat(res2.latitude),
          longitude: parseFloat(res2.longitude),
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
      } catch (e) {
        console.error('Error: ', e);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    const allCoords = [shopRegion, customerRegion]
      .filter(
        (coord): coord is Region =>
          coord !== undefined && typeof coord.latitude === 'number' && typeof coord.longitude === 'number'
      )
      .map((coord) => ({
        latitude: coord.latitude,
        longitude: coord.longitude,
      }));

    mapRef.current?.fitToCoordinates(allCoords, {
      edgePadding: { top: 300, right: 300, bottom: 300, left: 300 },
      animated: true,
    });
  }, [shopRegion, customerRegion]);

  useEffect(() => {
    if (!socket) return;

    socket.on('requestRejected', ({ requestIDs, reason_rejected }) => {
      for (const id of requestIDs) {
        setRequestDetails((prev) =>
          prev.map((r) => (r.requestID === id ? { ...r, status: 'Rejected', reasonRejected: reason_rejected } : r))
        );
      }
    });

    socket.on('requestAccepted', ({ requestIDs }) => {
      for (const id of requestIDs) {
        setRequestDetails((prev) => prev.map((r) => (r.requestID === id ? { ...r, status: 'Ongoing' } : r)));
      }
    });

    socket.on('requestCompleted', ({ requestIDs, repair_procedure, completed_on }) => {
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
      socket.off('requestRejected');
      socket.off('requestAccepted');
      socket.off('requestCompleted');
    };
  }, []);

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
            customer: item.customer,
            customerNum: item.customerNum,
            customerEmail: item.customerEmail,
            customerProfile: item.customerProfile,
            customerProfileBG: item.customerProfileBG,
            status: item.status,
            datetime: item.datetime,
            completedOn: item.completedOn,
            make: item.make,
            model: item.model,
            year: item.year,
            longitude: item.longitude,
            latitude: item.latitude,
            dtc: [item.dtc],
            technicalDescription: [item.technicalDescription],
            meaning: [item.meaning],
            possibleCauses: [item.possibleCauses],
            recommendedRepair: [item.recommendedRepair],
            scanReference: ref,
            vehicleIssue: item.vehicleIssue,
            repairProcedure: item.repairProcedure,
            reasonRejected: item.reasonRejected,
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
          customer: string;
          customerNum: string;
          customerEmail: string | null;
          customerProfile: string | null;
          customerProfileBG: string;
          status: string;
          datetime: string;
          completedOn: string | null;
          make: string;
          model: string;
          year: string;
          longitude: number;
          latitude: number;
          dtc: (string | null)[];
          technicalDescription: (string | null)[];
          meaning: (string | null)[];
          possibleCauses: (string | null)[];
          recommendedRepair: (string | null)[];
          scanReference: string;
          vehicleIssue: string | null;
          repairProcedure: string | null;
          reasonRejected: string | null;
        }
      >
    )
  );

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

  const handleRejectRequest = async (IDs: number[]) => {
    if (!selectedReason) {
      showMessage({
        message: 'Please select reason for rejection.',
        type: 'warning',
        floating: true,
        color: '#FFF',
        icon: 'warning',
      });
      return;
    }

    try {
      if (selectedReason === 'Others') {
        await rejectRequest(IDs, otherReason);
        showMessage({
          message: 'Request rejected',
          type: 'success',
          floating: true,
          color: '#FFF',
          icon: 'success',
        });
        return;
      }

      await rejectRequest(IDs, selectedReason);
      showMessage({
        message: 'Request rejected',
        type: 'success',
        floating: true,
        color: '#FFF',
        icon: 'success',
      });
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

  const handleAcceptRequest = async (IDs: number[]) => {
    try {
      await acceptRequest(IDs);
      showMessage({
        message: 'Request accepted',
        type: 'success',
        floating: true,
        color: '#FFF',
        icon: 'success',
      });
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

  const handleRequestCompleted = async (IDs: number[]) => {
    if (!selectedOptCompleted && !repairProcedure) {
      showMessage({
        message: 'Please fill in required field.',
        type: 'warning',
        floating: true,
        color: '#FFF',
        icon: 'warning',
      });
      return;
    }

    try {
      if (selectedOptCompleted === 'Repair unsuccessful') {
        await requestCompleted(IDs, 'Repair unsuccessful', dayjs().format());
        showMessage({
          message: 'Request completed',
          type: 'success',
          floating: true,
          color: '#FFF',
          icon: 'success',
        });
        return;
      }

      if (selectedOptCompleted === 'Prefer not to say') {
        await requestCompleted(IDs, null, dayjs().format());
        showMessage({
          message: 'Request completed',
          type: 'success',
          floating: true,
          color: '#FFF',
          icon: 'success',
        });
        return;
      }

      if (!selectedOptCompleted) {
        await requestCompleted(IDs, repairProcedure, dayjs().format());
        showMessage({
          message: 'Request completed',
          type: 'success',
          floating: true,
          color: '#FFF',
          icon: 'success',
        });
        return;
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
      <ScrollView>
        <Header headerTitle="Request Details" />

        {grouped.map((item, groupedIndex) => (
          <View key={item.scanReference} style={styles.lowerBox}>
            <View style={styles.customerProfileContainer}>
              {item.customerProfile === null && (
                <View style={[styles.profilePicWrapper, { backgroundColor: item.customerProfileBG }]}>
                  <MaterialCommunityIcons name="car-wrench" size={50} color="#FFF" />
                </View>
              )}

              {item.customerProfile !== null && (
                <View style={styles.profilePicWrapper}>
                  <Image style={styles.profilePic} source={{ uri: item.customerProfile }} width={100} height={100} />
                </View>
              )}

              <Text style={styles.customerName}>{item.customer}</Text>
              <Text style={[styles.text, { color: '#555' }]}>{item.customerNum}</Text>
              {item.customerEmail !== null && (
                <Text style={[styles.text, { color: '#555' }]}>{item.customerEmail}</Text>
              )}
              <TouchableOpacity
                style={styles.chatButton}
                onPress={() => {
                  backRoute();
                  dispatch(
                    setSenderReceiverState({
                      senderID: item.repairShopID,
                      receiverID: item.userID,
                      role: 'repair-shop',
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
              </View>
            </View>

            <View style={styles.locationContainer}>
              <Text style={styles.subHeader}>Location</Text>
              <View style={styles.mapButtonContainer}>
                <View style={styles.mapView}>
                  <MapView style={styles.map} mapType="hybrid" region={customerRegion} provider={PROVIDER_GOOGLE}>
                    {customerRegion && (
                      <Marker
                        coordinate={{
                          latitude: customerRegion.latitude,
                          longitude: customerRegion.longitude,
                        }}
                      />
                    )}
                  </MapView>
                </View>

                <TouchableOpacity style={styles.mapButton} onPress={() => setMapModalVisible(true)}></TouchableOpacity>
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
                      {shopRegion && (
                        <Marker
                          coordinate={{
                            latitude: shopRegion.latitude,
                            longitude: shopRegion.longitude,
                          }}
                          image={require('../../../../assets/images/circle-marker.png')}
                          title="You"
                        />
                      )}

                      {customerRegion && (
                        <Marker
                          coordinate={{
                            latitude: customerRegion.latitude,
                            longitude: customerRegion.longitude,
                          }}
                          title="Customer"
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

            {item.status === 'Pending' && (
              <>
                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    style={[styles.button, { backgroundColor: '#780606' }]}
                    onPress={() => setRejectedModalVisible(true)}
                  >
                    <Text style={styles.buttonText}>Reject</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.button, { backgroundColor: '#000B58' }]}
                    onPress={() => handleAcceptRequest(item.requestID)}
                  >
                    <Text style={styles.buttonText}>Accept</Text>
                  </TouchableOpacity>
                </View>

                <Modal
                  animationType="fade"
                  backdropColor={'rgba(0, 0, 0, 0.5)'}
                  visible={rejectedModalVisible}
                  onRequestClose={() => {
                    setRejectedModalVisible(false);
                    setSelectedReason('');
                    setOtherReason('');
                  }}
                >
                  <TouchableWithoutFeedback
                    onPress={() => {
                      setRejectedModalVisible(false);
                      setSelectedReason('');
                      setOtherReason('');
                    }}
                  >
                    <View style={styles.centeredView}>
                      <Pressable style={styles.textInputView} onPress={() => {}}>
                        <Text style={[styles.subHeader, { textAlign: 'center' }]}>Reason For Rejection</Text>
                        {reasons.map((item) => (
                          <View key={item} style={styles.checkboxContainer}>
                            <Checkbox
                              value={selectedReason === item}
                              onValueChange={() => {
                                setSelectedReason(selectedReason === item ? '' : item);
                              }}
                              color={selectedReason === item ? '#000B58' : undefined}
                            />
                            <Text style={styles.text}>{item}</Text>
                          </View>
                        ))}

                        {selectedReason === 'Others' && (
                          <TextInput style={styles.input} value={otherReason} onChangeText={setOtherReason} />
                        )}

                        <View style={styles.buttonContainer}>
                          <TouchableOpacity
                            style={[styles.button, { borderWidth: 1, borderColor: '#555' }]}
                            onPress={() => setRejectedModalVisible(false)}
                          >
                            <Text style={[styles.buttonText, { color: '#555' }]}>Cancel</Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            style={[styles.button, { backgroundColor: '#000B58' }]}
                            onPress={() => handleRejectRequest(item.requestID)}
                          >
                            <Text style={styles.buttonText}>Proceed</Text>
                          </TouchableOpacity>
                        </View>
                      </Pressable>
                    </View>
                  </TouchableWithoutFeedback>
                </Modal>
              </>
            )}

            {item.status === 'Rejected' && (
              <View style={styles.reasonRejectedContainer}>
                <Text style={styles.subHeader}>Reason For Rejection</Text>
                <View style={styles.textContainer}>
                  <Text style={[styles.text, { color: '#780606' }]}>{item.reasonRejected}</Text>
                </View>
              </View>
            )}

            {item.status === 'Ongoing' && (
              <>
                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    style={[styles.button, { backgroundColor: '#000B58' }]}
                    onPress={() => setCompletedModalVisible(true)}
                  >
                    <Text style={styles.buttonText}>Done</Text>
                  </TouchableOpacity>
                </View>

                <Modal
                  animationType="fade"
                  backdropColor={'rgba(0, 0, 0, 0.5)'}
                  visible={completedModalVisible}
                  onRequestClose={() => {
                    setCompletedModalVisible(false);
                    setSelectedOptCompleted('');
                    setRepairProcedure('');
                  }}
                >
                  <TouchableWithoutFeedback
                    onPress={() => {
                      setCompletedModalVisible(false);
                      setSelectedOptCompleted('');
                      setRepairProcedure('');
                    }}
                  >
                    <View style={styles.centeredView}>
                      <Pressable style={styles.textInputView} onPress={() => {}}>
                        <Text style={[styles.subHeader, { textAlign: 'center' }]}>Repair Procedure Done</Text>
                        {completed.map((item) => (
                          <View key={item} style={styles.checkboxContainer}>
                            <Checkbox
                              value={selectedOptCompleted === item}
                              onValueChange={() => {
                                setSelectedOptCompleted(selectedOptCompleted === item ? '' : item);
                                setRepairProcedure('');
                              }}
                              color={selectedOptCompleted === item ? '#000B58' : undefined}
                            />
                            <Text style={styles.text}>{item}</Text>
                          </View>
                        ))}

                        <TextInput
                          style={styles.textarea}
                          placeholder="Describe what did you do to fix the vehicle."
                          id="textarea"
                          multiline={true}
                          numberOfLines={5}
                          value={repairProcedure}
                          onChangeText={setRepairProcedure}
                          onFocus={() => setSelectedOptCompleted('')}
                          textAlignVertical="top"
                        />

                        <View style={styles.buttonContainer}>
                          <TouchableOpacity
                            style={[styles.button, { borderWidth: 1, borderColor: '#555' }]}
                            onPress={() => {
                              setCompletedModalVisible(false);
                              setSelectedOptCompleted('');
                              setRepairProcedure('');
                            }}
                          >
                            <Text style={[styles.buttonText, { color: '#555' }]}>Cancel</Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            style={[styles.button, { backgroundColor: '#000B58' }]}
                            onPress={() => handleRequestCompleted(item.requestID)}
                          >
                            <Text style={styles.buttonText}>Proceed</Text>
                          </TouchableOpacity>
                        </View>
                      </Pressable>
                    </View>
                  </TouchableWithoutFeedback>
                </Modal>
              </>
            )}

            {item.status === 'Completed' && (
              <View style={styles.repairProcedureContainer}>
                <Text style={styles.subHeader}>Repair Procedure Done</Text>
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
  customerProfileContainer: {
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
  customerName: {
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
  subHeader: {
    fontFamily: 'BodyBold',
    fontSize: 18,
    color: '#333',
    marginBottom: 10,
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
    fontFamily: 'BodyBold',
    color: '#780606',
  },
  diagnosisButtonText2: {
    fontFamily: 'BodyRegular',
    color: '#555',
  },
  repairProcedureContainer: {
    marginTop: 10,
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
  buttonContainer: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    gap: 10,
  },
  button: {
    width: 100,
    height: 45,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
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
    fontFamily: 'BodyRegular',
    color: '#FFF',
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
  textInputView: {
    backgroundColor: '#FFF',
    width: '90%',
    padding: 25,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    gap: 10,
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: '#EAEAEA',
  },
  reasonRejectedContainer: {
    width: '100%',
    marginTop: 10,
  },
  textarea: {
    backgroundColor: '#EAEAEA',
    marginTop: 10,
    width: '100%',
    minHeight: 100,
    borderRadius: 5,
    padding: 10,
    color: '#333',
    fontFamily: 'BodyRegular',
  },
});

export default RepairRequestDetails;
