import { useRouter } from 'expo-router'; // [수정] useNavigation import 삭제
import { Pressable, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import TopHeader from '../../components/TopHeader';

const MainHome = ()=>{
    const router = useRouter();
    // [삭제] const navigation = useNavigation();
    
    return (
        <SafeAreaView  edges={['top']}>
            <TopHeader 
            title="채움" 
            showBack={false}
            showIcons={true}
        />
            

            <Pressable style = { [styles.Button,styles.groupButton] } >
                <Text style = {styles.ButtonText}>새로운 그룹 생성</Text>
            </Pressable>
                        
            
            <Pressable style  = { [styles.Button1,styles.codeButton]} >
                <Text style = {styles.ButtonText}>초대코드로 입장하기</Text>
            </Pressable>

            {/* [수정] 경로를 `./RecieptOCR`에서 `../RecieptOCR` 또는 절대 경로로 수정 필요할 수 있음 */}
            <Pressable style  = { [styles.Button2,styles.codeButton]} onPress={() => router.push('../RecieptOCR')}>
                <Text style={styles.ButtonText}>영수증 인식</Text>
            </Pressable>
            
        
            
            
        </SafeAreaView>
    )
}
export default MainHome;

// ... styles 는 기존과 동일 ...
const styles = StyleSheet.create({
    SafeAreaView:{flex: 1,
        backgroundColor: 'white', 
        alignItems: 'center', 
        paddingTop: 80, 
        paddingHorizontal: 20,},
    
    header : {
    height: 80,
    backgroundColor: '#5DADE2',
    alignItems: 'center',
    justifyContent: 'center',
    },

    headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',},

    headerText: {fontSize: 22,
    fontWeight: 'bold',
    color: 'black',
    marginRight:5},

    icon: {
        color: 'black'
    },
    Button: {
        width: '70%', 
        height: 50,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 8,
        marginTop:150,    
        marginHorizontal:50
    },

    Button1: {
        width: '70%', 
        height: 50,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 8,
        marginTop:20,    
        marginHorizontal:50
    },

    Button2 :{
        width: '70%', 
        height: 50,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 8,
        marginTop:20,    
        marginHorizontal:50
    },

    ButtonText:{color: 'white',
        fontSize: 16,
        fontWeight: 'bold',},

    codeButton: {backgroundColor: '#9CCC65',},

    groupButton: {backgroundColor: '#5DADE2',},

    BottomTab: {
        flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: '#fff',
    },
    BottomtabButton:{
        alignContent:'center'
    },
    BottomText:{
        fontSize: 12,
        textAlign: 'center'
    },
});
