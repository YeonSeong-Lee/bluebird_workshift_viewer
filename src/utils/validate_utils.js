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
