export interface AutoRepairShop {
    owner_firstname: string;
    owner_lastname: string;
    gender: string;
    shop_name: string;
    mobile_num: string;
    password: string;
    email: string | null;
    services_offered: string[];
    longitude: string;
    latitude: string;
    creation_date: Date | null;
    profile_pic: string | null;
    shop_images: string[] | null;
    number_of_ratings: number;
    average_rating: number;
    approval_status: string;
    total_score:  number;
}