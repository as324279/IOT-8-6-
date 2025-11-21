import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Checkbox } from 'react-native-paper';
import { API_BASE_URL } from '../../config/apiConfig'; // 1. API 설정 파일 import

// 컴포넌트 이름을 파일명과 일치시킴 (EmailScreen -> SignupScreen)
const SignupScreen = () => {

    const router = useRouter();

    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [passwordcheck, setPasswordcheck] = useState('');
    const [showpassword, setShowpassword] = useState(false);
    const [showpasswordcheck, setShowpasswordcheck] = useState(false);
    const [togglebox,setTogglebox] = useState(false);
    const [togglebox2, setTogglebox2] = useState(false);
    const [eCode,setECode] = useState(''); //이메일 인증코드
    const [isEVerified, setIsEVerified] = useState(false); //인증코드 확인

    //이메일 인증 발송
    const sendEmail = async () => {
        
        if (!email) {
                Alert.alert("이메일을 입력해주세요!");
                console.log("이메일 입력");
                return;
        }

        
            const response = await axios.post(`${API_BASE_URL}/api/v1/auth/send-code`, {
                email:email,
            });
            if(response.data.data === true){
            Alert.alert("인증코드가 발송되었습니다.");
            console.log("코드 발송 확인",response.data);
        } else {
            console.log("인증 코드 오류:", error.response?.data || error);

        }
        
    }

    //이메일 인증 코드 확인
    const verifyCode = async () => {
        if (!eCode) {
            Alert.alert("인증코드를 입력하세요");
            return;
        }
        
            const response = await axios.post(`${API_BASE_URL}/api/v1/auth/verify-code`, {
                email:email,
                code : eCode
            });
            if(response.data.data === true){
                setIsEVerified(true);
                Alert.alert("이메일 인증이 완료되었습니다.");
                console.log("이메일 인증 완료",response.data);
            }
            else {
            Alert.alert("인증 코드 오류",error.response?.data?.error || "인증실패");
        }
    }

    const handleSignup = async () => {
        if (!email || !name || !password || !passwordcheck) {
            Alert.alert("오류", "모든 필드를 입력해주세요.");
            return;
        }
        if (password !== passwordcheck) {
            Alert.alert("오류", "비밀번호가 일치하지 않습니다.");
            return;
        }
        // [수정] 백엔드 DTO에 약관 동의 필드가 필요하므로 검증 유지
        if (!togglebox || !togglebox2) {
            Alert.alert("오류", "약관에 모두 동의해주세요.");
            return;
        }

        const userData = {
            email: email,
            
            name: name,
            password: password,
            termsAgreed: togglebox,
            privacyAgreed: togglebox2,
        };

        console.log("서버로 보내는 데이터: ", userData);

        try {
            // 2. [수정] API 주소 변경 (/v1 추가 및 apiConfig 사용)
            console.log(`🌐 POST 요청 전송: ${API_BASE_URL}/api/v1/auth/signup`);
            const response = await axios.post(`${API_BASE_URL}/api/v1/auth/signup`, userData);
            console.log("서버 응답 수신: ",response.data);

            // 3. [수정] 백엔드 응답이 { data: null, error: null } 형식이 됨
            if (response.data && response.data.error) {
                // 이 경우는 거의 없지만, 성공 응답인데 error가 있는 경우
                Alert.alert("회원가입 오류", response.data.error);
                console.log("응답 오류: ", response.data.error);
            } else {
                Alert.alert("성공", "인증 메일을 발송했습니다. 메일함을 확인해주세요.");
                // 4. [수정] 로그인 대신 이메일 확인 화면으로 이동
                console.log("회원가입 성공: ");
                router.push('checkScreen');
                console.log("라우터 실행 됬다.")
            }

        } catch (error) {
            if (error.response) {
                // 5. [수정] 백엔드가 보내는 { error: "메시지" } 형식의 오류 처리
                const errorMessage = error.response.data?.error || "서버 응답 오류"; // ?. 옵셔널 체이닝 추가
                console.error('서버 응답 에러:', error.response.data); // data 전체 로그 확인
                Alert.alert("회원가입 오류", errorMessage);
            } else {
                console.error('연결 오류:', error.message);
                Alert.alert("연결 오류", "서버에 연결할 수 없습니다. IP 주소와 서버 상태를 확인하세요.");
            }
        }
    };


    return(
        <View style = {styles.container}>
            <Text style = {styles.HeaderText}>반갑습니다. 정보를 입력해주세요!</Text>

            
            <View style = {styles.inputContainer}>
            <TextInput style = {styles.inputfiled}
            placeholder='Email을 입력해주세요.'
            placeholderTextColor={'#000000'}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            />
            <Pressable style = {styles.verifyButton} onPress={sendEmail}>
                <Text style = {styles.verifynextButton}>인증</Text>
            </Pressable>
            </View>

            <View style = {styles.inputContainer}>
            <TextInput style = {styles.inputfiled}
            placeholder='인증코드을 입력해주세요.'
            placeholderTextColor={'#000000'}
            value={eCode}
            onChangeText={setECode}
            keyboardType="email-address"
            autoCapitalize="none"
            />
            <Pressable style = {styles.verifyButton} onPress={verifyCode}>
                <Text style = {styles.verifynextButton}>인증 완료!</Text>
            </Pressable>
            </View>

            {isEVerified && (
                <Text style = {styles.verifyText}>
                    이메일 인증 완료
                </Text>
            )}

            <TextInput style = {styles.input}
            placeholder='닉네임을 입력해주세요.'
            placeholderTextColor={'#000000'}
            value={name}
            onChangeText={setName}
            />

            <View style = {styles.passwordContainer}>
                <TextInput style = {styles.passwordInput}
                placeholder='비밀번호를 입력해주세요'
                placeholderTextColor={'#000000'}
                value = {password}
                secureTextEntry = {!showpassword}
                onChangeText={setPassword}
                />
                <TouchableOpacity onPress = {() => setShowpassword(!showpassword)}>
                    <Ionicons name = {showpassword ? 'eye-off': 'eye'}
                            size = {20} color = 'gray'></Ionicons>
                </TouchableOpacity>

            </View>

            <View style = {styles.passwordContainer}>
                <TextInput style = {styles.passwordInput} placeholder='비밀번호를 다시 입력해주세요'
                value = {passwordcheck}
                placeholderTextColor={'#000000'}
                secureTextEntry = {!showpasswordcheck}
                onChangeText={setPasswordcheck}
                />
                <TouchableOpacity onPress={() => setShowpasswordcheck(!showpasswordcheck)}>
                    <Ionicons name = {showpasswordcheck ? 'eye-off' : 'eye'}
                            size = {20} color = 'gray'></Ionicons>
                </TouchableOpacity>

            </View>

            <View style = {{flexDirection : 'row',alignItems:'center'}}>
                <Checkbox
                status = {togglebox ? 'checked': 'unchecked'}
                onPress = {() => setTogglebox(!togglebox)}
                color = "#7DBCE9"/>
                <Text style = {{marginLeft:8}}>서비스 이용약관 관련 전체 동의</Text>
            </View>

            <View style = {{flexDirection : 'row',alignItems:'center'}}>
                <Checkbox
                status = {togglebox2 ? 'checked': 'unchecked'}
                onPress = {() => setTogglebox2(!togglebox2)}
                color = "#7DBCE9"/>
                <Text style = {{marginLeft:8}}>개인정보 약관 전체 동의</Text>
            </View>

            <Pressable style = {styles.Button} onPress={handleSignup}>
                <Text style = {styles.nextButton}>회원가입</Text>
            </Pressable>


        </View>
    )
}
// export 이름을 파일명과 일치
export default SignupScreen;

