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
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { useRouter } from 'expo-router';
import LottieView from 'lottie-react-native';
import React, { useEffect, useRef, useState } from 'react';
import {
  Image,
  Modal,
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
      vehicleID: number;
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
      vehicleIssue: string | null;
      repairProcedure: string | null;
      reasonRejected: string | null;
      isRated: boolean;
      score: number | null;
      requestType: string;
      serviceType: string;
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
  const shopID = useSelector((state: RootState) => state.role.ID);
  const mapType = useSelector((state: RootState) => state.settings.mapType);
  const [error, setError] = useState<string>('');

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
          vehicleID: number;
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
          isRated: boolean;
          score: number | null;
          requestType: string;
          serviceType: string;
        }[] = [];

        if (res1) {
          if (res1.mechanic_requests) {
            res1.mechanic_requests.forEach((request: any) => {
              if (request) {
                const requestID = request.mechanic_request_id;
                const datetime = dayjs(request.request_datetime).utc(true).format('ddd MMM DD YYYY, h:mm A');
                const completedOn = dayjs(request.completed_on).utc(true).format('ddd MMM DD YYYY, h:mm A');
                const longitude = parseFloat(request.longitude);
                const latitude = parseFloat(request.latitude);
                const status = request.status;
                const repairProcedure = request.repair_procedure;
                const reasonRejected = request.reason_rejected;
                const isRated = request.is_rated;
                const score = request.score;
                const requestType = request.request_type;
                const serviceType = request.service_type;
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
                            const vehicleID = vehicle.vehicle_id;
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
                                    vehicleID: vehicleID,
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
                                    isRated: isRated,
                                    score: score,
                                    requestType: requestType,
                                    serviceType: serviceType,
                                  });

                                  setCustomerRegion({
                                    latitude: latitude,
                                    longitude: longitude,
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

    socket.on(`requestRejected-RS-${shopID}`, ({ requestIDs, reason_rejected }) => {
      for (const id of requestIDs) {
        setRequestDetails((prev) =>
          prev.map((r) => (r.requestID === id ? { ...r, status: 'Rejected', reasonRejected: reason_rejected } : r))
        );
      }
    });

    socket.on(`requestAccepted-RS-${shopID}`, ({ requestIDs }) => {
      for (const id of requestIDs) {
        setRequestDetails((prev) => prev.map((r) => (r.requestID === id ? { ...r, status: 'Ongoing' } : r)));
      }
    });

    socket.on(`requestCompleted-RS-${shopID}`, ({ requestIDs, repair_procedure, completed_on }) => {
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
      socket.off(`requestRejected-RS-${shopID}`);
      socket.off(`requestAccepted-RS-${shopID}`);
      socket.off(`requestCompleted-RS-${shopID}`);
    };
  }, [shopID]);

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
            vehicleID: item.vehicleID,
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
            isRated: item.isRated,
            score: item.score,
            requestType: item.requestType,
            serviceType: item.serviceType,
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
          vehicleID: number;
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
          isRated: boolean;
          score: number | null;
          requestType: string;
          serviceType: string;
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

    setTimeout(() => {
      mapRef.current?.fitToCoordinates(allCoords, {
        edgePadding: { top: 150, right: 150, bottom: 150, left: 150 },
        animated: true,
      });
    }, 1000);
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

  // Helper function to get DTC category info
  const getDTCCategoryInfo = (dtcCode: string) => {
    const code = dtcCode?.toUpperCase().trim() || '';

    if (code.startsWith('P0')) {
      return {
        category: 'Powertrain (Generic)',
        icon: 'engine-outline',
        color: '#DC2626',
        bgColor: '#FEE2E2',
        weight: 3,
      };
    } else if (code.startsWith('P1')) {
      return {
        category: 'Powertrain (Manufacturer)',
        icon: 'engine',
        color: '#F59E0B',
        bgColor: '#FEF3C7',
        weight: 2,
      };
    } else if (code.startsWith('C0')) {
      return {
        category: 'Chassis',
        icon: 'car-brake-abs',
        color: '#F59E0B',
        bgColor: '#FEF3C7',
        weight: 2,
      };
    } else if (code.startsWith('B0')) {
      return {
        category: 'Body',
        icon: 'car-door',
        color: '#3B82F6',
        bgColor: '#DBEAFE',
        weight: 1,
      };
    } else if (code.startsWith('U0')) {
      return {
        category: 'Network',
        icon: 'network-outline',
        color: '#3B82F6',
        bgColor: '#DBEAFE',
        weight: 1,
      };
    }

    return {
      category: 'Other',
      icon: 'alert-circle-outline',
      color: '#6B7280',
      bgColor: '#F3F4F6',
      weight: 1,
    };
  };

  // Helper function to get severity level
  const getSeverityLevel = (dtcCode: string) => {
    const categoryInfo = getDTCCategoryInfo(dtcCode);

    if (categoryInfo.weight >= 3) {
      return { level: 'Critical', icon: 'alert-octagon', color: '#DC2626' };
    } else if (categoryInfo.weight >= 2) {
      return { level: 'Warning', icon: 'alert-circle', color: '#F59E0B' };
    } else {
      return { level: 'Info', icon: 'information', color: '#3B82F6' };
    }
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

  const handleRejectRequest = async (IDs: number[], year: string, make: string, model: string, userID: number) => {
    if (!selectedReason) {
      setError('Please select reason for rejection.');
      return;
    }

    try {
      if (selectedReason === 'Others') {
        await rejectRequest(IDs, otherReason, year, make, model, userID);
        setRejectedModalVisible(false);
        setError('');
        showMessage({
          message: 'Request rejected',
          type: 'success',
          floating: true,
          color: '#FFF',
          icon: 'success',
        });
        return;
      }

      await rejectRequest(IDs, selectedReason, year, make, model, userID);
      setRejectedModalVisible(false);
      setError('');
      showMessage({
        message: 'Request rejected',
        type: 'success',
        floating: true,
        color: '#FFF',
        icon: 'success',
      });
    } catch {
      setError('Something went wrong. Please try again.');
    }
  };

  const handleAcceptRequest = async (IDs: number[], year: string, make: string, model: string, userID: number) => {
    try {
      await acceptRequest(IDs, year, make, model, userID);
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

  const handleRequestCompleted = async (
    IDs: number[],
    vehicleID: number,
    year: string,
    make: string,
    model: string,
    userID: number,
    requestType: string
  ) => {
    if (!selectedOptCompleted && !repairProcedure) {
      setError('Please fill out required field.');
      return;
    }

    try {
      if (selectedOptCompleted === 'Repair unsuccessful') {
        await requestCompleted(
          IDs,
          'Repair unsuccessful',
          dayjs().format(),
          vehicleID,
          year,
          make,
          model,
          userID,
          requestType
        );
        setCompletedModalVisible(false);
        setError('');
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
        await requestCompleted(IDs, null, dayjs().format(), vehicleID, year, make, model, userID, requestType);
        setCompletedModalVisible(false);
        setError('');
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
        await requestCompleted(
          IDs,
          repairProcedure,
          dayjs().format(),
          vehicleID,
          year,
          make,
          model,
          userID,
          requestType
        );
        setCompletedModalVisible(false);
        setError('');
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
      setError('Something went wrong. Please try again');
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
            <View style={styles.customerProfileContainer}>
              <View style={styles.profileSection}>
                {item.customerProfile === null && (
                  <View style={[styles.profilePicWrapper, { backgroundColor: item.customerProfileBG }]}>
                    <MaterialCommunityIcons name="account" size={50} color="#FFF" />
                  </View>
                )}

                {item.customerProfile !== null && (
                  <View style={styles.profilePicWrapper}>
                    <Image style={styles.profilePic} source={{ uri: item.customerProfile }} width={100} height={100} />
                  </View>
                )}
              </View>

              <Text style={styles.customerName}>{item.customer}</Text>

              <View style={styles.contactInfoContainer}>
                <View style={styles.contactRow}>
                  <MaterialCommunityIcons name="phone" size={16} color="#6B7280" />
                  <Text style={[styles.text, { color: '#555' }]}>{item.customerNum}</Text>
                </View>
                {item.customerEmail !== null && (
                  <View style={styles.contactRow}>
                    <MaterialCommunityIcons name="email" size={16} color="#6B7280" />
                    <Text style={[styles.text, { color: '#555' }]}>{item.customerEmail}</Text>
                  </View>
                )}
              </View>

              <TouchableOpacity
                style={styles.chatButton}
                onPress={() => {
                  backRoute();
                  dispatch(
                    setSenderReceiverState({
                      senderID: Number(shopID),
                      receiverID: Number(item.userID),
                      role: 'repair-shop',
                    })
                  );
                  router.replace('/chat-room/chat-room');
                }}
              >
                <MaterialCommunityIcons name="message-text" size={16} color="#FFF" />
                <Text style={[styles.buttonText, { fontSize: 14, fontFamily: 'LeagueSpartan' }]}>Chat</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.statusVehicleContainer}>
              <View style={styles.statusBadgeWrapper}>
                <View
                  style={[
                    styles.statusContainer,
                    item.status === 'Pending' && styles.statusPending,
                    item.status === 'Rejected' && styles.statusRejected,
                    item.status === 'Ongoing' && styles.statusOngoing,
                    item.status === 'Completed' && styles.statusCompleted,
                  ]}
                >
                  <Text style={styles.status}>{item.status}</Text>
                  {item.status === 'Pending' && (
                    <LottieView
                      source={require('@/assets/images/pending.json')}
                      autoPlay
                      loop
                      style={{
                        width: 24,
                        height: 24,
                      }}
                    />
                  )}
                  {item.status === 'Rejected' && (
                    <LottieView
                      source={require('@/assets/images/rejected.json')}
                      autoPlay
                      loop
                      style={{
                        width: 24,
                        height: 24,
                      }}
                    />
                  )}
                  {item.status === 'Ongoing' && (
                    <LottieView
                      source={require('@/assets/images/ongoing.json')}
                      autoPlay
                      loop
                      style={{
                        width: 24,
                        height: 24,
                      }}
                    />
                  )}
                  {item.status === 'Completed' && (
                    <LottieView
                      source={require('@/assets/images/completed.json')}
                      autoPlay
                      loop
                      style={{
                        width: 24,
                        height: 24,
                      }}
                    />
                  )}
                </View>
              </View>

              <View style={styles.infoCard}>
                <View style={styles.infoSection}>
                  <MaterialCommunityIcons name="clock-outline" size={16} color="#000B58" />
                  <View style={styles.infoTextContainer}>
                    <Text style={styles.infoLabel}>Requested</Text>
                    <Text style={styles.text}>{item.datetime}</Text>
                  </View>
                </View>

                {item.status === 'Completed' && (
                  <View style={styles.infoSection}>
                    <MaterialCommunityIcons name="check-circle" size={16} color="#10B981" />
                    <View style={styles.infoTextContainer}>
                      <Text style={styles.infoLabel}>Completed</Text>
                      <Text style={styles.text}>{item.completedOn}</Text>
                    </View>
                  </View>
                )}

                <View style={styles.infoDivider} />

                <View style={styles.infoSection}>
                  <MaterialCommunityIcons name="car" size={16} color="#000B58" />
                  <View style={styles.infoTextContainer}>
                    <Text style={styles.infoLabel}>Vehicle</Text>
                    <Text style={styles.text}>{`${item.year} ${item.make} ${item.model}`}</Text>
                  </View>
                </View>

                <View style={styles.infoSection}>
                  <MaterialCommunityIcons name="wrench" size={16} color="#000B58" />
                  <View style={styles.infoTextContainer}>
                    <Text style={styles.infoLabel}>Request Type</Text>
                    <Text style={styles.text}>{item.requestType}</Text>
                  </View>
                </View>

                <View style={styles.infoSection}>
                  <MaterialCommunityIcons name="tools" size={16} color="#000B58" />
                  <View style={styles.infoTextContainer}>
                    <Text style={styles.infoLabel}>Service Type</Text>
                    <Text style={styles.text}>{item.serviceType}</Text>
                  </View>
                </View>

                {item.isRated && (
                  <View style={styles.infoSection}>
                    <MaterialCommunityIcons name="star" size={16} color="#FDCC0D" />
                    <View style={styles.infoTextContainer}>
                      <Text style={styles.infoLabel}>Customer Rating</Text>
                      <Text style={styles.text}>{`${item.score}/5`}</Text>
                    </View>
                  </View>
                )}
              </View>
            </View>

            <View style={styles.locationContainer}>
              <View style={styles.sectionHeader}>
                <MaterialCommunityIcons name="map-marker" size={20} color="#000B58" />
                <Text style={styles.subHeader}>Location</Text>
              </View>
              <View style={styles.mapButtonContainer}>
                <View style={styles.mapView}>
                  <MapView
                    style={styles.map}
                    mapType={mapType as any}
                    region={customerRegion}
                    provider={PROVIDER_GOOGLE}
                  >
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

                <TouchableOpacity style={styles.mapButton} onPress={() => fitToCoord()}></TouchableOpacity>
              </View>

              <Modal
                animationType="fade"
                transparent={true}
                visible={mapModalVisible}
                onRequestClose={() => setMapModalVisible(false)}
              >
                <View style={styles.modalOverlay}>
                  <TouchableWithoutFeedback onPress={() => setMapModalVisible(false)}>
                    <View style={styles.modalBackground} />
                  </TouchableWithoutFeedback>

                  <View style={styles.mapView2}>
                    <View style={styles.mapModalHeader}>
                      <MaterialCommunityIcons name="map-marker-distance" size={24} color="#000B58" />
                      <Text style={styles.mapModalTitle}>Location & Distance</Text>
                      <TouchableOpacity style={styles.exitButton2} onPress={() => setMapModalVisible(false)}>
                        <MaterialCommunityIcons name="close" size={24} color="#6B7280" />
                      </TouchableOpacity>
                    </View>

                    <MapView
                      style={styles.map2}
                      ref={mapRef}
                      mapType={mapType as any}
                      initialRegion={customerRegion}
                      provider={PROVIDER_GOOGLE}
                    >
                      {shopRegion && (
                        <Marker
                          coordinate={{
                            latitude: shopRegion.latitude,
                            longitude: shopRegion.longitude,
                          }}
                          image={require('../../../../assets/images/you-marker.png')}
                          title="You"
                        />
                      )}

                      {customerRegion && (
                        <Marker
                          coordinate={{
                            latitude: customerRegion.latitude,
                            longitude: customerRegion.longitude,
                          }}
                          title={item.customer}
                        />
                      )}
                    </MapView>

                    <View style={styles.mapInfoCard}>
                      <View style={styles.mapInfoRow}>
                        <MaterialCommunityIcons name="map-marker" size={20} color="#000B58" />
                        <View style={styles.mapInfoTextContainer}>
                          <Text style={styles.mapInfoLabel}>Customer</Text>
                          <Text style={styles.mapInfoText}>{item.customer}</Text>
                        </View>
                      </View>
                      <View style={styles.mapInfoDivider} />
                      <View style={styles.mapInfoRow}>
                        <MaterialCommunityIcons name="map-marker-distance" size={20} color="#10B981" />
                        <View style={styles.mapInfoTextContainer}>
                          <Text style={styles.mapInfoLabel}>Distance</Text>
                          <Text style={styles.mapInfoText}>
                            {`${getDistance(customerRegion?.latitude ?? 0, customerRegion?.longitude ?? 0, shopRegion?.latitude ?? 0, shopRegion?.longitude ?? 0)} KM away`}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                </View>
              </Modal>
            </View>

            <View style={styles.vehicleIssueContainer}>
              <View style={styles.sectionHeader}>
                <MaterialCommunityIcons name="alert-circle" size={20} color="#000B58" />
                <Text style={styles.subHeader}>Vehicle Issue</Text>
              </View>
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
                        <View style={styles.diagnosisHeader}>
                          <MaterialCommunityIcons
                            name={getSeverityLevel(dtc || '').icon as any}
                            size={20}
                            color={getSeverityLevel(item.dtc[selectedIndex] || '').color}
                          />
                          <Text style={styles.diagnosisButtonText1}>{dtc}</Text>
                        </View>
                        <Text style={styles.diagnosisButtonText2}>{item.technicalDescription[index]}</Text>
                        <View style={styles.viewDetailsRow}>
                          <Text style={styles.viewDetailsText}>View Details</Text>
                          <MaterialCommunityIcons name="chevron-right" size={16} color="#000B58" />
                        </View>
                      </TouchableOpacity>

                      <Modal
                        animationType="fade"
                        transparent={true}
                        visible={modalVisible}
                        onRequestClose={() => setModalVisible(false)}
                      >
                        <View style={styles.modalOverlay}>
                          <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
                            <View style={styles.modalBackground} />
                          </TouchableWithoutFeedback>

                          <View style={styles.modalView}>
                            <View style={styles.dtcModalHeader}>
                              <MaterialCommunityIcons name="file-document-outline" size={24} color="#000B58" />
                              <Text style={styles.dtcModalTitle}>Diagnostic Report</Text>
                              <TouchableOpacity style={styles.dtcCloseButton} onPress={() => setModalVisible(false)}>
                                <MaterialCommunityIcons name="close" size={24} color="#6B7280" />
                              </TouchableOpacity>
                            </View>

                            <ScrollView style={styles.dtcModalBody} showsVerticalScrollIndicator={false}>
                              <View onStartShouldSetResponder={() => true}>
                                <View style={styles.dtcCodeSection}>
                                  <MaterialCommunityIcons
                                    name={getDTCCategoryInfo(item.dtc[selectedIndex] || '').icon as any}
                                    size={32}
                                    color={getDTCCategoryInfo(item.dtc[selectedIndex] || '').color}
                                  />
                                  <Text style={styles.troubleCode}>{item.dtc[selectedIndex]}</Text>
                                  <View
                                    style={[
                                      styles.categoryBadge,
                                      { backgroundColor: getDTCCategoryInfo(item.dtc[selectedIndex] || '').bgColor },
                                    ]}
                                  >
                                    <Text
                                      style={[
                                        styles.categoryText,
                                        { color: getDTCCategoryInfo(item.dtc[selectedIndex] || '').color },
                                      ]}
                                    >
                                      {getDTCCategoryInfo(item.dtc[selectedIndex] || '').category}
                                    </Text>
                                  </View>
                                  <View style={styles.severityBadge}>
                                    <MaterialCommunityIcons
                                      name={getSeverityLevel(item.dtc[selectedIndex] || '').icon as any}
                                      size={16}
                                      color={getSeverityLevel(item.dtc[selectedIndex] || '').color}
                                    />
                                    <Text
                                      style={[
                                        styles.severityText,
                                        { color: getSeverityLevel(item.dtc[selectedIndex] || '').color },
                                      ]}
                                    >
                                      {getSeverityLevel(item.dtc[selectedIndex] || '').level}
                                    </Text>
                                  </View>
                                  <Text style={styles.technicalDescription}>
                                    {item.technicalDescription[selectedIndex]}
                                  </Text>
                                </View>

                                <View style={styles.textContainer2}>
                                  <View style={styles.dtcSectionHeader}>
                                    <MaterialCommunityIcons name="information-outline" size={20} color="#000B58" />
                                    <Text style={styles.label}>Meaning</Text>
                                  </View>
                                  <Text style={styles.text}>{item.meaning[selectedIndex]}</Text>
                                </View>

                                <View style={styles.textContainer2}>
                                  <View style={styles.dtcSectionHeader}>
                                    <MaterialCommunityIcons name="alert-circle-outline" size={20} color="#F59E0B" />
                                    <Text style={styles.label}>Possible Causes</Text>
                                  </View>
                                  {bulletPossibleCauses[groupedIndex]?.map((cause, index) => (
                                    <View key={index} style={styles.bulletView}>
                                      <MaterialCommunityIcons
                                        name="chevron-right"
                                        size={16}
                                        color="#F59E0B"
                                        style={styles.bulletIcon}
                                      />
                                      <Text style={styles.bulletedText}>{cause}</Text>
                                    </View>
                                  ))}
                                </View>

                                <View style={styles.textContainer2}>
                                  <View style={styles.dtcSectionHeader}>
                                    <MaterialCommunityIcons name="wrench-outline" size={20} color="#10B981" />
                                    <Text style={styles.label}>Recommended Solutions</Text>
                                  </View>
                                  {bulletRecommendedRepair[groupedIndex]?.map((repair, index) => (
                                    <View key={index} style={styles.bulletView}>
                                      <MaterialCommunityIcons
                                        name="check-circle-outline"
                                        size={16}
                                        color="#10B981"
                                        style={styles.bulletIcon}
                                      />
                                      <Text style={styles.bulletedText}>{repair}</Text>
                                    </View>
                                  ))}
                                </View>
                              </View>
                            </ScrollView>
                          </View>
                        </View>
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
                    style={[styles.button, { backgroundColor: '#DC2626' }]}
                    onPress={() => setRejectedModalVisible(true)}
                  >
                    <Text style={styles.buttonText}>Reject</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.button, { backgroundColor: '#000B58' }]}
                    onPress={() => handleAcceptRequest(item.requestID, item.year, item.make, item.model, item.userID)}
                  >
                    <Text style={styles.buttonText}>Accept</Text>
                  </TouchableOpacity>
                </View>

                <Modal
                  animationType="fade"
                  transparent={true}
                  visible={rejectedModalVisible}
                  onRequestClose={() => {
                    setRejectedModalVisible(false);
                    setSelectedReason('');
                    setOtherReason('');
                    setError('');
                  }}
                >
                  <View style={styles.modalOverlay}>
                    <TouchableWithoutFeedback
                      onPress={() => {
                        setRejectedModalVisible(false);
                        setSelectedReason('');
                        setOtherReason('');
                        setError('');
                      }}
                    >
                      <View style={styles.modalBackground} />
                    </TouchableWithoutFeedback>

                    <View style={styles.textInputView}>
                      <View style={styles.modalIconContainer}>
                        <MaterialCommunityIcons name="close-circle-outline" size={48} color="#DC2626" />
                      </View>

                      <Text style={[styles.subHeader, { textAlign: 'center', marginBottom: 8 }]}>
                        Reason For Rejection
                      </Text>
                      <Text
                        style={[styles.text, { textAlign: 'center', color: '#6B7280', marginBottom: 20, fontSize: 14 }]}
                      >
                        Please select a reason why you&apos;re rejecting this request
                      </Text>

                      <ScrollView style={{ maxHeight: 300 }} showsVerticalScrollIndicator={false}>
                        {reasons.map((item) => (
                          <TouchableOpacity
                            key={item}
                            style={[
                              styles.checkboxContainer,
                              selectedReason === item && {
                                backgroundColor: '#EEF2FF',
                                borderColor: '#000B58',
                                borderWidth: 2,
                                borderRadius: 8,
                                paddingVertical: 12,
                                paddingHorizontal: 12,
                              },
                              selectedReason !== item && {
                                backgroundColor: '#F9FAFB',
                                borderColor: '#E5E7EB',
                                borderWidth: 1,
                                borderRadius: 8,
                                paddingVertical: 12,
                                paddingHorizontal: 12,
                              },
                            ]}
                            onPress={() => {
                              setSelectedReason(selectedReason === item ? '' : item);
                            }}
                            activeOpacity={0.7}
                          >
                            <View
                              style={{
                                width: 20,
                                height: 20,
                                borderRadius: 10,
                                borderWidth: 2,
                                borderColor: selectedReason === item ? '#000B58' : '#D1D5DB',
                                backgroundColor: selectedReason === item ? '#000B58' : 'transparent',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              {selectedReason === item && (
                                <MaterialCommunityIcons name="check" size={14} color="#FFF" />
                              )}
                            </View>
                            <Text
                              style={[
                                styles.text,
                                { flex: 1 },
                                selectedReason === item && { color: '#000B58', fontFamily: 'BodyBold' },
                              ]}
                            >
                              {item}
                            </Text>
                          </TouchableOpacity>
                        ))}

                        {selectedReason === 'Others' && (
                          <View style={{ marginTop: 16 }}>
                            <Text style={[styles.text, { marginBottom: 8, fontFamily: 'BodyBold', fontSize: 14 }]}>
                              Please specify:
                            </Text>
                            <TextInput
                              style={[
                                styles.input,
                                {
                                  backgroundColor: '#F9FAFB',
                                  borderWidth: 1,
                                  borderColor: '#E5E7EB',
                                  borderRadius: 8,
                                  padding: 12,
                                  minHeight: 80,
                                  textAlignVertical: 'top',
                                },
                              ]}
                              value={otherReason}
                              onChangeText={setOtherReason}
                              placeholder="Enter your reason here..."
                              placeholderTextColor="#9CA3AF"
                              multiline
                            />
                          </View>
                        )}
                      </ScrollView>

                      {error.length > 0 && (
                        <View style={styles.errorContainer}>
                          <MaterialCommunityIcons name="alert-circle" size={18} color="#DC2626" />
                          <Text style={styles.errorMessage}>{error}</Text>
                        </View>
                      )}
                      <View style={[styles.buttonContainer, { marginTop: 20, marginBottom: 0 }]}>
                        <TouchableOpacity
                          style={[
                            styles.button,
                            {
                              backgroundColor: '#F9FAFB',
                              borderWidth: 1,
                              borderColor: '#E5E7EB',
                              flex: 1,
                              height: 48,
                            },
                          ]}
                          onPress={() => {
                            setRejectedModalVisible(false);
                            setSelectedReason('');
                            setOtherReason('');
                            setError('');
                          }}
                        >
                          <Text style={[styles.buttonText, { color: '#374151', fontFamily: 'BodyBold' }]}>Cancel</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={[
                            styles.button,
                            {
                              backgroundColor: '#DC2626',
                              flex: 1,
                              height: 48,
                              shadowColor: '#DC2626',
                              shadowOffset: { width: 0, height: 4 },
                              shadowOpacity: 0.2,
                              shadowRadius: 8,
                              elevation: 4,
                            },
                          ]}
                          onPress={() =>
                            handleRejectRequest(item.requestID, item.year, item.make, item.model, item.userID)
                          }
                        >
                          <Text style={[styles.buttonText, { fontFamily: 'BodyBold' }]}>Reject</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </Modal>
              </>
            )}

            {item.status === 'Rejected' && (
              <View style={styles.reasonRejectedContainer}>
                <View style={styles.sectionHeader}>
                  <MaterialCommunityIcons name="alert-circle" size={20} color="#DC2626" />
                  <Text style={styles.subHeader}>Reason For Rejection</Text>
                </View>
                <View style={[styles.textContainer, styles.rejectionCard]}>
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
                  transparent={true}
                  visible={completedModalVisible}
                  onRequestClose={() => {
                    setCompletedModalVisible(false);
                    setSelectedOptCompleted('');
                    setRepairProcedure('');
                  }}
                >
                  <View style={styles.modalOverlay}>
                    <TouchableWithoutFeedback
                      onPress={() => {
                        setCompletedModalVisible(false);
                        setSelectedOptCompleted('');
                        setRepairProcedure('');
                      }}
                    >
                      <View style={styles.modalBackground} />
                    </TouchableWithoutFeedback>

                    <View style={styles.textInputView}>
                      <ScrollView>
                        <View style={[styles.modalIconContainer, { backgroundColor: '#D1FAE5' }]}>
                          <MaterialCommunityIcons name="check-circle-outline" size={48} color="#10B981" />
                        </View>

                        <Text style={[styles.subHeader, { textAlign: 'center', marginBottom: 8 }]}>
                          Mark as Completed
                        </Text>
                        <Text
                          style={[
                            styles.text,
                            { textAlign: 'center', color: '#6B7280', marginBottom: 20, fontSize: 14 },
                          ]}
                        >
                          Describe the repair procedure or select an option
                        </Text>

                        {completed.map((item) => (
                          <TouchableOpacity
                            key={item}
                            style={[
                              styles.checkboxContainer,
                              selectedOptCompleted === item && {
                                backgroundColor: '#EEF2FF',
                                borderColor: '#000B58',
                                borderWidth: 2,
                                borderRadius: 8,
                                paddingVertical: 12,
                                paddingHorizontal: 12,
                              },
                              selectedOptCompleted !== item && {
                                backgroundColor: '#F9FAFB',
                                borderColor: '#E5E7EB',
                                borderWidth: 1,
                                borderRadius: 8,
                                paddingVertical: 12,
                                paddingHorizontal: 12,
                              },
                            ]}
                            onPress={() => {
                              setSelectedOptCompleted(selectedOptCompleted === item ? '' : item);
                              setRepairProcedure('');
                            }}
                            activeOpacity={0.7}
                          >
                            <View
                              style={{
                                width: 20,
                                height: 20,
                                borderRadius: 10,
                                borderWidth: 2,
                                borderColor: selectedOptCompleted === item ? '#000B58' : '#D1D5DB',
                                backgroundColor: selectedOptCompleted === item ? '#000B58' : 'transparent',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              {selectedOptCompleted === item && (
                                <MaterialCommunityIcons name="check" size={14} color="#FFF" />
                              )}
                            </View>
                            <Text
                              style={[
                                styles.text,
                                { flex: 1 },
                                selectedOptCompleted === item && { color: '#000B58', fontFamily: 'BodyBold' },
                              ]}
                            >
                              {item}
                            </Text>
                          </TouchableOpacity>
                        ))}

                        <View style={{ marginTop: 16 }}>
                          <Text style={[styles.text, { marginBottom: 8, fontFamily: 'BodyBold', fontSize: 14 }]}>
                            Or describe the repair procedure:
                          </Text>
                          <TextInput
                            style={styles.textarea}
                            placeholder="Describe what you did to fix the vehicle..."
                            multiline={true}
                            numberOfLines={5}
                            value={repairProcedure}
                            onChangeText={setRepairProcedure}
                            onFocus={() => setSelectedOptCompleted('')}
                            textAlignVertical="top"
                            placeholderTextColor="#9CA3AF"
                          />
                        </View>

                        {error.length > 0 && (
                          <View style={styles.errorContainer}>
                            <MaterialCommunityIcons name="alert-circle" size={18} color="#DC2626" />
                            <Text style={styles.errorMessage}>{error}</Text>
                          </View>
                        )}
                      </ScrollView>

                      <View style={[styles.buttonContainer, { marginTop: 20, marginBottom: 0 }]}>
                        <TouchableOpacity
                          style={[
                            styles.button,
                            {
                              backgroundColor: '#F9FAFB',
                              borderWidth: 1,
                              borderColor: '#E5E7EB',
                              flex: 1,
                              height: 48,
                            },
                          ]}
                          onPress={() => {
                            setCompletedModalVisible(false);
                            setSelectedOptCompleted('');
                            setRepairProcedure('');
                          }}
                        >
                          <Text style={[styles.buttonText, { color: '#374151', fontFamily: 'BodyBold' }]}>Cancel</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={[
                            styles.button,
                            {
                              backgroundColor: '#10B981',
                              flex: 1,
                              height: 48,
                              shadowColor: '#10B981',
                              shadowOffset: { width: 0, height: 4 },
                              shadowOpacity: 0.2,
                              shadowRadius: 8,
                              elevation: 4,
                            },
                          ]}
                          onPress={() =>
                            handleRequestCompleted(
                              item.requestID,
                              item.vehicleID,
                              item.year,
                              item.make,
                              item.model,
                              item.userID,
                              item.requestType
                            )
                          }
                        >
                          <Text style={[styles.buttonText, { fontFamily: 'BodyBold' }]}>Complete</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </Modal>
              </>
            )}

            {item.status === 'Completed' && (
              <View style={styles.repairProcedureContainer}>
                <View style={styles.sectionHeader}>
                  <MaterialCommunityIcons name="tools" size={20} color="#000B58" />
                  <Text style={styles.subHeader}>Repair Procedure Done</Text>
                </View>
                {item.repairProcedure !== null && (
                  <>
                    {item.repairProcedure !== 'Repair unsuccessful' && (
                      <View style={[styles.textContainer, { minHeight: 150 }]}>
                        <Text style={styles.text}>{item.repairProcedure}</Text>
                      </View>
                    )}

                    {item.repairProcedure === 'Repair unsuccessful' && (
                      <View style={[styles.textContainer, styles.rejectionCard]}>
                        <Text style={[styles.text, { color: '#780606' }]}>{item.repairProcedure}</Text>
                      </View>
                    )}
                  </>
                )}

                {item.repairProcedure === null && (
                  <View style={[styles.textContainer, styles.rejectionCard]}>
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
    backgroundColor: '#f2f4f7',
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
    textAlign: 'center',
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
  locationContainer: {
    width: '100%',
    marginTop: 10,
  },
  subHeader: {
    fontFamily: 'BodyBold',
    fontSize: 18,
    color: '#333',
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
    backgroundColor: '#fff',
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
    backgroundColor: '#fff',
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
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalView: {
    backgroundColor: '#FFF',
    width: '90%',
    maxHeight: 600,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    overflow: 'hidden',
  },
  dtcModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
    gap: 12,
  },
  dtcModalTitle: {
    fontFamily: 'HeadingBold',
    fontSize: 18,
    color: '#000B58',
    flex: 1,
  },
  dtcCloseButton: {
    padding: 4,
    borderRadius: 8,
  },
  dtcModalBody: {
    padding: 20,
    maxHeight: 500,
  },
  dtcCodeSection: {
    alignItems: 'center',
    paddingBottom: 20,
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    gap: 12,
  },
  categoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  categoryText: {
    fontFamily: 'BodyBold',
    fontSize: 12,
    textAlign: 'center',
  },
  severityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
  },
  severityText: {
    fontFamily: 'BodyBold',
    fontSize: 12,
  },
  dtcSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  troubleCode: {
    fontFamily: 'BodyBold',
    fontSize: 24,
    color: '#333',
    textAlign: 'center',
  },
  technicalDescription: {
    fontFamily: 'BodyRegular',
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    lineHeight: 24,
  },
  label: {
    fontFamily: 'BodyBold',
    fontSize: 18,
    color: '#333',
  },
  textContainer2: {
    marginBottom: 20,
  },
  bulletView: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    paddingLeft: 5,
    marginBottom: 8,
  },
  bulletedText: {
    fontFamily: 'BodyRegular',
    color: '#333',
    lineHeight: 22,
    flex: 1,
  },
  bulletIcon: {
    marginTop: 2,
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
    width: 80,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
    borderRadius: 5,
    backgroundColor: '#000B58',
    padding: 8,
  },
  buttonText: {
    fontFamily: 'BodyRegular',
    color: '#FFF',
  },
  // Profile section styles
  profileSection: {
    marginBottom: 12,
  },
  contactInfoContainer: {
    alignItems: 'center',
    gap: 8,
    marginVertical: 8,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  // Status badge styles
  statusBadgeWrapper: {
    alignItems: 'center',
    marginBottom: 16,
  },
  statusPending: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statusRejected: {
    backgroundColor: '#FECACA',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statusOngoing: {
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statusCompleted: {
    backgroundColor: '#BBF7D0',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  // Info card styles
  infoCard: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  infoSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 12,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoLabel: {
    fontFamily: 'BodyBold',
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  infoDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 8,
  },
  // Section header styles
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  // Diagnosis button styles
  diagnosisHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  viewDetailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
    marginTop: 8,
  },
  viewDetailsText: {
    fontFamily: 'BodyBold',
    fontSize: 12,
    color: '#000B58',
  },
  // Rejection card style
  rejectionCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#DC2626',
  },
  mapView2: {
    backgroundColor: '#FFF',
    width: '95%',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    overflow: 'hidden',
  },
  mapModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    gap: 12,
  },
  mapModalTitle: {
    fontFamily: 'HeadingBold',
    fontSize: 18,
    color: '#000B58',
    flex: 1,
  },
  map2: {
    width: '100%',
    height: 300,
  },
  exitButton2: {
    padding: 4,
    borderRadius: 8,
  },
  mapInfoCard: {
    width: '100%',
    backgroundColor: '#FFF',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  mapInfoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  mapInfoTextContainer: {
    flex: 1,
  },
  mapInfoLabel: {
    fontFamily: 'BodyBold',
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  mapInfoText: {
    fontFamily: 'BodyRegular',
    fontSize: 15,
    color: '#333',
    lineHeight: 20,
  },
  mapInfoDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 12,
  },
  textInputView: {
    backgroundColor: '#FFF',
    width: '90%',
    maxHeight: '90%',
    padding: 25,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 8,
    overflow: 'hidden',
  },
  modalIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 16,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  input: {
    fontFamily: 'BodyRegular',
    color: '#333',
    fontSize: 14,
  },
  reasonRejectedContainer: {
    width: '100%',
    marginTop: 10,
  },
  textarea: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    width: '100%',
    minHeight: 100,
    padding: 12,
    color: '#333',
    fontFamily: 'BodyRegular',
    fontSize: 14,
  },
  errorContainer: {
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DC2626',
    width: '100%',
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
  },
  errorMessage: {
    fontFamily: 'BodyRegular',
    color: '#DC2626',
    fontSize: 13,
    flex: 1,
  },
});

export default RepairRequestDetails;
