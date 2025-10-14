import React from 'react';
import { View, Text, Image, StyleSheet, Pressable, ImageBackground, TextInput } from 'react-native';
import { useRouter } from 'expo-router';

const EmailScreen = () => {

    return(
        <View style = {styles.container}>
            <Text style = {styles.HeaderText}>반갑습니다. 이메일과 비밀번호를 입력해주세요!</Text>

            <TextInput style = {styles.input} placeholder='Email을 입력해주세요.'>

            </TextInput>

            <TextInput style = {styles.input} placeholder='비밀번호를 입력해주세요'>
            
            </TextInput>

            <TextInput style = {styles.input} placeholder='비밀번호를 다시 입력해주세요'>
            
            </TextInput>
            <Pressable style = {styles.Button}>
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