import { findDepartments } from '../extract_utils';

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
        expect(findDepartments("이과장", mockTeamConfig)).toEqual(["복지증진과"]);
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
});
