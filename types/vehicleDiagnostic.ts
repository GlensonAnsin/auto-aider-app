export interface VehicleDiagnostic {
    vehicle_id: number;
    dtc: string;
    technical_description: string;
    meaning: string;
    possible_causes: string;
    recommended_repair: string;
    datetime: Date;
    scan_reference: string;
};