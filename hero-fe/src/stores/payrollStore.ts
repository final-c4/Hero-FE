import { defineStore } from 'pinia';
import {
    fetchMyPayroll,
    fetchPayslipDetail,
    fetchPayHistory,
    fetchMyBankAccounts,
    createBankAccount,
    fetchBankAccountHistory,
    setPrimaryBankAccount as apiSetPrimaryBankAccount,
    updateMyBankAccount as apiUpdateMyBankAccount
} from '@/api/payroll';
import type {
    MyPaySummary,
    PayslipDetail,
    PayHistoryResponse,
    BankAccount,
    BankAccountHistoryRow
} from '@/types/payroll';

export const usePayrollStore = defineStore('payroll', {
    state: () => ({
        loading: false as boolean,
        error: null as string | null,

        // 내 급여
        currentMonth: '' as string, // "2025-11" 같은 값
        summary: null as MyPaySummary | null,
        payslip: null as PayslipDetail | null,

        // 이력
        history: null as PayHistoryResponse | null,

        // 계좌
        accounts: [] as BankAccount[],
        accountHistory: [] as BankAccountHistoryRow[]
    }),

    actions: {
        /* -------------------
         * 급여 조회
         * ------------------- */
        async loadMyPayroll(month?: string) {
            try {
                this.loading = true;
                this.error = null;
                const { data } = await fetchMyPayroll(month);
                this.summary = data;
                this.currentMonth = data.salaryMonth;
            } catch (e: any) {
                this.error = e?.response?.data?.message ?? '급여 정보를 불러오지 못했습니다.';
            } finally {
                this.loading = false;
            }
        },

        async loadPayslip(month: string) {
            try {
                this.loading = true;
                this.error = null;
                const { data } = await fetchPayslipDetail(month);
                this.payslip = data;
            } catch (e: any) {
                this.error = e?.response?.data?.message ?? '명세서를 불러오지 못했습니다.';
            } finally {
                this.loading = false;
            }
        },

        async loadHistory() {
            try {
                this.loading = true;
                this.error = null;
                const { data } = await fetchPayHistory();
                this.history = data;
            } catch (e: any) {
                this.error = e?.response?.data?.message ?? '급여 이력을 불러오지 못했습니다.';
            } finally {
                this.loading = false;
            }
        },

        /* -------------------
         * 계좌 관련
         * ------------------- */

        /** 내 계좌 목록 조회 (기존 loadAccounts 유지) */
        async loadAccounts() {
            try {
                const { data } = await fetchMyBankAccounts();
                this.accounts = data;
            } catch (e) {
                console.error(e);
            }
        },

        /** 새 계좌 추가 (기존 addAccount 유지) */
        async addAccount(payload: {
            bankCode: string;
            accountNumber: string;
            accountHolder: string;
        }) {
            await this.addMyBankAccount(payload);
        },

        /** 계좌 이력 조회 */
        async loadAccountHistory() {
            try {
                const { data } = await fetchBankAccountHistory();
                this.accountHistory = data;
            } catch (e) {
                console.error(e);
            }
        },

        /** 새 이름: 내 계좌 목록 조회 (My 급여 페이지에서 사용) */
        async loadMyBankAccounts() {
            // 기존 함수 재사용 (컨벤션 + 하위 호환)
            await this.loadAccounts();
        },

        /**  새 이름: 계좌 추가 + 생성된 계좌 리턴 (모달에서 id 필요해서) */
        async addMyBankAccount(payload: {
            bankCode: string;
            accountNumber: string;
            accountHolder: string;
        }): Promise<BankAccount> {
            const response = await createBankAccount(payload);
            // 목록 최신화
            await this.loadAccounts();
            return response.data as BankAccount;
        },

        /* 급여 수령(기본) 계좌 설정 */
        async setPrimaryBankAccount(bankAccountId: number) {
            try {
                await apiSetPrimaryBankAccount(bankAccountId);

                this.accounts = this.accounts.map((acc) => ({
                    ...acc,
                    primary: acc.id === bankAccountId
                }));
            } catch (e) {
                console.error(e);
            }
        },

        /* (옵션) 단일 기본 계좌 정보 수정 – 필요 시 다른 화면에서 사용 */
        async updateMyBankAccount(payload: {
            bankCode: string;
            accountNumber: string;
            accountHolder: string;
        }) {
            try {
                await apiUpdateMyBankAccount(payload);

                // summary / accounts 최신화
                // currentMonth가 설정되어 있으면 해당 월 급여 다시 로딩
                if (this.currentMonth) {
                    await this.loadMyPayroll(this.currentMonth);
                } else {
                    await this.loadMyPayroll();
                }

                await this.loadAccounts();
            } catch (e) {
                console.error(e);
            }
        }
    }
});
