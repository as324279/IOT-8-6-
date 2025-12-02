import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'; 
import { useAuth } from '../../components/AuthProvider';
import { API_BASE_URL } from '../../config/apiConfig'; 
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from "jwt-decode";

const LoginScreen = () => {
    const router = useRouter();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showpassword, setShowpassword] = useState(false);

    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');

    const { signIn } = useAuth();

    const handleLogin = async () => {
        console.log("LOGIN BUTTON CLICKED!");

        //  에러 메시지를 초기화
        setEmailError('');
        setPasswordError('');

        //  유효성 검사 
        let hasError = false;
        if (!email) {
            setEmailError("이메일을 입력해주세요.");
            hasError = true;
        }
        if (!password) {
            setPasswordError("비밀번호를 입력해주세요.");
            hasError = true;
        }
        if (hasError) {
            return; // 에러가 있으면 API 요청을 보내지 않고 함수 종료
        }

        const loginData = {
            email: email,
            password: password,
        };

        try {
            const response = await axios.post(`${API_BASE_URL}/api/v1/auth/login`, loginData);
            const token = response.data?.token || response.data?.data; 
            
            if (token) {
                console.log("로그인 성공",token);

                try {
                    const decoded = jwtDecode(token);
                    const userId = decoded.sub; // 보통 'sub' 필드에 ID가 들어있습니다.
                    
                    console.log("토큰에서 추출한 User ID:", userId);
                    
                    // 폰에 영구 저장
                    await AsyncStorage.setItem('userId', userId);
                    
                } catch (e) {
                    console.log("토큰 해독 실패:", e);
                }
                
                await signIn(token);
                router.replace('../(tabs)/mainHome');
            } else {
                const errorMessage = response.data?.error || "로그인에 실패했습니다.";
                setPasswordError(errorMessage);
            }

        } catch (error) {
            if (error.response) {
                const errorMessage = error.response.data?.error || "로그인 중 오류 발생";
                console.error('서버 응답 에러:', error.response.data);
                setPasswordError(errorMessage); 
            } else {
                console.error('연결 오류:', error.message);
                setPasswordError("서버에 연결할 수 없습니다. 네트워크를 확인하세요.");
            }
        }
    };

    return(
        <View style = {styles.container}>
            <Text style = {styles.HeaderText}>로그인해주세요!</Text>

            {/* --- 이메일 입력창 --- */}
            <TextInput style = {styles.input}
                placeholder='Email을 입력해주세요.'
                placeholderTextColor={'#000000'}
                value={email}
                // 입력 시작하면 에러 제거
                onChangeText={(text) => {
                    setEmail(text);
                    if (emailError) setEmailError('');
                }}
                keyboardType="email-address"
                autoCapitalize="none"
            />
            {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}


            {/* --- 비밀번호 입력창 --- */}
            <View style = {styles.passwordContainer}>
                <TextInput style = {styles.passwordInput}
                    placeholder='비밀번호를 입력해주세요'
                    value = {password}
                    secureTextEntry = {!showpassword}
                    // 입력 시작하면 에러 제거
                    onChangeText={(text) => {
                        setPassword(text);
                        if (passwordError) setPasswordError('');
                    }}
                    placeholderTextColor={'#000000'}
                />
                <TouchableOpacity onPress = {() => setShowpassword(!showpassword)}>
                    <Ionicons name = {showpassword ? 'eye-off': 'eye'}
                            size = {20} color = 'gray'></Ionicons>
                </TouchableOpacity>
            </View>
            {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}


            <Pressable style = {styles.Button} onPress={handleLogin}>
                <Text style = {styles.nextButton}>로그인</Text>
            </Pressable>
        </View>
    )
}
export default LoginScreen;

const styles = StyleSheet.create({
    container:{
        flex: 1,
        backgroundColor: 'white',
        paddingTop: 50,
        paddingHorizontal: 20,
    },

    input:{
        width: '100%',
        height: 50,
        backgroundColor: '#F5FFF5',
        borderRadius: 8,
        paddingHorizontal: 15,
        fontSize: 16,
        color: '#333',
        borderWidth: 1,
        borderColor: 'transparent',
    },

    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F5FFF5',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'transparent',
        paddingHorizontal: 15,
        height: 50,
        marginTop: 30, 
    },
    passwordInput: {
        flex: 1,
        fontSize: 16,
        color: '#333',
    },

    
    errorText: {
        color: 'red',
        fontSize: 12,
        marginTop: 5, 
        marginLeft: 5, 
    },

    Button:{
        width: '100%',
        height: 50,
        backgroundColor: '#7DBCE9',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 40, 
    },

    nextButton:{
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },

    HeaderText: {
        fontSize: 32,
        fontWeight: 'bold',
        color: 'black',
        marginBottom: 40,
        lineHeight: 40, 
    }
});