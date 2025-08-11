import { Header } from '@/components/Header'
import React from 'react'
import { ScrollView, StyleSheet, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

const RepairRequestDetails = () => {
    return (
        <SafeAreaView style={styles.container}>
            <ScrollView>
                <Header headerTitle='Request Details' />

                <View style={styles.lowerBox}></View>
            </ScrollView>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF',
    },
    lowerBox: {},
})

export default RepairRequestDetails