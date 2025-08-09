export interface AddRequest {
    mechanic_request_id: number | null;
    vehicle_diagnostic_id: number;
    repair_shop_id: number;
    repair_procedure: string | null;
    request_datetime: string;
    status: string;
    is_deleted: boolean;
};