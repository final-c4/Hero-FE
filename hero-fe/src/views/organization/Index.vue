<template>
  <div class="page-container">
    <div class="header">
      <h1 class="title">조직도</h1>
    </div>

    <div v-if="isLoading" class="loading-state">
      <p>조직도 정보를 불러오는 중입니다...</p>
    </div>
    <div v-else-if="error" class="error-state">
      <p>{{ error }}</p>
      <button @click="loadData" class="retry-btn">다시 시도</button>
    </div>

    <div v-else class="content-grid">
      <!-- Left Panel: Department List -->
      <div class="panel department-list-panel">
        <div class="panel-header">
          <h2>부서 목록</h2>
        </div>
        <div class="panel-body">
          <ul class="tree-root">
            <OrganizationTreeNode
              v-for="node in filteredOrganizationChart"
              :key="node.departmentId"
              :node="node"
              :is-for-list="true"
              :selected-department-id="selectedDepartment?.departmentId"
              @select-department="handleSelectDepartment"
            />
          </ul>
        </div>
      </div>

      <!-- Center Panel: Department Details -->
      <div class="panel department-detail-panel">
        <div v-if="!selectedDepartment" class="placeholder">
          <p>왼쪽에서 부서를 선택해주세요.</p>
        </div>
        <div v-else class="department-details">
          <div class="panel-header">
            <h2>{{ selectedDepartment.departmentName }} 정보</h2>
          </div>
          <div class="panel-body">
            <div v-if="selectedDepartment.children && selectedDepartment.children.length > 0" class="detail-section">
              <h3 class="detail-title">하위 부서</h3>
              <ul class="sub-department-list">
                <li v-for="child in selectedDepartment.children" :key="child.departmentId" @click="handleSelectDepartment(child)" class="sub-department-item">
                  <span>{{ child.departmentName }}</span>
                  <span class="member-count">({{ getRecursiveMemberCount(child) }}명)</span>
                </li>
              </ul>
            </div>
            <div v-if="selectedDepartment.employees && selectedDepartment.employees.length > 0" class="detail-section">
              <h3 class="detail-title">소속 인원</h3>
              <ul class="employee-list-center">
                <li v-for="emp in sortedEmployees" :key="emp.employeeId" @click="handleSelectEmployee(emp)" :class="{ 'selected': selectedEmployee?.employeeId === emp.employeeId }" class="employee-item-center">
                  <div class="profile-img-wrapper">
                    <img v-if="!centerListImageErrorIds.has(emp.employeeId)" :src="getProfileImageUrl(emp.imagePath)" @error="onCenterListImageError(emp.employeeId)" class="profile-img" alt="profile" />
                    <div v-else class="profile-initial">{{ emp.employeeName.charAt(0) }}</div>
                  </div>
                  <div class="employee-info">
                    <span class="employee-name">{{ emp.employeeName }} {{ emp.gradeName }}</span>
                    <span class="employee-job">{{ emp.jobTitleName }}</span>
                  </div>
                </li>
              </ul>
            </div>
            <div v-if="(!selectedDepartment.children || selectedDepartment.children.length === 0) && (!selectedDepartment.employees || selectedDepartment.employees.length === 0)" class="no-content">
              <p>하위 부서 또는 소속 인원이 없습니다.</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Panel: Employee Details -->
      <div class="panel employee-detail-panel">
        <div v-if="!selectedEmployee" class="placeholder">
          <p>사원을 선택하여 상세 정보를 확인하세요.</p>
        </div>
        <div v-else class="employee-details">
          <div class="panel-header">
            <h2>사원 정보</h2>
            <button @click="selectedEmployee = null" class="close-btn">×</button>
          </div>
          <div class="panel-body">
            <div class="employee-profile-card">
              <div class="profile-img-large-wrapper">
                <img v-if="!selectedEmployeeImageError" :src="getProfileImageUrl(selectedEmployee.imagePath)" @error="selectedEmployeeImageError = true" class="profile-img-large" alt="profile" />
                <div v-else class="profile-initial-large">{{ selectedEmployee.employeeName.charAt(0) }}</div>
              </div>
              <h3 class="employee-name-large">{{ selectedEmployee.employeeName }}</h3>
              <p class="employee-grade-large">{{ selectedEmployee.gradeName }}</p>
            </div>
            <div class="employee-info-grid">
              <div class="info-item"><span class="label">부서</span><span class="value">{{ selectedDepartment?.departmentName }}</span></div>
              <div class="info-item"><span class="label">직책</span><span class="value">{{ selectedEmployee.jobTitleName }}</span></div>
              <div class="info-item"><span class="label">사번</span><span class="value">{{ selectedEmployee.employeeNumber }}</span></div>
              <div class="info-item"><span class="label">이메일</span><span class="value">{{ selectedEmployee.email }}</span></div>
              <div class="info-item"><span class="label">연락처</span><span class="value">{{ selectedEmployee.phone }}</span></div>
              <div class="info-item"><span class="label">입사일</span><span class="value">{{ selectedEmployee.hireDate }}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useOrganizationStore } from '@/stores/organization/organization.store';
import type { OrganizationNode, OrganizationEmployeeDetail } from '@/types/organization/organization.types';
import OrganizationTreeNode from './OrganizationTreeNode.vue';

const store = useOrganizationStore();
const { organizationChart, isLoading, error } = storeToRefs(store);

const filteredOrganizationChart = computed(() => {
  return organizationChart.value?.filter(node => node.departmentName !== '관리자 부서') || [];
});

