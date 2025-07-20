export interface VehicleDiagnostic {
    vehicle_diagnostic_id: number | null;
    vehicle_id: number;
    dtc: string;
    technical_description: string;
    meaning: string;
    possible_causes: string;
    recommended_repair: string;
    date: Date;
    scan_reference: string;
};