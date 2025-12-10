IOT-8-6-/front
├── .expo/                   # Expo 실행 캐시 및 설정 파일 (Git 제외 권장)
├── app/                     # [핵심] Expo Router 기반의 페이지(Screen) 라우팅 디렉토리
│   ├── (auth)/              # 인증 관련 그룹 (로그인 전 화면들)
│   │   ├── checkScreen.js   # 약관 동의 또는 가입 전 확인 화면
│   │   ├── login.js         # 로그인 화면
│   │   ├── signupScreen.js  # 회원가입 화면
│   │   └── _layout.tsx      # 인증 그룹의 레이아웃 설정
│   ├── (mypage)/            # 마이페이지 관련 그룹
│   │   ├── inquiryScreen.js        # 1:1 문의 또는 고객센터 화면
│   │   ├── noticeScreen.js         # 공지사항 화면
│   │   ├── notificationSettings.js # 알림 설정 화면
│   │   ├── passwordChange.js       # 비밀번호 변경 화면
│   │   └── _layout.tsx             # 마이페이지 그룹 레이아웃
│   ├── (tabs)/              # 하단 탭 네비게이션이 적용된 메인 화면 그룹
│   │   ├── mainHome.js      # [탭1] 메인 홈 (냉장고/방 선택 등)
│   │   ├── mypage.js        # [탭3] 마이페이지 메인
│   │   ├── shoppingHome.js  # [탭2] 장보기/쇼핑 리스트 메인
│   │   └── _layout.tsx      # 하단 탭 바(Tab Bar) 설정 및 디자인
│   ├── index.js             # 앱의 시작 진입점 (Splash 또는 리다이렉트 처리)
│   ├── inputScreen.js       # 수동 재고/아이템 입력 화면
│   ├── inventory.js         # 특정 구역의 재고 목록 상세 화면
│   ├── itemDetail.js        # 개별 아이템 상세 정보 및 수정 화면
│   ├── loading.js           # 데이터 로딩 시 보여줄 스피너/화면
│   ├── notification.js      # 알림 내역 리스트 화면
│   ├── RecieptOCR.js        # 영수증 촬영 및 OCR 결과 확인 화면
│   ├── recieptScreen.js     # 영수증 관련 추가 처리 화면
│   └── _layout.js           # 앱 전체 공통 레이아웃 (Stack 설정, Provider 주입)
├── assets/                  # 이미지, 폰트 등 정적 리소스
├── components/              # 재사용 가능한 UI 컴포넌트 모음
│   ├── AuthProvider.js      # 로그인 상태 관리 (Context API)
│   ├── home/                # 홈 화면 전용 컴포넌트 (방 목록, 그룹 모달 등)
│   ├── shopping/            # 쇼핑 화면 전용 컴포넌트 (아이템 폼, 리스트 아이템 등)
│   ├── room/                # 방(Room) 관련 컴포넌트
│   ├── ui/                  # 공통 UI 요소 (아이콘, 접기/펼치기 뷰 등)
│   ├── ItemCard.js          # 재고 아이템을 보여주는 카드 UI
│   └── TopHeader.js         # 앱 상단 헤더 공통 컴포넌트
├── config/
│   └── apiConfig.js         # 백엔드 API URL 및 통신 설정
├── constants/               # 상수 데이터 (테마 색상, 고정 문구 등)
├── hooks/                   # 커스텀 React Hooks (비즈니스 로직 분리)
│   ├── useGroupManager.js     # 그룹/방 관리 로직
│   ├── useInventoryLogic.js   # 재고 추가/삭제/수정 로직
│   └── useShoppingManager.js  # 장보기 리스트 관리 로직
├── libs/
│   └── axios.ts             # Axios 인스턴스 및 인터셉터 설정
├── OCR/                     # OCR 기능 관련 모듈
│   ├── .env                 # OCR API 키 등 환경변수 (보안 주의)
│   └── ocr.js               # OCR 처리 로직 및 API 호출 함수
├── package.json             # 프로젝트 의존성(라이브러리) 및 스크립트 목록
└── tsconfig.json            # TypeScript 컴파일 설정