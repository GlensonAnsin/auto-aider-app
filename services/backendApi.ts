import { AutoRepairShop, UpdateRepairShopInfo } from '@/types/autoRepairShop';
import { AddRequest } from '@/types/mechanicRequest';
import { ChangePass, LoginUser, UpdateUserInfo, User } from '@/types/user';
import { Vehicle } from '@/types/vehicle';
import { VehicleDiagnostic } from '@/types/vehicleDiagnostic';
import axios from 'axios';
import api from './interceptor';
import { getAccessToken, storeTokens } from './tokenStorage';

const apiURL = process.env.EXPO_PUBLIC_BACKEND_API_URL;

// SIGNUP USER
export const createUser = async (userData: User) => {
  try {
    await axios.post(`${apiURL}/user/signup`, userData);

  } catch (e) {
    console.error('Signup Error:', e);
  }
};

// GET ALL USERS
export const getUsers = async () => {
  try {
    const res = await axios.get(`${apiURL}/user/get-all`);
    return res.data;
    
  } catch (e) {
    console.error('Get All Users Error: ', e);
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
      console.error('Login Error: ', e);
      return null;
    }
  }
}

// GET USER INFO
export const getUserInfo = async () => {
  try {
    const token = await getAccessToken();
    const res = await axios.get(`${apiURL}/user/get-user-info`, 
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    return res.data;

  } catch (e) {
    console.error('Get User Info Error: ', e);
    return null;
  }
};

// UPDATE USER INFO
export const updateUserInfo = async (userData: UpdateUserInfo) => {
  try {
    const token = await getAccessToken();
    await axios.patch(`${apiURL}/user/update-user-info`,
      userData,
      { 
        headers: {
          Authorization: `Bearer ${token}`
        } 
      }
    );

  } catch (e) {
    console.error('Update User Info Error: ', e);
  }
};

// USER CHANGE PASS
export const changePass = async (userData: ChangePass) => {
  try {
    const token = await getAccessToken();
    await axios.patch(`${apiURL}/user/change-password`,
      userData,
      { 
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

  } catch (e: any) {
    if (e.response?.status === 401) {
      return '401';

    } else {
      console.error('Change Pass Error: ', e);
    }
  }
};



// SIGNUP REPAIR SHOP
export const createRepairShop = async (repairShopData: AutoRepairShop) => {
  try {
    await axios.post(`${apiURL}/auto_repair_shop/signup`, repairShopData);

  } catch (e) {
    console.error('Signup Error: ', e);
  }
};

// GET ALL REPAIR SHOPS
export const getRepairShops = async () => {
  try {
    const res = await axios.get(`${apiURL}/auto_repair_shop/get-all`);
    return res.data;

  } catch (e) {
    console.error('Get All Repair Shops Error: ', e);
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
      console.error('Login Error: ', e);
      return null;
    }
  }
};

// GET REPAIR SHOP INFO
export const getRepairShopInfo = async () => {
  try {
    const token = await getAccessToken();
    const res = await axios.get(`${apiURL}/auto_repair_shop/get-repair-shop-info`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    return res.data;

  } catch (e) {
    console.error('Get Repair Shop Info Error: ', e);
    return null;
  }
};

// UPDATE REPAIR SHOP INFO
export const updateRepairShopInfo = async (userData: UpdateRepairShopInfo) => {
  try {
    const token = await getAccessToken();
    await axios.patch(`${apiURL}/auto_repair_shop/update-repair-shop-info`,
      userData,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

  } catch (e: any) {
    if (e.response?.status === 401) {
      return '401';
      
    } else {
      console.error('Update Repair Shop Info Error: ', e);
    }
  }
};



// ADD VEHICLE
export const addVehicle = async (vehicleInfo: Vehicle) => {
  try {
    const token = await getAccessToken();
    await axios.post(`${apiURL}/vehicle/add-vehicle`,
      vehicleInfo,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

  } catch (e) {
    console.error('Add Vehicle Error: ', e);
  }
};

// GET VEHICLE
export const getVehicle = async () => {
  try {
    const token = await getAccessToken();
    const res = await axios.get(`${apiURL}/vehicle/get-vehicles`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    return res.data;

  } catch (e) {
    console.error('Get Vehicle Error: ', e);
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
    console.error('Get Scanned Vehicle Error: ', e);
    return null;
  }
}

// DELETE VEHICLE
export const deleteVehicle = async (vehicleID: number) => {
  try {
    const token = await getAccessToken();
    await axios.patch(`${apiURL}/vehicle/delete-vehicle`,
      { 
        vehicle_id: vehicleID,
      },
      { 
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

  } catch (e) {
    console.error('Delete Vehicle Error: ', e);
  }
};



// ADD VEHICLE DIAGNOSTIC
export const addVehicleDiagnostic = async (vehicleDiagnosticData: VehicleDiagnostic) => {
  try {
    const token = await getAccessToken();
    await axios.post(`${apiURL}/vehicle_diagnostic/add-vehicle-diagnostic`,
      vehicleDiagnosticData,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

  } catch (e) {
    console.error('Add Vehicle Diagnostic Error: ', e);
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
    console.error('Get All User Vehicle Diagnostics Error: ', e);
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
    console.error('Get Ongoing Vehicle Diagnostic Error: ', e);
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
    console.error('Get Details of Ongoing Specific Vehicle Diagnostic Error: ', e);
    return null;
  }
}

// DELETE VEHICLE DIAGNOSTIC
export const deleteVehicleDiagnostic = async (scanReference: string) => {
  try {
    const token = await getAccessToken();
    await axios.patch(`${apiURL}/vehicle_diagnostic/delete-vehicle-diagnostic`,
      {
        scan_reference: scanReference,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

  } catch (e) {
    console.error('Delete Vehicle Diagnostic Error: ', e);
  }
};

// DELETE ALL VEHICLE DIAGNOSTICS
export const deleteAllVehicleDiagnostics = async () => {
  try {
    const token = await getAccessToken();
    await axios.patch(`${apiURL}/vehicle_diagnostic/delete-all-vehicle-diagnostics`,
      null,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

  } catch (e) {
    console.error('Delete All Vehicle Diagnostics Error: ', e);
  }
};



// ADD REQUEST
export const addRequest = async (requestData: AddRequest) => {
  try {
    const token = await getAccessToken();
    await axios.post(`${apiURL}/mechanic_request/add-request`,
      requestData,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

  } catch (e) {
    console.error('Add Request Error: ', e);
  }
};

// GET REQUESTS FOR CAR OWNER
export const getRequestsForCarOwner = async () => {
  try {
    const token = await getAccessToken();
    const res = await axios.get(`${apiURL}/mechanic_request/get-requests-co`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    return res.data;

  } catch (e) {
    console.error('Get Requests For Car Owner Error: ', e);
    return null;
  }
};

// GET REQUESTS FOR REPAIR SHOP
export const getRequestsForRepairShop = async () => {
  try {
    const token = await getAccessToken();
    const res = await axios.get(`${apiURL}/mechanic_request/get-requests-rs`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    return res.data;

  } catch (e) {
    console.error('Get Requests For Repair Shop Error: ', e);
    return null;
  }
};

// REJECT REQUEST
export const rejectRequest = async (requestIDs: number[], reason_rejected: string) => {
  try {
    const token = await getAccessToken();
    await axios.patch(`${apiURL}/mechanic_request/reject-request`,
      { requestIDs, reason_rejected },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

  } catch (e) {
    console.error('Reject Request Error: ', e);
  }
};

// ACCEPT REQUEST
export const acceptRequest = async (requestIDs: number[]) => {
  try {
    const token = await getAccessToken();
    await axios.patch(`${apiURL}/mechanic_request/accept-request`,
      { requestIDs },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

  } catch (e) {
    console.error('Accept Request Error: ', e);
  }
}

// REQUEST COMPLETED
export const requestCompleted = async (requestIDs: number[], repair_procedure: string | null, completed_on: string) => {
  try {
    const token = await getAccessToken();
    await axios.patch(`${apiURL}/mechanic_request/request-completed`,
      {
        requestIDs,
        repair_procedure,
        completed_on,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

  } catch (e) {
    console.error('Request Completed Error: ', e);
  }
};