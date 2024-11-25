export class WorkShiftView {
    constructor(shadowRoot) {
        this.shadowRoot = shadowRoot;
    }

    /**
     * @param {string} date - 날짜
     * @param {Object} workers - 근무자 정보
     * @param {string[]} teamNames - 팀 이름 목록
     */
    render(date, workers, teamNames) {
        if (!date) {
            throw new Error("날짜 정보가 없습니다.");
        }
        if (!workers || Object.keys(workers).length === 0) {
            throw new Error("근무자 정보가 없습니다.");
        }
        if (!teamNames || teamNames.length === 0) {
            throw new Error("팀 정보가 없습니다.");
        }
        return this.renderShiftTable(date, workers, teamNames);
    }

    renderShiftTable(date, workers, teamNames) {
        const today = new Date(date).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
        const container = document.createElement('div');
        container.classList.add('work-shift');
        container.innerHTML = `
            <div class="navigation">
                <button id="prev-date" class="nav-button tooltip" tooltip="이전 날짜 (← 키)">◀</button>
                <table class="work-shift-table">
                    ${this.renderTitle(`${today} 근무표`)}
                    ${this.renderSettingHeader(date, teamNames)}
                    ${this.renderWorkersList(workers)}
                </table>
                <button id="next-date" class="nav-button tooltip" tooltip="다음 날짜 (→ 키)">▶</button>
            </div>
            ${this.renderSettingsModal()}
        `;
        return container;
    }

    renderSettingHeader(date='', teamNames) {
        return `
            <tr id="setting-header">
                ${this.renderTeamFilter(teamNames)}
                ${this.renderDateInputForm(date)}
            </tr>
        `;
    }

    /**
     * @param {string[]} teamNames - 팀 이름 목록
     */
    renderTeamFilter(teamNames = []) {
        return `
            <td>
                <select id="team-filter">
                <option value="all" ${localStorage.getItem('CURRENT_TEAM_FILTER') === 'all' ? 'selected' : ''}>전체</option>
                ${teamNames.map(team => `
                    <option value="${team}" ${localStorage.getItem('CURRENT_TEAM_FILTER') === team ? 'selected' : ''}>${team}</option>
                    `).join('')}
                </select>
            </td>
        `;
    }

    renderDateInputForm(date) {
        const today = new Date().toISOString().split('T')[0];
        const isNotToday = date !== today;
        
        return `
            <td>
                <form id="shift-form">
                    <input type="date" id="date-input" value="${date || ''}" />
                    <input type="reset" id="reset-shift" class="${isNotToday ? 'highlight' : ''}" value="오늘 근무" />
                </form>
            </td>
        `;
    }

    renderWorkersList(workers) {
        return `
            ${this.renderWorkerGroup('노D', workers.yellow_workers, 'D, E 근무자중 노란색으로 칠해진 근무자')}
            ${this.renderWorkerGroup('D', workers.day_worker, '근무표에 D가 포함된 근무자')}
            ${this.renderWorkerGroup('E', workers.evening_worker, '근무표에 E가 포함된 근무자')}
            ${this.renderWorkerGroup('N', workers.night_worker, '근무표에 N이 포함된 근무자')}
            ${this.renderWorkerGroup('OFF', workers.off_worker, 'D, E, N에 속하지 않는 모든 근무자')}
        `;
    }

    renderWorkerGroup(title, workers, tooltip='') {
        if (!workers?.length) return '';
        return `
            <tr>
                <td class="shift-type ${tooltip ? 'tooltip' : ''}" tooltip="${tooltip}">${title}</td>
                <td class="worker-list">${workers.map(w => w.name).join(', ')}</td>
            </tr>
        `;
    }

    renderError(error) {
        const container = document.createElement('div');
        container.classList.add('work-shift');

        container.innerHTML = `
            <div class="navigation">
                <button id="prev-date" class="nav-button tooltip" tooltip="이전 날짜 (← 키)">◀</button>
                <table>
                    ${this.renderTitle('에러 페이지')}
                    ${this.renderSettingHeader()}
                    <tr>
                        <td colspan="2" style="text-align: center;"><span style="color: #3498db;">ℹ️</span> 엑셀 파일 경로를 수정하거나 엑셀 파일에서 직접 수정해주세요. <br/> <span style="color: #3498db;">ℹ️</span> 팀 설정에 있는 근무자만 근무표에 표시됩니다.</td>
                    </tr>
                    <tr>
                        <td colspan="2" style="color: red; white-space: pre-line; text-align: center;">${error}</td>
                    </tr>
                    <tr>
                        <td style="text-align: right;" colspan="2">
                            <button id="change-excel">엑셀 파일 변경</button>
                        </td>
                    </tr>
                </table>
                <button id="next-date" class="nav-button tooltip" tooltip="다음 날짜 (→ 키)">▶</button>
            </div>
            ${this.renderSettingsModal()}
        `;
        return container;
    }

    renderSettingsModal() {
        return `
            <div id="settings-modal" class="modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>설정</h2>
                        <span id="close-settings" class="close">&times;</span>
                    </div>
                    <div class="modal-body">
                        <div class="settings-item">
                            <span>
                                엑셀 파일 경로
                            </span>
                            <div class="file-path-container">
                                <input type="text" id="excel-path" readonly 
                                    value="${localStorage.getItem('EXCEL_FILE_PATH') || ''}">
                                <button id="change-excel">변경</button>
                            </div>
                        </div>
                        <br/>
                        <div class="settings-item">
                            <span>가져올 최대 개월 수</span>
                            <div class="month-config-container">
                                <input type="number" id="month-count" min="1" max="142" 
                                    value="${localStorage.getItem('MONTH_COUNT') || '3'}">
                                <span style="margin-left: 5px;">개월</span>
                                <button id="save-month-count">저장</button>
                            </div>
                        </div>
                        <br/>
                        <span>팀 설정</span>
                        <div class="settings-item">
                            ${(() => {
                                try {
                                    const teamConfig = JSON.parse(localStorage.getItem('TEAM_CONFIG'));
                                    return `<textarea id="team-config" rows="10">${ JSON.stringify(teamConfig, null, 2) }</textarea>`;
                                } catch (e) {
                                    return `<textarea id="team-config" rows="10"></textarea>`;
                                }
                            })()}
                            </div>
                            <div class="settings-item-actions" style="margin-top: 10px;">
                                <button id="reset-team-config" class="settings-item-action-button">초기화</button>
                                <button id="save-team-config" class="settings-item-action-button">저장</button>
                            </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderGoogleDriveButton() {
        return `
            <button id="download-from-drive" class="tooltip" tooltip="30분마다 지원팀 공용 PC에서 업로드된 근무표를 바탕화면에 다운로드합니다.">
                엑셀 파일 다운로드
            </button>
        `;
    }

    renderTitle(title) {
        return `
            <thead>
                <tr>
                    <th colspan="2" id="header">
                        <span class="header-text">${title}</span>
                        <button id="open-settings" class="settings-button">⚙️</button>
                    </th>
                </tr>
            </thead>
        `;
    }

    renderLoading() {
        const loadingElement = document.createElement('div');
        loadingElement.className = 'loading-skeleton';
        loadingElement.innerHTML = `
            <div class="skeleton-table">
                <div class="skeleton-header"></div>
                <div class="skeleton-controls">
                    <div class="skeleton-control"></div>
                    <div class="skeleton-control"></div>
                </div>
                <div class="skeleton-row"></div>
                <div class="skeleton-row"></div>
                <div class="skeleton-row"></div>
                <div class="skeleton-row"></div>
                <div class="skeleton-row"></div>
            </div>
        `;
        return loadingElement;
    }
}
