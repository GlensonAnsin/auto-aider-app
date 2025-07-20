import { AutoRepairShop, UpdateRepairShopInfo } from '@/types/autoRepairShop';
import { ChangePass, LoginUser, UpdateUserInfo, User } from '@/types/user';
import { Vehicle } from '@/types/vehicle';
import { VehicleDiagnostic } from '@/types/vehicleDiagnostic';
import axios from 'axios';
import api from './interceptor';
import { getAccessToken, storeTokens } from './tokenStorage';

const apiURL = process.env.EXPO_PUBLIC_BACKEND_API_URL;

// SIGNUP USER
export const createUser = async (userData: User): Promise<User | null> => {
  try {
    const res = await axios.post(`${apiURL}/user/signup`, userData);
    return res.data;

  } catch (e) {
    console.error('Error:', e);
    return null;
  }
};

// GET ALL USERS
export const getUsers = async () => {
  try {
    const res = await axios.get(`${apiURL}/user/get-all`);
    return res.data;
    
  } catch (e) {
    console.error('Error: ', e);
    return null;
  }
};

// LOGIN USER
export const loginUser = async (userData: LoginUser): Promise<string | null> => {
  try {
    const res = await api.post('user/login', userData);
    const { accessToken, refreshToken } = res.data;
    await storeTokens(accessToken, refreshToken);
    return null;

  } catch (e: any) {
    if (e.response?.status === 401) {
      return '401';

    } else {
      console.error('Error: ', e);
      return null;
    }
  }
}

