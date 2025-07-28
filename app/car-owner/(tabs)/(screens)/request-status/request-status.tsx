import { Header } from '@/components/Header';
import { getRepairShops, getRequestsForCarOwner } from '@/services/backendApi';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const RequestStatus = () => {
    dayjs.extend(utc);
    dayjs.extend(timezone);
    const guessTimezone = dayjs.tz.guess();
    
    const [requestStatus, setRequestStatus] = useState<{ vehicleName: string, repairShop: string, scanReference: string, datetime: string, status: string }[]>([]);

    useEffect(() => {
        (async () => {
            try {
                const res1 = await getRequestsForCarOwner();
                const res2 = await getRepairShops();

                const statusData: { vehicleName: string, repairShop: string, scanReference: string, datetime: string, status: string }[] = [];

                res1?.vehicles?.forEach((vehicle: any) => {
                    const vehicleName = `${vehicle.year} ${vehicle.make} ${vehicle.model}`;
                    vehicle?.vehicle_diagnostics?.forEach((diagnostic: any) => {
                        const scanReference = diagnostic.scan_reference;
                        diagnostic?.mechanic_requests?.forEach((request: any) => {
                            const repairShop = res2.find((shop: any) => shop.repair_shop_id === request.repair_shop_id);
                            const datetime = dayjs(request.request_datetime).utc(true).tz(guessTimezone).format();
                            if (repairShop) {
                                statusData.push({
                                    vehicleName,
                                    repairShop: repairShop.shop_name,
                                    scanReference,
                                    datetime: dayjs(datetime).utc(true).tz(guessTimezone).format("ddd MMM DD YYYY, h:mm A"),
                                    status: request.status,
                                });
                            }
                        });
                    });
                });

                setRequestStatus(statusData);

            } catch (e) {
                console.error('Error: ', e);
            }
        })();
    }, []);

    const grouped = Object.values(
        requestStatus.reduce((acc, item) => {
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

        }, {} as Record<string, { vehicleName: string; repairShop: string; scanReference: string; datetime: string; status: string; }>)
    );

    return (
        <SafeAreaView style={styles.container}>
        <ScrollView>
            <Header headerTitle='Request Status' link='/car-owner/(tabs)' />

            <View style={styles.lowerBox}>
                {grouped.length !== 0 && (
                    <>
                        {grouped.map((item, index) => (
                            <TouchableOpacity key={index} style={styles.requestButton}>
                                <View style={styles.vehicleShopContainer}>
                                    <Text style={styles.vehicleName}>{item.vehicleName}</Text>
                                    <Text style={styles.requestText}>{item.repairShop}</Text>
                                    <Text style={styles.requestText}>{item.datetime}</Text>
                                </View>
                                <View style={styles.statusContainer}>
                                    <Text style={styles.statusText}>{item.status}</Text>
                                    <View style={[styles.statusColor, { backgroundColor:
                                        item.status === 'Pending'
                                        ? '#FFC107'
                                        : item.status === 'Rejected'
                                        ? '#F44336'
                                        : item.status === 'Ongoing'
                                        ? '#2196F3'
                                        : '#4CAF50'
                                    }]}></View>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </>
                )}

                {grouped.length === 0 && (
                    <Text style={styles.noRequestText}>-- No Requests --</Text>
                )}
            </View>
        </ScrollView>
        </SafeAreaView>
    )
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
    vehicleShopContainer: {

    },
    vehicleName: {
        fontFamily: 'LeagueSpartan_Bold',
        color: '#333',
        fontSize: 18,
    },
    requestText: {
        fontFamily: 'LeagueSpartan_Bold',
        color: '#555',
        fontSize: 14,
    },
    statusContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 10,
    },
    statusColor: {
        width: 10,
        height: 10,
        borderRadius: 10
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
  },
})

export default RequestStatus;