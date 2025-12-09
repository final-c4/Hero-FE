<template>
  <div class="payroll-page">
    <header class="payroll-header">
      <div class="payroll-header__right">
        <select v-model="selectedMonth" class="month-select" @change="onChangeMonth">
          <option v-for="m in monthOptions" :key="m.value" :value="m.value">
            {{ m.label }}
          </option>
        </select>

        <div class="payroll-header__buttons">
          <button class="btn-secondary" @click="openPayslip">
            상세 보기
          </button>
          <button class="btn-primary" @click="downloadPayslipPdf">
            명세서 다운로드
          </button>
        </div>
      </div>
    </header>

    <section v-if="summary" class="summary-cards">
      <div class="summary-card">
        <span class="summary-label">실수령액</span>
        <p class="summary-value">{{ formatMoney(summary.netPay) }}</p>
        <p class="summary-caption">{{ summary.salaryMonth }}월</p>
      </div>
      <div class="summary-card">
        <span class="summary-label">지급 총액</span>
        <p class="summary-value">{{ formatMoney(summary.grossPay) }}</p>
      </div>
      <div class="summary-card">
        <span class="summary-label">공제 총액</span>
        <p class="summary-value">{{ formatMoney(summary.totalDeduction) }}</p>
      </div>
      <div class="summary-card">
        <span class="summary-label">근무일수</span>
        <p class="summary-value">{{ summary.workDays }}일</p>
      </div>
    </section>

    <section v-if="summary" class="pay-detail">
      <!-- 지급 내역 -->
      <div class="pay-panel pay-panel--left">
        <h2 class="panel-title">지급 내역</h2>
        <div class="pay-list">
          <div class="pay-row">
            <span class="pay-name">기본급</span>
            <span class="pay-amount">{{ formatMoney(summary.basesalary) }}</span>
          </div>
          <div
            v-for="item in summary.allowances"
            :key="item.name"
            class="pay-row pay-row--allowance"
          >
            <span class="pay-name">{{ item.name }}</span>
            <span class="pay-amount pay-amount--plus">
              +{{ formatMoney(item.amount) }}
            </span>
          </div>
          <div class="pay-row pay-row--total">
            <span class="pay-name">지급 총액</span>
            <span class="pay-amount">{{ formatMoney(summary.grossPay) }}</span>
          </div>
        </div>
      </div>

      <!-- 공제 내역 -->
      <div class="pay-panel pay-panel--right">
        <h2 class="panel-title">공제 내역</h2>
        <div class="pay-list">
          <div
            v-for="item in summary.deductions"
            :key="item.name"
            class="pay-row pay-row--deduction"
          >
            <span class="pay-name">{{ item.name }}</span>
            <span class="pay-amount pay-amount--minus">
              -{{ formatMoney(item.amount) }}
            </span>
          </div>
          <div class="pay-row pay-row--total pay-row--deduction-total">
            <span class="pay-name">공제 총액</span>
            <span class="pay-amount">{{ formatMoney(summary.totalDeduction) }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- 근무 정보 -->
    <section v-if="summary" class="work-info">
      <h2 class="panel-title">근로 정보</h2>
      <div class="work-grid">
        <div class="work-card">
          <p class="work-label">근무 일수</p>
          <p class="work-value">{{ summary.workDays }}일</p>
        </div>
        <div class="work-card">
          <p class="work-label">근무 시간</p>
          <p class="work-value">{{ summary.workHours }}시간</p>
        </div>
        <div class="work-card">
          <p class="work-label">초과 근무</p>
          <p class="work-value">{{ summary.overtimeHours }}시간</p>
        </div>
      </div>
    </section>

    <!-- 계좌 + 급여일 통합 섹션 -->
    <section v-if="summary" class="pay-meta">
      <div class="pay-meta-card pay-meta-card--full">
        <h2 class="panel-title">지급 정보</h2>

        <!-- 지급 계좌 -->
        <div class="pay-meta-row">
          <p class="pay-meta-label">지급 계좌</p>
          <div class="pay-meta-value">
            <p>은행명 : {{ summary.bankName }}</p>
            <p>계좌번호 : {{ summary.bankAccountNumber }}</p>
            <p>예금주 : {{ summary.accountHolder }}</p>
          </div>
          <button class="btn-link" @click="openAccountModal">
            계좌 관리하기
          </button>
        </div>

        <!-- 급여일 -->
        <div class="pay-meta-row">
          <p class="pay-meta-label">급여일</p>
          <p class="pay-meta-value">
            {{ summary.payDayLabel }}
          </p>
        </div>
      </div>
    </section>

    <!-- 명세서 모달 -->
    <Teleport to="body">
      <div v-if="payslipModalOpen" class="modal-backdrop" @click.self="closePayslip">
        <div class="modal" ref="payslipRef">
          <header class="modal-header">
            <h2>급여 명세서</h2>
            <button class="modal-close" @click="closePayslip">✕</button>
          </header>

          <section v-if="payslip" class="payslip-body">
            <div class="payslip-header">
              <div>
                <p class="payslip-month">{{ payslip.salaryMonth }}월 급여명세서</p>
              </div>
              <div class="payslip-meta">
                <p>사원명: {{ payslip.employeeName }}</p>
                <p>부서: {{ payslip.departmentName }}</p>
              </div>
            </div>

            <div class="payslip-section">
              <h3>지급 내역</h3>
              <div class="payslip-table">
                <div class="payslip-row">
                  <span>기본급</span>
                  <span>{{ formatMoney(payslip.baseSalary) }}</span>
                </div>
                <div
                  v-for="item in payslip.allowances"
                  :key="item.name"
                  class="payslip-row"
                >
                  <span>{{ item.name }}</span>
                  <span>{{ formatMoney(item.amount) }}</span>
                </div>
                <div class="payslip-row payslip-row--total">
                  <span>지급 총액</span>
                  <span>{{ formatMoney(payslip.grossPay) }}</span>
                </div>
              </div>
            </div>

            <div class="payslip-section">
              <h3>공제 내역</h3>
              <div class="payslip-table">
                <div
                  v-for="item in payslip.deductions"
                  :key="item.name"
                  class="payslip-row payslip-row--deduction"
                >
                  <span>{{ item.name }}</span>
                  <span>-{{ formatMoney(item.amount) }}</span>
                </div>
                <div class="payslip-row payslip-row--total">
                  <span>공제 총액</span>
                  <span>{{ formatMoney(payslip.totalDeduction) }}</span>
                </div>
              </div>
            </div>

            <div class="payslip-section payslip-section--net">
              <span>실수령액</span>
              <span class="payslip-net">{{ formatMoney(payslip.netPay) }}</span>
            </div>
          </section>

          <footer class="modal-footer">
            <button class="btn-secondary" @click="closePayslip">닫기</button>
            <button class="btn-primary" @click="downloadPayslipPdf">
              PDF 다운로드
            </button>
          </footer>
        </div>
      </div>
    </Teleport>

    <!-- 계좌 관리 모달 컴포넌트 -->
    <AccountModal
      v-model:open="accountModalOpen"
      :accounts="bankAccounts"
      :summary="summary"
      :selected-month="selectedMonth"
      @saved="onAccountSaved"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, nextTick } from 'vue';
