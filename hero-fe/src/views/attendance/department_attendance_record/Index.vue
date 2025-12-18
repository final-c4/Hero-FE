<!-- 
  <pre>
  (File => TypeScript / Vue) Name   : WorkSystemStatus.vue
  Description : 근무제 현황 조회 페이지
                - 이름·근무제·직급에 대한 검색
                - 프론트 단 필터링 + 페이지네이션
                - 더미 데이터를 기반으로 근무제/근무시간 목록 표시

  History
  2025/12/16(이지윤) 최초 작성
  </pre>

  @author 이지윤
  @version 1.0
-->

<template>
  <div class="worksystem-wrapper">
    <div class="worksystem-page">
      <div class="panel">
        <!-- 검색 영역 : 기간(시작) / 기간(종료) -->
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
              </div>
            </div>

            <!-- 검색 / 초기화 버튼 -->
            <div class="search-button-group">
              <button
                class="btn-search"
                @click="onSearch"
              >
                검색
              </button>
              <button
                class="btn-reset"
                @click="onReset"
              >
                초기화
              </button>
            </div>
          </div>
        </div>

        <!-- 테이블 영역 -->
        <div class="panel-table-wrapper">
          <div class="panel-table">
            <table class="employee-table">
              <thead>
                <tr>
                  <th class="col-name">이름</th>
                  <th class="col-status">상태</th>
                  <th class="col-position">직급</th>
                  <th class="col-worksystem">근무제</th>
                  <th class="col-worktime">근무시간</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(row, index) in pagedList"
                  :key="row.id"
                  :class="{ 'row-striped': index % 2 === 1 }"
                >
                  <td class="cell-name">
                    {{ row.name }}
                  </td>

                  <td class="cell-status">
                    <span class="status-pill">
                      {{ row.status }}
                    </span>
                  </td>

                  <td class="cell-position">
                    {{ row.position }}
                  </td>

                  <td class="cell-worksystem">
                    {{ row.workSystem }}
                  </td>

                  <td class="cell-worktime">
                    {{ row.workTime }}
                  </td>
                </tr>

                <tr v-if="pagedList.length === 0">
                  <td
                    colspan="5"
                    class="empty-row"
                  >
                    조회된 근무제 현황이 없습니다.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- 페이지네이션 -->
          <div
            v-if="totalPages > 0"
            class="pagination"
          >
            <button
              class="page-button"
              :disabled="currentPage === 1"
              @click="goPage(currentPage - 1)"
            >
              이전
            </button>

            <button
              v-for="page in totalPages"
              :key="page"
              class="page-button"
              :class="{ 'page-active': page === currentPage }"
              @click="goPage(page)"
            >
              {{ page }}
            </button>

            <button
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
  </div>
</template>


<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import {
  useDeptWorkSystemStore,
  type DeptWorkSystemRowDTO,
} from '@/stores/attendance/deptWorkSystem'

/**
 * 화면에서 사용하는 테이블 한 행 타입
 * - 백엔드 DTO(DeptWorkSystemRowDTO)를 화면용 필드로 변환한 형태
 */
interface EmployeeWorkSystemRow {
  id: number
  name: string
  status: string
  position: string
  workSystem: string
  workTime: string
}

/** 부서 근태 현황 Pinia 스토어 */
const deptWorkStore = useDeptWorkSystemStore()
const { workDate } = storeToRefs(deptWorkStore)

/** 기간 필터 (화면용) – 인풋 디폴트는 비어 있도록 유지 */
const startDate = ref<string>('')   // → input에 '연도-월-일' 플레이스홀더 표시
const endDate = ref<string>('')

/** 페이지네이션 상태 (프론트 전용) */
const currentPage = ref<number>(1)
const pageSize = ref<number>(5)

/**
 * 스토어의 DTO 목록을 화면용 행 데이터로 변환
 * - name/status/position/workSystem/workTime 으로 매핑
 */
const allList = computed<EmployeeWorkSystemRow[]>(() => {
  return deptWorkStore.rows.map((row: DeptWorkSystemRowDTO, index) => ({
    id: row.employeeId ?? index, // employeeId를 키로 사용, 없으면 index
    name: row.employeeName,
    status: row.state,
    position: row.jobTitle,
    workSystem: row.workSystemName,
    workTime: `${row.startTime} - ${row.endTime}`,
  }))
})

/**
 * 현재는 백엔드가 workDate(단일 날짜)만 받기 때문에
 * - 우선 startDate를 기준으로 workDate를 맞춰서 조회
 * - startDate가 비어 있고 endDate만 있으면 endDate를 사용
 * - 둘 다 없으면 오늘 날짜를 workDate로 사용
 * (화면 인풋 값은 건드리지 않음)
 */
const syncWorkDateFromRange = () => {
  if (startDate.value) {
    workDate.value = startDate.value
    return
  }

  if (endDate.value) {
    workDate.value = endDate.value
    return
  }

  const today = new Date()
  workDate.value = today.toISOString().slice(0, 10)
}

/** 전체 페이지 수 (프론트 기준) */
const totalPages = computed<number>(() => {
  return Math.max(1, Math.ceil(allList.value.length / pageSize.value))
})

/** 현재 페이지에 보여줄 데이터 */
const pagedList = computed<EmployeeWorkSystemRow[]>(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value

  return allList.value.slice(start, end)
})

/**
 * 검색 버튼 클릭
 * - 기간 필터 → workDate 동기화
 * - 1페이지부터 다시 조회
 */
