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
*/export const getRelativeTime = (dateString: string): string => {
  if (!dateString) return '';

  // 1. 서버 시간을 Date 객체로 생성
  // 서버가 UTC 문자열을 준다면 new Date(dateString)만으로도 충분하지만,
  // 형식이 불분명할 경우를 대비해 처리합니다.
  const date = new Date(dateString);
  
  // 2. 현재 시간
  const now = new Date();
  
  // 3. 차이 계산 (밀리초 단위)
  const diffMs = now.getTime() - date.getTime();
  
  // ⚠️ 만약 미래 시간으로 찍힌다면 (서버-클라이언트 시간 오차), 방금 전 처리
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