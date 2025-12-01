// 🚨🚨🚨 [필수!] 🚨🚨🚨
// 1. 터미널(cmd)에서 'ipconfig' (Windows) 또는 'ifconfig' (Mac)를 실행
// 2. 'IPv4 주소' (예: 192.168.1.5)를 찾아서 아래 'YOUR_LAN_IP' 부분에 덮어쓰기
//수환님 주소 192.168.34.7
const YOUR_LAN_IP = '192.168.0.93'; // ⬅️⬅️⬅️ 여기를 네 IP로 수정

// Spring Boot 백엔드 서버 주소
export const API_BASE_URL = `http://${YOUR_LAN_IP}:8080`;

// Python OCR 서버 주소 (포트가 5000인 경우)
export const OCR_API_URL = `http://${YOUR_LAN_IP}:5000/ocr`;

