import { popRouteState } from '@/redux/slices/routeSlice';
import { RootState } from '@/redux/store';
import { useRouter } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useDispatch, useSelector } from 'react-redux';

interface HeaderProps {
  headerTitle: string;
}

export const Header = ({ headerTitle }: HeaderProps) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const routes: any[] = useSelector((state: RootState) => state.route.route);

  return (
    <View style={styles.upperBox}>
      <View style={styles.arrowHeaderContainer}>
        <TouchableOpacity
          style={styles.arrowWrapper}
          onPress={() => {
            router.replace(routes[routes.length - 1]);
            dispatch(popRouteState());
          }}
        >
          <Icon name="arrow-left" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.header}>{headerTitle}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  upperBox: {
    backgroundColor: '#000B58',
    justifyContent: 'center',
    alignItems: 'center',
    height: 63,
  },
  arrowHeaderContainer: {
    flexDirection: 'row',
    width: '90%',
    alignItems: 'center',
    gap: 10,
  },
  header: {
    color: '#FFF',
    fontFamily: 'HeaderBold',
    fontSize: 18,
  },
  arrowWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
