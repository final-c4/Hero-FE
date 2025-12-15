<!-- src/views/vacation/VacationHistory.vue -->
<template>
  <div class="vacation-history-wrapper">
    <div class="vacation-history-page">
      <!-- 상단 요약 카드 4개 -->
      <div class="summary-cards">
        <!-- 총 연차 -->
        <div class="summary-card">
          <div class="summary-card-header">총 연차</div>
          <div class="summary-card-body">
            <span class="summary-value">{{ totalAnnualLeave }}</span>
            <span class="summary-unit">일</span>
          </div>
        </div>

        <!-- 사용 연차 -->
        <div class="summary-card">
          <div class="summary-card-header">사용 연차</div>
          <div class="summary-card-body">
            <span class="summary-value">{{ usedLeave }}</span>
            <span class="summary-unit">일</span>
          </div>
        </div>

        <!-- 남은 연차 -->
        <div class="summary-card">
          <div class="summary-card-header">남은 연차</div>
          <div class="summary-card-body">
            <span class="summary-value">{{ remainingLeave }}</span>
            <span class="summary-unit">일</span>
          </div>
        </div>

        <!-- 소멸 예정 -->
        <div class="summary-card">
          <div class="summary-card-header">소멸 예정</div>
          <div class="summary-card-body">
            <span class="summary-value">{{ expiringLeave }}</span>
            <span class="summary-unit">일</span>
          </div>
        </div>
      </div>

      <!-- 하단 패널 (테이블 + 페이징) -->
      <div class="vacation-panel">
        <!-- 검색 영역 (기간 필터) -->
        <div class="panel-search">
        <div class="panel-search-inner">
            <!-- 기간(시작) -->
            <div class="date-filter-group">
            <span class="date-label">기간(시작)</span>
            <div class="date-input-wrapper">
                <input
                v-model="startDate"
                type="date"
                class="date-input"
                />
                <span class="date-icon">📅</span>
            </div>
            </div>

            <!-- 기간(종료) -->
            <div class="date-filter-group">
            <span class="date-label">기간(종료)</span>
            <div class="date-input-wrapper">
                <input
                v-model="endDate"
                type="date"
                class="date-input"
                />
                <span class="date-icon">📅</span>
            </div>
            </div>

            <!-- 검색 / 초기화 버튼 -->
            <div class="search-button-group">
            <button class="btn-search" type="button" @click="onSearch">검색</button>
            <button class="btn-reset" type="button" @click="onReset">초기화</button>
            </div>
        </div>
        </div>

        <!-- 테이블 영역 -->
        <div class="vacation-table-wrapper">
        <table class="vacation-table">
            <thead>
            <tr>
                <th class="col-period">휴가 기간</th>
                <th class="col-type">휴가 종류</th>
                <th class="col-reason">휴가 사유</th>
                <th class="col-status">승인 현황</th>
            </tr>
            </thead>
            <tbody>
            <tr
                v-for="(row, index) in pagedVacationList"
                :key="row.id"
                :class="{ 'row-striped': index % 2 === 1 }"
            >
                <td class="cell-period">
                {{ row.period }}
                </td>
                <td class="cell-type">
                <span class="vacation-type-pill">
                    {{ row.type }}
                </span>
                </td>
                <td class="cell-reason">
                {{ row.reason }}
                </td>
                <td class="cell-status">
                {{ row.status }}
                </td>
            </tr>
            </tbody>
        </table>
        </div>

        <!-- 페이지네이션 -->
        <div class="vacation-pagination">
          <button
            type="button"
            class="page-button"
            :disabled="currentPage === 1"
            @click="goPage(currentPage - 1)"
          >
            이전
          </button>

          <button
            v-for="page in totalPages"
            :key="page"
            type="button"
            class="page-button"
            :class="{ 'page-button--active': page === currentPage }"
            @click="goPage(page)"
          >
            {{ page }}
          </button>

          <button
            type="button"
            class="page-button"
            :disabled="currentPage === totalPages"
            @click="goPage(currentPage + 1)"
          >
            다음
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface VacationRow {
  id: number
  period: string       // "2025-11-20 (1일)" 등
  type: string         // 연차 / 반차 / 병가 ...
  reason: string       // 휴가 사유
  status: string       // 승인, 반려 등
}

