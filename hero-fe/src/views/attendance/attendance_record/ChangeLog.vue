<template>
  <div class="attendance-wrapper">
    <div class="attendance-page">
      <!-- 상단 요약 카드 4개 -->
      <div class="summary-cards">
        <div class="summary-card">
          <div class="summary-title">이번 달 근무일</div>
          <div class="summary-value-wrapper">
            <span class="summary-value">15</span>
            <span class="summary-unit">시간</span>
          </div>
        </div>

        <div class="summary-card">
          <div class="summary-title">오늘 근무</div>
          <div class="summary-value-wrapper">
            <span class="summary-value">기본근무제</span>
          </div>
        </div>

        <div class="summary-card">
          <div class="summary-title">이번 달 지각</div>
          <div class="summary-value-wrapper">
            <span class="summary-value">2</span>
            <span class="summary-unit">회</span>
          </div>
        </div>

        <div class="summary-card">
          <div class="summary-title">이번 달 결근</div>
          <div class="summary-value-wrapper">
            <span class="summary-value">0</span>
            <span class="summary-unit">회</span>
          </div>
        </div>
      </div>

      <!-- 메인 패널 -->
      <div class="panel">
        <!-- 탭 영역 -->
        <div class="panel-tabs">
          <RouterLink
            :to="{ name: 'AttendancePersonal' }"
            class="tab tab-left"
            :class="{ 'tab-active': isActiveTab('AttendancePersonal') }"
          >
            개인 근태 이력
          </RouterLink>

          <RouterLink
            :to="{ name: 'AttendanceOvertime' }"
            class="tab"
            :class="{ 'tab-active': isActiveTab('AttendanceOvertime') }"
          >
            초과 근무 이력
          </RouterLink>

          <RouterLink
            :to="{ name: 'AttendanceCorrection' }"
            class="tab"
            :class="{ 'tab-active': isActiveTab('AttendanceCorrection') }"
          >
            근태 기록 수정 이력
          </RouterLink>

          <RouterLink
            :to="{ name: 'AttendanceChangeLog' }"
            class="tab tab-right"
            :class="{ 'tab-active': isActiveTab('AttendanceChangeLog') }"
          >
            근무제 변경 이력
          </RouterLink>
        </div>

        <!-- 검색 영역 (기간 필터 UI) -->
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

            <!-- 버튼 -->
            <div class="search-button-group">
              <button class="btn-search" @click="onSearch">검색</button>
              <button class="btn-reset" @click="onReset">초기화</button>
            </div>
          </div>
        </div>

        <!-- 테이블 영역 -->
        <div class="panel-table-wrapper">
          <div class="panel-table">
            <table class="attendance-table">
              <thead>
                <tr>
                  <th>날짜</th>
                  <th>근무제 이름</th>
                  <th>출근시간</th>
                  <th>퇴근시간</th>
                  <th>사유</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(row, index) in changeLogList"
                  :key="row.id"
                  :class="{ 'row-striped': index % 2 === 1 }"
                >
                  <td>{{ row.date }}</td>
                  <td class="worksystem-name">
                    {{ row.workSystemName }}
                  </td>
                  <td class="time-cell">
                    {{ formatTime(row.startTime) }}
                  </td>
                  <td class="time-cell">
                    {{ formatTime(row.endTime) }}
                  </td>
                  <td>{{ row.reason }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- 페이지네이션 (지금은 더미, 동작 없음) -->
          <div class="pagination">
            <button class="page-button">이전</button>
            <button class="page-button page-active">1</button>
            <button class="page-button">2</button>
            <button class="page-button">3</button>
            <button class="page-button">다음</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { RouterLink, useRoute } from 'vue-router'
import { ref } from 'vue'

const route = useRoute()
const isActiveTab = (name: string) => route.name === name

// 기간 필터 인풋 (지금은 UI만)
const startDate = ref('')
const endDate = ref('')

// 한 행 타입
interface WorkSystemChangeRow {
  id: number
  date: string
  workSystemName: string
  startTime: string
  endTime: string
  reason: string
}

// Figma 기준 더미 데이터
const changeLogList = ref<WorkSystemChangeRow[]>([
  {
    id: 1,
    date: '2025-12-01',
    workSystemName: '유연근무제',
    startTime: '09:30',
    endTime: '18:30',
    reason: '늦잠',
  },
  {
    id: 2,
    date: '2025-11-30',
    workSystemName: '재택근무제',
    startTime: '09:00',
    endTime: '18:00',
    reason: '몸살',
  },
  {
    id: 3,
    date: '2025-11-29',
    workSystemName: '유연근무제',
    startTime: '10:00',
    endTime: '17:00',
    reason: '교통체증',
  },
  {
    id: 4,
    date: '2025-11-28',
    workSystemName: '유연근무제',
    startTime: '10:00',
    endTime: '19:00',
    reason: '야근',
  },
  {
    id: 5,
    date: '2025-11-27',
    workSystemName: '재택근무제',
    startTime: '09:00',
    endTime: '18:00',
    reason: '독감',
  },
])

// 검색 버튼 (지금은 콘솔만, 나중에 백엔드 연동 시 로직 교체)
function onSearch() {
  console.log('근무제 변경 이력 검색 클릭 (아직 필터 로직 없음)', {
    startDate: startDate.value,
    endDate: endDate.value,
  })
}

// 초기화 버튼
function onReset() {
  startDate.value = ''
  endDate.value = ''
}

// "09:00:00" 형식 대응용
function formatTime(time: string) {
  if (!time) return ''
  return time.length >= 5 ? time.substring(0, 5) : time
}
</script>


<style scoped>
/* TODO: attendance-wrapper / attendance-page / panel 등
  BEM 네이밍 컨벤션에 맞춰 점진적 리팩터링 예정 */
  
/* ===== 레이아웃 / 공통 스타일 (Personal / Overtime과 동일) ===== */

.attendance-wrapper {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow-y: auto;
}

.attendance-page {
  width: 100%;
  height: 85%;
  padding: 36px;
  display: flex;
  flex-direction: column;
  gap: 36px;
  overflow-y: auto;
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
  border-radius: 14px;
  border: 1px solid #e2e8f0;
  padding: 20px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}

.summary-title {
  color: #64748b;
  font-size: 24px;
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
  font-size: 38px;
  font-weight: 700;
  color: #000000;
}

.summary-unit {
  font-size: 26px;
  font-weight: 500;
  color: #64748b;
}

/* 메인 패널 */
.panel {
  width: 100%;
  background: #ffffff;
  border-radius: 14px;
  border: 2px solid #e2e8f0;
  display: flex;
  flex-direction: column;
}

/* 탭 영역 */
.panel-tabs {
  display: inline-flex;
  border-bottom: 1px solid #e2e8f0;
}

.tab {
  width: 146px;
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ffffff;
  border-top: 2px solid #e2e8f0;
  border-bottom: 2px solid #e2e8f0;
  border-right: 2px solid #e2e8f0;
  font-size: 14px;
  color: #62748e;
  text-decoration: none;
}

.tab-left {
  border-left: 2px solid #e2e8f0;
  border-top-left-radius: 14px;
}

.tab-right {
  border-top-right-radius: 14px;
}

.tab-active {
  background: linear-gradient(180deg, #1c398e 0%, #162456 100%);
  color: #ffffff;
  font-weight: 700;
}

/* 검색 영역 */
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

.search-button-group {
  display: flex;
  align-items: center;
  gap: 6px;
}

/* 날짜 필터 그룹 */
.date-filter-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.date-label {
  font-size: 13px;
  color: #64748b;
}

.date-input-wrapper {
  display: flex;
  align-items: center;
  width: 260px;
  height: 40px;
  border-radius: 10px;
  border: 2px solid #cad5e2;
  background: #ffffff;
  overflow: hidden;
}

.date-input {
  flex: 1;
  border: none;
  height: 100%;
  padding: 0 12px;
  font-size: 14px;
  color: #1f2933;
}

.date-input:focus {
  outline: none;
}

.date-icon {
  width: 40px;
  height: 100%;
  border-left: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  color: #94a3b8;
}

/* 버튼 */
.btn-search,
.btn-reset {
  min-width: 70px;
  height: 40px;
  border-radius: 10px;
  font-size: 14px;
  cursor: pointer;
  padding: 0 12px;
  border-width: 2px;
  border-style: solid;
  transition: background-color 0.15s ease,
    color 0.15s ease,
    box-shadow 0.1s ease,
    transform 0.05s ease;
}

.btn-search {
  background: #155dfc;
  border-color: #155dfc;
  color: #ffffff;
}

.btn-reset {
  background: #ffffff;
  border-color: #cad5e2;
  color: #62748e;
}

.btn-search:hover {
  background: #2b6bff;
  border-color: #2b6bff;
}

.btn-reset:hover {
  background: #e5edff;
}

.btn-search:active,
.btn-reset:active {
  transform: translateY(1px);
  box-shadow: none;
}

/* 테이블 영역 */
.panel-table-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 14px 18px 0 18px;
  gap: 20px;
}

.panel-table {
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
}

/* 테이블 */
.attendance-table {
  width: 100%;
  border-collapse: collapse;
}

.attendance-table thead tr {
  background: linear-gradient(180deg, #1c398e 0%, #162456 100%);
}

.attendance-table th {
  color: #ffffff;
  font-size: 14px;
  font-weight: 700;
  padding: 16px;
  text-align: left;
}

.attendance-table td {
  padding: 16px;
  font-size: 14px;
  color: #62748e;
  border-top: 0.67px solid #e2e8f0;
}

/* 시간 칸 전용 */
.attendance-table td.time-cell {
  text-align: center; 
  padding-left: 0;    
  padding-right: 42px;
}

.attendance-table tbody tr {
  background: #ffffff;
}

.attendance-table tbody tr.row-striped {
  background: #f8fafc;
}

/* 페이지네이션 */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 16px 0;
  gap: 10px;
}

.page-button {
  min-width: 32px;
  height: 28px;
  border-radius: 4px;
  border: 0.67px solid #cad5e2;
  font-size: 14px;
  color: #62748e;
  background: #ffffff;
  cursor: pointer;
}

.page-active {
  background: #155dfc;
  color: #ffffff;
  border-color: #155dfc;
}

/* 수정 후 시간 강조 */
.changed-time {
  color: #e7000b;
}



</style>

