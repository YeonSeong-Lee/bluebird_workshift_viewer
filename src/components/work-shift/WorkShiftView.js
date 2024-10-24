export class WorkShiftView {
    constructor(shadowRoot) {
        this.shadowRoot = shadowRoot;
    }

    render(date, workers) {
        if (!workers) {
            throw new Error("근무자 정보가 없습니다.");
        }
        return this.renderShiftTable(date, workers);
    }

    renderShiftTable(date, workers) {
        const today = new Date(date).toLocaleDateString('kr', { month: '2-digit', day: "2-digit" });
        const container = document.createElement('div');
        container.classList.add('work-shift');
        container.innerHTML = `
            <table>
                <tr>
                    <th colspan="2" id="header">${today} 근무표</th>
                </tr>
                <tr>
                    <td colspan="2">
                        <form id="shift-form">
                            <input type="date" id="date-input" value="${date}" />
                            <input type="reset" id="reset-shift" value="오늘 근무" />
                        </form>
                    </td>
                </tr>
                ${this.renderWorkersList(workers)}
            </table>
        `;
        return container;
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
                <tr>
                    <th colspan="2" id="header">에러 페이지</th>
                </tr>
                <tr>
                    <td><span style="color: #3498db;">ℹ️</span> 엑셀 파일 경로를 수정하거나 엑셀 파일에서 직접 수정해주세요.</td>
                </tr>
                <tr>
                    <td style="color: red;">${error}</td>
                </tr>
                <tr>
                    <td>
                        <button id="change-excel">엑셀 파일 변경</button>
                    </td>
                </tr>
            </table>
        `;
        return container;
    }
}
