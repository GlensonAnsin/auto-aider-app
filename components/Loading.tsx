import { ActivityIndicator, StyleSheet, View } from "react-native";

export const Loading = () => {
    return (
        <View style={styles.loadingContainer}>
            <ActivityIndicator size='large' color='#000B58' />
        </View>
    ) 
}

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
})