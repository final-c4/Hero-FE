// 급여 공통 항목
export interface PayItem {
    name: string;
    amount: number;
}

// /api/me/payroll 응답
export interface MyPaySummary {
    salaryMonth: string;
    basesalary: number;
    netPay: number;
    grossPay: number;
    totalDeduction: number;
    workDays: number;
    workHours: number;
    overtimeHours: number;
    payDayLabel: string;
    bankName: string;
    bankAccountNumber: string;
    accountHolder: string;
    allowances: PayItem[];
    deductions: PayItem[];
}

// /api/me/payroll/payslip 응답
export interface PayslipDetail {
    salaryMonth: string;
    employeeName: string;
    departmentName: string;
    baseSalary: number;
    allowances: PayItem[];
    deductions: PayItem[];
    grossPay: number;
    totalDeduction: number;
    netPay: number;
    pdfUrl: string | null;
}

// 급여 이력
export interface PayHistoryRow {
    salaryMonth: string;
    baseSalary: number;
    allowanceTotal: number;
    deductionTotal: number;
    netPay: number;
    remark: string;
}

export interface PayHistoryChartPoint {
    salaryMonth: string;
    netPay: number;
}

export interface PayHistoryResponse {
    avgNetPay: number;
    maxNetPay: number;
    minNetPay: number;
    monthOverMonthRate: number;
    ytdNetPay: number;
    chart: PayHistoryChartPoint[];
    rows: PayHistoryRow[];
}

/** 계좌 관리 */

export interface BankAccount {
    id: number;
    bankName: string;
    bankCode: string;
    accountNumber: string;
    accountHolder: string;
    isPrimary: boolean;
    createdAt: string;
}

export interface BankAccountHistoryRow {
    bankName: string;
    accountNumber: string;
    accountHolder: string;
    changedAt: string;
    changedByName: string;
}
