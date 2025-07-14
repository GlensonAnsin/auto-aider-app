import { Header } from '@/components/Header';
import { getRepairShops } from '@/services/backendApi';
import * as Location from 'expo-location';
import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';

const repaiShops = () => {
    const [regions, setRegions] = useState<Region[] | undefined>(undefined);
    const [currentLocation, setCurrentLocation] = useState<Region | undefined>(undefined);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    useEffect(() => {
        (async () => {
            try {
                setIsLoading(true);
                const res = await getRepairShops();
                setRegions(res.map((shop: any) => ({
                    latitude: parseFloat(shop.latitude),
                    longitude: parseFloat(shop.longitude),
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                })));

            } catch (e) {
                console.error('Error:', e);

            } finally {
                setIsLoading(false);
            }
        })
    });

    useEffect(() => {
        (async () => {
          let { status } = await Location.requestForegroundPermissionsAsync();
          if (status !== 'granted') {
            console.warn('Permission to access location was denied');
            return;
          }
    
          let location = await Location.getCurrentPositionAsync({});
          setCurrentLocation({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          });
        })();
    }, []);

    return (
        <SafeAreaView style={styles.container}>
            <Header headerTitle='Repair Shops' link='/car-owner/(tabs)' />

            <View style={styles.lowerBox}>
                <MapView 
                    mapType='hybrid'
                    style={styles.map}
                    initialRegion={currentLocation}
                >
                    {currentLocation && (
                    <Marker
                        coordinate={{
                            latitude: currentLocation.latitude,
                            longitude: currentLocation.longitude,
                        }}
                        image={require('../../../../../assets/images/circle-marker.png')}
                    />
                  )}
                </MapView>
            </View>
        </SafeAreaView>
    )
    };

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF',
    },
    lowerBox: {},
    map: {
        width: '100%',
        height: 500,
    },
})

export default repaiShops;