/**
 * 팀 설정에서 특정 이름이 속한 부서/팀을 찾아 반환하는 함수
 * @param {string} name - 찾을 사람 이름
 * @param {object} teamConfig - 팀 설정 객체
 * @returns {string[]} 소속된 부서/팀 배열 (빈 배열이면 소속 없음)
 */
export const findDepartments = (name, teamConfig) => {
    if (!name || typeof name !== 'string' || !teamConfig) {
        return [];
    }

    const departments = [];
    
    const searchInConfig = (obj, parentDept = null) => {
        for (const key in obj) {
            if (Array.isArray(obj[key])) {
                if (obj[key].includes(name)) {
                    if (parentDept) {
                        departments.push(parentDept);
                    }
                    if (key !== '과장') { // '과장'은 부서명이 아니므로 제외
                        departments.push(key);
                    }
                }
            } else if (typeof obj[key] === 'object') {
                const nextParent = key === '과장' ? parentDept : key;
                if (parentDept && !departments.includes(parentDept)) {
                    departments.push(parentDept);
                }
                searchInConfig(obj[key], nextParent);
            }
        }
    };

    try {
        searchInConfig(teamConfig);
        return departments;
    } catch (error) {
        console.error('부서 검색 중 오류 발생:', error);
        return [];
    }
}

/**
 * 팀 설정에서 모든 팀 이름을 추출하는 함수
 * @param {object} teamConfig - 팀 설정 객체
 * @returns {string[]} 모든 팀 이름 배열
 */
export const getAllTeamNames = (teamConfig) => {
    if (!teamConfig) {
        return [];
    }

    const teams = new Set();

    const extractTeams = (obj) => {
        for (const key in obj) {
            if (Array.isArray(obj[key])) {
                if (key !== '과장') { // '과장'은 팀 이름이 아니므로 제외
                    teams.add(key);
                }
            } else if (typeof obj[key] === 'object') {
                if (key !== '과장') { // '과장'은 팀 이름이 아니므로 제외
                    teams.add(key);
                }
                extractTeams(obj[key]);
            }
        }
    };

    try {
        extractTeams(teamConfig);
        return Array.from(teams);
    } catch (error) {
        console.error('팀 이름 추출 중 오류 발생:', error);
        return [];
    }
}
