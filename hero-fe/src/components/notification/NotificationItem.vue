<!--
  <pre>
  Vue Name: NotificationItem.vue
  Description: 알림 아이템 컴포넌트
                - 알림 타입별 아이콘 표시
                - 읽음/안 읽음 상태 스타일 구분
                - 클릭 시 상세 페이지 이동
                - 액션 버튼 및 삭제 버튼 제공

  
  History
  2025/12/09 (혜원) 최초작성
  2025/12/14 (혜원) TypeScript 변환 및 타입 정의
  2025/12/16 (혜원) Notification 타입 맞춤 수정
  </pre>

  @author 혜원
  @version 2.1
-->

<template>
  <div 
    class="notification-item"
    :class="{ 'unread': !notification.isRead }"
  >
    <!-- 상단: 아이콘 + 내용 + 삭제 버튼 -->
    <div class="notification-header" @click="handleClick">
      <img 
        :src="getIcon(notification.type)" 
        :alt="`${notification.type} 아이콘`"
        class="notification-icon"
      />

      <div class="content">
        <h3 class="title">{{ notification.title }}</h3>
        <p class="description">{{ notification.message }}</p>
        <span class="time">{{ notification.timeAgo }}</span>
      </div>

      <!-- 삭제 버튼 (우측 상단) -->
      <button 
        class="delete-btn"
        @click.stop="handleDeleteClick"
        title="삭제"
      >
        ✕
      </button>
      <!-- 링크로 가는 버튼 -->
      <div v-if="notification.link" class="notification-footer">
      <button 
        class="link-btn"
        @click.stop="handleLinkClick"
      >
        {{ getLinkText(notification.type) }}
      </button>
    </div>
  </div>
    </div>    
</template>

<script setup lang="ts">
// 1. Import 구문
import { useRouter } from 'vue-router';
import type { Notification, NotificationCategory } from '@/types/notification/notification.types';

const router = useRouter();

// 2. Props 정의
/**
 * @property {Notification} notification - 표시할 알림 데이터 객체
 */
const props = defineProps<{
  notification: Notification;
}>();

// 3. Emits 정의
/**
 * @event click - 알림 아이템 클릭 시 발생 (읽음 처리 및 상세 로직 실행)
 * @event delete - 삭제 버튼 클릭 시 발생
 * @event action - 링크 버튼 클릭 시 발생 (현재는 handleLinkClick 내부에서 처리)
 */
const emit = defineEmits<{
  click: [notification: Notification];
  delete: [id: number];
  action: [notification: Notification];
}>();

// 4. 메소드

/**
 * 알림 아이템 클릭 핸들러
 * - 부모 컴포넌트로 click 이벤트 발행 
 */
const handleClick = (): void => {
  emit('click', props.notification);
};

/**
 * 삭제 버튼 클릭 핸들러
 * - 이벤트 전파 방지 후, 부모 컴포넌트로 delete 이벤트 발행
 * @param {Event} event - 클릭 이벤트 객체
 */
const handleDeleteClick = (event: Event): void => {
  event.stopPropagation(); // 이벤트 전파 방지 (핵심 로직)
  emit('delete', props.notification.notificationId);
};

/**
 * 링크 버튼 클릭 핸들러
 * - 알림을 읽음 처리하고, router link로 이동합니다.
 */
const handleLinkClick = (): void => {
  if (props.notification.link) {
    // 1. 읽음 처리 요청 (부모에게 click 이벤트 위임)
    emit('click', props.notification);
    
    // 2. 페이지 이동
    router.push(props.notification.link);
  }
};

/**
 * 알림 타입에 따른 아이콘 경로 반환 (비즈니스 로직)
 * @param {string} type - 알림 카테고리 타입
 * @returns {string} 아이콘 이미지 경로
 */
