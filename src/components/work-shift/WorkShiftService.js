import teamConfig from '../../../team.config.js';
import { convertToYYMM } from '../../utils/dates_utils.js';
import { isValidYYYY년_MM월_DD일 } from '../../utils/validate_utils.js';
import { getAllTeamNames, findDepartments } from '../../utils/extract_utils.js';

const START_NAME_ROW = 4;
const WORK_NUM = 30;

export class WorkShiftService {
    static config = {
        excelPath: '',
        monthCount: 3,
        teamConfig: '',
        originalTeamConfig: JSON.stringify(teamConfig),
        teamNames: getAllTeamNames(teamConfig),
    }

    static async fetch_xlsx() {
        const EXCEL_FILE_PATH = localStorage.getItem('EXCEL_FILE_PATH');
        try {
            const raw_data = await window.electronAPI.fetch_xlsx(EXCEL_FILE_PATH, this.config.monthCount);
            console.log('raw_data', raw_data)
            if (!raw_data) {
                throw new Error(`"${EXCEL_FILE_PATH}"에서 근무자 정보를 불러올 수 없습니다.`);
            }
            const parsed_data_by_date = {};
            raw_data.forEach(tab => {
                const tabName = convertToYYMM(tab.name);
                const year = '20' + tabName.split('-')[0];
                const date = [];
                for (let i = 1; i < tab.data[1].length; i++) {
                    if (tab.data[1][i].value === null || tab.data[2][i].value === null) {
                        continue;
                    }
                    date.push(year + '년 ' + tab.data[1][i].value.trim() + ' ' + tab.data[2][i].value + '일');
                }
                for (let i = 2; i < tab.data[1].length; i++) {
                    const row = [];
                    for (let j = START_NAME_ROW; j < START_NAME_ROW + WORK_NUM; j++) {
                        if (!tab.data[j][i] || !tab.data[j][i].value) {
                            continue;
                        }
                        const temp = { name: tab.data[j][1].value, value: tab.data[j][i].value };
                        if (tab.data[j][i].style?.fill?.fgColor?.argb === 'FFFFFF00') {
                            temp['노D'] = true;
                        }
                        temp['team'] = findDepartments(temp.name, this.config.teamConfig);
                        row.push(temp);
                    }
                    if (isValidYYYY년_MM월_DD일(date[i - 2])) {
                        parsed_data_by_date[date[i - 2]] = row;
                    }
                }
            });
            console.log('parsed_data_by_date', parsed_data_by_date)

            localStorage.setItem('parsed_data_by_date', JSON.stringify(parsed_data_by_date));
        } catch (error) {
            console.error("Error fetching Excel data:", error);
            throw error;
        }
    }

    static getWorkersByDate(date) {
        const parsed_data_by_date = JSON.parse(localStorage.getItem('parsed_data_by_date'));
        const today_key = new Date(date).toLocaleDateString('ko-KR', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
        
        if (!parsed_data_by_date || !parsed_data_by_date[today_key]) {
            throw new Error(`"${today_key}"에 근무자 정보가 없습니다.`);
        }

        return {
            day_worker: parsed_data_by_date[today_key]?.filter(worker => typeof worker.value === 'string' && worker.value.includes('D')),
            yellow_workers: parsed_data_by_date[today_key]?.filter(worker => 
                worker["노D"] === true && (worker.value.includes('D') || worker.value.includes('E'))),
            evening_worker: parsed_data_by_date[today_key]?.filter(worker => typeof worker.value === 'string' && worker.value.includes('E')),
            night_worker: parsed_data_by_date[today_key]?.filter(worker => typeof worker.value === 'string' && worker.value.includes('N')),
            off_worker: parsed_data_by_date[today_key]?.filter(worker => 
                !(typeof worker.value === 'string' && (worker.value.includes('D') || worker.value.includes('E') || worker.value.includes('N'))))
        };
    }
}
