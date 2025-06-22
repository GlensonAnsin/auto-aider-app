import axios from 'axios';

const baseURL = process.env.EXPO_PUBLIC_BACKEND_BASE_URL;

interface CreateUser {
    firstname: string;
    lastname: string;
    gender: string;
    email: string | null;
    mobile_num: string;
    password: string;
    creation_date: Date;
    profile_pic: string | null;
    role: string;
}

export const createUser = async (userData: CreateUser): Promise<CreateUser | null> => {
  try {
    const res = await axios.post(`${baseURL}/user`, userData);
    return res.data;
  } catch (e) {
    console.error('Error creating user:', e);
    return null;
  }
};