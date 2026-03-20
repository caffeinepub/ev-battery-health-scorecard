import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Scorecard {
    vin: string;
    status: string;
    signature: string;
    thermalCheck: Section;
    technicianName: string;
    customerIssue: Section;
    electricalHealth: Section;
    date: string;
    repairQuality: Section;
    safetyCheck: Section;
    redFlags: Array<string>;
    totalScore: bigint;
    bmsDiagnostics: Section;
    visualInspection: Section;
    finalPerformance: Section;
    vehicleId: string;
}
export interface Section {
    score: bigint;
    notes: string;
    checkedItems: Array<boolean>;
}
export interface backendInterface {
    createScorecard(card: Scorecard): Promise<bigint>;
    deleteScorecard(id: bigint): Promise<void>;
    getAllScorecards(): Promise<Array<Scorecard>>;
    getScorecard(id: bigint): Promise<Scorecard>;
    updateScorecard(id: bigint, card: Scorecard): Promise<void>;
}
