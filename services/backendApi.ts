import { AutoRepairShop } from '@/types/autoRepairShop';
import { User } from '@/types/user';
import axios from 'axios';

const baseURL = process.env.EXPO_PUBLIC_BACKEND_BASE_URL;

// SIGNUP USER
export const createUser = async (userData: User): Promise<User | null> => {
  try {
    const res = await axios.post(`${baseURL}/user/signup`, userData);
    return res.data;

  } catch (e) {
    console.error('Error creating user:', e);
    return null;
  }
};

// GET ALL USERS
export const getUsers = async () => {
  try {
    const res = await axios.get(`${baseURL}/user/get-all`);
    return res.data;
    
  } catch (e) {
    console.error('Error getting all users: ', e);
    return null;
  }
};

// GET USER INFO
export const getUserInfo = async (id: number) => {
  try {
    const res = await axios.post(`${baseURL}/user/get-user-info`, { id });
    return res.data;

  } catch (e) {
    console.error('Error getting user info: ', e);
    return null;
  }
};

// SIGNUP REPAIR SHOP
export const createRepairShop = async (repairShopData: AutoRepairShop): Promise<AutoRepairShop | null> => {
  try {
    const res = await axios.post(`${baseURL}/auto_repair_shop/signup`, repairShopData);
    return res.data;

  } catch (e) {
    console.error('Error creating repair shop: ', e);
    return null;
  }
};

// GET ALL REPAIR SHOPS
export const getRepairShops = async () => {
  try {
    const res = await axios.get(`${baseURL}/auto_repair_shop/get-all`);
    return res.data;

  } catch (e) {
    console.error('Error getting all repair shops: ', e);
    return null;
  }
};