const sortedEmployees = computed(() => {
  const employees = selectedDepartment.value?.employees;
  if (!employees) return [];

  return [...employees].sort((a, b) => {
    // 1. 팀장 우선 (직책이 '팀장'인 경우 최상단)
    const aIsLeader = a.jobTitleName === '팀장';
    const bIsLeader = b.jobTitleName === '팀장';
    if (aIsLeader && !bIsLeader) return -1;
    if (!aIsLeader && bIsLeader) return 1;

    // 2. 직급 순서 (높은 직급이 위로)
    const gradeOrder: Record<string, number> = {
      '사장': 1, '부사장': 2, '전무': 3, '상무': 4, '이사': 5,
      '부장': 6, '차장': 7, '과장': 8, '대리': 9, '주임': 10, '사원': 11, '인턴': 12
    };
    const aRank = gradeOrder[a.gradeName] || 99;
    const bRank = gradeOrder[b.gradeName] || 99;
    
    if (aRank !== bRank) return aRank - bRank;

    // 3. 입사일 순 (먼저 입사한 사람이 위로)
    const aDate = a.hireDate || '9999-12-31';
    const bDate = b.hireDate || '9999-12-31';
    return aDate.localeCompare(bDate);
  });
});

const selectedDepartment = ref<OrganizationNode | null>(null);
const selectedEmployee = ref<OrganizationEmployeeDetail | null>(null);
const centerListImageErrorIds = ref(new Set<number>());
const selectedEmployeeImageError = ref(false);

const loadData = () => {
  store.loadOrganizationChart();
};

const handleSelectDepartment = (department: OrganizationNode) => {
  selectedDepartment.value = department;
  selectedEmployee.value = null; // 부서 변경 시 사원 선택 해제
  centerListImageErrorIds.value.clear();
};

const handleSelectEmployee = (employee: OrganizationEmployeeDetail) => {
  selectedEmployee.value = employee;
  selectedEmployeeImageError.value = false;
};

const getRecursiveMemberCount = (node: OrganizationNode): number => {
  let count = node.employees?.length || 0;
  if (node.children) {
    for (const child of node.children) {
      count += getRecursiveMemberCount(child);
    }
  }
  return count;
};

const getProfileImageUrl = (path?: string) => {
  if (!path) return '/images/default-profile.png';
  if (path.startsWith('http')) return path;
  
  const baseUrl = 'http://localhost:8080';
  let resourcePath = path.startsWith('/') ? path : `/${path}`;
  if (!resourcePath.startsWith('/uploads')) {
    resourcePath = `/uploads${resourcePath}`;
  }
  return `${baseUrl}${resourcePath}`;
};

const onCenterListImageError = (id: number) => {
  centerListImageErrorIds.value.add(id);
};

onMounted(() => {
  loadData();
});
</script>

<style scoped>
.page-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  background: #f8fafc;
  overflow: hidden; 
}

.header {
  width: 100%;
  height: 60px;
  background: white;
  padding: 0 24px;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
}

.title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #0f172b;
}

.content-grid {
  display: grid;
  grid-template-columns: 300px 1fr 350px;
  grid-template-rows: minmax(0, 1fr);
  gap: 24px;
  flex: 1;
  padding: 24px;
  overflow: hidden;
}

.panel {
  background: white;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.panel-header {
  padding: 16px 20px;
  border-bottom: 1px solid #e2e8f0;
  flex-shrink: 0;
}

.panel-header h2 {
  font-size: 1rem;
  font-weight: 600;
  margin: 0;
}

.panel-body {
  padding: 20px;
  overflow-y: auto;
  flex: 1;
}

.department-list-panel .panel-body {
  padding: 12px;
}

.tree-root {
  padding: 0;
  margin: 0;
  list-style: none;
}

.loading-state,
.error-state,
.placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #64748b;
  text-align: center;
}

.placeholder p {
  font-size: 14px;
}

.retry-btn {
  margin-top: 12px;
  padding: 8px 16px;
  background-color: #1c398e;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.department-details, .employee-details {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

/* Center Panel */
.detail-section {
  margin-bottom: 24px;
}
.detail-title {
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 12px;
}
.sub-department-list, .employee-list-center {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.sub-department-item {
  display: flex;
  justify-content: space-between;
  padding: 10px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s;
}
.sub-department-item:hover {
  background-color: #f8fafc;
}
.member-count {
  color: #94a3b8;
  font-size: 13px;
}
.employee-item-center {
  display: flex;
  align-items: center;
  padding: 8px;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s;
}
.employee-item-center:hover, .employee-item-center.selected {
  background-color: #eff6ff;
}
.profile-img-wrapper {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  overflow: hidden;
  margin-right: 12px;
  flex-shrink: 0;
}
.profile-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.profile-initial {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
}
.employee-info {
  display: flex;
  flex-direction: column;
}
.employee-name {
  font-size: 14px;
  font-weight: 600;
}
.employee-job {
  font-size: 12px;
  color: #64748b;
}
.no-content {
  text-align: center;
  color: #94a3b8;
  padding: 40px 0;
}

/* Right Panel */
.employee-detail-panel .panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.close-btn {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #94a3b8;
}
.employee-profile-card {
  text-align: center;
  padding-bottom: 24px;
  border-bottom: 1px solid #f1f5f9;
  margin-bottom: 24px;
}
.profile-img-large-wrapper {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  overflow: hidden;
  margin: 0 auto 12px;
  border: 3px solid white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}
.profile-img-large {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.profile-initial-large {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 32px;
}
.employee-name-large {
  font-size: 18px;
  font-weight: 700;
  margin: 0;
}
.employee-grade-large {
  font-size: 14px;
  color: #64748b;
}
.employee-info-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}
.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.info-item .label {
  font-size: 12px;
  color: #94a3b8;
}
.info-item .value {
  font-size: 14px;
  font-weight: 500;
  color: #334155;
}
</style>
