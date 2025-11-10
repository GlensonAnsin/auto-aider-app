import { Header } from '@/components/Header';
import { Loading } from '@/components/Loading';
import { useBackRoute } from '@/hooks/useBackRoute';
import { clearScanState } from '@/redux/slices/scanSlice';
import { setSenderReceiverState } from '@/redux/slices/senderReceiverSlice';
import { RootState } from '@/redux/store';
import {
  addRequest,
  addVehicleDiagnostic,
  getOnVehicleDiagnostic,
  getRepairShops,
  getVehicle,
} from '@/services/backendApi';
import { generateReference } from '@/services/generateReference';
import { startBackgroundLocation, stopBackgroundLocation } from '@/services/locationTask';
import Fontisto from '@expo/vector-icons/Fontisto';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { useFocusEffect } from '@react-navigation/native';
import dayjs from 'dayjs';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
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
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import MapView, { Circle, Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import Carousel from 'react-native-reanimated-carousel';
import { SafeAreaView } from 'react-native-safe-area-context';
import SelectDropdown from 'react-native-select-dropdown';
import { useDispatch, useSelector } from 'react-redux';

const RepairShops = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const backRoute = useBackRoute('/car-owner/(screens)/repair-shops/repair-shops');
  const mapRef = useRef<MapView | null>(null);
  const bottomSheetRef = useRef<BottomSheet | null>(null);
  const zoomLevelRef = useRef<{ latitudeDelta: number; longitudeDelta: number } | null>(null);
  const scrollRef = useRef<ScrollView | null>(null);
  const { width: screenWidth } = Dimensions.get('window');
  const [regions, setRegions] = useState<
    | {
        repairShopID: number;
        latitude: number;
        longitude: number;
        shopName: string;
        ownerFirstname: string;
        ownerLastname: string;
        gender: string;
        mobileNum: string;
        email: string | null;
        profilePic: string;
        profileBG: string;
        shopImages: string[];
        servicesOffered: string[];
        ratingsNum: number;
        averageRating: number;
        availability: string;
      }[]
    | undefined
  >(undefined);
  const [nearbyRepShop, setNearbyRepShop] = useState<
    | {
        repairShopID: number;
        latitude: number;
        longitude: number;
        shopName: string;
        ownerFirstname: string;
        ownerLastname: string;
        gender: string;
        mobileNum: string;
        email: string | null;
        profilePic: string;
        profileBG: string;
        shopImages: string[];
        servicesOffered: string[];
        ratingsNum: number;
        averageRating: number;
        availability: string;
        distance: number;
      }[]
    | undefined
  >(undefined);
  const [currentLocation, setCurrentLocation] = useState<Region | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedRepShop, setSelectedRepShop] = useState<number | null>(null);
  const [currentSnapPointIndex, setCurrentSnapPointIndex] = useState<number>(-1);
  const maxDistanceKM: number = 10;
  const snapPoints = useMemo(() => ['37%', '99.9%'], []);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [vehicles, setVehicles] = useState<{ id: number; make: string; model: string; year: string }[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<number | undefined>(undefined);
  const [vehicleIssue, setVehicleIssue] = useState<string>('');
  const [codeInterpretation, setCodeInterpretation] = useState<
    { vehicleDiagnosticID: number; dtc: string; technicalDescription: string }[]
  >([]);
  const [scannedVehicle, setScannedVehicle] = useState<string>('');
  const [scanReference2, setScanReference2] = useState<string>('');
  const [requestLoading, setRequestLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [animateToCurrReg, setAnimateToCurrReg] = useState<boolean>(true);
  const [withinTenKM, setWithinTenKM] = useState<boolean>(true);
  const [requestType, setRequestType] = useState<string>('');
  const [serviceType, setServiceType] = useState<string>('');

  const vehicleID: number | null = useSelector((state: RootState) => state.scan.vehicleID);
  const scanReference: string | null = useSelector((state: RootState) => state.scan.scanReference);
  const userID = useSelector((state: RootState) => state.role.ID);
  const mapType = useSelector((state: RootState) => state.settings.mapType);

  useFocusEffect(
    useCallback(() => {
      startBackgroundLocation();
      let isActive = true;

      const fetchData = async () => {
        try {
          setIsLoading(true);
          const res1 = await getRepairShops();
          const res2 = await getVehicle();

          if (vehicleID && scanReference) {
            const res3 = await getOnVehicleDiagnostic(vehicleID ?? 0, scanReference ?? '');

            if (res3) {
              setCodeInterpretation(
                res3.map((item: any) => ({
                  vehicleDiagnosticID: item.vehicle_diagnostic_id,
                  dtc: item.dtc,
                  technicalDescription: item.technical_description,
                }))
              );
            }
          }

          if (!isActive) return;

          setRegions(
            res1.map((shop: any) => ({
              repairShopID: shop.repair_shop_id,
              latitude: parseFloat(shop.latitude),
              longitude: parseFloat(shop.longitude),
              shopName: shop.shop_name,
              ownerFirstname: shop.owner_firstname,
              ownerLastname: shop.owner_lastname,
              gender: shop.gender,
              mobileNum: shop.mobile_num,
              email: shop.email,
              profilePic: shop.profile_pic,
              profileBG: shop.profile_bg,
              shopImages: shop.shop_images,
              servicesOffered: shop.services_offered,
              ratingsNum: shop.number_of_ratings,
              averageRating: shop.average_rating,
              availability: shop.availability,
            }))
          );

          const vehicleInfo = res2.map((v: { vehicle_id: number; make: string; model: string; year: string }) => ({
            id: v.vehicle_id,
            make: v.make,
            model: v.model,
            year: v.year,
          }));

          setVehicles(vehicleInfo);

          const scanReference2 = generateReference();
          setScanReference2(scanReference2);
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
          if (isActive) setIsLoading(false);
        }
      };

      fetchData();

      return () => {
        isActive = false;
        dispatch(clearScanState());
        stopBackgroundLocation();
        setAnimateToCurrReg(true);
      };
    }, [dispatch, router, scanReference, vehicleID])
  );

  useFocusEffect(
    useCallback(() => {
      let locationSubscription: Location.LocationSubscription | null = null;
      let isActive = true;

      (async () => {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          console.warn('Permission to access location was denied');
          return;
        }

        locationSubscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            distanceInterval: 10,
          },
          (location) => {
            if (!isActive) return;

            const newLocation = {
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
              latitudeDelta: 0.1,
              longitudeDelta: 0.1,
            };

            if (animateToCurrReg) {
              mapRef.current?.animateToRegion(newLocation);
              setAnimateToCurrReg(false);
              setCurrentLocation(newLocation);
              console.log('animate');
            } else {
              setCurrentLocation({
                latitude: newLocation.latitude,
                longitude: newLocation.longitude,
                latitudeDelta: zoomLevelRef.current?.latitudeDelta ?? 0,
                longitudeDelta: zoomLevelRef.current?.longitudeDelta ?? 0,
              });
              console.log('no animate');
            }

            const nearby = regions
              ?.map((loc) => {
                const distance = getDistance(newLocation.latitude, newLocation.longitude, loc.latitude, loc.longitude);
                return {
                  ...loc,
                  distance: parseFloat(distance),
                };
              })
              .filter((loc) => loc.distance <= maxDistanceKM);

            const isSameShops = (prev: any[] | undefined, next: any[] | undefined) => {
              if (!prev || !next || prev.length !== next.length) return false;
              return prev.every(
                (shop, i) => shop.repairShopID === next[i].repairShopID && shop.distance === next[i].distance
              );
            };

            if (!isSameShops(nearbyRepShop, nearby)) {
              setNearbyRepShop(nearby);
            }
          }
        );
      })();

      return () => {
        isActive = false;
        if (locationSubscription) {
          locationSubscription.remove();
          console.log('Location watcher removed');
        }
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [regions, animateToCurrReg])
  );

  const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const R = 6371;

    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return (R * c).toFixed(2);
  };

  const handleSheetChanges = useCallback((index: number) => {
    console.log('handleSheetChanges', index);
    setCurrentSnapPointIndex(index);
    if (index === 0) {
      bottomSheetRef.current?.close();
    }
  }, []);

  const handleRegionChangeComplete = (newRegion: Region) => {
    if (zoomLevelRef.current) {
      zoomLevelRef.current.latitudeDelta = newRegion.latitudeDelta;
      zoomLevelRef.current.longitudeDelta = newRegion.longitudeDelta;
    }
  };

  const handleMakeRequest = () => {
    if (vehicleID !== null) {
      const vehicle = vehicles.find((item) => Number(item.id) === vehicleID);
      setScannedVehicle(`${vehicle?.year} ${vehicle?.make} ${vehicle?.model}`);
    }

    setModalVisible(true);
  };

  const handleSubmitRequest = async (repairShopID: number, vehicleDiagID: number | null, type: string) => {
    if (!serviceType) {
      scrollRef.current?.scrollToEnd({ animated: true });
      setError('Please fill out all fields.');
      return;
    }

    setError('');

    try {
      setRequestLoading(true);
      switch (type) {
        case 'with-obd2':
          const datetimeWithObd2 = dayjs().format();

          for (const item of codeInterpretation ?? []) {
            const id = item.vehicleDiagnosticID;

            const requestData = {
              vehicle_diagnostic_id: id,
              repair_shop_id: repairShopID,
              repair_procedure: null,
              request_datetime: datetimeWithObd2,
              status: 'Pending',
              is_deleted: false,
              completed_on: null,
              rejected_reason: null,
              longitude: currentLocation?.longitude.toString() ?? '',
              latitude: currentLocation?.latitude.toString() ?? '',
              is_rated: false,
              request_type: 'Vehicle Repair',
              service_type: serviceType,
            };

            await addRequest(requestData);
          }

          showMessage({
            message: 'Request submitted successfully!',
            type: 'success',
            floating: true,
            color: '#FFF',
            icon: 'success',
          });
          setModalVisible(false);
          backRoute();
          router.replace('/car-owner/(screens)/request-status/request-status');
          break;

        case 'without-obd2':
          const requestData = {
            vehicle_diagnostic_id: vehicleDiagID ?? 0,
            repair_shop_id: repairShopID,
            repair_procedure: null,
            request_datetime: dayjs().format(),
            status: 'Pending',
            is_deleted: false,
            completed_on: null,
            rejected_reason: null,
            longitude: currentLocation?.longitude.toString() ?? '',
            latitude: currentLocation?.latitude.toString() ?? '',
            is_rated: false,
            request_type: requestType,
            service_type: serviceType,
          };

          await addRequest(requestData);

          showMessage({
            message: 'Request submitted successfully!',
            type: 'success',
            floating: true,
            color: '#FFF',
            icon: 'success',
          });
          setModalVisible(false);
          backRoute();
          router.replace('/car-owner/(screens)/request-status/request-status');
          break;

        default:
          throw new Error('Unsupported type');
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
    } finally {
      setRequestLoading(false);
    }
  };

  const handleAddVehicleDiagnostic = async () => {
    try {
      const vehicleDiagnosticData = {
        vehicle_diagnostic_id: null,
        vehicle_id: selectedVehicle !== undefined ? selectedVehicle : 0,
        dtc: null,
        technical_description: null,
        meaning: null,
        possible_causes: null,
        recommended_repair: null,
        date: dayjs().format(),
        scan_reference: scanReference2,
        vehicle_issue_description: requestType === 'Vehicle Repair' ? vehicleIssue : '-',
        is_deleted: false,
      };

      await addVehicleDiagnostic(vehicleDiagnosticData);
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

  const getVehicleDiagnostic = async () => {
    try {
      const res = await getOnVehicleDiagnostic(selectedVehicle !== undefined ? selectedVehicle : 0, scanReference2);
      if (res) {
        const id = res.map((item: any) => item.vehicle_diagnostic_id);
        return id[0];
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
      return null;
    }
  };

  const handleSubmitRequestWithoutOBD2 = async (repairShopID: number) => {
    if (requestType === 'Vehicle Repair') {
      if (!selectedVehicle || !requestType || !serviceType || !vehicleIssue) {
        scrollRef.current?.scrollToEnd({ animated: true });
        setError('Please fill out all fields.');
        return;
      }
    } else {
      if (!selectedVehicle || !requestType || !serviceType) {
        scrollRef.current?.scrollToEnd({ animated: true });
        setError('Please fill out all fields.');
        return;
      }
    }

    setError('');
    setRequestLoading(true);
    await handleAddVehicleDiagnostic();
    const res = await getVehicleDiagnostic();
    await handleSubmitRequest(repairShopID, res, 'without-obd2');
    setVehicleIssue('');
  };

  const toggleWithinTenKM = () => {
    setWithinTenKM((prev) => !prev);
    setSelectedRepShop(null);
    bottomSheetRef.current?.close();
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <GestureHandlerRootView>
        <Header headerTitle="Repair Shops" />
        <View style={styles.lowerBox}>
          <MapView
            ref={mapRef}
            mapType={mapType as any}
            style={styles.map}
            initialRegion={currentLocation}
            provider={PROVIDER_GOOGLE}
            onRegionChangeComplete={handleRegionChangeComplete}
          >
            {currentLocation && (
              <>
                <Marker
                  coordinate={{
                    latitude: currentLocation.latitude,
                    longitude: currentLocation.longitude,
                  }}
                  image={require('../../../../assets/images/you-marker.png')}
                  title="You"
                  tracksViewChanges={false}
                />

                {withinTenKM && (
                  <Circle
                    center={{
                      latitude: currentLocation.latitude,
                      longitude: currentLocation.longitude,
                    }}
                    radius={10000}
                    strokeColor="rgba(0, 122, 255, 0.8)"
                    fillColor="rgba(0, 122, 255, 0.3)"
                  />
                )}
              </>
            )}

            {withinTenKM ? (
              <>
                {nearbyRepShop?.map((loc, index) => (
                  <Marker
                    key={index}
                    coordinate={{
                      latitude: loc.latitude,
                      longitude: loc.longitude,
                    }}
                    image={require('../../../../assets/images/shop-marker.png')}
                    title={`${loc.distance}KM Away`}
                    tracksViewChanges={false}
                    onPress={() => {
                      bottomSheetRef.current?.snapToIndex(1);
                      setSelectedRepShop(index);
                    }}
                  />
                ))}
              </>
            ) : (
              <>
                {regions?.map((loc, index) => (
                  <Marker
                    key={index}
                    coordinate={{
                      latitude: loc.latitude,
                      longitude: loc.longitude,
                    }}
                    image={require('../../../../assets/images/shop-marker.png')}
                    title={`${getDistance(currentLocation?.latitude ?? 0, currentLocation?.longitude ?? 0, loc.latitude, loc.longitude)}KM Away`}
                    tracksViewChanges={false}
                    onPress={() => {
                      bottomSheetRef.current?.snapToIndex(1);
                      setSelectedRepShop(index);
                    }}
                  />
                ))}
              </>
            )}
          </MapView>

          <TouchableOpacity
            style={[styles.tenKMButton, { backgroundColor: withinTenKM ? '#000B58' : '#FFFFFF' }]}
            onPress={() => toggleWithinTenKM()}
          >
            <MaterialCommunityIcons
              name={withinTenKM ? 'map-marker-radius' : 'map-marker-radius-outline'}
              size={18}
              color={withinTenKM ? '#fff' : '#000B58'}
            />
            <Text style={[styles.tenKMButtonText, { color: withinTenKM ? '#fff' : '#000B58' }]}>Within 10KM</Text>
          </TouchableOpacity>

          <BottomSheet ref={bottomSheetRef} onChange={handleSheetChanges} index={-1} snapPoints={snapPoints}>
            <BottomSheetScrollView style={styles.contentContainer}>
              <View style={styles.repShopInfoContainer}>
                {withinTenKM ? (
                  <>
                    {nearbyRepShop && selectedRepShop !== null && nearbyRepShop[selectedRepShop] && (
                      <>
                        <View style={styles.shopHeaderCard}>
                          <View style={styles.picRepNameContainer}>
                            {nearbyRepShop[selectedRepShop].profilePic === null && (
                              <View
                                style={[
                                  styles.profilePicWrapper,
                                  {
                                    backgroundColor: nearbyRepShop[selectedRepShop].profileBG,
                                  },
                                ]}
                              >
                                <MaterialCommunityIcons name="car-wrench" size={50} color="#FFF" />
                              </View>
                            )}

                            {nearbyRepShop[selectedRepShop].profilePic !== null && (
                              <View style={styles.profilePicWrapper}>
                                <Image
                                  style={styles.profilePic}
                                  source={{
                                    uri: nearbyRepShop[selectedRepShop].profilePic,
                                  }}
                                  width={100}
                                  height={100}
                                />
                              </View>
                            )}

                            <View style={styles.repShopNameContainer}>
                              <Text style={styles.repShopName}>{nearbyRepShop[selectedRepShop].shopName}</Text>

                              <View style={styles.contactInfoRow}>
                                <View style={styles.genderNameContainer}>
                                  {nearbyRepShop[selectedRepShop].gender === 'Male' && (
                                    <Fontisto name="male" size={14} color="#555" />
                                  )}
                                  {nearbyRepShop[selectedRepShop].gender === 'Female' && (
                                    <Fontisto name="female" size={14} color="#555" />
                                  )}
                                  <Text
                                    style={styles.contactText}
                                  >{`${nearbyRepShop[selectedRepShop].ownerFirstname} ${nearbyRepShop[selectedRepShop].ownerLastname}`}</Text>
                                </View>
                              </View>

                              <View style={styles.contactInfoRow}>
                                <MaterialCommunityIcons name="phone" size={14} color="#000B58" />
                                <Text style={styles.contactText}>{nearbyRepShop[selectedRepShop].mobileNum}</Text>
                              </View>

                              {nearbyRepShop[selectedRepShop].email !== null && (
                                <View style={styles.contactInfoRow}>
                                  <MaterialCommunityIcons name="email" size={14} color="#000B58" />
                                  <Text style={styles.contactText}>{nearbyRepShop[selectedRepShop].email}</Text>
                                </View>
                              )}

                              <View style={styles.ratingContainer}>
                                <View style={styles.ratingItem}>
                                  <Fontisto name="persons" size={14} color="#555" />
                                  <Text style={styles.rating}>{nearbyRepShop[selectedRepShop].ratingsNum}</Text>
                                </View>
                                <View style={styles.ratingItem}>
                                  <MaterialIcons name="star-rate" size={16} color="#FDCC0D" />
                                  <Text style={styles.rating}>{nearbyRepShop[selectedRepShop].averageRating}</Text>
                                </View>
                                <View
                                  style={[
                                    styles.availabilityBadge,
                                    {
                                      backgroundColor:
                                        nearbyRepShop[selectedRepShop].availability === 'open' ? '#D1FAE5' : '#FEE2E2',
                                    },
                                  ]}
                                >
                                  <MaterialCommunityIcons
                                    name={
                                      nearbyRepShop[selectedRepShop].availability === 'open'
                                        ? 'clock-check'
                                        : 'clock-alert'
                                    }
                                    size={14}
                                    color={
                                      nearbyRepShop[selectedRepShop].availability === 'open' ? '#17B978' : '#DC2626'
                                    }
                                  />
                                  <Text
                                    style={[
                                      styles.availabilityText,
                                      {
                                        color:
                                          nearbyRepShop[selectedRepShop].availability === 'open'
                                            ? '#17B978'
                                            : '#DC2626',
                                      },
                                    ]}
                                  >
                                    {nearbyRepShop[selectedRepShop].availability === 'open'
                                      ? nearbyRepShop[selectedRepShop].availability.toUpperCase()
                                      : `${nearbyRepShop[selectedRepShop].availability.toUpperCase()}D`}
                                  </Text>
                                </View>
                              </View>
                            </View>
                          </View>
                        </View>

                        <View style={styles.buttonContainer}>
                          <TouchableOpacity style={styles.button} onPress={() => handleMakeRequest()}>
                            <MaterialCommunityIcons name="wrench" size={16} color="#FFF" />
                            <Text style={styles.buttonText}>Request Repair</Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            style={styles.button}
                            onPress={() => {
                              backRoute();
                              dispatch(
                                setSenderReceiverState({
                                  senderID: Number(userID),
                                  receiverID: Number(nearbyRepShop[selectedRepShop].repairShopID),
                                  role: 'car-owner',
                                })
                              );
                              router.replace('/chat-room/chat-room');
                            }}
                          >
                            <MaterialCommunityIcons name="chat" size={16} color="#FFF" />
                            <Text style={styles.buttonText}>Chat Shop</Text>
                          </TouchableOpacity>
                        </View>

                        {currentSnapPointIndex === 2 && (
                          <>
                            <View style={styles.shopImages}>
                              <View style={styles.sectionHeaderRow}>
                                <MaterialCommunityIcons name="image-multiple" size={20} color="#000B58" />
                                <Text style={styles.subHeader}>Shop Images</Text>
                              </View>

                              {nearbyRepShop[selectedRepShop].shopImages.length === 0 && (
                                <View style={styles.noImagesView}>
                                  <MaterialCommunityIcons name="image-off" size={48} color="#999" />
                                  <Text style={styles.noImagesText}>No Images</Text>
                                </View>
                              )}

                              {nearbyRepShop[selectedRepShop].shopImages.length !== 0 && (
                                <Carousel
                                  width={screenWidth * 0.9}
                                  height={300}
                                  data={nearbyRepShop[selectedRepShop].shopImages}
                                  mode="parallax"
                                  autoPlay={true}
                                  autoPlayInterval={3000}
                                  scrollAnimationDuration={2000}
                                  loop={true}
                                  renderItem={({ item }) => (
                                    <Image key={item} height={300} style={styles.image} source={{ uri: item }} />
                                  )}
                                />
                              )}
                            </View>

                            <View style={styles.servicesOffered}>
                              <View style={styles.sectionHeaderRow}>
                                <MaterialCommunityIcons name="tools" size={20} color="#000B58" />
                                <Text style={styles.subHeader}>Services Offered</Text>
                              </View>
                              {nearbyRepShop[selectedRepShop].servicesOffered.map((item) => (
                                <View key={item} style={styles.services}>
                                  <MaterialCommunityIcons name="check-circle" size={16} color="#10B981" />
                                  <Text style={styles.servicesText}>{item}</Text>
                                </View>
                              ))}
                            </View>
                          </>
                        )}

                        <Modal
                          animationType="fade"
                          transparent={true}
                          visible={modalVisible}
                          onRequestClose={() => {
                            setModalVisible(false);
                            setRequestType('');
                            setServiceType('');
                            setVehicleIssue('');
                            setError('');
                          }}
                        >
                          <View style={styles.modalOverlay}>
                            <TouchableWithoutFeedback
                              onPress={() => {
                                setModalVisible(false);
                                setRequestType('');
                                setServiceType('');
                                setVehicleIssue('');
                                setError('');
                              }}
                            >
                              <View style={styles.modalBackground} />
                            </TouchableWithoutFeedback>

                            <View style={styles.modalView}>
                              <View style={styles.modalHeader}>
                                <MaterialCommunityIcons name="wrench" size={24} color="#000B58" />
                                <Text style={styles.modalTitle}>Request Repair Service</Text>
                                <TouchableOpacity
                                  style={styles.modalCloseButton}
                                  onPress={() => {
                                    setModalVisible(false);
                                    setRequestType('');
                                    setServiceType('');
                                    setVehicleIssue('');
                                    setError('');
                                  }}
                                >
                                  <MaterialCommunityIcons name="close" size={24} color="#666" />
                                </TouchableOpacity>
                              </View>

                              <View style={styles.modalBody}>
                                <ScrollView ref={scrollRef}>
                                  <View style={styles.profileNameContainer}>
                                    {nearbyRepShop[selectedRepShop].profilePic === null && (
                                      <View
                                        style={[
                                          styles.profilePicWrapper,
                                          {
                                            backgroundColor: nearbyRepShop[selectedRepShop].profileBG,
                                          },
                                        ]}
                                      >
                                        <MaterialCommunityIcons name="car-wrench" size={50} color="#FFF" />
                                      </View>
                                    )}

                                    {nearbyRepShop[selectedRepShop].profilePic !== null && (
                                      <View style={styles.profilePicWrapper}>
                                        <Image
                                          style={styles.profilePic}
                                          source={{
                                            uri: nearbyRepShop[selectedRepShop].profilePic,
                                          }}
                                          width={100}
                                          height={100}
                                        />
                                      </View>
                                    )}

                                    <Text style={styles.repShopName}>{nearbyRepShop[selectedRepShop].shopName}</Text>
                                  </View>

                                  {vehicleID !== null && scanReference !== null && (
                                    <>
                                      <View style={{ paddingHorizontal: 20, paddingVertical: 16 }}>
                                        <View style={styles.textInputContainer}>
                                          <Text style={styles.textInputLabel}>Vehicle</Text>
                                          <TextInput style={styles.input} value={scannedVehicle} readOnly />
                                        </View>

                                        <View style={styles.textInputContainer}>
                                          <Text style={styles.textInputLabel}>Service Type</Text>
                                          <SelectDropdown
                                            data={['In-Shop Service', 'On-Site Service', 'Home Service']}
                                            onSelect={(selectedItem) => setServiceType(selectedItem)}
                                            renderButton={(selectedItem, isOpen) => (
                                              <View style={styles.dropdownButtonStyle}>
                                                <Text style={styles.dropdownButtonTxtStyle}>
                                                  {(selectedItem && `${selectedItem}`) || 'Select service type'}
                                                </Text>
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
                                                  ...(isSelected && {
                                                    backgroundColor: '#D2D9DF',
                                                  }),
                                                }}
                                              >
                                                <Text style={styles.dropdownItemTxtStyle}>{`${item}`}</Text>
                                              </View>
                                            )}
                                            showsVerticalScrollIndicator={false}
                                            dropdownStyle={styles.dropdownMenuStyle}
                                          />
                                        </View>

                                        <View style={styles.textInputContainer}>
                                          <Text style={styles.textInputLabel}>Vehicle Issue</Text>
                                          {codeInterpretation.map((item) => (
                                            <View key={item.vehicleDiagnosticID} style={styles.troubleCodeContainer}>
                                              <Text style={styles.troubleCodeText}>{item.dtc}</Text>
                                              <Text style={styles.troubleCodeText2}>{item.technicalDescription}</Text>
                                            </View>
                                          ))}
                                        </View>

                                        {error.length > 0 && (
                                          <View style={styles.errorContainer}>
                                            <Text style={styles.errorMessage}>{error}</Text>
                                          </View>
                                        )}
                                      </View>
                                    </>
                                  )}

                                  {vehicleID === null && scanReference === null && (
                                    <>
                                      <View style={{ paddingHorizontal: 20, paddingVertical: 16 }}>
                                        <View style={styles.textInputContainer}>
                                          <Text style={styles.textInputLabel}>Vehicle</Text>
                                          <SelectDropdown
                                            data={vehicles}
                                            onSelect={(selectedItem) => setSelectedVehicle(selectedItem.id)}
                                            renderButton={(selectedItem, isOpen) => (
                                              <View style={styles.dropdownButtonStyle}>
                                                <Text style={styles.dropdownButtonTxtStyle}>
                                                  {(selectedItem &&
                                                    `${selectedItem.year} ${selectedItem.make} ${selectedItem.model}`) ||
                                                    'Select vehicle'}
                                                </Text>
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
                                                  ...(isSelected && {
                                                    backgroundColor: '#D2D9DF',
                                                  }),
                                                }}
                                              >
                                                <Text
                                                  style={styles.dropdownItemTxtStyle}
                                                >{`${item.year} ${item.make} ${item.model}`}</Text>
                                              </View>
                                            )}
                                            showsVerticalScrollIndicator={false}
                                            dropdownStyle={styles.dropdownMenuStyle}
                                          />
                                        </View>

                                        <View style={styles.textInputContainer}>
                                          <Text style={styles.textInputLabel}>Request Type</Text>
                                          <SelectDropdown
                                            data={['Preventive Maintenance Service', 'Vehicle Repair']}
                                            onSelect={(selectedItem) => setRequestType(selectedItem)}
                                            renderButton={(selectedItem, isOpen) => (
                                              <View style={styles.dropdownButtonStyle}>
                                                <Text style={styles.dropdownButtonTxtStyle}>
                                                  {(selectedItem && `${selectedItem}`) || 'Select request type'}
                                                </Text>
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
                                                  ...(isSelected && {
                                                    backgroundColor: '#D2D9DF',
                                                  }),
                                                }}
                                              >
                                                <Text style={styles.dropdownItemTxtStyle}>{`${item}`}</Text>
                                              </View>
                                            )}
                                            showsVerticalScrollIndicator={false}
                                            dropdownStyle={styles.dropdownMenuStyle}
                                          />
                                        </View>

                                        <View style={styles.textInputContainer}>
                                          <Text style={styles.textInputLabel}>Service Type</Text>
                                          <SelectDropdown
                                            data={['In-Shop Service', 'On-Site Service', 'Home Service']}
                                            onSelect={(selectedItem) => setServiceType(selectedItem)}
                                            renderButton={(selectedItem, isOpen) => (
                                              <View style={styles.dropdownButtonStyle}>
                                                <Text style={styles.dropdownButtonTxtStyle}>
                                                  {(selectedItem && `${selectedItem}`) || 'Select service type'}
                                                </Text>
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
                                                  ...(isSelected && {
                                                    backgroundColor: '#D2D9DF',
                                                  }),
                                                }}
                                              >
                                                <Text style={styles.dropdownItemTxtStyle}>{`${item}`}</Text>
                                              </View>
                                            )}
                                            showsVerticalScrollIndicator={false}
                                            dropdownStyle={styles.dropdownMenuStyle}
                                          />
                                        </View>

                                        {requestType === 'Vehicle Repair' && (
                                          <View style={styles.textInputContainer}>
                                            <Text style={styles.textInputLabel}>Vehicle Issue Description</Text>
                                            <TextInput
                                              style={styles.textArea}
                                              placeholder="Describe vehicle issue"
                                              placeholderTextColor="#555"
                                              multiline={true}
                                              numberOfLines={5}
                                              value={vehicleIssue}
                                              onChangeText={setVehicleIssue}
                                              textAlignVertical="top"
                                            />
                                          </View>
                                        )}

                                        {error.length > 0 && (
                                          <View style={styles.errorContainer}>
                                            <Text style={styles.errorMessage}>{error}</Text>
                                          </View>
                                        )}
                                      </View>
                                    </>
                                  )}
                                </ScrollView>

                                <View style={styles.cancelSaveContainer}>
                                  <TouchableOpacity
                                    style={[styles.modalButton, { borderWidth: 1, borderColor: '#555' }]}
                                    onPress={() => {
                                      setModalVisible(false);
                                      setRequestType('');
                                      setServiceType('');
                                      setVehicleIssue('');
                                      setError('');
                                    }}
                                  >
                                    <Text style={[styles.modalButtonText, { color: '#555' }]}>Cancel</Text>
                                  </TouchableOpacity>

                                  <TouchableOpacity
                                    style={[
                                      styles.modalButton,
                                      { backgroundColor: '#000B58' },
                                      requestLoading && styles.modalButtonDisabled,
                                    ]}
                                    onPress={() => {
                                      if (vehicleID !== null && scanReference !== null) {
                                        handleSubmitRequest(
                                          nearbyRepShop[selectedRepShop].repairShopID,
                                          null,
                                          'with-obd2'
                                        );
                                      } else {
                                        handleSubmitRequestWithoutOBD2(nearbyRepShop[selectedRepShop].repairShopID);
                                      }
                                    }}
                                    disabled={requestLoading}
                                  >
                                    {requestLoading ? (
                                      <ActivityIndicator size="small" color="#FFF" />
                                    ) : (
                                      <Text style={[styles.modalButtonText, { color: '#FFF' }]}>Request</Text>
                                    )}
                                  </TouchableOpacity>
                                </View>
                              </View>
                            </View>
                          </View>
                        </Modal>
                      </>
                    )}
                  </>
                ) : (
                  <>
                    {regions && selectedRepShop !== null && regions[selectedRepShop] && (
                      <>
                        <View style={styles.shopHeaderCard}>
                          <View style={styles.picRepNameContainer}>
                            {regions[selectedRepShop].profilePic === null && (
                              <View
                                style={[
                                  styles.profilePicWrapper,
                                  {
                                    backgroundColor: regions[selectedRepShop].profileBG,
                                  },
                                ]}
                              >
                                <MaterialCommunityIcons name="car-wrench" size={50} color="#FFF" />
                              </View>
                            )}

                            {regions[selectedRepShop].profilePic !== null && (
                              <View style={styles.profilePicWrapper}>
                                <Image
                                  style={styles.profilePic}
                                  source={{
                                    uri: regions[selectedRepShop].profilePic,
                                  }}
                                  width={100}
                                  height={100}
                                />
                              </View>
                            )}

                            <View style={styles.repShopNameContainer}>
                              <Text style={styles.repShopName}>{regions[selectedRepShop].shopName}</Text>

                              <View style={styles.contactInfoRow}>
                                <View style={styles.genderNameContainer}>
                                  {regions[selectedRepShop].gender === 'Male' && (
                                    <Fontisto name="male" size={14} color="#555" />
                                  )}
                                  {regions[selectedRepShop].gender === 'Female' && (
                                    <Fontisto name="female" size={14} color="#555" />
                                  )}
                                  <Text
                                    style={styles.contactText}
                                  >{`${regions[selectedRepShop].ownerFirstname} ${regions[selectedRepShop].ownerLastname}`}</Text>
                                </View>
                              </View>

                              <View style={styles.contactInfoRow}>
                                <MaterialCommunityIcons name="phone" size={14} color="#000B58" />
                                <Text style={styles.contactText}>{regions[selectedRepShop].mobileNum}</Text>
                              </View>

                              {regions[selectedRepShop].email !== null && (
                                <View style={styles.contactInfoRow}>
                                  <MaterialCommunityIcons name="email" size={14} color="#000B58" />
                                  <Text style={styles.contactText}>{regions[selectedRepShop].email}</Text>
                                </View>
                              )}

                              <View style={styles.ratingContainer}>
                                <View style={styles.ratingItem}>
                                  <Fontisto name="persons" size={14} color="#555" />
                                  <Text style={styles.rating}>{regions[selectedRepShop].ratingsNum}</Text>
                                </View>
                                <View style={styles.ratingItem}>
                                  <MaterialIcons name="star-rate" size={16} color="#FDCC0D" />
                                  <Text style={styles.rating}>{regions[selectedRepShop].averageRating}</Text>
                                </View>
                                <View
                                  style={[
                                    styles.availabilityBadge,
                                    {
                                      backgroundColor:
                                        regions[selectedRepShop].availability === 'open' ? '#D1FAE5' : '#FEE2E2',
                                    },
                                  ]}
                                >
                                  <MaterialCommunityIcons
                                    name={
                                      regions[selectedRepShop].availability === 'open' ? 'clock-check' : 'clock-alert'
                                    }
                                    size={14}
                                    color={regions[selectedRepShop].availability === 'open' ? '#17B978' : '#DC2626'}
                                  />
                                  <Text
                                    style={[
                                      styles.availabilityText,
                                      {
                                        color: regions[selectedRepShop].availability === 'open' ? '#17B978' : '#DC2626',
                                      },
                                    ]}
                                  >
                                    {regions[selectedRepShop].availability === 'open'
                                      ? regions[selectedRepShop].availability.toUpperCase()
                                      : `${regions[selectedRepShop].availability.toUpperCase()}D`}
                                  </Text>
                                </View>
                              </View>
                            </View>
                          </View>
                        </View>

                        <View style={styles.buttonContainer}>
                          <TouchableOpacity style={styles.button} onPress={() => handleMakeRequest()}>
                            <MaterialCommunityIcons name="wrench" size={16} color="#FFF" />
                            <Text style={styles.buttonText}>Request Repair</Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            style={styles.button}
                            onPress={() => {
                              backRoute();
                              dispatch(
                                setSenderReceiverState({
                                  senderID: Number(userID),
                                  receiverID: Number(regions[selectedRepShop].repairShopID),
                                  role: 'car-owner',
                                })
                              );
                              router.replace('/chat-room/chat-room');
                            }}
                          >
                            <MaterialCommunityIcons name="chat" size={16} color="#FFF" />
                            <Text style={styles.buttonText}>Chat Shop</Text>
                          </TouchableOpacity>
                        </View>

                        {currentSnapPointIndex === 2 && (
                          <>
                            <View style={styles.shopImages}>
                              <View style={styles.sectionHeaderRow}>
                                <MaterialCommunityIcons name="image-multiple" size={20} color="#000B58" />
                                <Text style={styles.subHeader}>Shop Images</Text>
                              </View>

                              {regions[selectedRepShop].shopImages.length === 0 && (
                                <View style={styles.noImagesView}>
                                  <MaterialCommunityIcons name="image-off" size={48} color="#999" />
                                  <Text style={styles.noImagesText}>No Images</Text>
                                </View>
                              )}

                              {regions[selectedRepShop].shopImages.length !== 0 && (
                                <Carousel
                                  width={screenWidth * 0.9}
                                  height={300}
                                  data={regions[selectedRepShop].shopImages}
                                  mode="parallax"
                                  autoPlay={true}
                                  autoPlayInterval={3000}
                                  scrollAnimationDuration={2000}
                                  loop={true}
                                  renderItem={({ item }) => (
                                    <Image key={item} height={300} style={styles.image} source={{ uri: item }} />
                                  )}
                                />
                              )}
                            </View>

                            <View style={styles.servicesOffered}>
                              <View style={styles.sectionHeaderRow}>
                                <MaterialCommunityIcons name="tools" size={20} color="#000B58" />
                                <Text style={styles.subHeader}>Services Offered</Text>
                              </View>
                              {regions[selectedRepShop].servicesOffered.map((item) => (
                                <View key={item} style={styles.services}>
                                  <MaterialCommunityIcons name="check-circle" size={16} color="#10B981" />
                                  <Text style={styles.servicesText}>{item}</Text>
                                </View>
                              ))}
                            </View>
                          </>
                        )}

                        <Modal
                          animationType="fade"
                          transparent={true}
                          visible={modalVisible}
                          onRequestClose={() => {
                            setModalVisible(false);
                            setRequestType('');
                            setServiceType('');
                            setVehicleIssue('');
                            setError('');
                          }}
                        >
                          <View style={styles.modalOverlay}>
                            <TouchableWithoutFeedback
                              onPress={() => {
                                setModalVisible(false);
                                setRequestType('');
                                setServiceType('');
                                setVehicleIssue('');
                                setError('');
                              }}
                            >
                              <View style={styles.modalBackground} />
                            </TouchableWithoutFeedback>

                            <View style={styles.modalView}>
                              <View style={styles.modalHeader}>
                                <MaterialCommunityIcons name="wrench" size={24} color="#000B58" />
                                <Text style={styles.modalTitle}>Request Repair Service</Text>
                                <TouchableOpacity
                                  style={styles.modalCloseButton}
                                  onPress={() => {
                                    setModalVisible(false);
                                    setRequestType('');
                                    setServiceType('');
                                    setVehicleIssue('');
                                    setError('');
                                  }}
                                >
                                  <MaterialCommunityIcons name="close" size={24} color="#666" />
                                </TouchableOpacity>
                              </View>

                              <View style={styles.modalBody}>
                                <ScrollView ref={scrollRef}>
                                  <View style={styles.profileNameContainer}>
                                    {regions[selectedRepShop].profilePic === null && (
                                      <View
                                        style={[
                                          styles.profilePicWrapper,
                                          {
                                            backgroundColor: regions[selectedRepShop].profileBG,
                                          },
                                        ]}
                                      >
                                        <MaterialCommunityIcons name="car-wrench" size={50} color="#FFF" />
                                      </View>
                                    )}

                                    {regions[selectedRepShop].profilePic !== null && (
                                      <View style={styles.profilePicWrapper}>
                                        <Image
                                          style={styles.profilePic}
                                          source={{
                                            uri: regions[selectedRepShop].profilePic,
                                          }}
                                          width={100}
                                          height={100}
                                        />
                                      </View>
                                    )}

                                    <Text style={styles.repShopName}>{regions[selectedRepShop].shopName}</Text>
                                  </View>

                                  {vehicleID !== null && scanReference !== null && (
                                    <>
                                      <View style={{ paddingHorizontal: 20, paddingVertical: 16 }}>
                                        <View style={styles.textInputContainer}>
                                          <Text style={styles.textInputLabel}>Vehicle</Text>
                                          <TextInput style={styles.input} value={scannedVehicle} readOnly />
                                        </View>

                                        <View style={styles.textInputContainer}>
                                          <Text style={styles.textInputLabel}>Vehicle Issue</Text>
                                          {codeInterpretation.map((item) => (
                                            <View key={item.vehicleDiagnosticID} style={styles.troubleCodeContainer}>
                                              <Text style={styles.troubleCodeText}>{item.dtc}</Text>
                                              <Text style={styles.troubleCodeText2}>{item.technicalDescription}</Text>
                                            </View>
                                          ))}
                                        </View>

                                        {error.length > 0 && (
                                          <View style={styles.errorContainer}>
                                            <Text style={styles.errorMessage}>{error}</Text>
                                          </View>
                                        )}
                                      </View>
                                    </>
                                  )}

                                  {vehicleID === null && scanReference === null && (
                                    <>
                                      <View style={{ paddingHorizontal: 20, paddingVertical: 16 }}>
                                        <View style={styles.textInputContainer}>
                                          <Text style={styles.textInputLabel}>Vehicle</Text>
                                          <SelectDropdown
                                            data={vehicles}
                                            onSelect={(selectedItem) => setSelectedVehicle(selectedItem.id)}
                                            renderButton={(selectedItem, isOpen) => (
                                              <View style={styles.dropdownButtonStyle}>
                                                <Text style={styles.dropdownButtonTxtStyle}>
                                                  {(selectedItem &&
                                                    `${selectedItem.year} ${selectedItem.make} ${selectedItem.model}`) ||
                                                    'Select vehicle'}
                                                </Text>
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
                                                  ...(isSelected && {
                                                    backgroundColor: '#D2D9DF',
                                                  }),
                                                }}
                                              >
                                                <Text
                                                  style={styles.dropdownItemTxtStyle}
                                                >{`${item.year} ${item.make} ${item.model}`}</Text>
                                              </View>
                                            )}
                                            showsVerticalScrollIndicator={false}
                                            dropdownStyle={styles.dropdownMenuStyle}
                                          />
                                        </View>

                                        <View style={styles.textInputContainer}>
                                          <Text style={styles.textInputLabel}>Request Type</Text>
                                          <SelectDropdown
                                            data={['Preventive Maintenance Service', 'Vehicle Repair']}
                                            onSelect={(selectedItem) => setRequestType(selectedItem)}
                                            renderButton={(selectedItem, isOpen) => (
                                              <View style={styles.dropdownButtonStyle}>
                                                <Text style={styles.dropdownButtonTxtStyle}>
                                                  {(selectedItem && `${selectedItem}`) || 'Select request type'}
                                                </Text>
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
                                                  ...(isSelected && {
                                                    backgroundColor: '#D2D9DF',
                                                  }),
                                                }}
                                              >
                                                <Text style={styles.dropdownItemTxtStyle}>{`${item}`}</Text>
                                              </View>
                                            )}
                                            showsVerticalScrollIndicator={false}
                                            dropdownStyle={styles.dropdownMenuStyle}
                                          />
                                        </View>

                                        <View style={styles.textInputContainer}>
                                          <Text style={styles.textInputLabel}>Service Type</Text>
                                          <SelectDropdown
                                            data={['In-Shop Service', 'On-Site Service', 'Home Service']}
                                            onSelect={(selectedItem) => setServiceType(selectedItem)}
                                            renderButton={(selectedItem, isOpen) => (
                                              <View style={styles.dropdownButtonStyle}>
                                                <Text style={styles.dropdownButtonTxtStyle}>
                                                  {(selectedItem && `${selectedItem}`) || 'Select service type'}
                                                </Text>
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
                                                  ...(isSelected && {
                                                    backgroundColor: '#D2D9DF',
                                                  }),
                                                }}
                                              >
                                                <Text style={styles.dropdownItemTxtStyle}>{`${item}`}</Text>
                                              </View>
                                            )}
                                            showsVerticalScrollIndicator={false}
                                            dropdownStyle={styles.dropdownMenuStyle}
                                          />
                                        </View>

                                        {requestType === 'Vehicle Repair' && (
                                          <View style={styles.textInputContainer}>
                                            <Text style={styles.textInputLabel}>Vehicle Issue Description</Text>
                                            <TextInput
                                              style={styles.textArea}
                                              placeholder="Describe vehicle issue"
                                              placeholderTextColor="#555"
                                              multiline={true}
                                              numberOfLines={5}
                                              value={vehicleIssue}
                                              onChangeText={setVehicleIssue}
                                              textAlignVertical="top"
                                            />
                                          </View>
                                        )}

                                        {error.length > 0 && (
                                          <View style={styles.errorContainer}>
                                            <Text style={styles.errorMessage}>{error}</Text>
                                          </View>
                                        )}
                                      </View>
                                    </>
                                  )}
                                </ScrollView>

                                <View style={styles.cancelSaveContainer}>
                                  <TouchableOpacity
                                    style={[styles.modalButton, { borderWidth: 1, borderColor: '#555' }]}
                                    onPress={() => {
                                      setModalVisible(false);
                                      setRequestType('');
                                      setServiceType('');
                                      setVehicleIssue('');
                                      setError('');
                                    }}
                                  >
                                    <Text style={[styles.modalButtonText, { color: '#555' }]}>Cancel</Text>
                                  </TouchableOpacity>

                                  <TouchableOpacity
                                    style={[
                                      styles.modalButton,
                                      { backgroundColor: '#000B58' },
                                      requestLoading && styles.modalButtonDisabled,
                                    ]}
                                    onPress={() => {
                                      if (vehicleID !== null && scanReference !== null) {
                                        handleSubmitRequest(regions[selectedRepShop].repairShopID, null, 'with-obd2');
                                      } else {
                                        handleSubmitRequestWithoutOBD2(regions[selectedRepShop].repairShopID);
                                      }
                                    }}
                                    disabled={requestLoading}
                                  >
                                    {requestLoading ? (
                                      <ActivityIndicator size="small" color="#FFF" />
                                    ) : (
                                      <Text style={[styles.modalButtonText, { color: '#FFF' }]}>Request</Text>
                                    )}
                                  </TouchableOpacity>
                                </View>
                              </View>
                            </View>
                          </View>
                        </Modal>
                      </>
                    )}
                  </>
                )}
              </View>
            </BottomSheetScrollView>
          </BottomSheet>
        </View>
      </GestureHandlerRootView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f4f7',
  },
  lowerBox: {
    flex: 1,
    position: 'relative',
  },
  tenKMButton: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    alignSelf: 'center',
    top: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 4,
  },
  tenKMButtonText: {
    fontFamily: 'BodyBold',
    fontSize: 14,
  },
  map: {
    width: '100%',
    flex: 1,
  },
  contentContainer: {
    width: '100%',
  },
  repShopInfoContainer: {
    width: '90%',
    alignSelf: 'center',
    marginBottom: 100,
  },
  shopHeaderCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  picRepNameContainer: {
    flexDirection: 'row',
    gap: 20,
    width: '100%',
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
  repShopNameContainer: {
    width: '63%',
    gap: 4,
  },
  repShopName: {
    fontFamily: 'BodyBold',
    color: '#333',
    fontSize: 20,
    marginBottom: 4,
  },
  contactInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  genderNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  contactText: {
    fontFamily: 'BodyRegular',
    color: '#555',
    fontSize: 13,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
    flexWrap: 'wrap',
  },
  ratingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  rating: {
    fontFamily: 'BodyRegular',
    color: '#555',
    fontSize: 13,
  },
  availabilityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  availabilityText: {
    fontFamily: 'BodyBold',
    fontSize: 11,
  },
  buttonContainer: {
    justifyContent: 'space-evenly',
    width: '100%',
    marginTop: 0,
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderBottomWidth: 1,
    borderColor: '#EAEAEA',
    paddingBottom: 20,
    gap: 10,
  },
  button: {
    backgroundColor: '#000B58',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: 140,
    padding: 10,
    borderRadius: 8,
    gap: 6,
  },
  buttonText: {
    fontFamily: 'BodyRegular',
    fontSize: 13,
    color: '#FFF',
  },
  shopImages: {
    width: '100%',
    marginTop: 20,
    paddingBottom: 20,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  subHeader: {
    fontFamily: 'BodyBold',
    color: '#333',
    fontSize: 18,
  },
  image: {
    flex: 1,
    borderRadius: 8,
  },
  noImagesView: {
    backgroundColor: '#F3F4F6',
    minHeight: 200,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    gap: 12,
  },
  noImagesText: {
    fontFamily: 'BodyRegular',
    color: '#999',
    fontSize: 15,
  },
  servicesOffered: {
    width: '100%',
  },
  services: {
    width: '100%',
    flexDirection: 'row',
    gap: 8,
    paddingLeft: 5,
    alignItems: 'center',
    marginBottom: 6,
  },
  servicesText: {
    fontFamily: 'BodyRegular',
    color: '#333',
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
    backgroundColor: '#FFFFFF',
    width: '90%',
    maxWidth: 600,
    maxHeight: '90%',
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
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
    gap: 12,
  },
  modalTitle: {
    fontFamily: 'HeadingBold',
    fontSize: 18,
    color: '#000B58',
    flex: 1,
  },
  modalCloseButton: {
    padding: 4,
    borderRadius: 8,
  },
  modalBody: {
    maxHeight: '90%',
  },
  profileNameContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  textInputContainer: {
    gap: 10,
    marginTop: 10,
    width: '100%',
  },
  textInputLabel: {
    fontFamily: 'BodyBold',
    fontSize: 13,
    color: '#000B58',
    marginBottom: 4,
  },
  dropdownButtonStyle: {
    width: '100%',
    height: 50,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  dropdownButtonTxtStyle: {
    flex: 1,
    color: '#1F2937',
    fontSize: 15,
    fontFamily: 'BodyRegular',
  },
  dropdownButtonArrowStyle: {
    fontSize: 22,
    color: '#6B7280',
  },
  dropdownMenuStyle: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  dropdownItemStyle: {
    width: '100%',
    flexDirection: 'row',
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 8,
  },
  dropdownItemTxtStyle: {
    flex: 1,
    color: '#1F2937',
    fontSize: 15,
    fontFamily: 'BodyRegular',
  },
  textArea: {
    backgroundColor: '#FFFFFF',
    width: '100%',
    minHeight: 120,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    padding: 14,
    color: '#1F2937',
    fontSize: 15,
    fontFamily: 'BodyRegular',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  input: {
    backgroundColor: '#F9FAFB',
    width: '100%',
    height: 50,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
    color: '#6B7280',
    fontSize: 15,
    fontFamily: 'BodyRegular',
  },
  cancelSaveContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
  },
  modalButton: {
    width: '30%',
    height: 45,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  modalButtonDisabled: {
    backgroundColor: '#666666',
    opacity: 0.6,
  },
  modalButtonText: {
    fontFamily: 'HeaderBold',
  },
  troubleCodeContainer: {
    backgroundColor: '#FEF2F2',
    marginBottom: 5,
    width: '100%',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#DC2626',
    padding: 14,
    shadowColor: '#DC2626',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  troubleCodeText: {
    fontFamily: 'BodyBold',
    fontSize: 16,
    color: '#DC2626',
    marginBottom: 6,
  },
  troubleCodeText2: {
    fontFamily: 'BodyRegular',
    color: '#6B7280',
    fontSize: 14,
    lineHeight: 20,
  },
  errorContainer: {
    backgroundColor: '#FEE2E2',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#DC2626',
    width: '100%',
    padding: 14,
    marginTop: 12,
    shadowColor: '#DC2626',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  errorMessage: {
    fontFamily: 'BodyBold',
    color: '#DC2626',
    textAlign: 'center',
    fontSize: 13,
  },
});

export default RepairShops;
