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
}