import { usePayrollStore } from '@/stores/payrollStore';
import html2pdf from 'html2pdf.js';
import AccountModal from '@/views/payroll/AccountModal.vue';

const store = usePayrollStore();

const payslipModalOpen = ref(false);
const payslipRef = ref<HTMLElement | null>(null);

const accountModalOpen = ref(false);

const summary = computed(() => store.summary);
const payslip = computed(() => store.payslip);
const bankAccounts = computed(() => store.accounts);

const monthOptions = computed(() => {
  const now = new Date();
  const arr: { value: string; label: string }[] = [];
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const ymVal = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    arr.push({
      value: ymVal,
      label: `${d.getFullYear()}년 ${d.getMonth() + 1}월`
    });
  }
  return arr;
});

const selectedMonth = ref<string>('');

onMounted(async () => {
  await store.loadMyPayroll();
  if (store.summary) {
    selectedMonth.value = store.summary.salaryMonth;
  } else {
    selectedMonth.value = monthOptions.value[0].value;
  }
});

const onChangeMonth = () => {
  store.loadMyPayroll(selectedMonth.value);
};

const openPayslip = async () => {
  if (!selectedMonth.value) return;
  await store.loadPayslip(selectedMonth.value);
  payslipModalOpen.value = true;
};

const closePayslip = () => {
  payslipModalOpen.value = false;
};

//  계좌 모달 열기
const openAccountModal = async () => {
  await store.loadMyBankAccounts();
  accountModalOpen.value = true;
};

// 계좌 저장 후 처리
const onAccountSaved = async () => {
  if (selectedMonth.value) {
    await store.loadMyPayroll(selectedMonth.value);
  } else {
    await store.loadMyPayroll();
  }
};

