<template>
  <div class="pay-history-page">

    <section v-if="history" class="history-cards">
      <div class="summary-card">
        <span class="summary-label">평균 실수령액</span>
        <p class="summary-value">{{ formatMoney(history.avgNetPay) }}</p>
      </div>
      <div class="summary-card">
        <span class="summary-label">최고 실수령액</span>
        <p class="summary-value">{{ formatMoney(history.maxNetPay) }}</p>
      </div>
      <div class="summary-card">
        <span class="summary-label">최저 실수령액</span>
        <p class="summary-value">{{ formatMoney(history.minNetPay) }}</p>
      </div>
<div class="summary-card">
    <span class="summary-label">전월 대비 변화율</span>
    <p
      class="summary-value"
      :class="history.monthOverMonthRate >= 0 ? 'rate-up' : 'rate-down'"
    >
      <span v-if="history.monthOverMonthRate >= 0">▲</span>
      <span v-else>▼</span>
      {{ history.monthOverMonthRate }}%
    </p>
  </div>

  <!-- 올해 누적 실수령액 -->
  <div class="summary-card">
    <span class="summary-label">올해 누적 실수령액</span>
    <p class="summary-value">{{ formatMoney(history.ytdNetPay) }}</p>
  </div>
      
    </section>

    <!-- 차트 -->
    <section v-if="history" class="history-chart">
      <h2 class="panel-title">급여 추이</h2>
      <canvas ref="chartRef" height="80"></canvas>
    </section>

    <!-- 테이블 표 -->
    <section v-if="history" class="history-table">
      
      <h2 class="panel-title">급여 이력</h2>
      
      <table>
        <thead>
          <tr class="table-header">
            <th>급여월</th>
            <th>기본급</th>
            <th>수당</th>
            <th>공제</th>
            <th>실수령액</th>
          </tr>
        </thead>
        <tbody class="table-body">
          <tr v-for="row in history.rows" :key="row.salaryMonth">
            <td class="table-cell">{{ row.salaryMonth }}</td>
            <td>{{ formatMoney(row.baseSalary) }}</td>
            <td class="plus">+{{ formatMoney(row.allowanceTotal) }}</td>
            <td class="minus">-{{ formatMoney(row.deductionTotal) }}</td>
            <td>{{ formatMoney(row.netPay) }}</td>
          </tr>
        </tbody>
      </table>

      <p class="history-note">
        <br/>
        · 급여 이력은 최근 12개월까지 조회 가능합니다. <br />
        · 상세 내역은 각 월의 급여명세서에서 확인하실 수 있습니다.
      </p>
    </section>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, computed, watch } from 'vue';
import { usePayrollStore } from '@/stores/payrollStore';
import { Chart, LineController, LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend } from 'chart.js';

Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend);

const store = usePayrollStore();
const history = computed(() => store.history);
const chartRef = ref<HTMLCanvasElement | null>(null);
let chart: Chart | null = null;

const buildChart = () => {
  if (!chartRef.value || !history.value) return;

  const labels = history.value.chart.map(c => c.salaryMonth);
  const data = history.value.chart.map(c => c.netPay);

  if (chart) {
    chart.destroy();
  }

  chart = new Chart(chartRef.value, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: '실수령액',
          data,
          tension: 0.3,
          fill: false
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,

       layout: {
      padding: {
        left: 10,
        right: 24,  
        top: 10,
        bottom: 10
      }
    },

      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label(context) {
              const v = context.parsed.y || 0;
              return `실수령액: ₩${v.toLocaleString()}`;
            }
          }
        }
      },
      scales: {
        y: { ticks: { callback: value => `₩${Number(value).toLocaleString()}` } }
      }
    }
  });
};

onMounted(async () => {
  await store.loadHistory();
  buildChart();
});

watch(history, () => {
  buildChart();
});

onUnmounted(() => {
  if (chart) chart.destroy();
});

const formatMoney = (value: number) => `₩${value.toLocaleString()}`;
</script>

<style scoped>
.pay-history-page {
  padding-top:24px;
  padding-bottom:40px;
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.history-cards {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 16px;
}

.summary-card {
  background-color: #ffffff;
  border-radius: 16px;
  padding: 12px 12px;
  border: 1px solid #e5e7eb;
}

.summary-label {
  font-size: 13px;
  color: #6b7280;
  margin-left:22px;
}

.summary-value {
  margin-top: 6px;
  margin-bottom: 6px;
  font-size: 18px;
  font-weight: 700;
  margin-left:12px;
}

.history-chart {
  background-color: #ffffff;
  border-radius: 16px;
  border: 1px solid #e5e7eb;
  /* padding: 24px 32px 72px; */
  padding-bottom:72px;
  height: 260px;
  margin-bottom: 24px;
}

.history-table {
  background-color: #ffffff;
  border-radius: 16px;
  border: 1px solid #e5e7eb;
  padding-bottom:10px;
  /* padding-top:16px; */
}

.history-table table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
  font-size: 13px;
}

/* 헤더 왼쪽 위 모서리 */
.history-table thead tr:first-child th:first-child {
  border-top-left-radius: 5px; 
}

/* 헤더 오른쪽 위 모서리 */
.history-table thead tr:first-child th:last-child {
  border-top-right-radius: 5px;
}

/* .history-table th,
.history-table td {
  padding: 14px 24px;
  text-align: right;
  border-bottom: 1px solid #f3f4f6;
} */

.history-table th {
  text-align: left;
  padding: 12px 20px;
}

.history-table td {
  text-align: left;
  padding: 12px 20px;
}

.history-table td:last-child {
  text-align: right;
}

.history-table th:first-child,
.history-table td:first-child,
.history-table th:last-child,
.history-table td:last-child {
  text-align: left;
}


.plus {
  color: #16a34a;
}

.minus {
  color: #b91c1c;
}

.history-note {
  padding-left:18px;
  margin-top: 12px;
  font-size: 12px;
  color: #6b7280;
}

.history-table th:nth-child(5) {
  text-align: right !important;
} 

.rate-up {
  color: #16a34a;
}

.rate-down {
  color: #dc2626;
}

.table-header{
  background-color: #162456;
  color:white;
}

.table-body tr:nth-child(2n){
  background-color: #E2E8F0;
}

.table-cell{
  color:#155DFC;
}

.table-body tr td:last-child {
  text-align: right;
}

.panel-title{
  padding-left:28px;
}
</style>
