import css from './work-shift-css.js';

class WorkShift extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        const style = document.createElement('style');
        style.textContent = css;
        this.shadowRoot.appendChild(style);

        const container = document.createElement('div');
        container.classList.add('container');
        this.shadowRoot.appendChild(container);

        // 대기화면 추가
        const loadingScreen = document.createElement('div');
        loadingScreen.id = 'loading-screen';
        loadingScreen.textContent = '로딩 중...';
        loadingScreen.style.display = 'flex';
        loadingScreen.style.justifyContent = 'center';
        loadingScreen.style.alignItems = 'center';
        loadingScreen.style.height = '100%';
        loadingScreen.style.fontSize = '24px';
        container.appendChild(loadingScreen);
    }

    syncDate(event) {
        const selectedDate = event.target.value;
        this.render(selectedDate);
    }

    errorRender() {
        const loadingScreen = this.shadowRoot.querySelector('#loading-screen');
        if (loadingScreen) {
            loadingScreen.style.display = 'none';
        }
        this.shadowRoot.querySelector('.container').innerHTML = `
            <div class="work-shift">
                <table>
                <tr>
                    <th colspan="2" id="header">에러 페이지</th>
                </tr>
                <tr>
                    <td>
                        엑셀 파일을 확인해주세요.
                    </td>
                </tr>
                <tr>
                    <td>
                        <button id="change-excel">엑셀 파일 변경</button>
                    </td>
                </tr>
            </div>
        `;
        this.shadowRoot.querySelector('#change-excel').addEventListener('click', () => {
            window.electronAPI.open_file_dialog().then((filePath) => {
                localStorage.setItem('EXCEL_FILE_PATH', filePath);
                window.electronAPI.set_file_path(filePath);
                location.reload();
            });
        })
    }

    render(date) {
        const today = new Date(date).toLocaleDateString('kr', { month: '2-digit', day: "2-digit" });
        const parsed_data_by_date = JSON.parse(localStorage.getItem('parsed_data_by_date'));
        const today_key = new Date(date).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
        const loadingScreen = this.shadowRoot.querySelector('#loading-screen');
        if (loadingScreen) {
            loadingScreen.style.display = 'none';
        }
        if (!parsed_data_by_date || !parsed_data_by_date[today_key]) {
            this.shadowRoot.querySelector('.container').innerHTML = `
                <div class="work-shift">
                <table>
                <tr>
                    <th colspan="2" id="header">${today} 근무표</th>
                    <tr>
                        <td colspan="2">
                        <form id="shift-form">
                            <input type="date" id="date-input" value=${date} />
                            <input type="reset" id="reset-shift" value="오늘 근무" />
                        </form>
                        </td>
                    </tr>
                <tr>
                    <tr>
                        <td>
                            ${today} 근무자를 불러오지 못했습니다. 엑셀 파일을 확인해주세요.
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <button id="change-excel">엑셀 파일 변경</button>
                        </td>
                    </tr>
                </table>
                </div>
            `;
            this.shadowRoot.querySelector('#date-input').addEventListener('change', (event) => {
                this.syncDate(event);
            });
            this.shadowRoot.querySelector('#reset-shift').addEventListener('click', () => {
                const today = new Date().toISOString().slice(0, 10); // Get today's date in YYYY-MM-DD format
                this.shadowRoot.querySelector('#date-input').value = today; // Set the date input to today's date   
                this.render(today);
            });
            this.shadowRoot.querySelector('#change-excel').addEventListener('click', () => {
                window.electronAPI.open_file_dialog().then((filePath) => {
                    localStorage.setItem('EXCEL_FILE_PATH', filePath);
                    window.electronAPI.set_file_path(filePath);
                    location.reload();
                });
            })
            return;
        }
        const day_worker = parsed_data_by_date[today_key]?.filter(worker => worker.value.includes('D'));
        const yellow_workers = parsed_data_by_date[today_key]?.filter(worker => worker["노D"] === true && (worker.value.includes('D') || worker.value.includes('E')));
        const evening_worker = parsed_data_by_date[today_key]?.filter(worker => worker.value.includes('E'));
        const night_worker = parsed_data_by_date[today_key]?.filter(worker => worker.value.includes('N'));
        const off_worker = parsed_data_by_date[today_key]?.filter(worker => !(worker.value.includes('D') || worker.value.includes('E') || worker.value.includes('N')));

        this.shadowRoot.querySelector('.container').innerHTML = `
            <div class="work-shift">
                <table>
                <tr>
                    <th colspan="2" id="header">${today} 근무표</th>
                    <tr>
                        <td colspan="2">
                        <form id="shift-form">
                            <input type="date" id="date-input" value=${date} />
                            <input type="reset" id="reset-shift" value="오늘 근무" />
                        </form>
                        </td>
                    </tr>
                <tr>
                    <th>시간</th>
                    <th>근무자</th>
                </tr>
                <tr>
                    <td>노D</td>
                    <td>${yellow_workers.map((e) => e.name).join(', ')}</td>
                </tr>
                <tr>
                    <td>D</td>
                    <td>${day_worker.map((e) => e.name).join(', ')}</td>
                </tr>
                <tr>
                    <td>E</td>
                    <td>${evening_worker.map((e) => e.name).join(', ')}</td>
                </tr>
                <tr>
                    <td>N</td>
                    <td>${night_worker.map((e) => e.name).join(', ')}</td>
                </tr>
                <tr>
                    <td>OFF</td>
                    <td>${off_worker.map((e) => e.name).join(', ')}</td>
                </tr>
                </table>
            </div>
        `;
        this.shadowRoot.querySelector('#date-input').addEventListener('change', (event) => {
            this.syncDate(event);
        });
        this.shadowRoot.querySelector('#reset-shift').addEventListener('click', () => {
            const today = new Date().toISOString().slice(0, 10); // Get today's date in YYYY-MM-DD format
            this.shadowRoot.querySelector('#date-input').value = today; // Set the date input to today's date
            this.render(today);
        });
    }
}

customElements.define('work-shift', WorkShift);
