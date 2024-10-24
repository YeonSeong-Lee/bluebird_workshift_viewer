import { convertToYYMM } from '../dates_utils';

describe('convertToYYMM', () => {
  test('Date 객체를 YY-MM 형식으로 변환', () => {
    const date = new Date('2024-03-15');
    expect(convertToYYMM(date)).toBe('24-03');
  });

  test('YYYY년 MM월 형식을 YY-MM으로 변환', () => {
    expect(convertToYYMM('2024년 3월')).toBe('24-03');
    expect(convertToYYMM('2024년 12월')).toBe('24-12');
  });

  test('YYYY-MM-DD 형식을 YY-MM으로 변환', () => {
    expect(convertToYYMM('2024-03-15')).toBe('24-03');
    expect(convertToYYMM('2024-12-31')).toBe('24-12');
  });

  test('YYYY/MM/DD 형식을 YY-MM으로 변환', () => {
    expect(convertToYYMM('2024/03/15')).toBe('24-03');
    expect(convertToYYMM('2024/12/31')).toBe('24-12');
  });

  test('이미 YY-MM 형식인 경우 그대로 반환', () => {
    expect(convertToYYMM('24-03')).toBe('24-03');
  });

  test('YY-MM월 형식을 YY-MM으로 변환', () => {
    expect(convertToYYMM('24-03월')).toBe('24-03');
    expect(convertToYYMM('24-3')).toBe('24-03');
    expect(convertToYYMM('24-3월')).toBe('24-03');
  });

  test('YY년-MM 형식을 YY-MM으로 변환', () => {
    expect(convertToYYMM('24년-03월')).toBe('24-03');
    expect(convertToYYMM('24년-3월')).toBe('24-03');
  });
  
  test('YY년MM월 형식을 YY-MM으로 변환', () => {
    expect(convertToYYMM('23년8월')).toBe('23-08');
  });



  test('잘못된 형식에 대한 에러 처리', () => {
    expect(() => convertToYYMM('잘못된 형식')).toThrow('날짜 변환 실패');
    expect(() => convertToYYMM('2024-13-01')).toThrow('날짜 변환 실패');
  });
});
