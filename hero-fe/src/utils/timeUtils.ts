/*
  <pre>
  TypeScript Name: timeUtils
  Description: 시간 관련 유틸리티 함수
                - UTC 날짜 문자열을 상대적 시간으로 변환
                - 사용자에게 친숙한 형식으로 시간 표시
                - 예: "방금 전", "5분 전", "2시간 전", "3일 전"
  </pre>

  History
  2026/01/03 (혜원) 최초작성

  @author 혜원
  @version 1.0
  </pre>
*/
  export const getRelativeTime = (dateString: string): string => {
  if (!dateString) return '';

  // 1. 현재 클라이언트(브라우저)의 날짜 객체 생성
  const now = new Date();
  
  // 2. 서버 날짜 문자열에서 시간 정보 추출 (T 또는 공백 기준 분리)
  // 예: "2026-01-03 13:00:00" -> "13:00:00" 추출
  const timePart = dateString.includes('T') ? dateString.split('T')[1] : dateString.split(' ')[1];
  const [hours, minutes, seconds] = timePart.split(':').map(Number);
  
  // 3. 현재 날짜 객체에 서버의 시/분/초를 주입 (핵심 로직)
  // 서버-클라이언트 간의 날짜 차이가 없다면 이 방식이 가장 정확합니다.
  const targetDate = new Date();
  targetDate.setHours(hours, minutes, seconds, 0);

  // 4. 경과 시간 계산
  const diffMs = now.getTime() - targetDate.getTime();
  
  // 미래 시간 오차 방지 (방금 온 알림 처리)
  if (diffMs < 0) return '방금 전';

  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  if (diffMinutes < 1) return '방금 전';
  if (diffMinutes < 60) return `${diffMinutes}분 전`;
  
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}시간 전`;
  
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}일 전`;
  
  return targetDate.toLocaleDateString('ko-KR');
};