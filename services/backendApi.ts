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
};

// GET USER INFO
export const getUserInfo = async () => {
  try {
    const token = await getAccessToken();
    const res = await axios.get(`${apiURL}/user/get-user-info`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data;
  } catch (e) {
    console.error('Get User Info Error: ', e);
    return null;
  }
};

// GET USER INFO FOR CHAT
export const getUserInfoForChat = async (userID: number) => {
  try {
    const token = await getAccessToken();
    const res = await axios.get(`${apiURL}/user/get-user-info-chat/${userID}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    return res.data;
  } catch (e) {
    console.error('Get User Info For Chat Error: ', e);
    return null;
  }
};

// UPDATE USER INFO
export const updateUserInfo = async (userData: UpdateUserInfo) => {
  try {
    const token = await getAccessToken();
    await axios.patch(`${apiURL}/user/update-user-info`, userData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (e) {
    console.error('Update User Info Error: ', e);
  }
};

// USER CHANGE PASS
export const changePass = async (userData: ChangePass) => {
  try {
    const token = await getAccessToken();
    await axios.patch(`${apiURL}/user/change-password`, userData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
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
    const res = await axios.get(`${apiURL}/auto_repair_shop/get-repair-shop-info`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data;
  } catch (e) {
    console.error('Get Repair Shop Info Error: ', e);
    return null;
  }
};

// GET REPAIR SHOP INFO FOR CHAT
export const getShopInfoForChat = async (repairShopID: number) => {
  try {
    const token = await getAccessToken();
    const res = await axios.get(`${apiURL}/auto_repair_shop/get-shop-info-chat/${repairShopID}`,
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
}

// UPDATE REPAIR SHOP INFO
export const updateRepairShopInfo = async (userData: UpdateRepairShopInfo) => {
  try {
    const token = await getAccessToken();
    await axios.patch(`${apiURL}/auto_repair_shop/update-repair-shop-info`, userData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (e: any) {
    if (e.response?.status === 401) {
      return '401';
    } else {
      console.error('Update Repair Shop Info Error: ', e);
    }
  }
};

// UPDATE SHOP RATING
export const updateRatings = async (shopID: number, requestID: number[], score: number) => {
  try {
    const token = await getAccessToken();
    await axios.patch(`${apiURL}/auto_repair_shop/update-ratings`,
      { shopID, requestID, score },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      },
    );
  } catch (e) {
    console.error('Update Rating Error:', e);
  }
}

// UPDATE SHOP AVAILABILITY
export const updateAvailability = async (availability: boolean) => {
  try {
    const token = await getAccessToken();
    await axios.patch(`${apiURL}/auto_repair_shop/update-availability`,
      { availability },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      },
    );
  } catch (e) {
    console.error('Update Availability Error:', e);
  }
}

// ADD VEHICLE
export const addVehicle = async (vehicleInfo: Vehicle) => {
  try {
    const token = await getAccessToken();
    await axios.post(`${apiURL}/vehicle/add-vehicle`, vehicleInfo, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (e) {
    console.error('Add Vehicle Error: ', e);
  }
};

// GET VEHICLE
export const getVehicle = async () => {
  try {
    const token = await getAccessToken();
    const res = await axios.get(`${apiURL}/vehicle/get-vehicles`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
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
    const res = await axios.get(`${apiURL}/vehicle/get-scanned-vehicle/${vehicleID}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data;
  } catch (e) {
    console.error('Get Scanned Vehicle Error: ', e);
    return null;
  }
};

// DELETE VEHICLE
export const deleteVehicle = async (vehicleID: number) => {
  try {
    const token = await getAccessToken();
    await axios.patch(
      `${apiURL}/vehicle/delete-vehicle`,
      {
        vehicle_id: vehicleID,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
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
    await axios.post(`${apiURL}/vehicle_diagnostic/add-vehicle-diagnostic`, vehicleDiagnosticData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (e) {
    console.error('Add Vehicle Diagnostic Error: ', e);
  }
};

// GET ALL USER VEHICLE DIAGNOSTICS
export const getVehicleDiagnostics = async () => {
  try {
    const token = await getAccessToken();
    const res = await axios.get(`${apiURL}/vehicle_diagnostic/get-vehicle-diagnostics`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data;
  } catch (e) {
    console.error('Get All User Vehicle Diagnostics Error: ', e);
    return null;
  }
};

// GET ONGOING VEHICLE DIAGNOSTIC
export const getOnVehicleDiagnostic = async (vehicleID: number, scanReference: string): Promise<[] | null> => {
  try {
    const token = await getAccessToken();
    const res = await axios.get(
      `${apiURL}/vehicle_diagnostic/get-on-vehicle-diagnostic/${vehicleID}/${scanReference}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
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
    const res = await axios.get(`${apiURL}/vehicle_diagnostic/get-on-spec-vehicle-diagnostic/${vehicleDiagnosticID}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data;
  } catch (e) {
    console.error('Get Details of Ongoing Specific Vehicle Diagnostic Error: ', e);
    return null;
  }
};

// DELETE VEHICLE DIAGNOSTIC
export const deleteVehicleDiagnostic = async (scanReference: string) => {
  try {
    const token = await getAccessToken();
    await axios.patch(
      `${apiURL}/vehicle_diagnostic/delete-vehicle-diagnostic`,
      {
        scan_reference: scanReference,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
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
    await axios.patch(`${apiURL}/vehicle_diagnostic/delete-all-vehicle-diagnostics`, null, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (e) {
    console.error('Delete All Vehicle Diagnostics Error: ', e);
  }
};

// ADD REQUEST
export const addRequest = async (requestData: AddRequest) => {
  try {
    const token = await getAccessToken();
    await axios.post(`${apiURL}/mechanic_request/add-request`, requestData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (e) {
    console.error('Add Request Error: ', e);
  }
};

// GET REQUESTS FOR CAR OWNER
export const getRequestsForCarOwner = async () => {
  try {
    const token = await getAccessToken();
    const res = await axios.get(`${apiURL}/mechanic_request/get-requests-co`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
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
    const res = await axios.get(`${apiURL}/mechanic_request/get-requests-rs`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data;
  } catch (e) {
    console.error('Get Requests For Repair Shop Error: ', e);
    return null;
  }
};

// REJECT REQUEST
export const rejectRequest = async (requestIDs: number[], reason_rejected: string, scanReference: string, year: string, make: string, model: string, userID: number) => {
  try {
    const token = await getAccessToken();
    await axios.patch(
      `${apiURL}/mechanic_request/reject-request`,
      { requestIDs, reason_rejected, scanReference, year, make, model, userID, },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  } catch (e) {
    console.error('Reject Request Error: ', e);
  }
};

// ACCEPT REQUEST
export const acceptRequest = async (requestIDs: number[], scanReference: string, year: string, make: string, model: string, userID: number) => {
  try {
    const token = await getAccessToken();
    await axios.patch(
      `${apiURL}/mechanic_request/accept-request`,
      { requestIDs, scanReference, year, make, model, userID, },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  } catch (e) {
    console.error('Accept Request Error: ', e);
  }
};

// REQUEST COMPLETED
export const requestCompleted = async (requestIDs: number[], repair_procedure: string | null, completed_on: string, scanReference: string, year: string, make: string, model: string, userID: number) => {
  try {
    const token = await getAccessToken();
    await axios.patch(
      `${apiURL}/mechanic_request/request-completed`,
      {
        requestIDs,
        repair_procedure,
        completed_on,
        scanReference,
        year,
        make,
        model,
        userID,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  } catch (e) {
    console.error('Request Completed Error: ', e);
  }
};

// GET CONVERSATION FOR CAR OWNER
export const getConversationForCarOwner = async (repairShopID: number) => {
  try {
    const token = await getAccessToken();
    const res = await axios.get(`${apiURL}/messages/get-conversation-co/${repairShopID}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    return res.data;
  } catch (e) {
    console.error('Get Convo For Car Owner Error: ', e);
    return null;
  }
};

// GER CONVERSATION FOR REPAIR SHOP
export const getConversationForShop = async (userID: number) => {
  try {
    const token = await getAccessToken();
    const res = await axios.get(`${apiURL}/messages/get-conversation-rs/${userID}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    return res.data;
  } catch (e) {
    console.error('Get Convo For Shop Error: ', e);
    return null;
  }
};


// GET ALL CONVERSATIONS FOR CAR OWNER
export const getAllConversationsCO = async () => {
  try {
    const token = await getAccessToken();
    const res = await axios.get(`${apiURL}/messages/get-all-chats-co`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    return res.data;
  } catch (e) {
    console.error('Get All Chats For Car Owner Error: ', e);
    return null;
  }
};

// GET ALL CONVERSATIONS FOR REPAIR SHOP
export const getAllConversationsRS = async () => {
  try {
    const token = await getAccessToken();
    const res = await axios.get(`${apiURL}/messages/get-all-chats-rs`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    return res.data;
  } catch (e) {
    console.error('Get All Chats For Shop Error: ', e);
    return null;
  }
};

// GET ALL NOTIFICATIONS FOR CAR OWNER
export const getNotificationsCO = async () => {
  try {
    const token = await getAccessToken();
    const res = await axios.get(`${apiURL}/notifications/get-notifications-co`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    return res.data;
  } catch (e) {
    console.error('Get Notifications For Car Owner Error: ', e);
    return null;
  }
};

// GET ALL NOTIFICATIONS FOR REPAIR SHOP
export const getNotificationsRS = async () => {
  try {
    const token = await getAccessToken();
    const res = await axios.get(`${apiURL}/notifications/get-notifications-rs`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    return res.data;
  } catch (e) {
    console.error('Get Notifications For Shop Error: ', e);
    return null;
  }
};

// UPDATE NOTIFICATION STATUS FOR CAR OWNER
export const updateNotificationStatusCO = async (notificationID: number) => {
  try {
    const token = await getAccessToken();
    await axios.patch(`${apiURL}/notifications/update-notification-co`,
      { notificationID },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
  } catch (e) {
    console.error('Update Notification For Car Owner Error: ', e);
  }
};

// UPDATE NOTIFICATION STATUS FOR REPAIR SHOP
export const updateNotificationStatusRS = async (notificationID: number) => {
  try {
    const token = await getAccessToken();
    await axios.patch(`${apiURL}/notifications/update-notification-rs`,
      { notificationID },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
  } catch (e) {
    console.error('Update Notification For Shop Error: ', e);
  }
};

// DELETE NOTIFICATION FOR CAR OWNER
export const deleteNotificationCO = async (notificationID: number) => {
  try {
    const token = await getAccessToken();
    await axios.delete(`${apiURL}/notifications/delete-notification-co`,
      {
        data: { notificationID },
        headers: {
          Authorization: `Bearer ${token}`
        },
      },
    );
  } catch (e) {
    console.error('Delete Notification For Car Owner Error: ', e);
  }
};

// DELETE NOTIFICATION FOR REPAIR SHOP
export const deleteNotificationRS = async (notificationID: number) => {
  try {
    const token = await getAccessToken();
    await axios.delete(`${apiURL}/notifications/delete-notification-rs`,
      {
        data: { notificationID },
        headers: {
          Authorization: `Bearer ${token}`
        },
      },
    );
  } catch (e) {
    console.error('Delete Notification For Shop Error: ', e);
  }
};