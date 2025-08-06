import { Header } from '@/components/Header'
import { ScrollView, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

const repairRequests = () => {
  return (
    <SafeAreaView style={styles.container}>
        <ScrollView>
            <Header headerTitle='Repair Requests' />
        </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF',
    },
})

export default repairRequests;