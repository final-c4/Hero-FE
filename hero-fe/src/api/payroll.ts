import client from '@/api/client';

import type {
    MyPaySummary,
    PayslipDetail,
    PayHistoryResponse,
    BankAccount,
    BankAccountHistoryRow
} from '@/types/payroll';

/* 새 계좌 생성/수정에 쓸 payload 타입 */
export interface BankAccountPayload {
    bankCode: string;
    accountNumber: string;
    accountHolder: string;
}

//api 제거된 상태 그대로 유지

/* ------- 급여 조회 API ------- */

export const fetchMyPayroll = (month?: string) => {
    return client.get<MyPaySummary>('/me/payroll', {
        params: month ? { month } : undefined
    });
};

export const fetchPayslipDetail = (month: string) => {
    return client.get<PayslipDetail>('/me/payroll/payslip', {
        params: { month }
    });
};

export const fetchPayHistory = () => {
    return client.get<PayHistoryResponse>('/me/payroll/history');
};

/* ------- 계좌 API ------- */

export const fetchMyBankAccounts = () => {
    return client.get<BankAccount[]>('/me/bank-accounts');
};

export const createBankAccount = (payload: BankAccountPayload) => {
    return client.post<BankAccount>('/me/bank-accounts', payload);
};

export const fetchBankAccountHistory = () => {
    return client.get<BankAccountHistoryRow[]>('/me/bank-accounts/history');
};

/** 급여 수령(기본) 계좌 설정 */
export const setPrimaryBankAccount = (bankAccountId: number) => {
    return client.put<void>(`/me/bank-accounts/${bankAccountId}/primary`);
};

/** (옵션) 내 기본 계좌 정보 한 번에 수정 – 단일 계좌 화면에서 사용 가능 */
export const updateMyBankAccount = (payload: BankAccountPayload) => {
    return client.put<void>('/me/bank-account', payload);
};
