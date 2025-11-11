import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../components/AuthProvider';
import { API_BASE_URL } from '../../config/apiConfig'; // 1. API 설정 파일 import

const LoginScreen = () => {

    const router = useRouter();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showpassword, setShowpassword] = useState(false);

    //const { signIn } = useAuth(); // AuthProvider에서 signIn 함수를 가져옵니다.

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert("오류", "이메일과 비밀번호를 모두 입력해주세요.");
            return;
        }

        const loginData = {
            email: email,
            password: password,
        };

        try {
            // 2. [수정] API 주소 변경 (/v1 추가 및 apiConfig 사용)
            const response = await axios.post(`${API_BASE_URL}/api/v1/auth/login`, loginData);

            // 3. [수정] 백엔드 응답이 { data: "token", error: null } 형식이 됨
            const token = response.data?.data; // ?. 옵셔널 체이닝 추가

            if (token) {
                // Context의 signIn 함수로 토큰 저장 및 상태 업데이트
                await signIn(token); // signIn 함수가 토큰을 저장한다고 가정
                Alert.alert("로그인 성공", "메인 화면으로 이동합니다.");
                router.replace('/(tabs)/mainHome');
            } else {
                // data 필드가 없거나 비어있는 경우 (백엔드 에러 응답)
                const errorMessage = response.data?.error || "로그인에 실패했습니다.";
                Alert.alert("로그인 오류", errorMessage);
            }

        } catch (error) {
            if (error.response) {
                // 4. [수정] 백엔드가 보내는 { error: "메시지" } 형식의 오류 처리
                // 예: "이메일 인증이 완료되지 않았습니다.", "자격증명 오류" 등
                const errorMessage = error.response.data?.error || "로그인 중 오류 발생"; // ?. 옵셔널 체이닝 추가
                console.error('서버 응답 에러:', error.response.data); // data 전체 로그 확인
                Alert.alert("로그인 오류", errorMessage);
            } else {
                console.error('연결 오류:', error.message);
                Alert.alert("연결 오류", "서버에 연결할 수 없습니다. IP 주소와 서버 상태를 확인하세요.");
            }
        }
    };

    return(
        <View style = {styles.container}>
            <Text style = {styles.HeaderText}>로그인해주세요!</Text>

            <TextInput style = {styles.input}
            placeholder='Email을 입력해주세요.'
            placeholderTextColor={'#000000'}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            />

            <View style = {styles.passwordContainer}>
                <TextInput style = {styles.passwordInput}
                placeholder='비밀번호를 입력해주세요'
                value = {password}
                secureTextEntry = {!showpassword}
                onChangeText={setPassword}
                placeholderTextColor={'#000000'}
                />
                <TouchableOpacity onPress = {() => setShowpassword(!showpassword)}>
                    <Ionicons name = {showpassword ? 'eye-off': 'eye'}
                            size = {20} color = 'gray'></Ionicons>
                </TouchableOpacity>
            </View>

            <Pressable style = {styles.Button} onPress={handleLogin}>
                <Text style = {styles.nextButton}>로그인</Text>
            </Pressable>
        </View>
    )
}
export default LoginScreen;

// 스타일 코드는 기존과 동일
const styles = StyleSheet.create({
    container:{
        flex: 1,
        backgroundColor: 'white',
        paddingTop: 50,
        paddingHorizontal: 20,},

    input:{width: '100%',
        height: 50,
        backgroundColor: '#F5FFF5',
        borderRadius: 8,
        paddingHorizontal: 15,
        fontSize: 16,
        color: '#333',
        borderWidth: 1,
        borderColor: 'transparent',
        marginBottom:40 },

    passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5FFF5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
    paddingHorizontal: 15,
    height: 50,
    marginBottom: 30,
    },
    passwordInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    },
    Button:{width: '100%',
        height: 50,
        backgroundColor: '#7DBCE9',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 40, },

    nextButton:{color: 'white',
        fontSize: 16,
        fontWeight: 'bold',},

    HeaderText: {fontSize: 32,
        fontWeight: 'bold',
        color: 'black',
        marginBottom: 40,
        lineHeight: 40, }
});

