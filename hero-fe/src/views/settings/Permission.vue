<template>
  <div>
    <div class="page-header">
      <h2 class="page-title">사원 권한 관리</h2>
    </div>
    
    <!-- 검색 -->
    <div class="search-container">
      <input v-model="searchQuery" @keyup.enter="fetchData" type="text" placeholder="사원명 검색" class="search-input" />
      <button @click="fetchData" class="btn-search">검색</button>
    </div>

    <!-- 테이블 -->
    <div class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>사원명 (사번)</th>
            <th>부서</th>
            <th>직급/직책</th>
            <th>권한</th>
            <th>관리</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="emp in permissions" :key="emp.employeeId">
            <td>{{ emp.employeeName }} ({{ emp.employeeId }})</td>
            <td>{{ emp.department }}</td>
            <td>{{ emp.grade }} / {{ emp.jobTitle }}</td>
            <td>
              <div class="role-badges">
                <span v-for="role in emp.role" :key="role" class="badge">
                  {{ role }}
                </span>
              </div>
            </td>
            <td>
              <button @click="openEditModal(emp)" class="btn-edit">수정</button>
            </td>
          </tr>
          <tr v-if="permissions.length === 0">
            <td colspan="5" class="no-data">검색 결과가 없습니다.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 페이지네이션 -->
    <div class="pagination-container">
      <button 
        v-for="p in totalPages" 
        :key="p" 
        @click="changePage(p)"
        :class="['page-btn', currentPage === p ? 'active' : '']"
      >
        {{ p }}
      </button>
    </div>

    <!-- 권한 수정 모달 -->
    <Teleport to="body">
      <div v-if="editingEmployee" class="modal-overlay" @click.self="editingEmployee = null">
        <div class="modal-content">
          <div class="modal-header">
            <h3>권한 수정 - {{ editingEmployee.employeeName }} ({{ editingEmployee.employeeId }})</h3>
          </div>
          <div class="modal-body">
            <div class="checkbox-group select-all">
              <input 
                type="checkbox" 
                id="role-all" 
                v-model="isAllSelected"
                class="checkbox-input"
              >
              <label for="role-all" class="label-bold">전체 선택</label>
            </div>
            <div v-for="role in settingsStore.roles" :key="role.roleId" class="checkbox-group">
              <input 
                type="checkbox" 
                :id="'role-' + role.roleId" 
                :value="role.roleId" 
                v-model="selectedRoleIds"
                class="checkbox-input"
              >
              <label :for="'role-' + role.roleId">{{ role.roleName }}</label>
            </div>
          </div>
          <div class="modal-footer">
            <button @click="savePermissions" class="btn-save-modal">저장</button>
            <button @click="editingEmployee = null" class="btn-cancel">취소</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useSettingsStore } from '@/stores/settings';
import { getPermissions, updatePermissions } from '@/api/settings';
import type { SettingsPermissionsResponseDTO } from '@/types/settings';

const settingsStore = useSettingsStore();
const permissions = ref<SettingsPermissionsResponseDTO[]>([]);
const currentPage = ref(1);
const totalPages = ref(1);
const searchQuery = ref('');

const editingEmployee = ref<SettingsPermissionsResponseDTO | null>(null);
const selectedRoleIds = ref<number[]>([]);

const isAllSelected = computed({
  get: () => settingsStore.roles.length > 0 && selectedRoleIds.value.length === settingsStore.roles.length,
  set: (val) => {
    if (val) {
      selectedRoleIds.value = settingsStore.roles.map(r => r.roleId);
    } else {
      selectedRoleIds.value = [];
    }
  }
});

const fetchData = async () => {
  const res = await getPermissions(currentPage.value - 1, 10, searchQuery.value);
  if (res.success) {
    permissions.value = res.data.content;
    totalPages.value = res.data.totalPages;
  }
};

const changePage = (page: number) => {
  currentPage.value = page;
  fetchData();
};

const openEditModal = (emp: SettingsPermissionsResponseDTO) => {
  editingEmployee.value = emp;
  selectedRoleIds.value = settingsStore.roles
    .filter(r => emp.role.includes(r.roleName))
    .map(r => r.roleId);
};

const savePermissions = async () => {
  if (!editingEmployee.value) return;
  const res = await updatePermissions({
    employeeId: editingEmployee.value.employeeId,
    roleIds: selectedRoleIds.value
  });
  if (res.success) {
    alert('권한이 수정되었습니다.');
    editingEmployee.value = null;
    fetchData();
  }
};

onMounted(async () => {
  await settingsStore.fetchRoles();
  fetchData();
});
</script>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #0f172b;
}

.search-container {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.search-input {
  width: 300px;
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
}

.btn-search {
  background: linear-gradient(180deg, #1c398e 0%, #162456 100%);
  color: white;
  border: none;
  padding: 8px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
}

.table-container {
  overflow-x: auto;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  margin-bottom: 20px;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.data-table th, .data-table td {
  padding: 15px;
  border-bottom: 1px solid #e2e8f0;
}

.data-table th {
  background: linear-gradient(180deg, #1c398e 0%, #162456 100%);
  color: white;
  font-weight: 600;
  font-size: 14px;
}

.role-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.badge {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  background-color: #e0e7ff;
  color: #3730a3;
}

.btn-edit {
  color: #2563eb;
  font-weight: 500;
  cursor: pointer;
  background: none;
  border: none;
}

.pagination-container {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-top: 20px;
}

.page-btn {
  padding: 6px 12px;
  border: 1px solid #e2e8f0;
  background: white;
  border-radius: 6px;
  cursor: pointer;
}

.page-btn.active {
  background: linear-gradient(180deg, #1c398e 0%, #162456 100%);
  color: white;
  border: none;
}

.no-data {
  text-align: center;
  padding: 40px 0;
  color: #94a3b8;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 400px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.modal-header {
  background: linear-gradient(180deg, #1c398e 0%, #162456 100%);
  padding: 16px 24px;
  color: white;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
}

.modal-body {
  padding: 24px;
}

.checkbox-group {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.checkbox-input {
  margin-right: 8px;
}

.select-all {
  padding-bottom: 12px;
  margin-bottom: 12px;
  border-bottom: 1px solid #e2e8f0;
}

.label-bold {
  font-weight: 600;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 0 24px 24px;
}

.btn-cancel {
  background-color: #f1f5f9;
  color: #4b5563;
  border: 1px solid #cbd5e1;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
}

.btn-save-modal {
  background: linear-gradient(180deg, #1c398e 0%, #162456 100%);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
}
</style>
