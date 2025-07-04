export interface User {
    firstname: string;
    lastname: string;
    gender: string;
    email: string | null;
    mobile_num: string;
    password: string;
    creation_date: Date;
    profile_pic: string | null;
    role: string;
    user_initials_bg: string;
};

export interface UserWithID {
    user_id: number;
    firstname: string;
    lastname: string;
    gender: string;
    email: string | null;
    mobile_num: string;
    password: string;
    creation_date: Date;
    profile_pic: string | null;
    role: string;
};

export interface UpdateUser {
    firstname: string;
    lastname: string;
    gender: string;
    email: string | null;
    mobile_num: string;
    profile_pic: string | null;
};

export interface ChangePass {
    newPassword: string;
    currentPassword: string;
};

export interface LoginUser {
    username: string;
    password: string;
};