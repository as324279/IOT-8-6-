import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Checkbox } from "react-native-paper";
import { API_BASE_URL } from "../../config/apiConfig";
import { useAuth } from "../../components/AuthProvider";

const SignupScreen = () => {
  const router = useRouter();
  const { signIn } = useAuth();

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [passwordcheck, setPasswordcheck] = useState("");
  const [showpassword, setShowpassword] = useState(false);
  const [showpasswordcheck, setShowpasswordcheck] = useState(false);
  const [togglebox, setTogglebox] = useState(false);
  const [togglebox2, setTogglebox2] = useState(false);

  const [eCode, setECode] = useState("");
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [isEVerified, setIsEVerified] = useState(false);
  const [codeError, setCodeError] = useState("");

  const isPasswordMismatch =
    password && passwordcheck && password !== passwordcheck;

  const isSignupEnabled =
    isEVerified &&
    password &&
    passwordcheck &&
    !isPasswordMismatch &&
    togglebox &&
    togglebox2;

  const sendEmail = async () => {
    if (!email) {
      Alert.alert("오류", "이메일을 입력해주세요!");
      return;
    }
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/v1/auth/send-code`,
        {
          email: email,
        }
      );
      if (response.data.data === true) {
        Alert.alert(
          "전송 완료",
          "인증번호가 전송되었습니다. 메일함을 확인해주세요."
        );
        setIsEmailSent(true);
        setIsEVerified(false);
        setECode("");
        setCodeError("");
      } else {
        Alert.alert("오류", "인증번호 발송에 실패했습니다.");
      }
    } catch (error) {
      console.log("인증 코드 발송 오류:", error.response?.data || error);
      Alert.alert("오류", "인증번호 발송 중 문제가 발생했습니다.");
    }
  };

  const verifyCode = async () => {
    if (!eCode) {
      setCodeError("인증코드를 입력하세요.");
      return;
    }
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/v1/auth/verify-code`,
        {
          email: email,
          code: eCode,
        }
      );
      if (response.data.data === true) {
        setIsEVerified(true);
        setCodeError("");
      } else {
        setCodeError("인증번호가 일치하지 않습니다.");
      }
    } catch (error) {
      const msg =
        error.response?.data?.error || "인증번호가 일치하지 않습니다.";
      setCodeError(msg);
      setIsEVerified(false);
    }
  };

  const handleSignup = async () => {
        const userData = {
            email: email,
            name: name,
            password: password,
            termsAgreed: togglebox,
            privacyAgreed: togglebox2,
        };

        try {
            // 회원가입 요청
            console.log("회원가입 요청");
            const signupResponse = await axios.post(`${API_BASE_URL}/api/v1/auth/signup`, userData);
            
            let token = signupResponse.data.token || signupResponse.data.data?.token;

            // 토큰 없다면 로그인 요청
            if (!token) {
                console.log("토큰 없어서 자동 로그인 시도");
                const loginResponse = await axios.post(`${API_BASE_URL}/api/v1/auth/login`, {
                    email: email,
                    password: password
                });
                token = loginResponse.data.token || loginResponse.data.data;
            }

            // 토큰이 확보되었으면 로그인 처리
            if (token) {
                await signIn(token); // 앱에 토큰 저장
                Alert.alert("환영합니다!", "회원가입이 완료되었습니다.");
                router.replace('(tabs)/mainHome'); // 메인으로 이동
            } else {
                // 만약 로그인 시도조차 실패했다면
                Alert.alert("회원가입 완료", "자동 로그인에 실패했습니다. 로그인 화면으로 이동합니다.");
                router.replace('login');
            }

        } catch (error) {
            console.error("회원가입 프로세스 실패:", error);
            if (error.response) {
                const errorMessage = error.response.data?.error || "오류가 발생했습니다.";
                Alert.alert("오류", errorMessage);
            } else {
                Alert.alert("연결 오류", "서버와 통신할 수 없습니다.");
            }
        }
    };

  return (
    <View style={styles.container}>

      <View style={styles.topBar}>
        <View style={{ flex: 1 }} />
          <Pressable onPress={() => router.back()} style={styles.closeTextButton}>
            <Text style={styles.closeText}>닫기</Text>
          </Pressable>
      </View>

      <Text style={styles.HeaderText}>반갑습니다. 정보를 입력해주세요!</Text>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.inputfiled}
          placeholder="Email을 입력해주세요."
          placeholderTextColor={"#999"}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          editable={!isEVerified}
        />
        <Pressable
          style={[
            styles.verifyButton,
            isEVerified ? styles.disabledButton : styles.activeButton,
          ]}
          onPress={sendEmail}
          disabled={isEVerified}
        >
          <Text style={styles.verifynextButton}>
            {isEVerified ? "완료" : isEmailSent ? "재전송" : "인증번호 발송"}
          </Text>
        </Pressable>
      </View>

      <View style={{ marginBottom: 0 }}>
        <View
          style={[
            styles.inputContainer,
            !isEmailSent && styles.inputDisabled,
            { marginBottom: 0 },
          ]}
        >
          <TextInput
            style={styles.inputfiled}
            placeholder="인증코드를 입력해주세요."
            placeholderTextColor={"#999"}
            value={eCode}
            onChangeText={(text) => {
              setECode(text);
              setCodeError("");
            }}
            keyboardType="number-pad"
            autoCapitalize="none"
            editable={isEmailSent && !isEVerified}
          />
          <Pressable
            style={[
              styles.verifyButton,
              !eCode || isEVerified || !isEmailSent
                ? styles.disabledButton
                : styles.activeButton,
            ]}
            onPress={verifyCode}
            disabled={!isEmailSent || !eCode || isEVerified}
          >
            <Text style={styles.verifynextButton}>
              {isEVerified ? "인증됨" : "인증확인"}
            </Text>
          </Pressable>
        </View>

        <View style={{ height: 20, justifyContent: "center" }}>
          {codeError ? <Text style={styles.errorText}>{codeError}</Text> : null}
          {isEVerified ? <Text style={styles.successText}>이메일 인증이 완료되었습니다.</Text> : null}
        </View>
      </View>

      <TextInput
        style={styles.input}
        placeholder="닉네임을 입력해주세요."
        placeholderTextColor={"#999"}
        value={name}
        onChangeText={setName}
      />

      {/* 비밀번호 입력 */}
      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.passwordInput}
          placeholder="비밀번호를 입력해주세요"
          placeholderTextColor={"#999"}
          value={password}
          secureTextEntry={!showpassword}
          onChangeText={setPassword}
        />
        <TouchableOpacity onPress={() => setShowpassword(!showpassword)}>
          <Ionicons
            name={showpassword ? "eye-off" : "eye"}
            size={20}
            color="gray"
          />
        </TouchableOpacity>
      </View>

      {/* 비밀번호 확인 */}
      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.passwordInput}
          placeholder="비밀번호를 다시 입력해주세요"
          placeholderTextColor={"#999"}
          value={passwordcheck}
          secureTextEntry={!showpasswordcheck}
          onChangeText={setPasswordcheck}
        />
        <TouchableOpacity
          onPress={() => setShowpasswordcheck(!showpasswordcheck)}
        >
          <Ionicons
            name={showpasswordcheck ? "eye-off" : "eye"}
            size={20}
            color="gray"
          />
        </TouchableOpacity>
      </View>

      <View style={{ height: 20 }}>
        {isPasswordMismatch ? (
          <Text style={styles.errorText}>비밀번호가 일치하지 않습니다</Text>
        ) : null}
      </View>

      {/* 이용약관 1 */}
      <View
        style={{ flexDirection: "row", alignItems: "center", marginBottom: 5 }}
      >
        <Checkbox
          status={togglebox ? "checked" : "unchecked"}
          onPress={() => setTogglebox(!togglebox)}
          color="#7DBCE9"
        />
        <Text style={{ marginLeft: 8 }}>서비스 이용약관 관련 전체 동의</Text>
      </View>

      {/* 이용약관 2 */}
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Checkbox
          status={togglebox2 ? "checked" : "unchecked"}
          onPress={() => setTogglebox2(!togglebox2)}
          color="#7DBCE9"
        />
        <Text style={{ marginLeft: 8 }}>개인정보 약관 전체 동의</Text>
      </View>

      {/* 가입 버튼 */}
      <Pressable
        style={[styles.Button, !isSignupEnabled && styles.disabledButton]}
        onPress={handleSignup}
        disabled={!isSignupEnabled}
      >
        <Text style={styles.nextButton}>회원가입</Text>
      </Pressable>
    </View>
  );
};
export default SignupScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  HeaderText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "black",
    marginBottom: 30,
    lineHeight: 36,
    marginTop:10
  },
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
  inputDisabled: {
    backgroundColor: "#F0F0F0",
    borderColor: "#E0E0E0",
  },
  inputfiled: {
    flex: 1,
    fontSize: 16,
    color: "#333",
    height: "100%",
  },
  input: {
    width: "100%",
    height: 50,
    backgroundColor: "#F5FFF5",
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    color: "#333",
    borderWidth: 1,
    borderColor: "transparent",
    marginBottom: 20,
    marginTop: 0,
  },
  verifyButton: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 6,
    marginLeft: 10,
    justifyContent: "center",
    alignItems: "center",
    minWidth: 80,
  },
  activeButton: {
    backgroundColor: "#7DBCE9",
  },
  disabledButton: {
    backgroundColor: "#D3D3D3",
  },
  verifynextButton: {
    color: "white",
    fontSize: 13,
    fontWeight: "bold",
  },
  successText: {
    color: "#4CAF50",
    fontSize: 13,
    marginLeft: 5,
    marginTop: 0,
    fontWeight: "600",
  },
  errorText: {
    color: "#F44336",
    fontSize: 13,
    marginLeft: 5,
    marginTop: 0,
    fontWeight: "600",
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5FFF5",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "transparent",
    paddingHorizontal: 15,
    height: 50,
    marginBottom: 20,
  },
  passwordInput: {
    flex: 1,
    fontSize: 16,
    color: "#333",
    height: "100%",
  },
  Button: {
    width: "100%",
    height: 50,
    backgroundColor: "#7DBCE9",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 30,
  },
  nextButton: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  topBar: {
  flexDirection: "row",
  width: "100%",
  justifyContent: "flex-end",
  alignItems: "center",
  marginBottom: 15,
},

closeTextButton: {
  padding: 5,
},

closeText: {
  fontSize: 16,
  fontWeight: "600",
  color: "#555",
},

});