/**
 * 상단 요약 카드 데이터 (추후 API 연동 예정)
 */
const totalAnnualLeave = ref(15)
const usedLeave = ref(6)
const remainingLeave = ref(2)
const expiringLeave = ref(0)

/**
 * 하단 휴가 이력 테이블 더미 데이터
 * - 나중에 백엔드 연동 시 API 응답으로 대체
 */
const vacationList = ref<VacationRow[]>([
  {
    id: 1,
    period: '2025-11-20 (1일)',
    type: '연차',
    reason: '개인 사정',
    status: '승인',
  },
  {
    id: 2,
    period: '2025-11-20 (1일)',
    type: '반차',
    reason: '병가',
    status: '승인',
  },
  {
    id: 3,
    period: '2025-10-10 ~ 2025-10-12 (3일)',
    type: '연차',
    reason: '가족 행사',
    status: '승인',
  },
  {
    id: 4,
    period: '2025-09-05 ~ 2025-09-06 (2일)',
    type: '연차',
    reason: '여행',
    status: '승인',
  },
  {
    id: 5,
    period: '2025-07-20 ~ 2025-07-22 (3일)',
    type: '연차',
    reason: '병가',
    status: '승인',
  },
])

/** 필터링 결과 리스트 */
const filteredVacationList = ref<VacationRow[]>([...vacationList.value])

/** 날짜 필터 상태 */
const startDate = ref('')
const endDate = ref('')

/**
 * 간단한 페이지네이션 (추후 백엔드 연동 시 교체)
 */
const currentPage = ref(1)
const pageSize = ref(10)

/** 전체 페이지 수 */
const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredVacationList.value.length / pageSize.value)),
)

/** 현재 페이지 데이터 */
const pagedVacationList = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredVacationList.value.slice(start, end)
})

/** period 문자열에서 시작/종료 날짜 추출 */
const parsePeriodRange = (period: string): { from: Date; to: Date } | null => {
  try {
    // "2025-10-10 ~ 2025-10-12 (3일)"
    // "2025-11-20 (1일)"
    const [rangePart] = period.split('(') // 괄호 앞까지만
    const parts = rangePart.split('~').map(p => p.trim())

    if (parts.length === 1) {
      const dateStr = parts[0].split(' ')[0] // "2025-11-20"
      const d = new Date(dateStr)
      return { from: d, to: d }
    }

    const fromStr = parts[0].split(' ')[0]
    const toStr = parts[1].split(' ')[0]
    return {
      from: new Date(fromStr),
      to: new Date(toStr),
    }
  } catch {
    return null
  }
}

/** 검색 버튼: 날짜 기준 필터링 */
const onSearch = () => {
  const filterFrom = startDate.value ? new Date(startDate.value) : null
  const filterTo = endDate.value ? new Date(endDate.value) : null

  filteredVacationList.value = vacationList.value.filter(row => {
    const range = parsePeriodRange(row.period)
    if (!range) return true // 파싱 실패 시 일단 포함

    const { from, to } = range

    // 시작/종료 필터가 모두 없는 경우 → 전체
    if (!filterFrom && !filterTo) return true

    // 필터 범위와 휴가 기간이 겹치는지 확인
    if (filterFrom && to < filterFrom) return false
    if (filterTo && from > filterTo) return false

    return true
  })

  currentPage.value = 1
}

/** 초기화 버튼 */
const onReset = () => {
  startDate.value = ''
  endDate.value = ''
  filteredVacationList.value = [...vacationList.value]
  currentPage.value = 1
}

/** 페이지 이동 */
const goPage = (page: number) => {
  if (page < 1 || page > totalPages.value) return
  currentPage.value = page
}
</script>

<style scoped>
.vacation-history-wrapper {
  width: 100%;
  height: 100%;
  padding: 20px 36px 20px 30px;
  display: flex;
  flex-direction: column;
}

