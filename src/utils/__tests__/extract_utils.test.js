import { findDepartments, getAllTeamNames, getAllWorkerNames } from '../extract_utils';


describe('findDepartments', () => {
    test('returns empty array when inputs are invalid', () => {
        expect(findDepartments(null)).toEqual([]);
        expect(findDepartments(undefined)).toEqual([]);
        expect(findDepartments(123)).toEqual([]);
        expect(findDepartments('')).toEqual([]);
        expect(findDepartments('name', null)).toEqual([]);
    });

    test('returns correct departments for existing names', () => {
        const mockTeamConfig = {
            "사무국": ["김철수"],
            "복지증진과": {
                "과장": ["이과장"],
                "복지사업팀": ["박복지", "김복지"],
                "기획사업팀": ["최기획"]
            }
        };

        expect(findDepartments("김철수", mockTeamConfig)).toEqual(["사무국"]);
        expect(findDepartments("이과장", mockTeamConfig)).toEqual(["복지증진과", "복지사업팀", "기획사업팀"]);
        expect(findDepartments("박복지", mockTeamConfig)).toEqual(["복지증진과", "복지사업팀"]);
        expect(findDepartments("최기획", mockTeamConfig)).toEqual(["복지증진과", "기획사업팀"]);
    });

    test('returns empty array for non-existing names', () => {
        const mockTeamConfig = {
            "사무국": ["김철수"],
            "복지증진과": {
                "과장": ["이과장"],
                "복지사업팀": ["박복지"]
            }
        };

        expect(findDepartments("존재하지않음", mockTeamConfig)).toEqual([]);
    });

    test('handles nested department structure correctly', () => {
        const mockTeamConfig = {
            "부서1": {
                "팀1": {
                    "소팀1": ["직원1"]
                }
            }
        };
        expect(findDepartments("직원1", mockTeamConfig)).toEqual(["부서1", "팀1", "소팀1"]);
    });

    test('handles "과장" correctly', () => {
        const mockTeamConfig = {
            "부서1": {
                "과장": ["이과장"],
                "팀1": ["직원1"]
            }
        };
        expect(findDepartments("이과장", mockTeamConfig)).toEqual(["부서1", "팀1"]);
    });
});


describe('getAllTeamNames', () => {
    test('returns all team names', () => {
        const mockTeamConfig = {
            "부서1": {
                "팀1": {
                    "소팀1": ["직원1"]
                }
            }
        };
        expect(getAllTeamNames(mockTeamConfig)).toEqual(["부서1", "팀1", "소팀1"]);
    });

    test('과장이 팀 이름에 포함되지 않음', () => {
        const mockTeamConfig = {
            "부서1": {
                "팀1": {
                    "과장": ["이과장"]
                }
            }
        };
        expect(getAllTeamNames(mockTeamConfig)).toEqual(["부서1", "팀1"]);
    });
});

describe('getAllWorkerNames', () => {
    test('returns all worker names', () => {
        const mockTeamConfig = {
            "부서1": {
                "팀1": {
                    "소팀1": ["직원1", "직원2"]
                },
                "팀2": ["직원3"]
            },
            "부서2": {
                "팀3": ["직원4"]
            }
        };
        expect(getAllWorkerNames(mockTeamConfig)).toEqual(["직원1", "직원2", "직원3", "직원4"]);
    });

    test('returns empty array if teamConfig is empty', () => {
        const mockTeamConfig = {};
        expect(getAllWorkerNames(mockTeamConfig)).toEqual([]);
    });

    test('returns empty array if teamConfig is null', () => {
        const mockTeamConfig = null;
        expect(getAllWorkerNames(mockTeamConfig)).toEqual([]);
    });

    test('handles nested structure correctly', () => {
        const mockTeamConfig = {
            "부서1": {
                "팀1": {
                    "소팀1": ["직원1"]
                }
            }
        };
        expect(getAllWorkerNames(mockTeamConfig)).toEqual(["직원1"]);
    });
});
