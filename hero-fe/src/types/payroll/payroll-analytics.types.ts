/**
 * 급여 Analytics(Admin) 응답 타입 정의
 * - /api/payroll/admin/analytics/*
 */

export type YearMonth = `${number}-${string}`; // "YYYY-MM" 정도로만 가볍게

/* =========================
 * Overview
 * ========================= */

export interface PayrollAnalyticsOverviewResponse {
    month: string;
    kpi: PayrollAnalyticsOverviewKpi;
    netPay: PayrollAnalyticsOverviewNetPay;
    trend: PayrollAnalyticsOverviewTrendPoint[];
}

export interface PayrollAnalyticsOverviewKpi {
    headcount: number;
    grossTotal: number;
    deductionTotal: number;
    laborCostTotal: number;
}

export interface PayrollAnalyticsOverviewNetPay {
    avgNetPay: number;
    medianNetPay: number;
    momChangeRate: number | null; // 전월 대비(%) - 없을 수 있음
}

export interface PayrollAnalyticsOverviewTrendPoint {
    month: string;
    laborCostTotal: number;
    momChangeRate: number | null; // 첫 포인트는 null
}

/* =========================
 * Organization
 * ========================= */

export interface PayrollAnalyticsOrgResponse {
    month: string;
    deptId: number | null;
    kpi: PayrollAnalyticsOrgKpi;
    departments: PayrollAnalyticsOrgDeptRow[];
    deptStacks: PayrollAnalyticsOrgDeptStackRow[];
    netPayTop10: PayrollAnalyticsOrgPersonRow[];
    netPayBottom10: PayrollAnalyticsOrgPersonRow[];
    deductionRateTop10: PayrollAnalyticsOrgDeductionRateRow[];
}

export interface PayrollAnalyticsOrgKpi {
    headcount: number;
    laborCostTotal: number;
    avgNetPay: number;
    laborCostSharePct: number | null;
}

export interface PayrollAnalyticsOrgDeptRow {
    departmentId: number;
    departmentName: string;
    headcount: number;
    grossTotal: number;
    deductionTotal: number;
    netTotal: number;
    momChangeRate: number | null;
}

export interface PayrollAnalyticsOrgDeptStackRow {
    departmentId: number;
    departmentName: string;
    baseTotal: number;
    allowanceTotal: number;
    overtimeTotal: number;
    bonusTotal: number;
    deductionTotal: number;
    laborCostTotal: number;
}

export interface PayrollAnalyticsOrgPersonRow {
    employeeId: number;
    employeeName: string;
    departmentName: string;
    netPay: number;
}

export interface PayrollAnalyticsOrgDeductionRateRow {
    employeeId: number;
    employeeName: string;
    departmentName: string;
    deductionRatePct: number;
    grossPay: number;
    deductionTotal: number;
}

/* =========================
 * Composition
 * ========================= */

export interface PayrollAnalyticsCompositionResponse {
    month: string;
    deptShare: PayrollAnalyticsCompositionDeptShareRow[];
    items: PayrollAnalyticsCompositionItemSummary;
    burden: PayrollAnalyticsCompositionBurdenRow[];
    stackTrend: PayrollAnalyticsCompositionMonthStackRow[];
}

export interface PayrollAnalyticsCompositionDeptShareRow {
    departmentId: number;
    departmentName: string;
    laborCostTotal: number;
    sharePct: number;
}

export interface PayrollAnalyticsCompositionItemSummary {
    allowance: PayrollAnalyticsCompositionItemRow[];
    deduction: PayrollAnalyticsCompositionItemRow[];
}

export interface PayrollAnalyticsCompositionItemRow {
    itemCode: string;
    itemName: string;
    amountTotal: number;
    sharePct: number;
}

export interface PayrollAnalyticsCompositionBurdenRow {
    deductionId: string;
    deductionName: string;
    employeeAmount: number;
    employerAmount: number;
    totalAmount: number;
}

export interface PayrollAnalyticsCompositionMonthStackRow {
    month: string;
    baseTotal: number;
    allowanceTotal: number;
    overtimeTotal: number;
    bonusTotal: number;
    deductionTotal: number;
    laborCostTotal: number;
}

/* =========================
 * Query Types
 * ========================= */

export interface AnalyticsOverviewQuery {
    month: string; // "YYYY-MM"
    trendMonths?: number;
}

export interface AnalyticsOrganizationQuery {
    month: string; // "YYYY-MM"
    deptId?: number;
}

export interface AnalyticsCompositionQuery {
    month: string; // "YYYY-MM"
    trendMonths?: number;
}