.vacation-history-page {
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 30px;
}

/* 상단 요약 카드 */
.summary-cards {
  display: flex;
  align-items: stretch;
  gap: 20px;
}

.summary-card {
  flex: 1;
  background: #ffffff;
  border-radius: 16px;
  border: 1px solid #e5e7eb;
  padding: 12px 12px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}

.summary-title {
  color: #64748b;
  font-size: 13px;
  font-weight: 500;
  line-height: 1.2;
  margin-bottom: 8px;
}

.summary-value-wrapper {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.summary-value {
  font-size: 18px;
  font-weight: 700;
  color: #000000;
}

.summary-unit {
  font-size: 18px;
  font-weight: 500;
  color: #64748b;
}


/* 하단 패널 */
.vacation-panel {
  width: 100%;
  background: #ffffff;
  border-radius: 14px;
  outline: 2px solid #e2e8f0;
  outline-offset: -2px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* 테이블 */
.vacation-table-wrapper {
  width: 100%;
}

.vacation-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
}

/* 헤더 */
.vacation-table thead tr {
  background: linear-gradient(180deg, #1c398e 0%, #162456 100%);
}

.vacation-table th {
  padding: 11px 16px;
  text-align: left;
  font-size: 14px;
  font-weight: 700;
  color: #ffffff;
}

.col-period,
.col-type,
.col-reason,
.col-status {
  width: 25%;
}

/* 바디 */
.vacation-table td {
  padding: 16px;
  font-size: 14px;
  color: #62748e;
  border-top: 0.67px solid #e2e8f0;
}

.row-striped {
  background-color: #f8fafc;
}

/* 휴가 종류 Pill */
.vacation-type-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 47px;
  height: 24px;
  padding: 0 8px;
  border-radius: 999px;
  font-size: 12px;
  color: #030213;
  background-color: #ffffff;
}

/* 페이지네이션 */
.vacation-pagination {
  display: flex;                      
  justify-content: center;             
  align-items: center;
  gap: 10px;
  padding: 16px 0 16px 0;            
  border-top: 2px solid #e2e8f0;
  background: #f8fafc;
}

.page-button {
  min-width: 34px;
  height: 29px;
  padding: 4px 10px;
  border-radius: 4px;
  border: 0.67px solid #cad5e2;
  background: #ffffff;
  font-size: 14px;
  color: #62748e;
  cursor: pointer;
}

.page-button--active {
  background: #155dfc;
  color: #ffffff;
  border-color: #155dfc;
}

.page-button:disabled {
  opacity: 0.5;
  cursor: default;
}

.panel-search {
  border-top: 2px solid #e2e8f0;
  border-bottom: 2px solid #e2e8f0;
  padding: 14px 18px;
}

.panel-search-inner {
  display: flex;
  justify-content: flex-end;
  align-items: flex-end;
  gap: 16px;
}

.date-filter-group {
  display: flex;
  flex-direction: column;   
  gap: 6px;
}

.date-label {
  font-size: 12px;
  color: #64748b;
}

.date-input-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  border-radius: 8px;
  border: 1px solid #cbd5e1;
  background: #ffffff;
}

.date-input {
  border: none;
  outline: none;
  font-size: 14px;
  color: #0f172a;
}

.date-input::-webkit-calendar-picker-indicator {
  cursor: pointer;
}

.date-icon {
  font-size: 16px;
}

.search-button-group {
  display: flex;
  align-items: center;
  gap: 6px;
  padding-bottom: 2px;
}


.btn-search {
  width: 60px;
  height: 40px;
  border-radius: 10px;
  border: 2px solid #155dfc;
  background: #155dfc;
  font-size: 14px;
  color: #ffffff;
  cursor: pointer;
}

.btn-reset {
  width: 60px;
  height: 40px;
  border-radius: 10px;
  border: 2px solid #e2e8f0;
  background: #ffffff;
  font-size: 14px;
  color: #64748b;
  cursor: pointer;
}


</style>
