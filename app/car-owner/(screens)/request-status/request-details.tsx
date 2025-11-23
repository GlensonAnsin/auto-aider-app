import { Header } from '@/components/Header';
import { Loading } from '@/components/Loading';
import { useBackRoute } from '@/hooks/useBackRoute';
import { setSenderReceiverState } from '@/redux/slices/senderReceiverSlice';
import { RootState } from '@/redux/store';
import { getRepairShops, getRequestsForCarOwner, updateRatings } from '@/services/backendApi';
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
      vehicleIssue: string | null;
      repairProcedure: string | null;
      completedOn: string | null;
      reasonRejected: string | null;
      isRated: boolean;
      score: number | null;
      requestType: string;
      serviceType: string;
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
  const mapType = useSelector((state: RootState) => state.settings.mapType);

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
          requestType: string;
          serviceType: string;
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
                              datetime: dayjs(request.request_datetime).utc(true).format('ddd MMM DD YYYY, h:mm A'),
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
                              completedOn: dayjs(request.completed_on).utc(true).format('ddd MMM DD YYYY, h:mm A'),
                              reasonRejected: request.reason_rejected,
                              isRated: request.is_rated,
                              score: request.score,
                              requestType: request.request_type,
                              serviceType: request.service_type,
                            });

                            setCustomerRegion({
                              latitude: latitude,
                              longitude: longitude,
                              latitudeDelta: 0.001,
                              longitudeDelta: 0.001,
                            });

                            setShopRegion({
                              latitude: parseFloat(repairShop.latitude),
                              longitude: parseFloat(repairShop.longitude),
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

        setRequestDetails(requestDetailsData);
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
      setTimeout(() => {
        router.push('/error/server-error');
      }, 2000);
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
              <View style={styles.profileSection}>
                {item.repairShopProfile === null && (
                  <View style={[styles.profilePicWrapper, { backgroundColor: item.repairShopProfileBG }]}>
                    <MaterialCommunityIcons name="car-wrench" size={50} color="#FFF" />
                  </View>
                )}

                {item.repairShopProfile !== null && (
                  <View style={styles.profilePicWrapper}>
                    <Image
                      style={styles.profilePic}
                      source={{ uri: item.repairShopProfile }}
                      width={100}
                      height={100}
                    />
                  </View>
                )}
              </View>

              <Text style={styles.shopName}>{item.repairShop}</Text>

              <View style={styles.contactInfoContainer}>
                <View style={styles.contactRow}>
                  <MaterialCommunityIcons name="phone" size={16} color="#6B7280" />
                  <Text style={[styles.text, { color: '#555' }]}>{item.repairShopNum}</Text>
                </View>
                {item.repairShopEmail !== null && (
                  <View style={styles.contactRow}>
                    <MaterialCommunityIcons name="email" size={16} color="#6B7280" />
                    <Text style={[styles.text, { color: '#555' }]}>{item.repairShopEmail}</Text>
                  </View>
                )}
              </View>

              <TouchableOpacity
                style={styles.chatButton}
                onPress={() => {
                  backRoute();
                  dispatch(
                    setSenderReceiverState({
                      senderID: Number(userID),
                      receiverID: Number(item.repairShopID),
                      role: 'car-owner',
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
                      <Text style={styles.infoLabel}>Your Rating</Text>
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
                  <MapView style={styles.map} mapType={mapType as any} region={shopRegion} provider={PROVIDER_GOOGLE}>
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
                      {customerRegion && (
                        <Marker
                          coordinate={{
                            latitude: customerRegion.latitude,
                            longitude: customerRegion.longitude,
                          }}
                          image={require('../../../../assets/images/you-marker.png')}
                          title="You"
                        />
                      )}

                      {shopRegion && (
                        <Marker
                          coordinate={{
                            latitude: shopRegion.latitude,
                            longitude: shopRegion.longitude,
                          }}
                          title={item.repairShop}
                        />
                      )}
                    </MapView>

                    <View style={styles.mapInfoCard}>
                      <View style={styles.mapInfoRow}>
                        <MaterialCommunityIcons name="map-marker" size={20} color="#000B58" />
                        <View style={styles.mapInfoTextContainer}>
                          <Text style={styles.mapInfoLabel}>Repair Shop</Text>
                          <Text style={styles.mapInfoText}>{item.repairShop}</Text>
                        </View>
                      </View>
                      <View style={styles.mapInfoDivider} />
                      <View style={styles.mapInfoRow}>
                        <MaterialCommunityIcons name="map-marker-distance" size={20} color="#10B981" />
                        <View style={styles.mapInfoTextContainer}>
                          <Text style={styles.mapInfoLabel}>Distance</Text>
                          <Text style={styles.mapInfoText}>
                            {`${getDistance(shopRegion?.latitude ?? 0, shopRegion?.longitude ?? 0, customerRegion?.latitude ?? 0, customerRegion?.longitude ?? 0)} KM away`}
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

            {item.status === 'Rejected' && (
              <View style={styles.reasonRejectedContainer}>
                <View style={styles.sectionHeader}>
                  <MaterialCommunityIcons name="close-circle" size={20} color="#DC2626" />
                  <Text style={styles.subHeader}>Reason For Rejection</Text>
                </View>
                <View style={[styles.textContainer, styles.rejectionCard]}>
                  <Text style={[styles.text, { color: '#780606' }]}>{item.reasonRejected}</Text>
                </View>
              </View>
            )}

            {item.status === 'Completed' && (
              <>
                <View style={styles.repairProcedureContainer}>
                  <View style={styles.sectionHeader}>
                    <MaterialCommunityIcons name="clipboard-check" size={20} color="#10B981" />
                    <Text style={styles.subHeader}>Repair Procedure</Text>
                  </View>
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
                  style={[styles.rateButton, { backgroundColor: item.isRated ? '#9CA3AF' : '#FDCC0D' }]}
                  onPress={() => setRatingModalVisible(true)}
                  disabled={item.isRated ? true : false}
                >
                  <MaterialCommunityIcons name={item.isRated ? 'check-circle' : 'star'} size={18} color="#FFF" />
                  <Text style={styles.rateButtonText}>{item.isRated ? 'Already Rated' : 'Rate Shop'}</Text>
                </TouchableOpacity>

                <Modal
                  animationType="fade"
                  transparent={true}
                  visible={ratingModalVisible}
                  onRequestClose={() => setRatingModalVisible(false)}
                >
                  <View style={styles.modalOverlay}>
                    <TouchableWithoutFeedback onPress={() => setRatingModalVisible(false)}>
                      <View style={styles.modalBackground} />
                    </TouchableWithoutFeedback>

                    <View style={styles.modalView}>
                      <View style={styles.ratingModalHeader}>
                        <MaterialCommunityIcons name="star-circle" size={24} color="#FDCC0D" />
                        <Text style={styles.ratingModalTitle}>Rate Your Experience</Text>
                        <TouchableOpacity style={styles.exitButton} onPress={() => setRatingModalVisible(false)}>
                          <MaterialCommunityIcons name="close" size={24} color="#6B7280" />
                        </TouchableOpacity>
                      </View>

                      <View style={styles.ratingModalBody}>
                        <View style={styles.shopInfoSection}>
                          {item.repairShopProfile === null && (
                            <View style={[styles.shopAvatarSmall, { backgroundColor: item.repairShopProfileBG }]}>
                              <MaterialCommunityIcons name="car-wrench" size={32} color="#FFF" />
                            </View>
                          )}
                          {item.repairShopProfile !== null && (
                            <Image
                              style={styles.shopAvatarSmall}
                              source={{ uri: item.repairShopProfile }}
                              width={64}
                              height={64}
                            />
                          )}
                          <View style={styles.shopInfoText}>
                            <Text style={styles.shopInfoName}>{item.repairShop}</Text>
                            <Text style={styles.shopInfoSubtext}>How was your experience?</Text>
                          </View>
                        </View>

                        <View style={styles.ratingSection}>
                          <Rating
                            type="custom"
                            ratingCount={5}
                            imageSize={48}
                            startingValue={rating || 0}
                            minValue={1}
                            onFinishRating={setRating}
                            ratingColor="#FDCC0D"
                            ratingBackgroundColor="#E5E7EB"
                            tintColor="#FFF"
                            style={{ paddingVertical: 20 }}
                          />

                          {rating > 0 && (
                            <View style={styles.ratingFeedback}>
                              <Text style={styles.ratingFeedbackText}>
                                {rating === 1 && '😞 Poor'}
                                {rating === 2 && '😐 Fair'}
                                {rating === 3 && '🙂 Good'}
                                {rating === 4 && '😊 Very Good'}
                                {rating === 5 && '🤩 Excellent'}
                              </Text>
                            </View>
                          )}
                        </View>

                        <View style={styles.ratingButtons}>
                          <TouchableOpacity
                            style={[styles.ratingButtonCancel]}
                            onPress={() => {
                              setRatingModalVisible(false);
                              setRating(0);
                            }}
                          >
                            <Text style={styles.ratingButtonCancelText}>Cancel</Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            style={[styles.submitButton, !rating && { backgroundColor: '#D1D5DB', opacity: 0.5 }]}
                            onPress={() => handleUpdateRating(item.repairShopID, item.requestID)}
                            disabled={!rating}
                          >
                            <Text style={styles.submitButtonText}>Submit</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  </View>
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
    backgroundColor: '#f2f4f7',
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
  rateButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    width: 140,
    padding: 10,
    borderRadius: 10,
    alignSelf: 'center',
    marginTop: 30,
  },
  rateButtonText: {
    fontFamily: 'BodyRegular',
    color: '#FFF',
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
  exitButton: {
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-end',
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
  bulletIcon: {
    marginTop: 2,
  },
  bulletedText: {
    fontFamily: 'BodyRegular',
    color: '#333',
    lineHeight: 22,
    flex: 1,
  },
  reasonRejectedContainer: {
    width: '100%',
    marginTop: 10,
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
    color: '#FFF',
    fontFamily: 'BodyRegular',
  },
  submitButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FDCC0D',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 10,
    shadowColor: '#FDCC0D',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonText: {
    fontFamily: 'BodyBold',
    color: '#FFF',
    fontSize: 16,
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
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
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
  rejectionCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#DC2626',
  },
  ratingModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#FFFBEB',
    gap: 12,
  },
  ratingModalTitle: {
    fontFamily: 'HeadingBold',
    fontSize: 18,
    color: '#000B58',
    flex: 1,
  },
  ratingModalBody: {
    padding: 24,
  },
  shopInfoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  shopAvatarSmall: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shopInfoText: {
    flex: 1,
  },
  shopInfoName: {
    fontFamily: 'BodyBold',
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
  },
  shopInfoSubtext: {
    fontFamily: 'BodyRegular',
    fontSize: 14,
    color: '#6B7280',
  },
  ratingSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  ratingFeedback: {
    backgroundColor: '#FFFBEB',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 12,
  },
  ratingFeedbackText: {
    fontFamily: 'BodyBold',
    fontSize: 16,
    color: '#F59E0B',
    textAlign: 'center',
  },
  ratingButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  ratingButtonCancel: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ratingButtonCancelText: {
    fontFamily: 'BodyBold',
    color: '#374151',
    fontSize: 16,
  },
});

export default RequestDetails;