const onSearch = async (): Promise<void> => {
  currentPage.value = 1
  syncWorkDateFromRange()

  // TODO: departmentId는 추후 로그인/부서선택과 연동
  const departmentId = 1
  deptWorkStore.setFilters(departmentId, workDate.value)
  await deptWorkStore.fetchDeptWorkSystem(1)
}

/**
 * 초기화 버튼 클릭
 * - 기간 인풋은 비우고(연도-월-일 플레이스홀더로 복귀)
 * - workDate만 오늘 날짜로 돌려서 조회
 */
const onReset = async (): Promise<void> => {
  // 인풋은 비우기
  startDate.value = ''
  endDate.value = ''
  currentPage.value = 1

  // 조회 기준 날짜는 오늘로
  const today = new Date()
  const iso = today.toISOString().slice(0, 10)

  workDate.value = iso
  const departmentId = 1
  deptWorkStore.setFilters(departmentId, iso)
  await deptWorkStore.fetchDeptWorkSystem(1)
}

/**
 * 페이지 이동 (프론트 페이지네이션)
 */
const goPage = (page: number): void => {
  if (page < 1 || page > totalPages.value) {
    return
  }

  currentPage.value = page
}

/**
 * 화면 진입 시 기본 조회
 * - workDate만 오늘 날짜로 설정해서 데이터 조회
 * - startDate/endDate는 건드리지 않아서 인풋에는 '연도-월-일' 그대로 보임
 */
onMounted(async () => {
  const today = new Date()
  const iso = today.toISOString().slice(0, 10)

  workDate.value = iso

  const departmentId = 1
  deptWorkStore.setFilters(departmentId, iso)
  await deptWorkStore.fetchDeptWorkSystem(1)
})
</script>


<style scoped>
.worksystem-wrapper {
  width: 100%;
  height: 100%;
  padding: 36px;
  background-color: #f8fafc;
  box-sizing: border-box;
}

.worksystem-page {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
}

/* 메인 패널 */
.panel {
  width: 100%;
  background-color: #ffffff;
  border-radius: 14px;
  border: 2px solid #e2e8f0;
  display: flex;
  flex-direction: column;
}

/* 버튼 */
.btn-search,
.btn-reset {
  min-width: 60px;
  height: 40px;
  border-radius: 10px;
  border: 2px solid #cad5e2;
  background-color: #ffffff;
  font-size: 14px;
  color: #62748e;
  cursor: pointer;
}

.btn-search {
  background-color: #155dfc;
  border-color: #155dfc;
  color: #ffffff;
}

.btn-search:disabled,
.btn-reset:disabled {
  opacity: 0.5;
  cursor: default;
}

/* 테이블 영역 */
.panel-table-wrapper {
  padding: 0 0 16px;
}

.panel-table {
  width: 100%;
  overflow-x: auto;
}

.employee-table {
  width: 100%;
  border-collapse: collapse;
  /* table-layout: fixed; */
}

/* 헤더 */
.employee-table thead tr {
  background: linear-gradient(180deg, #1c398e 0%, #162456 100%);
}

.employee-table th {
  height: 48px;
  padding: 11px 16px;
  font-size: 14px;
  font-weight: 700;
  color: #ffffff;
  text-align: left;
  border: none;
}

.col-name {
  width: 20%;
}
.col-status {
  width: 20%;
}
.col-position {
  width: 15%;
}
.col-worksystem {
  width: 25%;
}
.col-worktime {
  width: 20%;
}

/* 바디 */
.employee-table td {
  height: 60px;
  padding: 0 16px;
  font-size: 14px;
  color: #7b839f;
  border-top: 1px solid #e2e8f0;
  vertical-align: middle;
}

.row-striped {
  background-color: #f8fafc;
}

.cell-name {
  font-weight: 400;
}

.cell-status {
  padding-top: 0;
  padding-bottom: 0;
}

.status-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 80px;
  height: 24px;
  padding: 0 12px;
  border-radius: 9999px;
  border: 1px solid #cad5e2;
  background-color: #ffffff;
  font-size: 12px;
  color: #030213;
}

/* 근무시간은 살짝 가운데 정렬 */
.cell-worktime {
  text-align: left;
}

/* 빈 데이터 */
.empty-row {
  text-align: center;
  padding: 24px 0;
  color: #94a3b8;
}

/* 페이지네이션 */
.pagination {
  margin-top: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
}

.page-button {
  min-width: 40px;
  height: 30px;
  border-radius: 4px;
  border: 1px solid #cad5e2;
  background-color: #ffffff;
  font-size: 14px;
  color: #62748e;
  cursor: pointer;
}

.page-button:disabled {
  opacity: 0.5;
  cursor: default;
}

.page-active {
  background-color: #155dfc;
  border-color: #155dfc;
  color: #ffffff;
}

.employee-table tbody tr:last-child td {
  border-bottom: 1px solid #e2e8f0;
}

.panel-search {
  border-bottom: 2px solid #e2e8f0;
  padding: 14px 18px;
}

.panel-search-inner {
  display: flex;
  justify-content: flex-end;
  align-items: flex-end;
  gap: 8px;
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

/* 인풋 + 캘린더 아이콘 */
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

/* 버튼 영역 */
.search-button-group {
  display: flex;
  align-items: center;
  gap: 6px;
  padding-bottom: 2px;
}

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
  transition:
    background-color 0.15s ease,
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

</style>
