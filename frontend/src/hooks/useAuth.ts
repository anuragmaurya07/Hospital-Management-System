import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../store';
import { logout as logoutAction, setUser, setProfile } from '../store/slices/authSlice';
import { authApi } from '../services/hospitalApi';

export const useAuth = () => {
  const dispatch = useDispatch<AppDispatch>();
  const auth = useSelector((state: RootState) => state.auth);

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (e) {
      // Continue client cleanup even if network fails
    } finally {
      dispatch(logoutAction());
    }
  };

  return {
    ...auth,
    dispatch,
    logout,
    setUser: (u: any) => dispatch(setUser(u)),
    setProfile: (p: any) => dispatch(setProfile(p)),
  };
};
