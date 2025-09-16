import { popRouteState } from '@/redux/slices/routeSlice';
import { RootState } from '@/redux/store';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { BackHandler } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

export function BackHandlerManager() {
  const dispatch = useDispatch();
  const router = useRouter();
  const routes: any[] = useSelector((state: RootState) => state.route.route);

  useEffect(() => {
    let backHandler: any;
    if (routes.length === 0) {
      BackHandler.exitApp();
    } else {
      const backAction = () => {
        router.replace(routes[routes.length - 1]);
        dispatch(popRouteState());
        return true;
      };

      backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    }

    return () => {
      if (backHandler) {
        backHandler.remove();
      }
    };
  }, [dispatch, router, routes]);

  return null;
}
