<p align="center">
  <img src="blue-bird.png" alt="logo" height="200px" width="200px">
  <h2 align="center">파랑새둥지 근무표 Viewer</h2>
</p>

<p align="center">
  <a href="#문제정의">문제정의</a> | 
  <a href="#해결책">해결책</a> | 
  <a href="#기능">기능</a> | 
  <a href="#기술-스택">기술 스택</a> | 
  <a href="#설치-및-실행">설치 및 실행</a>
</p>

<p align="center">
  <h1>문제정의</h1>
  기존 근무표시트는 특정 날짜에 근무하는 근무자의 현황을 파악하기 쉽지 않습니다.
  <br>
  <img src="https://github.com/user-attachments/assets/f31d9812-ac1c-4d5b-a968-edf0b231b8dc" alt="기존_근무표">
</p>

<p align="center">
  <h1>해결책</h1>
  날짜별, 팀별로 근무자를 보여주는 Viewer를 통해 쉽게 근무자 파악 할 수 있습니다.
  <br>
  <img src="https://github.com/user-attachments/assets/76e4c04e-10df-4262-80cb-c514a67c8789" alt="work_shift_demo">
</p>

---

# 기능
- **근무자 정보 파싱**: Excel 파일에서 근무자 정보를 읽어와 날짜별로 정리합니다.
- **날짜별 근무자 조회**: 사용자가 선택한 날짜에 근무하는 근무자 목록을 제공합니다.
- **팀 필터링**: 특정 팀에 속한 근무자만 필터링하여 볼 수 있습니다.
- **설정 관리**: Excel 파일 경로 및 팀 설정을 사용자 정의할 수 있습니다.
- **자동 업데이트**: Excel 파일이 변경되면 자동으로 업데이트됩니다.

# 기술 스택
| 기술 스택 | 설명 | 선택 이유 |
|:-----------:|:------:|:-----------:|
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
4. team.config.example.js를 참고하여 team.config.js 파일을 생성합니다.
   ```bash
   cp team.config.example.js team.config.js
   ```
5. team.config.js 파일을 자신의 팀 구성에 맞게 수정합니다.
   ```javascript
   // team.config.js 예시
   const teamConfig = {
     "팀1": ["직원1", "직원2"],
     "팀2": {
       "팀장": ["팀장1"],
       "팀원": ["직원3", "직원4"]
     }
   }
   ```

6. 애플리케이션을 실행합니다.
   ```bash
   npm start
   ```

# 주요기능
- **Excel 파일 선택**: 설정 메뉴에서 Excel 파일을 선택하여 근무자 정보를 불러옵니다.
- **Excel 업데이트 자동 반영**: 해당 Excel 파일이 변경되면 근무자 정보도 자동 갱신됩니다.
- **날짜 선택**: 날짜 입력 폼을 통해 원하는 날짜를 선택합니다.
- **팀 필터링**: 팀 필터 드롭다운을 사용하여 특정 팀의 근무자만 볼 수 있습니다.

# 어플리케이션 사용법
어플리케이션 사용법은 [사용법 안내](https://github.com/YeonSeong-Lee/bluebird_workshift_viewer/wiki/%EC%82%AC%EC%9A%A9%EB%B2%95-%EC%95%88%EB%82%B4)을 참고해주세요.

# 라이센스
출처를 표기하는 한 모든 사용에 대해 허락합니다.

# 질문 및 건의사항
 깃허브 이슈나 `yeonseong.dev@gmail.com`으로 연락주세요.

# 근무표 도입 문의
 사회복지시설에서 근무표 viewer를 도입하고 싶다면 `yeonseong.dev@gmail.com`으로 연락주시면 성심껏 도와드리겠습니다.
