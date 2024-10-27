/**
 * 팀 설정에 있는 이름인지 확인하는 함수
 * @param {string} name - 확인할 이름
 * @param {object} teamConfig - 팀 설정 객체
 * @returns {boolean} 팀 설정에 있는 이름이면 true, 없으면 false
 */
export const isNameInTeamConfig = (name, teamConfig) => {
    // 이름이 없거나 문자열이 아닌 경우
    if (!name || typeof name !== 'string' || !teamConfig) {
        return false;
    }

    // teamConfig에서 모든 이름 배열을 추출하는 함수
    const extractNames = (obj) => {
        let names = [];
        for (const key in obj) {
            if (Array.isArray(obj[key])) {
                names = names.concat(obj[key]);
            } else if (typeof obj[key] === 'object') {
                names = names.concat(extractNames(obj[key]));
            }
        }
        return names;
    }

    try {
        const allNames = extractNames(teamConfig);
        return allNames.includes(name);
    } catch (error) {
        console.error('팀 설정 확인 중 오류 발생:', error);
        return false;
    }
}

/**
 * 날짜 문자열이 'YYYY년 MM월 DD일' 형식인지 검사하는 함수
 * @param {string} dateStr - 검사할 날짜 문자열
 * @returns {boolean} 올바른 형식이면 true, 아니면 false
 */
export const isValidYYYY년_MM월_DD일 = (dateStr) => {
    if (!dateStr || typeof dateStr !== 'string') {
        return false;
    }

    // 'YYYY년 MM월 DD일' 형식의 정규식
    const datePattern = /^(\d{4})년\s*(0?[1-9]|1[0-2])월\s*(0?[1-9]|[12][0-9]|3[01])일$/;
    
    if (!datePattern.test(dateStr)) {
        return false;
    }

    // 날짜 유효성 검사
    const [_, year, month, day] = dateStr.match(datePattern);
    const date = new Date(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10));
    
    return date.getFullYear() === parseInt(year, 10) &&
           date.getMonth() === parseInt(month, 10) - 1 &&
           date.getDate() === parseInt(day, 10);
}

/**
 * 근무자 데이터가 비어있는지 확인하는 함수
 * @param {{
 *  [key: string]: string[]
 * }} workers - 근무자 데이터
 * @returns {boolean} 비어있으면 true, 아니면 false
 */
export const isEmptyWorkers = (workers) => {
    return !workers || !Object.keys(workers).some(key => workers[key].length > 0);
}
