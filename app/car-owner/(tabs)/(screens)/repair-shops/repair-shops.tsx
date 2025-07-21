import { Header } from '@/components/Header';
import { Loading } from '@/components/Loading';
import { RootState } from '@/redux/store';
import { getRepairShops } from '@/services/backendApi';
import Fontisto from '@expo/vector-icons/Fontisto';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { useFocusEffect } from '@react-navigation/native';
import * as Location from 'expo-location';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import MapView, { Circle, Marker, Region } from 'react-native-maps';
import Carousel from 'react-native-reanimated-carousel';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';

const repairShops = () => {
    const mapRef = useRef<MapView | null>(null);
    const bottomSheetRef = useRef<BottomSheet | null>(null);
    const { width: screenWidth } = Dimensions.get('window');
    const [regions, setRegions] = useState<{ latitude: number, longitude: number, shopName: string, ownerFirstname: string, ownerLastname: string, gender: string, mobileNum: string, email: string | null, profilePic: string, profileBG: string, shopImages: string[], servicesOffered: string[], ratingsNum: number, averageRating: number }[] | undefined>(undefined);
    const [nearbyRepShop, setNearbyRepShop] = useState<{ latitude: number, longitude: number, shopName: string, ownerFirstname: string, ownerLastname: string, gender: string, mobileNum: string, email: string | null, profilePic: string, profileBG: string, shopImages: string[], servicesOffered: string[], ratingsNum: number, averageRating: number }[] | undefined>(undefined);
    const [currentLocation, setCurrentLocation] = useState<Region | undefined>(undefined);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [selectedRepShop, setSelectedRepShop] = useState<number | null>(null);
    const [currentSnapPointIndex, setCurrentSnapPointIndex] = useState<number>(-1);
    const [refreshKey, setRefreshKey] = useState(0);
    const maxDistanceKM: number = 5;
    const snapPoints = useMemo(() => ['37%', '99.9%'], []);
    const vehicleDiagIDs: number[] | null = useSelector((state: RootState) => state.vehicleDiagIDArr.vehicleDiagIDArr);

    const handleRefresh = () => {
        setRefreshKey(prev => prev + 1);
    };

    useFocusEffect(
        useCallback(() => {
            handleRefresh();
            let isActive = true;

            const fetchData = async () => {
                try {
                    setIsLoading(true);
                    const res = await getRepairShops();

                    if (!isActive) return;

                    setRegions(res.map((shop: any) => ({
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
                    })));

                } catch (e) {
                    console.error('Error:', e);

                } finally {
                    if (isActive) setIsLoading(false);
                }
            };

            fetchData();

            return () => {
                isActive = false;
            };
        }, [])
    );

    useEffect(() => {
        let locationSubscription: Location.LocationSubscription;

        (async () => {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                console.warn('Permission to access location was denied');
                return;
            }

            locationSubscription = await Location.watchPositionAsync(
                {
                    accuracy: Location.Accuracy.High,
                    timeInterval: 5000,
                    distanceInterval: 10,
                },
                (location) => {
                    const newLocation = {
                        latitude: location.coords.latitude,
                        longitude: location.coords.longitude,
                        latitudeDelta: 0.01,
                        longitudeDelta: 0.01,
                    };

                    setCurrentLocation(newLocation);

                    const nearby = regions?.filter((loc) => {
                        const distance = getDistance(
                            newLocation.latitude,
                            newLocation.longitude,
                            loc.latitude,
                            loc.longitude
                        );
                        return distance <= maxDistanceKM;
                    });

                    setNearbyRepShop(nearby);

                    const allCoords = [newLocation, ...(nearby || [])].map((coord) => ({
                        latitude: coord.latitude,
                        longitude: coord.longitude,
                    }));

                    mapRef.current?.fitToCoordinates(allCoords, {
                        edgePadding: { top: 300, right: 300, bottom: 300, left: 300 },
                        animated: true,
                    });
                }
            );
        })();

        return () => {
            if (locationSubscription) {
                locationSubscription.remove();
            }
        };
    }, [regions]);


    const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
        const toRad = ((deg: number) => (deg * Math.PI) / 180);
        const R = 6371;

        const dLat = toRad(lat2 - lat1);
        const dLon = toRad(lon2 - lon1);

        const a =
            Math.sin(dLat / 2) ** 2 +
            Math.cos(toRad(lat1)) *
            Math.cos(toRad(lat2)) *
            Math.sin(dLon / 2) ** 2;

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };

    const handleSheetChanges = useCallback((index: number) => {
        console.log('handleSheetChanges', index);
        setCurrentSnapPointIndex(index);
        if (index === 0) {
            bottomSheetRef.current?.close();
        };
    }, []);

    if (isLoading) {
        return <Loading />
    };

    return (
        <SafeAreaView key={refreshKey} style={styles.container}>
            <GestureHandlerRootView>
                <Header headerTitle='Repair Shops' link='/car-owner/(tabs)' />

                <View style={styles.lowerBox}>
                    <MapView
                        ref={mapRef} 
                        mapType='hybrid'
                        style={styles.map}
                        initialRegion={currentLocation}
                    >
                        {currentLocation && (
                            <>
                                <Marker
                                    coordinate={{
                                        latitude: currentLocation.latitude,
                                        longitude: currentLocation.longitude,
                                    }}
                                    image={require('../../../../../assets/images/circle-marker.png')}
                                    title='You'
                                />

                                <Circle 
                                    center={{
                                        latitude: currentLocation. latitude,
                                        longitude: currentLocation.longitude,
                                    }}
                                    radius={5000}
                                    strokeColor='rgba(0, 122, 255, 0.8)'
                                    fillColor='rgba(0, 122, 255, 0.3)'
                                />
                            </>
                        )}

                        {nearbyRepShop?.map((loc, index) => (
                            <Marker
                                key={index}
                                coordinate={{
                                    latitude: loc.latitude,
                                    longitude: loc.longitude,
                                }}
                                title={loc.shopName}
                                onPress={() => {
                                    bottomSheetRef.current?.snapToIndex(1);
                                    setSelectedRepShop(index);
                                }}
                            />
                        ))}
                    </MapView>

                    <BottomSheet
                        ref={bottomSheetRef}
                        onChange={handleSheetChanges}
                        index={-1}
                        snapPoints={snapPoints}
                    >
                        <BottomSheetScrollView style={styles.contentContainer}>
                            <View style={styles.repShopInfoContainer}>
                                {nearbyRepShop && selectedRepShop !== null && nearbyRepShop[selectedRepShop] && (
                                    <>
                                        <View style={styles.picRepNameContainer}>
                                            {nearbyRepShop[selectedRepShop].profilePic === null && (
                                                <View style={[styles.profilePicWrapper, { backgroundColor: nearbyRepShop[selectedRepShop].profileBG }]}>
                                                    <MaterialCommunityIcons name='car-wrench' size={50} color='#FFF' />
                                                </View>
                                            )}

                                            {nearbyRepShop[selectedRepShop].profilePic !== null && (
                                                <View style={styles.profilePicWrapper}>
                                                    <Image
                                                        style={styles.profilePic}
                                                        source={{ uri: nearbyRepShop[selectedRepShop].profilePic }}
                                                        width={100}
                                                        height={100}
                                                    />
                                                </View>
                                            )}

                                            <View style={styles.repShopNameContainer}>
                                                <Text style={styles.repShopName}>{nearbyRepShop[selectedRepShop].shopName}</Text>
                                                <View style={styles.genderNameContainer}>
                                                    {nearbyRepShop[selectedRepShop].gender === 'Male' && (
                                                        <>
                                                            <Fontisto name='male' size={16} color='#555' />
                                                        </>
                                                    )}

                                                    {nearbyRepShop[selectedRepShop].gender === 'Female' && (
                                                        <>
                                                            <Fontisto name='female' size={16} color='#555' />
                                                        </>
                                                    )}
                                                    <Text style={styles.contactText}>{`${nearbyRepShop[selectedRepShop].ownerFirstname} ${nearbyRepShop[selectedRepShop].ownerLastname}`}</Text>
                                                </View>

                                                <Text style={styles.contactText}>{nearbyRepShop[selectedRepShop].mobileNum}</Text>

                                                {nearbyRepShop[selectedRepShop].email !== null && (
                                                    <Text style={styles.contactText}>{nearbyRepShop[selectedRepShop].email}</Text>
                                                )}

                                                <View style={styles.ratingContainer}>
                                                    <Fontisto name='persons' size={16} color='#555' />
                                                    <Text style={styles.rating}>{nearbyRepShop[selectedRepShop].ratingsNum}</Text>
                                                    <MaterialIcons name='star-rate' size={16} color='#FDCC0D' />
                                                    <Text style={styles.rating}>{nearbyRepShop[selectedRepShop].averageRating}</Text>
                                                </View>
                                            </View>
                                        </View>

                                        <View style={styles.buttonContainer}>
                                            <TouchableOpacity style={styles.button}>
                                                <Text style={styles.buttonText}>Request Repair</Text>
                                            </TouchableOpacity>

                                            <TouchableOpacity style={styles.button}>
                                                <Text style={styles.buttonText}>Chat Shop</Text>
                                            </TouchableOpacity>
                                        </View>

                                        {currentSnapPointIndex === 2 && (
                                            <>
                                                <View style={styles.shopImages}>
                                                    <Text style={styles.subHeader}>Shop Images</Text>

                                                    {nearbyRepShop[selectedRepShop].shopImages.length === 0 && (
                                                        <View style={styles.noImagesView} >
                                                            <Text style={styles.noImagesText}>No Images</Text>
                                                        </View>
                                                    )}

                                                    {nearbyRepShop[selectedRepShop].shopImages.length !== 0 && (
                                                        <Carousel
                                                            width={screenWidth * 0.9}
                                                            height={300}
                                                            data={nearbyRepShop[selectedRepShop].shopImages}
                                                            mode='parallax'
                                                            autoPlay={true}
                                                            autoPlayInterval={3000}
                                                            scrollAnimationDuration={2000}
                                                            loop={true}
                                                            renderItem={({ item }) => (
                                                            <Image
                                                                key={item}
                                                                height={300}
                                                                style={styles.image}
                                                                source={{ uri: item }}
                                                            />
                                                            )}
                                                        />
                                                    )}
                                                </View>

                                                <View style={styles.servicesOffered}>
                                                    <Text style={styles.subHeader}>Services Offered</Text>
                                                    {nearbyRepShop[selectedRepShop].servicesOffered.map((item) => (
                                                        <View key={item} style={styles.services}>
                                                            <Text style={styles.bullet}>{`\u2022`}</Text>
                                                            <Text style={styles.servicesText}>{item}</Text>
                                                        </View>
                                                    ))}
                                                </View>
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
    )
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF',
    },
    lowerBox: {
        flex: 1,
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
    },
    repShopName: {
        fontFamily: 'LeagueSpartan_Bold',
        color: '#333',
        fontSize: 22,
    },
    genderNameContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
    },
    contactText: {
        fontFamily: 'LeagueSpartan',
        color: '#555',
        fontSize: 16,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
    },
    rating: {
        fontFamily: 'LeagueSpartan',
        color: '#555',
        fontSize: 16,
    },
    buttonContainer: {
        justifyContent: 'space-evenly',
        width: '100%',
        marginTop: 10,
        flexDirection: 'row',
        flexWrap: 'wrap',
        borderBottomWidth: 1,
        borderColor: '#EAEAEA',
        paddingBottom: 20,
    },
    button: {
        backgroundColor: '#000B58',
        justifyContent: 'center',
        alignItems: 'center',
        width: 110,
        padding: 5,
        borderRadius: 5,
    },
    buttonText: {
        fontFamily: 'LeagueSpartan',
        fontSize: 14,
        color: '#FFF',
    },
    shopImages: {
        width: '100%',
        marginTop: 20,
        paddingBottom: 20,
    },
    subHeader: {
        fontFamily: 'LeagueSpartan_Bold',
        color: '#333',
        fontSize: 20,
        marginBottom: 10,
    },
    image: {
        flex: 1,
        borderRadius: 8,
    },
    noImagesView: {
        backgroundColor: '#D9D9D9',
        minHeight: 200,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
    },
    noImagesText: {
        fontFamily: 'LeagueSpartan',
        fontSize: 16,
        color: '#555'
    },
    servicesOffered: {
        width: '100%',
    },
    services: {
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
    servicesText: {
        fontFamily: 'LeagueSpartan',
        color: '#333',
        fontSize: 16,
    },
})

export default repairShops;