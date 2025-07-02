import { useRouter } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface HeaderProps {
    headerTitle: string;
    link: any
};

export const Header = ({ headerTitle, link }: HeaderProps) => {
    const router = useRouter();
    
    return (
        <View style={styles.upperBox}>
            <Text style={styles.header}>{`|  ${headerTitle}`}</Text>
            <TouchableOpacity style={styles.arrowWrapper} onPress={() => router.replace(link)}>
                <Icon name='arrow-left' style={styles.arrowBack} />
            </TouchableOpacity>
        </View>
    )
}

const styles = StyleSheet.create({
    upperBox: {
        backgroundColor: '#000B58',
        justifyContent: 'center',
        alignItems: 'flex-start',
        height: 63,
    },
    header: {
        color: '#FFF',
        fontFamily: 'LeagueSpartan_Bold',
        fontSize: 22,
        marginLeft: 50,
    },
    arrowWrapper: {
        top: 23,
        right: 320,
        position: 'absolute',
    },
    arrowBack: {
        fontSize: 22,
        color: '#FFF',
    },
})