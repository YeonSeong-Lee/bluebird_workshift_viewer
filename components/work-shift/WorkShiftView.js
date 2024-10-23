export class WorkShiftView {
    constructor(shadowRoot) {
        this.shadowRoot = shadowRoot;
    }

    showLoadingScreen() {
        const loadingScreen = document.createElement('div');
        loadingScreen.id = 'loading-screen';
        loadingScreen.textContent = '로딩 중...';
        loadingScreen.style.display = 'flex';
        loadingScreen.style.justifyContent = 'center';
        loadingScreen.style.alignItems = 'center';
        loadingScreen.style.height = '100%';
        loadingScreen.style.fontSize = '24px';
        return loadingScreen;
    }

    renderError() {
        return `
            <div class="work-shift">
                <table>
                    <tr>
                        <th colspan="2" id="header">에러 페이지</th>
                    </tr>
                    <tr>
                        <td>엑셀 파일을 확인해주세요.</td>
                    </tr>
                    <tr>
                        <td>
                            <button id="change-excel">엑셀 파일 변경</button>
                        </td>
                    </tr>
                </table>
            </div>
        `;
    }

    renderShiftTable(date, workers) {
        const today = new Date(date).toLocaleDateString('kr', { month: '2-digit', day: "2-digit" });
        return `
            <div class="work-shift">
                <table>
                    <tr>
                        <th colspan="2" id="header">${today} 근무표</th>
                    </tr>
                    <tr>
                        <td colspan="2">
                            <form id="shift-form">
                                <input type="date" id="date-input" value=${date} />
                                <input type="reset" id="reset-shift" value="오늘 근무" />
                            </form>
                        </td>
                    </tr>
                    <!-- 근무자 목록 렌더링 -->
                    ${this.renderWorkersList(workers)}
                </table>
            </div>
        `;
    }
}