// 스타일 코드는 기존과 동일
const styles  = StyleSheet.create({
    container:{
        flex: 1,
        backgroundColor: 'white',
        paddingTop: 50, // 상단 여백
        paddingHorizontal: 20,},

    input:{width: '100%',
        height: 50,
        backgroundColor: '#F5FFF5', // 이미지의 연한 녹색 배경
        borderRadius: 8,
        paddingHorizontal: 15,
        fontSize: 16,
        color: '#333',
        borderWidth: 1,
        borderColor: 'transparent',
        marginBottom:20 }, // 간격 조정
    passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5FFF5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
    paddingHorizontal: 15,
    height: 50,
    marginBottom: 20, // 간격 조정
    },
    passwordInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    },
    Button:{width: '100%',
        height: 50,
        backgroundColor: '#7DBCE9', // 이미지의 파란색 계열 버튼
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
        marginBottom: 40, // 입력 필드와의 간격
        lineHeight: 40, },
inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    height: 50,
    backgroundColor: "#F5FFF5",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "transparent",
    marginBottom: 20,
    paddingHorizontal: 10,
},
inputfiled:{
    flex: 1,
    fontSize: 16,
    color: "#333",
},
verifyButton:{
    backgroundColor: "#7DBCE9",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 6,
    marginLeft: 10,
    justifyContent: "center",
    alignItems: "center",
},
verifynextButton: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
},
verifyText: {
    color: "#28A745",           // 초록색 ✔ 성공 표시
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 15,
    marginLeft: 5
}
});

