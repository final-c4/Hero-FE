import type { RouteRecordRaw } from 'vue-router';

const payrollRoutes: RouteRecordRaw[] = [
  {
    path: '/payroll',
    name: 'PayrollMain',
    component: () => import('@/views/payroll/Index.vue'),
    meta: {
      title: '급여 관리',
    },
  },
  {
    path: '/payroll/history',
    name: 'PayrollHistory',
    component: () => import('@/views/payroll/History.vue'),
    meta: {
      title: '급여 이력',
    },
  },
];

export default payrollRoutes;
