import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

const CheckScreen = () => {
    const router = useRouter();

    return (
        <View style = {styles.container}>
            <View style = {{alignItems: 'center'}}>
                <MaterialIcons name = {"mark-email-read"} size = {150} color = 'blue'
                ></MaterialIcons>
            </View>

            {/* [수정] 안내 문구 변경 */}
            <Text style = {styles.checkText}>인증 메일을 보냈어요
이메일 링크를 확인한 후, 아래 버튼을 눌러 로그인해주세요.</Text>

            {/* [수정] '다음' 버튼 클릭 시 login.js로 이동 */}
            <Pressable style = {styles.Button} onPress = {() => router.replace('/(auth)/login')}>
                <Text style = {styles.nextButton}>로그인하러 가기</Text>
            </Pressable>
        </View>
    )
}
export default CheckScreen;

// 스타일은 이전과 동일하게 유지
const styles = StyleSheet.create({
    container : {flex: 1,
        backgroundColor: 'white',
        paddingTop: 50, // 상단 여백
        paddingHorizontal: 20,},
    checkText : {fontWeight: 'bold',
        fontSize: 18, // 텍스트 크기 키움
        color: 'black',
        marginBottom: 40,
        marginTop:70,
        lineHeight: 40,
        textAlign: 'center'
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
});

