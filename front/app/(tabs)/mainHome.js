import { useNavigation } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import TopHeader from '../../components/Header';

const MainHome = ()=>{
    const router = useRouter();
    const navigation = useNavigation();
    
    return (
        
         <SafeAreaView style={styles.safeArea} edges={['top']}>
        
            <TopHeader 
            showBack={false}
            showIcons={true}
            title="채움"
            />
            
            <Pressable style = { [styles.Button,styles.groupButton] } onPress={() => OpenModal('create')} >
                <Text style = {styles.ButtonText}>새로운 그룹 생성</Text>
            </Pressable>
                        
            
            <Pressable style  = { [styles.Button2,styles.codeButton]} onPress={() => OpenModal('invite')} >
                <Text style = {styles.ButtonText}>초대코드로 입장하기</Text>
            </Pressable>

            <Pressable style  = { [styles.Button2,styles.codeButton]} onPress={() => router.push('./ReceiptOCR')}>
                <Text style={styles.ButtonText}>영수증 인식</Text>
            </Pressable>
            
        
            
        </SafeAreaView>
        
    )
}
export default MainHome;

// ... styles 는 기존과 동일 ...
const styles = StyleSheet.create({
    safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    alignItems: 'center',},
    
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
        marginTop:300,
    },
    Button2:{width: '70%', 
        height: 50,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 8,
        marginTop:30,},

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
    input:{
    width: "100%",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    marginBottom: 16,
    height:30,
    marginRight:10
    
    },
    moadlView: {
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center', 
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
    },

    view:{
        backgroundColor:'#9BDC5F',
        borderRadius:20,
        padding:40,
        alignItems: 'center',
        marginTop:200,
        margin:50,
        shadowOffset :{
            width:0,
            height:2
        },
        shadowOpacity:0.25,
        shadowRadius:4,
        elevation:5
    },
    viewText: { 
        fontSize:20,
        color:'#000000',
        fontWeight:'bold',
        textAlign:'center',
        marginBottom:50
    },
    modalText:{
        color:'#000000',
        fontsize:15,
        textAlign:'center',
        fontWeight:'bold'
    },
    Row:{
        flexDirection:'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
    },
    modalbutton: {
    backgroundColor: '#D9D9D9',
    paddingVertical: 17,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop:-20
    },
    buttontext: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    }
});