const getIcon = (type: string): string => {
  const iconMap: Record<string, string> = {
    'attendance': '/images/alarm/alarm-check.svg',
    'payroll': '/images/alarm/alarm-money.svg',
    'approval': '/images/alarm/alarm-paper.svg',
    'leave': '/images/alarm/alarm-calendar.svg',
    'evaluation': '/images/alarm/alarm-paper.svg',
    'system': '/images/alarm/alarmsetting.svg'
  };
  
  return iconMap[type] || '/images/alarm/alarmsetting.svg';
};

/**
 * 알림 타입에 따른 링크 버튼 텍스트 반환 (비즈니스 로직)
 * @param {NotificationCategory} type - 알림 카테고리 타입
 * @returns {string} 버튼에 표시될 텍스트
 */
const getLinkText = (type: NotificationCategory): string => {
  const linkTextMap: Record<NotificationCategory, string> = {
    'attendance': '근태 확인하기',
    'payroll': '명세서 보기',
    'approval': '결재 상세보기',
    'leave': '휴가 확인하기',
    'evaluation': '평가 보기',
    'system': '자세히 보기'
  };
  
  return linkTextMap[type] || '자세히 보기';
};
</script>

<style scoped>
.notification-item {
  display: flex;
  flex-direction: column;
  background: white;
  border-radius: 8px;
  transition: all 0.2s ease;
  margin-bottom: 12px;
  border-left: 4px solid transparent; /* 읽음 상태 구분용 */
  overflow: hidden;
}

/* 읽지 않은 알림 스타일 */
.notification-item.unread {
  background: #EFF6FF !important; /* 배경 강조 */
  border-left: 4px solid #3B82F6; /* 좌측 테두리 강조 */
}

.notification-item.unread .title {
  font-weight: 700;
  color: #1E40AF;
}

.notification-item.unread .description {
  color: #1E293B;
}

/* 상단 영역 (클릭 가능 영역) */
.notification-header {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 16px;
  cursor: pointer;
  position: relative; /* 삭제 버튼 위치 기준점 */
}

.notification-header:hover {
  background: rgba(0, 0, 0, 0.02);
}

/* 아이콘 */
.notification-icon {
  margin-top: 5px;
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

/* 내용 영역 */
.content {
  flex: 1;
  min-width: 0;
  padding-right: 32px;  /* 삭제 버튼과의 겹침 방지 */
}

.title {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 4px 0;
  color: #1e293b;
  line-height: 1.4;
}

.description {
  font-size: 14px;
  color: #64748b;
  margin: 0 0 8px 0;
  line-height: 1.5;
  /* 2줄 말줄임 처리 */
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.time {
  font-size: 12px;
  color: #94a3b8;
}

/* 삭제 버튼 (우측 상단 절대 위치) */
.delete-btn {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 28px;
  height: 28px;
  border: none;
  background: white;
  color: #94a3b8;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s ease;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.delete-btn:hover {
  background: #FEE2E2;
  color: #EF4444;
}

/* 하단 영역 (링크 버튼) */
.notification-footer {
  margin-top: 20px;
  padding: 0 16px 16px 16px;
  border-top: 1px solid #F1F5F9;
  padding-top: 12px;
}

.link-btn {
  width: 100%;
  padding: 10px 16px;
  background: white;
  color: #3B82F6;
  border: 1px solid #3B82F6;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.link-btn:hover {
  background: #3B82F6;
  color: white;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

/* 읽지 않은 알림의 링크 버튼 */
.notification-item.unread .link-btn {
  background: #DBEAFE;
  border-color: #3B82F6;
  color: #1E40AF;
  font-weight: 600;
}

.notification-item.unread .link-btn:hover {
  background: #3B82F6;
  color: white;
}

/* 반응형 스타일 */
@media (max-width: 768px) {
  .notification-header {
    gap: 12px;
    padding: 12px;
  }

  .notification-icon {
    width: 36px;
    height: 36px;
  }

  .title {
    font-size: 14px;
  }

  .description {
    font-size: 13px;
  }

  .delete-btn {
    top: 8px;
    right: 8px;
    width: 24px;
    height: 24px;
    font-size: 14px;
  }

  .notification-footer {
    padding: 0 12px 12px 12px;
  }
}
</style>