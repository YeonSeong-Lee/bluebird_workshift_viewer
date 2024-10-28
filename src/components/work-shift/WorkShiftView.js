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
            <table>
                ${this.renderTitle(`${today} 근무표`)}
                ${this.renderSettingHeader(date, teamNames)}
                ${this.renderWorkersList(workers)}
            </table>
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
                <option value="all">전체</option>
                ${teamNames.map(team => `
                    <option value="${team}">${team}</option>
                    `).join('')}
                </select>
            </td>
        `;
    }

    renderDateInputForm(date) {
        return `
            <td>
                <form id="shift-form">
                    <input type="date" id="date-input" value="${date || ''}" />
                    <input type="reset" id="reset-shift" value="오늘 근무" />
                </form>
            </td>
        `;
    }

    renderWorkersList(workers) {
        return `
            ${this.renderWorkerGroup('노D', workers.yellow_workers)}
            ${this.renderWorkerGroup('D', workers.day_worker)}
            ${this.renderWorkerGroup('E', workers.evening_worker)}
            ${this.renderWorkerGroup('N', workers.night_worker)}
            ${this.renderWorkerGroup('OFF', workers.off_worker)}
        `;
    }

    renderWorkerGroup(title, workers) {
        if (!workers?.length) return '';
        return `
            <tr>
                <td class="shift-type">${title}</td>
                <td class="worker-list">${workers.map(w => w.name).join(', ')}</td>
            </tr>
        `;
    }

    renderError(error) {
        const container = document.createElement('div');
        container.classList.add('work-shift');

        container.innerHTML = `
            <table>
                ${this.renderTitle('에러 페이지')}
                ${this.renderSettingHeader()}
                <tr>
                    <td colspan="2" style="text-align: center;"><span style="color: #3498db;">ℹ️</span> 엑셀 파일 경로를 수정하거나 엑셀 파일에서 직접 수정해주세요.</td>
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
