// PP 포맷팅 함수
export const formatPP = (amount) => {
  if (typeof amount !== 'number') return '0 PP';
  return `${amount.toLocaleString()} PP`;
};

// 트랜잭션 타입에 따른 색상 반환 함수
export const getTransactionColor = (type, theme) => {
  switch (type) {
    case "입금":
      return theme.green;
    case "출금":
      return theme.red;
    case "대기":
      return theme.gray;
    default:
      return theme.textSecondary;
  }
}; 