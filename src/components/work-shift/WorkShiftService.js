import teamConfig from '../../../team.config.js';

export class WorkShiftService {
    static config = {
        excelPath: '',
        monthCount: 3,
        teamConfig: '',
        originalTeamConfig: teamConfig,
    }

    static async fetch_xlsx() {
        let EXCEL_FILE_PATH = localStorage.getItem('EXCEL_FILE_PATH');
        if (!EXCEL_FILE_PATH || EXCEL_FILE_PATH === '' || EXCEL_FILE_PATH === "undefined") {
            EXCEL_FILE_PATH = '24년 근무표.xlsx';
        }
        try {
            const raw_data = await window.electronAPI.fetch_xlsx(EXCEL_FILE_PATH);
            console.log('raw_data', raw_data)
            if (!raw_data) {
                throw new Error(`"${EXCEL_FILE_PATH}"에서 근무자 정보를 불러올 수 없습니다.`);
            }
            // TODO: 탭이름이 YY-MM 형식이 아닐 경우 에러 반환
            // TODO: validate raw_data and alert if it's invalid
            const year = '20' + raw_data[0].split('-')[0]
            const date = []
            for (let i = 1; i < raw_data[1].length; i++) {
                if (raw_data[1][i].value === null || raw_data[2][i].value === null) {
                    continue
                }
                date.push(year + '년 ' + raw_data[1][i].value.trim() + ' ' + raw_data[2][i].value + '일')
            }
            const parsed_data_by_name = {}
            const START_NAME_ROW = 4
            const WORK_NUM = 30
            for (let i = START_NAME_ROW; i < START_NAME_ROW + WORK_NUM; i++) {
                const row = []
                const name = raw_data[i][1]?.value
                for (let j = 2; j < raw_data[i].length; j++) {
                    if (!raw_data[i][j] || !raw_data[i][j].value) {
                        continue
                    }
                    const temp = { date: date[j - 2], value: raw_data[i][j].value }
                    if (raw_data[i][j].style?.fill?.fgColor?.argb === 'FFFFFF00') {
                        temp['노D'] = true
                    }
                    row.push(temp)
                }
                parsed_data_by_name[name] = row
            }
    
            localStorage.setItem('parsed_data_by_name', JSON.stringify(parsed_data_by_name))
    
            const parsed_data_by_date = {}
            for (let i = 2; i < raw_data[1].length; i++) {
                const row = []
                for (let j = START_NAME_ROW; j < START_NAME_ROW + WORK_NUM; j++) {
                    if (!raw_data[j][i] || !raw_data[j][i].value) {
                        continue
                    }
                    const temp = { name: raw_data[j][1].value, value: raw_data[j][i].value }
                    if (raw_data[j][i].style?.fill?.fgColor?.argb === 'FFFFFF00') {
                        temp['노D'] = true
                    }
                    row.push(temp)
                }
                parsed_data_by_date[date[i - 2]] = row
            }
            localStorage.setItem('parsed_data_by_date', JSON.stringify(parsed_data_by_date))
            
            localStorage.setItem('parsed_data_by_name', JSON.stringify(parsed_data_by_name));
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
            day_worker: parsed_data_by_date[today_key]?.filter(worker => worker.value.includes('D')),
            yellow_workers: parsed_data_by_date[today_key]?.filter(worker => 
                worker["노D"] === true && (worker.value.includes('D') || worker.value.includes('E'))),
            evening_worker: parsed_data_by_date[today_key]?.filter(worker => worker.value.includes('E')),
            night_worker: parsed_data_by_date[today_key]?.filter(worker => worker.value.includes('N')),
            off_worker: parsed_data_by_date[today_key]?.filter(worker => 
                !(worker.value.includes('D') || worker.value.includes('E') || worker.value.includes('N')))
        };
    }

    static setConfig(config) {
        this.config = config;
        localStorage.setItem('EXCEL_FILE_PATH', config.excelPath);
        localStorage.setItem('MONTH_COUNT', config.monthCount);
        localStorage.setItem('TEAM_CONFIG', config.teamConfig);
    }
}
