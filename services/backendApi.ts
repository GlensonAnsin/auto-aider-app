import { AutoRepairShop } from '@/types/autoRepairShop';
import { UpdateUser, User } from '@/types/user';
import { Vehicle } from '@/types/vehicle';
import axios from 'axios';
import { getAccessToken } from './tokenStorage';

const baseURL = process.env.EXPO_PUBLIC_BACKEND_BASE_URL;

// SIGNUP USER
export const createUser = async (userData: User): Promise<User | null> => {
  try {
    const res = await axios.post(`${baseURL}/user/signup`, userData);
    return res.data;

  } catch (e) {
    console.error('Error:', e);
    return null;
  }
};

// GET ALL USERS
export const getUsers = async () => {
  try {
    const res = await axios.get(`${baseURL}/user/get-all`);
    return res.data;
    
  } catch (e) {
    console.error('Error: ', e);
    return null;
  }
};

// GET USER INFO
export const getUserInfo = async () => {
  try {
    const token = await getAccessToken();
    const res = await axios.get(`${baseURL}/user/get-user-info`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return res.data;

  } catch (e) {
    console.error('Error: ', e);
    return null;
  }
};

// UPDATE USER INFO
export const updateUserInfo = async (userData: UpdateUser): Promise<UpdateUser | null> => {
  try {
    const token = await getAccessToken();
    const res = await axios.patch(`${baseURL}/user/update-user-info`,
      userData,
      { headers: {
        Authorization: `Bearer ${token}`
      }}
    );
    return res.data;

  } catch (e) {
    console.error('Error: ', e);
    return null;
  }
}



// SIGNUP REPAIR SHOP
export const createRepairShop = async (repairShopData: AutoRepairShop): Promise<AutoRepairShop | null> => {
  try {
    const res = await axios.post(`${baseURL}/auto_repair_shop/signup`, repairShopData);
    return res.data;

  } catch (e) {
    console.error('Error: ', e);
    return null;
  }
};

// GET ALL REPAIR SHOPS
export const getRepairShops = async () => {
  try {
    const res = await axios.get(`${baseURL}/auto_repair_shop/get-all`);
    return res.data;

  } catch (e) {
    console.error('Error: ', e);
    return null;
  }
};



export const addVehicle = async (vehicleInfo: Vehicle): Promise<Vehicle | null> => {
  try {
    const token = await getAccessToken();
    const res = await axios.post(`${baseURL}/vehicle/add-vehicle`,
      vehicleInfo,
      { headers: {
        Authorization: `Bearer ${token}`
      }}
    );
    return res.data;

  } catch (e) {
    console.error('Error: ', e)
    return null;
  }
}