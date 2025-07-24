export interface VehicleDiagnostic {
    vehicle_diagnostic_id: number | null;
    vehicle_id: number;
    dtc: string | null;
    technical_description: string | null;
    meaning: string | null;
    possible_causes: string | null;
    recommended_repair: string | null;
    date: Date;
    scan_reference: string;
    vehicle_issue_description: string | null;
};