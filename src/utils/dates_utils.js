    /**
     * 다양한 날짜 형식을 YY-MM 형식으로 변환
     * @param {string|Date} date - 변환할 날짜
     * @returns {string} YY-MM 형식의 문자열
     * @throws {Error} 날짜 변환 실패시 에러 발생
     */
    export function convertToYYMM(date) {
        try {
            let targetDate;

            // Date 객체인 경우
            if (date instanceof Date) {
                targetDate = date;
            }
            // 문자열인 경우
            else if (typeof date === 'string') {
                // "YY-MM" 형식이 이미 맞는 경우
                if (date.match(/^\d{2}-\d{2}$/)) {
                    return date;
                }
                
                // "YYYY년 MM월" 형식 처리 
                const koreanFormat = date.match(/^(\d{4})(년)?\s*(\d{1,2})(월)?$/);
                if (koreanFormat) {
                    const [_, year, yearSuffix, month, monthSuffix] = koreanFormat;
                    validateMonth(month);
                    targetDate = new Date(parseInt(year), parseInt(month) - 1);
                }
                // "YY년MM월" 형식 처리
                else if (date.match(/^(\d{2})(년)(\d{1,2})(월)$/)) {
                    const [_, year, yearSuffix, month, monthSuffix] = date.match(/^(\d{2})(년)(\d{1,2})(월)$/);
                    validateMonth(month);
                    targetDate = new Date(2000 + parseInt(year), parseInt(month) - 1);
                }
                // "YY년-MM월" 또는 "YY-MM월" 형식 처리
                else if (date.match(/^(\d{2})(년)?-(\d{1,2})(월)?$/)) {
                    const [_, year, yearSuffix, month] = date.match(/^(\d{2})(년)?-(\d{1,2})/);
                    validateMonth(month);
                    targetDate = new Date(2000 + parseInt(year), parseInt(month) - 1);
                }
                // "YYYY-MM-DD" 또는 "YYYY/MM/DD" 형식 처리
                else if (date.match(/^\d{4}[-/]\d{1,2}([-/]\d{1,2})?$/)) {
                    const [year, month] = date.split(/[-/]/);
                    validateMonth(month);
                    targetDate = new Date(date.replace(/\//g, '-'));
                }
                // 그 외의 경우 Date 객체로 파싱 시도
                else {
                    targetDate = new Date(date);
                }
            }

            // 유효한 날짜인지 확인
            if (isNaN(targetDate.getTime())) {
                throw new Error(`${date}는 유효하지 않은 날짜 형식입니다.\n탭이름을 24년-12월같이 써주세요.`);
            }

            const year = targetDate.getFullYear().toString().slice(-2);
            const month = String(targetDate.getMonth() + 1).padStart(2, '0');
            
            return `${year}-${month}`;
        } catch (error) {
            throw new Error(`날짜 변환 실패: ${error.message}`);
        }
    }

    function validateMonth(month) {
        const monthNum = parseInt(month, 10);
        if (monthNum < 1 || monthNum > 12) {
            throw new Error('날짜 변환 실패 유효하지 않은 월 범위');
        }
    }
