import { AutoRepairShop } from '@/types/autoRepairShop';
import { User } from '@/types/user';
import axios from 'axios';

const baseURL = process.env.EXPO_PUBLIC_BACKEND_BASE_URL;

export const createUser = async (userData: User): Promise<User | null> => {
  try {
    const res = await axios.post(`${baseURL}/user`, userData);
    return res.data;
  } catch (e) {
    console.error('Error creating user:', e);
    return null;
  }
};

export const getUsers = async () => {
  try {
    const res = await axios.get(`${baseURL}/user`);
    return res.data;
  } catch (e) {
    console.error('Error getting all users: ', e);
    return null;
  }
};

export const createRepairShop = async (repairShopData: AutoRepairShop): Promise<AutoRepairShop | null> => {
  try {
    const res = await axios.post(`${baseURL}/auto_repair_shop`, repairShopData);
    return res.data;
  } catch (e) {
    console.error('Error creating repair shop: ', e);
    return null;
  }
};

export const getRepairShops = async () => {
  try {
    const res = await axios.get(`${baseURL}/auto_repair_shop`);
    return res.data;
  } catch (e) {
    console.error('Error getting all repair shops: ', e);
    return null;
  }
};