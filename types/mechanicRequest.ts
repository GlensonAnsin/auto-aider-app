export interface AddRequest {
  vehicle_diagnostic_id: number;
  repair_shop_id: number;
  repair_procedure: string | null;
  request_datetime: string;
  status: string;
  is_deleted: boolean;
  completed_on: string | null;
  rejected_reason: string | null;
  longitude: string;
  latitude: string;
  is_rated: boolean;
  request_type: string;
  service_type: string;
}
