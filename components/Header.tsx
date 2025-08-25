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
      <Text style={styles.header}>{`|  ${headerTitle}`}</Text>
      <TouchableOpacity
        style={styles.arrowWrapper}
        onPress={() => {
          router.replace(routes[routes.length - 1]);
          dispatch(popRouteState());
        }}
      >
        <Icon name="arrow-left" style={styles.arrowBack} />
      </TouchableOpacity>
    </View>
  );
};

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
});
