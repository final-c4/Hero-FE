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

  // 1. Z나 + 기호를 붙이지 않고, 서버가 준 문자열 그대로 Date 객체 생성
  // (서버와 클라이언트가 모두 한국 시간 기준일 때 가장 정확함)
  const date = new Date(dateString.replace(' ', 'T'));
  const now = new Date();

  const diffMs = now.getTime() - date.getTime();
  
  // 미래 시간으로 계산되는 오차 방지
  if (diffMs < 0) return '방금 전';

  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  if (diffMinutes < 1) return '방금 전';
  if (diffMinutes < 60) return `${diffMinutes}분 전`;
  
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}시간 전`;
  
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}일 전`;
  
  return date.toLocaleDateString('ko-KR');
};