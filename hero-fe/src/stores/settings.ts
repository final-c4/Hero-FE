import { defineStore } from 'pinia';
import { ref } from 'vue';
import { getDepartments, getGrades, getJobTitles, getRoles } from '@/api/settings';
import type { SettingsDepartmentResponseDTO, Grade, JobTitle, Role } from '@/types/settings';

export const useSettingsStore = defineStore('settings', () => {
  // State
  const departments = ref<SettingsDepartmentResponseDTO[]>([]);
  const grades = ref<Grade[]>([]);
  const jobTitles = ref<JobTitle[]>([]);
  const roles = ref<Role[]>([]);
  const isLoading = ref(false);

  // Actions
  const fetchDepartments = async () => {
    try {
      const res = await getDepartments();
      console.log("fetchDepartments:", res);
      if (res.success) {
        departments.value = res.data;
      }
    } catch (error) {
      console.error('Failed to fetch departments:', error);
    }
  };

  const fetchGrades = async () => {
    const res = await getGrades();
    if (res.success) {
      grades.value = res.data;
    }
  };

  const fetchJobTitles = async () => {
    const res = await getJobTitles();
    if (res.success) {
      jobTitles.value = res.data;
    }
  };

  const fetchRoles = async () => {
    const res = await getRoles();
    if (res.success) {
      roles.value = res.data;
    }
  };

  const loadAllSettings = async () => {
    isLoading.value = true;
    await Promise.all([fetchDepartments(), fetchGrades(), fetchJobTitles(), fetchRoles()]);
    isLoading.value = false;
  };

  return {
    departments,
    grades,
    jobTitles,
    roles,
    isLoading,
    fetchDepartments,
    fetchGrades,
    fetchJobTitles,
    fetchRoles,
    loadAllSettings,
  };
});
