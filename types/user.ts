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
    is_deleted: boolean;
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

export interface UpdateUserInfo {
    firstname: string | null;
    lastname: string | null;
    gender: string | null;
    email: string | null;
    mobile_num: string | null;
    profile_pic: string | null;
    field: string;
};

export interface ChangePass {
    newPassword: string;
    currentPassword: string;
};

export interface LoginUser {
    username: string;
    password: string;
};