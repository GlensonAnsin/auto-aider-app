export interface AddRequest {
    vehicle_diagnostic_id: number;
    repair_shop_id: number;
    repair_procedure: string | null;
    request_datetime: Date;
    status: string;
    is_deleted: boolean;
};