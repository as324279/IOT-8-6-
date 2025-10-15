import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';


const LoginScreen = () => {

    const router = useRouter();
    const navigation = useNavigation();
    const [password, setPassword] = useState('');
    const [showpassword, setShowpassword] = useState(false);

    

    return(
        <View style = {styles.container}>
            <Text style = {styles.HeaderText}>로그인해주세요!</Text>

            <TextInput style = {styles.input} 
            placeholder='Email을 입력해주세요.'
            
            />

            <View style = {styles.passwordContainer}>
                <TextInput style = {styles.passwordInput} 
            placeholder='비밀번호를 입력해주세요'
            value = {password}
            secureTextEntry = {!showpassword}
            onChangeText={setPassword}
            />
            <TouchableOpacity onPress = {() => setShowpassword(!showpassword)}>
                <Ionicons name = {showpassword ? 'eye-off': 'eye'}
                      size = {20} color = 'gray'></Ionicons>
            </TouchableOpacity>
            
            </View>

            <Pressable style = {styles.Button} onPress = {()=> router.push('../(tabs)/mainHome')}>
                <Text style = {styles.nextButton}>로그인</Text>
            </Pressable>


        </View>
    )
}
export default LoginScreen;

const styles  = StyleSheet.create({
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
        // 유효성 검사 실패 시 테두리 색상 변경을 위해 style 배열에서 동적으로 적용됨
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
  checkbox: {},


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
        lineHeight: 40, }
});