const downloadPayslipPdf = async () => {
  if (!selectedMonth.value) {
    if (summary.value) {
      selectedMonth.value = summary.value.salaryMonth;
    } else {
      return;
    }
  }

  if (!payslip.value) {
    await store.loadPayslip(selectedMonth.value);
  }

  let shouldCloseAfter = false;
  if (!payslipModalOpen.value) {
    payslipModalOpen.value = true;
    shouldCloseAfter = true;
    await nextTick();
  }

  if (!payslipRef.value) return;

  const modalEl = payslipRef.value;
  const bodyEl = modalEl.querySelector('.payslip-body') as HTMLElement | null;
  const closeBtn = modalEl.querySelector('.modal-close') as HTMLElement | null;
  const footerEl = modalEl.querySelector('.modal-footer') as HTMLElement | null;

  const prevModalMaxHeight = modalEl.style.maxHeight;
  const prevModalHeight = modalEl.style.height;
  const prevModalOverflow = modalEl.style.overflow;
  const prevModalWidth = modalEl.style.width;
  const prevModalMargin = modalEl.style.margin;

  const prevBodyMaxHeight = bodyEl?.style.maxHeight ?? '';
  const prevBodyOverflow = bodyEl?.style.overflow ?? '';

  const prevCloseDisplay = closeBtn?.style.display ?? '';
  const prevFooterDisplay = footerEl?.style.display ?? '';

  try {
    // PDF용 스타일 적용
    modalEl.style.maxHeight = 'none';
    modalEl.style.height = 'auto';
    modalEl.style.overflow = 'visible';

    // PDF 가로폭 조절
    modalEl.style.width = '720px';
    modalEl.style.margin = '0 auto';

    if (bodyEl) {
      bodyEl.style.maxHeight = 'none';
      bodyEl.style.overflow = 'visible';
    }

    if (closeBtn) closeBtn.style.display = 'none';
    if (footerEl) footerEl.style.display = 'none';

    modalEl.scrollIntoView({ block: 'center' });

    const opt = {
      margin: 10,
      filename: `payslip-${selectedMonth.value}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: {
        scale: 2,
        scrollY: 0
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    await html2pdf().set(opt).from(modalEl).save();
  } finally {
    modalEl.style.maxHeight = prevModalMaxHeight;
    modalEl.style.height = prevModalHeight;
    modalEl.style.overflow = prevModalOverflow;
    modalEl.style.width = prevModalWidth;
    modalEl.style.margin = prevModalMargin;

    if (bodyEl) {
      bodyEl.style.maxHeight = prevBodyMaxHeight;
      bodyEl.style.overflow = prevBodyOverflow;
    }

    if (closeBtn) closeBtn.style.display = prevCloseDisplay;
    if (footerEl) footerEl.style.display = prevFooterDisplay;

    if (shouldCloseAfter) {
      payslipModalOpen.value = false;
    }
  }
};

const formatMoney = (value: number) => {
  return `₩${value.toLocaleString()}`;
};
</script>

<style scoped>
.payroll-page {
  padding-top: 24px;
  padding-bottom: 40px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.payroll-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.payroll-header__right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.month-select {
  border-radius: 999px;
  padding: 6px 12px;
  border: 1px solid #d1d5db;
  font-size: 13px;
}

.payroll-header__buttons {
  display: flex;
  gap: 8px;
}

.btn-primary,
.btn-secondary {
  border-radius: 999px;
  font-size: 13px;
  padding: 8px 16px;
  border: none;
  cursor: pointer;
}

.btn-primary {
  background: linear-gradient(135deg, #06336f, #123c9c);
  color: white;
}

.btn-secondary {
  background-color: #eef2ff;
  color: #374151;
}

.summary-cards {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
}

.summary-card {
  background-color: #ffffff;
  border-radius: 16px;
  padding: 16px 18px;
  border: 1px solid #e5e7eb;
}

.summary-label {
  font-size: 13px;
  color: inherit;
}

.summary-value {
  margin-top: 6px;
  font-size: 20px;
  font-weight: 700;
}

.summary-caption {
  margin-top: 4px;
  font-size: 12px;
  opacity: 0.9;
}

.pay-detail {
  display: grid;
  grid-template-columns: 1.4fr 1.1fr;
  gap: 16px;
}

.pay-panel {
  background-color: #ffffff;
  border-radius: 16px;
  border: 1px solid #e5e7eb;
  padding: 16px 20px;
}

.panel-title {
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 12px;
}

.pay-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.pay-row {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
}

.pay-row--allowance .pay-name {
  color: #16a34a;
}

.pay-row--deduction .pay-name {
  color: #b91c1c;
}

.pay-row--total {
  border-top: 1px dashed #e5e7eb;
  margin-top: 6px;
  padding-top: 8px;
  font-weight: 600;
}

.pay-row--deduction-total {
  background-color: #fff7ed;
  border-radius: 8px;
  padding: 8px 10px;
}

.pay-amount--plus {
  color: #16a34a;
}

.pay-amount--minus {
  color: #b91c1c;
}

.work-info {
  background-color: #ffffff;
  border-radius: 16px;
  border: 1px solid #e5e7eb;
  padding: 16px 20px;
}

.work-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin-top: 10px;
}

.work-card {
  background-color: #f9fafb;
  border-radius: 12px;
  padding: 12px 14px;
}

.work-label {
  font-size: 12px;
  color: #6b7280;
}

.work-value {
  margin-top: 4px;
  font-weight: 600;
}

.pay-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(135deg, #0f172a, #1f2937);
  color: #ffffff;
  border-radius: 20px;
  padding: 18px 24px;
}

.footer-caption {
  font-size: 13px;
  opacity: 0.9;
}

.footer-value {
  font-size: 20px;
  font-weight: 700;
  margin-top: 4px;
}

.footer-subcaption {
  font-size: 12px;
  margin-top: 2px;
}

.footer-account {
  text-align: right;
}

.footer-account-label {
  font-size: 12px;
  opacity: 0.9;
  margin-bottom: 2px;
}

.footer-account-bank {
  font-weight: 600;
}

.footer-account-number,
.footer-account-holder {
  font-size: 13px;
}

/* 모달 / 명세서 */

.modal-backdrop {
  position: fixed;
  inset: 0;
  background-color: rgba(15, 23, 42, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 40;
}

.modal {
  background-color: #ffffff;
  border-radius: 16px;
  width: 520px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.modal-header {
  padding: 14px 20px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-close {
  background: none;
  border: none;
  cursor: pointer;
}

.payslip-body {
  padding: 16px 20px;
  overflow-y: auto;
}

.payslip-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
}

.payslip-month {
  font-weight: 600;
}

.payslip-section {
  margin-top: 12px;
}

.payslip-table {
  margin-top: 8px;
  border-radius: 8px;
}

.payslip-row {
  display: flex;
  justify-content: space-between;
  padding: 4px 2px;
  font-size: 13px;
}

.payslip-row--deduction span:last-child {
  color: #b91c1c;
}

.payslip-row--total {
  border-top: 1px dashed #e5e7eb;
  margin-top: 4px;
  padding-top: 6px;
  font-weight: 600;
}

.payslip-section--net {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16px;
  padding-top: 10px;
  border-top: 1px solid #e5e7eb;
}

.payslip-net {
  color: #1d4ed8;
  font-weight: 700;
}

.modal-footer {
  padding: 12px 20px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

/* 계좌 / 실수령 메타 섹션 */
.pay-meta {
  display: block;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.pay-meta-card {
  background-color: #ffffff;
  border-radius: 16px;
  border: 1px solid #e5e7eb;
  padding: 16px 20px;
}

.pay-meta-bank {
  font-weight: 600;
  margin-bottom: 2px;
}

.pay-meta-number,
.pay-meta-holder {
  font-size: 13px;
  color: #4b5563;
}

.pay-meta-net {
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 4px;
}

.pay-meta-caption {
  font-size: 13px;
  color: #6b7280;
}

.btn-link {
  margin-top: 10px;
  padding: 0;
  border: none;
  background: none;
  color: #2563eb;
  font-size: 13px;
  cursor: pointer;
  text-decoration: underline;
}

.pay-meta-card--full {
  width: 100%;
  padding: 20px;
  background: #ffffff;
  border-radius: 12px;
  border: 1px solid #f0f0f0;
}

.pay-meta-row {
  display: flex;
  /* justify-content: space-between; */
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f5f5f5;
}

.pay-meta-row:last-child {
  border-bottom: none;
}

.pay-meta-label {
  font-weight: 600;
  color: #555;
  width: 120px;
}

.pay-meta-value p {
  margin: 0;
  line-height: 1.4;
}

.btn-link {
  margin-left: auto;
  font-size: 14px;
}
</style>