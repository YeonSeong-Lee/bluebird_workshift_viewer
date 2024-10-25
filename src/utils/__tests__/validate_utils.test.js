import { isNameInTeamConfig } from '../validate_utils';

describe('validateName', () => {
    test('returns false when name is null or undefined', () => {
        expect(isNameInTeamConfig(null)).toBe(false);
        expect(isNameInTeamConfig(undefined)).toBe(false);
    });

    test('returns false when name is not a string', () => {
        expect(isNameInTeamConfig(123)).toBe(false);
        expect(isNameInTeamConfig({})).toBe(false);
        expect(isNameInTeamConfig([])).toBe(false);
    });

    test('returns true when name exists in TEAM_CONFIG', () => {
        const mockTeamConfig = {
            team1: ['John', 'Jane'],
            team2: {
                subteam1: ['Bob'],
                subteam2: ['Alice']
            }
        };
        expect(isNameInTeamConfig('John', mockTeamConfig)).toBe(true);
        expect(isNameInTeamConfig('Jane', mockTeamConfig)).toBe(true);
        expect(isNameInTeamConfig('Bob', mockTeamConfig)).toBe(true);
        expect(isNameInTeamConfig('Alice', mockTeamConfig)).toBe(true);
    });

    test('returns false when name does not exist in TEAM_CONFIG', () => {
        const mockTeamConfig = {
            team1: ['John', 'Jane'],
            team2: {
                subteam1: ['Bob'],
                subteam2: ['Alice']
            }
        };
        expect(isNameInTeamConfig('NotExist', mockTeamConfig)).toBe(false);
        expect(isNameInTeamConfig('Unknown', mockTeamConfig)).toBe(false);
    });
});
