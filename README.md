# 문제정의
기존 근무표시트는 특정 날짜에 근무하는 근무자의 현황을 파악하기 쉽지 않습니다.
![image](image)

# 해결책
기존 근무표시트를 파싱하여 날짜별로 근무자를 보여주는 시스템을 개발하였습니다.
![image](image)

# 기능
- **근무자 정보 파싱**: Excel 파일에서 근무자 정보를 읽어와 날짜별로 정리합니다.
- **날짜별 근무자 조회**: 사용자가 선택한 날짜에 근무하는 근무자 목록을 제공합니다.
- **팀 필터링**: 특정 팀에 속한 근무자만 필터링하여 볼 수 있습니다.
- **설정 관리**: Excel 파일 경로 및 팀 설정을 사용자 정의할 수 있습니다.
- **자동 업데이트**: Excel 파일이 변경되면 자동으로 업데이트됩니다.

# 기술 스택
| 기술 스택 | 설명 | 선택 이유 |
|-----------|------|-----------|
| **Electron** <br/> <img src="https://www.electronjs.org/assets/img/logo.svg" width="50" height="50" alt="Electron Logo"> | 데스크톱 애플리케이션 프레임워크 | - 웹 기술(HTML, CSS, JS)로 크로스 플랫폼 데스크톱 앱 개발 가능<br/>- 로컬 파일 시스템 접근이 용이함<br/>- 빠른 개발과 배포가 가능함 |


# 설치 및 실행
1. 저장소를 클론합니다.
   ```bash
   git clone https://github.com/YeonSeong-Lee/bluebird_workshift_viewer.git
   ```
2. 프로젝트 디렉토리로 이동합니다.
   ```bash
   cd bluebird_workshift_viewer
   ```
3. 의존성을 설치합니다.
   ```bash
   npm install
   ```
4. 애플리케이션을 실행합니다.
   ```bash
   npm start
   ```

# 사용법
- **Excel 파일 선택**: 설정 메뉴에서 Excel 파일을 선택하여 근무자 정보를 불러옵니다.
- **날짜 선택**: 날짜 입력 폼을 통해 원하는 날짜를 선택합니다.
- **팀 필터링**: 팀 필터 드롭다운을 사용하여 특정 팀의 근무자만 볼 수 있습니다.

어플리케이션 사용법은 [사용법 안내](https://github.com/YeonSeong-Lee/bluebird_workshift_viewer/wiki/%EC%82%AC%EC%9A%A9%EB%B2%95-%EC%95%88%EB%82%B4)을 참고해주세요.