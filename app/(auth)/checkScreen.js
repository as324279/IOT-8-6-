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

            <Text style = {styles.checkText}>인증 메일을 보냈어요</Text>

            <Pressable style = {styles.Button} onPress = {() => router.push('../(tabs)/mainHome')}>
                <Text style = {styles.nextButton}>다음</Text>
            </Pressable>
        </View>
    )
}
export default CheckScreen;

const styles = StyleSheet.create({
    container : {flex: 1,
        backgroundColor: 'white',
        paddingTop: 50, // 상단 여백
        paddingHorizontal: 20,},
    checkText : {fontWeight: 'bold',
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