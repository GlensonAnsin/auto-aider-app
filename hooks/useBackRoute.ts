import { setRouteState } from '@/redux/slices/routeSlice';
import { useDispatch } from 'react-redux';

export const useBackRoute = (link: string) => {
  const dispatch = useDispatch();

  const setBackRoute = () => {
    dispatch(setRouteState(link));
  };

  return setBackRoute;
};
