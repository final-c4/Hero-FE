/**
 * File Name   : organization.api.ts
 * Description : 조직도 관련 API 호출 모듈
 *
 * History
 * 2025/12/29 - 승건 최초 작성
 */

import client from '@/api/apiClient';
import type { OrganizationNode } from '@/types/organization/organization.types';

/**
 * 조직도 트리 구조 조회
 * @returns 부서와 직원이 포함된 트리 구조의 최상위 노드 리스트
 */
export const fetchOrganizationChart = () => {
  return client.get<OrganizationNode[]>('/departments/organization-chart');
};
