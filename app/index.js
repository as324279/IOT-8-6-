import React from 'react';
import { View, Text, Image, StyleSheet, Pressable, ImageBackground } from 'react-native';
import { useRouter } from 'expo-router';

const FirstScreen =  () => {
    const router = useRouter();


    return (

        <View style = {styles.container}>
            <Image
                source = {require('../assets/images/projectlogo.png')}
                style = {styles.logo}
                resizMode = "contain"
            />
            

            <Pressable style = { [styles.Button,styles.loginButton] } onPress = {()=>router.push('./(auth)/login')}>
                <Text style = {styles.ButtonText}>로그인</Text>
            </Pressable>
            

            <Pressable style  = { [styles.Button,styles.signButton]} onPress = {() => router.push('./(auth)/signupScreen')}>
                <Text style = {styles.ButtonText}>회원가입</Text>
            </Pressable>



        </View>
    )

    

}
export default FirstScreen;

const styles = StyleSheet.create({

    container: {
        flex: 1,
        backgroundColor: 'white', // 배경색
        alignItems: 'center', // 가로 중앙 정렬
        paddingTop: 80, // 상단 여백
        paddingHorizontal: 20,
    },
    Button: {
        width: '100%', // 너비 최대화
        height: 50,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 8,
        marginTop:30,    
    },
    ButtonText:{color: 'white',
        fontSize: 16,
        fontWeight: 'bold',},
    loginButton: {backgroundColor: '#9CCC65',},
    signButton: {backgroundColor: '#5DADE2',},
    logo: {width: 140,
    height: 140,
    marginBottom: 24,}
});
    