export class WorkShiftService {
    static getWorkersByDate(date) {
        const parsed_data_by_date = JSON.parse(localStorage.getItem('parsed_data_by_date'));
        const today_key = new Date(date).toLocaleDateString('ko-KR', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });

        if (!parsed_data_by_date || !parsed_data_by_date[today_key]) {
            return null;
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
}
