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
  // 시간대 정보가 없는 경우 강제로 UTC로 처리
  let utcDate: Date;
  
  if (!dateString.includes('Z') && !dateString.includes('+')) {
    // 'Z'나 '+' 가 없으면 UTC로 간주하고 'Z' 추가
    utcDate = new Date(dateString.replace(' ', 'T') + 'Z');
  } else {
    utcDate = new Date(dateString);
  }
  
  const now = new Date();
  const diffMs = now.getTime() - utcDate.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  
  if (diffMinutes < 1) return '방금 전';
  if (diffMinutes < 60) return `${diffMinutes}분 전`;
  
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}시간 전`;
  
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}일 전`;
  
  return utcDate.toLocaleDateString('ko-KR');
};