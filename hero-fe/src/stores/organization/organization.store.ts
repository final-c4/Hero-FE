import { defineStore } from 'pinia';
import { ref } from 'vue';
import { fetchOrganizationChart } from '@/api/organization/organization.api';
import type { OrganizationNode } from '@/types/organization/organization.types';

export const useOrganizationStore = defineStore('organization', () => {
  // State
  const organizationChart = ref<OrganizationNode[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // Actions
  const loadOrganizationChart = async () => {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await fetchOrganizationChart();
      // 백엔드에서 List<OrganizationNodeDTO>를 반환하므로 response.data가 배열입니다.
      organizationChart.value = response.data;
    } catch (err: any) {
      console.error('조직도 로딩 실패:', err);
      error.value = err.message || '조직도 데이터를 불러오는 중 오류가 발생했습니다.';
    } finally {
      isLoading.value = false;
    }
  };

  return {
    organizationChart,
    isLoading,
    error,
    loadOrganizationChart,
  };
});