import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Checkbox } from 'react-native-paper';

const EmailScreen = () => {

    const router = useRouter();

    const [password, setPassword] = useState('');
    const [passwordcheck, setPasswordcheck] = useState('');
    const [showpassword, setShowpassword] = useState(false);
    const [showpasswordcheck, setShowpasswordcheck] = useState(false);
    const [togglebox,setTogglebox] = useState(false);
    const [togglebox2, setTogglebox2] = useState(false);

    return(
        <View style = {styles.container}>
            <Text style = {styles.HeaderText}>반갑습니다. 이메일과 비밀번호를 입력해주세요!</Text>

            <TextInput style = {styles.input} 
            placeholder='Email을 입력해주세요.'
            placeholderTextColor={'#000000'}
            />

            <TextInput style = {styles.input} 
            placeholder='닉네임을 입력해주세요.'
            placeholderTextColor={'#000000'}
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

            <Pressable style = {styles.Button} onPress = {()=> router.push('checkScreen')}>
                <Text style = {styles.nextButton}>다음</Text>
            </Pressable>


        </View>
    )
}
export default EmailScreen;

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