// GET USER INFO
export const getUserInfo = async () => {
  try {
    const token = await getAccessToken();
    const res = await axios.get(`${apiURL}/user/get-user-info`, {
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
export const updateUserInfo = async (userData: UpdateUserInfo): Promise<UpdateUserInfo | null> => {
  try {
    const token = await getAccessToken();
    const res = await axios.patch(`${apiURL}/user/update-user-info`,
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
};

// USER CHANGE PASS
export const changePass = async (userData: ChangePass): Promise<ChangePass | string | null> => {
  try {
    const token = await getAccessToken();
    const res = await axios.patch(`${apiURL}/user/change-password`,
      userData,
      { headers: {
        Authorization: `Bearer ${token}`
      }}
    );
    return res.data;

  } catch (e: any) {
    if (e.response?.status === 401) {
      return '401';

    } else {
      console.error('Error: ', e);
      return null;
    }
  }
};



// SIGNUP REPAIR SHOP
export const createRepairShop = async (repairShopData: AutoRepairShop): Promise<AutoRepairShop | null> => {
  try {
    const res = await axios.post(`${apiURL}/auto_repair_shop/signup`, repairShopData);
    return res.data;

  } catch (e) {
    console.error('Error: ', e);
    return null;
  }
};

// GET ALL REPAIR SHOPS
export const getRepairShops = async () => {
  try {
    const res = await axios.get(`${apiURL}/auto_repair_shop/get-all`);
    return res.data;

  } catch (e) {
    console.error('Error: ', e);
    return null;
  }
};

// LOGIN REPAIR SHOP
export const loginRepairShop = async (userData: LoginUser): Promise<string | null> => {
  try {
    const res = await api.post(`${apiURL}/auto_repair_shop/login`, userData);
    const { accessToken, refreshToken } = res.data;
    await storeTokens(accessToken, refreshToken);
    return null;

  } catch (e: any) {
    if (e.response?.status === 401) {
      return '401';

    } else {
      console.error('Error: ', e);
      return null;
    }
  }
};

// GET REPAIR SHOP INFO
export const getRepairShopInfo = async () => {
  try {
    const token = await getAccessToken();
    const res = await axios.get(`${apiURL}/auto_repair_shop/get-repair-shop-info`, {
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

// UPDATE REPAIR SHOP INFO
export const updateRepairShopInfo = async (userData: UpdateRepairShopInfo): Promise<UpdateRepairShopInfo | string | null> => {
  try {
    const token = await getAccessToken();
    const res = await axios.patch(`${apiURL}/auto_repair_shop/update-repair-shop-info`,
      userData,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    return res.data;

  } catch (e: any) {
    if (e.response?.status === 401) {
      return '401';
      
    } else {
      console.error('Error: ', e);
      return null;
    }
  }
};



// ADD VEHICLE
export const addVehicle = async (vehicleInfo: Vehicle): Promise<Vehicle | null> => {
  try {
    const token = await getAccessToken();
    const res = await axios.post(`${apiURL}/vehicle/add-vehicle`,
      vehicleInfo,
      { headers: {
        Authorization: `Bearer ${token}`
      }}
    );
    return res.data;

  } catch (e) {
    console.error('Error: ', e);
    return null;
  }
};

// GET VEHICLE
export const getVehicle = async () => {
  try {
    const token = await getAccessToken();
    const res = await axios.get(`${apiURL}/vehicle/get-vehicles`, {
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

// GET SCANNED VEHICLE
export const getScannedVehicle = async (vehicleID: number) => {
  try {
    const token = await getAccessToken();
    const res = await axios.get(`${apiURL}/vehicle/get-scanned-vehicle/${vehicleID}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    return res.data;

  } catch (e) {
    console.error('Error: ', e);
    return null;
  }
}

// DELETE VEHICLE
export const deleteVehicle = async (vehicleID: number) => {
  try {
    const token = await getAccessToken();
    const res = await axios.delete(`${apiURL}/vehicle/delete-vehicle/${vehicleID}`,
      { headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return res.data;

  } catch (e) {
    console.error('Error: ', e);
  }
};



// ADD VEHICLE DIAGNOSTIC
export const addVehicleDiagnostic = async (vehicleDiagnosticData: VehicleDiagnostic): Promise<VehicleDiagnostic | null> => {
  try {
    const token = await getAccessToken();
    const res = await axios.post(`${apiURL}/vehicle_diagnostic/add-vehicle-diagnostic`,
      vehicleDiagnosticData,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    return res.data;

  } catch (e) {
    console.error('Error: ', e);
    return null;
  }
};

// GET ALL USER VEHICLE DIAGNOSTICS
export const getVehicleDiagnostics = async () => {
  try {
    const token = await getAccessToken();
    const res = await axios.get(`${apiURL}/vehicle_diagnostic/get-vehicle-diagnostics`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    return res.data;

  } catch (e) {
    console.error('Error: ', e);
    return null;
  }
}

// GET ONGOING VEHICLE DIAGNOSTIC
export const getOnVehicleDiagnostic = async (vehicleID: number, scanReference: string): Promise<[] | null> => {
  try {
    const token = await getAccessToken();
    const res = await axios.get(`${apiURL}/vehicle_diagnostic/get-on-vehicle-diagnostic/${vehicleID}/${scanReference}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    return res.data;

  } catch (e) {
    console.error('Error: ', e);
    return null;
  }
};

// GET DETAILS OF ONGOING SPECIFIC VEHICLE DIAGNOSTIC
export const getOnSpecificVehicleDiagnostic = async (vehicleDiagnosticID: number) => {
  try {
    const token = await getAccessToken();
    const res = await axios.get(`${apiURL}/vehicle_diagnostic/get-on-spec-vehicle-diagnostic/${vehicleDiagnosticID}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    return res.data;

  } catch (e) {
    console.error('Error: ', e);
    return null;
  }
}

// DELETE VEHICLE DIAGNOSTIC
export const deleteVehicleDiagnostic = async (vehicleDiagnosticID: number) => {
  try {
    const token = await getAccessToken();
    const res = await axios.delete(`${apiURL}/vehicle_diagnostic/delete-vehicle-diagnostic/${vehicleDiagnosticID}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    return res.data

  } catch (e) {
    console.error('Error: ', e);
  }
}