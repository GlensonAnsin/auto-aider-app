import { Header } from '@/components/Header'
import { ScrollView, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

const repairHistory = () => {
  return (
    <SafeAreaView style={styles.container}>
        <ScrollView>
            <Header headerTitle='Repair History' />
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

export default repairHistory;