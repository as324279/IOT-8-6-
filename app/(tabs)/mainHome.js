import { useNavigation } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { TextInput } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import TopHeader from '../../components/Header';

const MainHome = ()=>{
    const router = useRouter();
    const navigation = useNavigation();
    const [isModal, setIsModal] = useState(false);
    const [modalType, setModalType] = useState('');
    const [ismodalValue, setIsmodalValue] = useState("");
    
        useEffect(() => {
    
        }, []);
    
         const OpenModal = (type) => {
            setModalType(type);
            setIsModal(true);
         }
    
        const CloseModal = () => {
            setIsModal(false);
            setIsmodalValue("");
        }
    
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

            
            <Pressable style  = { [styles.Button2,styles.codeButton]} onPress = {() => router.push('./ReceiptOCR')}>
                <Text style = {styles.ButtonText}>영수증 시험</Text>
            </Pressable>
        
            <Modal 
                animationType="slide"
                visible={isModal}
                transparent={true}
                >
                        {/* 화면 모달 */}
                        <View style = {styles.moadlView}>
                            <View style = {styles.view} backgroundColor = {modalType === 'create' ? '#5DADE2' : '#9CCC65'}>
                            
                            <Text style = {styles.viewText}>
                                {modalType === 'create' ? '그룹을 생성해주세요' : '초대 코드를 입력하세요'}
                            </Text>
                            <View style = {styles.Row}>
                            <TextInput 
                            value = {ismodalValue}
                            onChangeText={setIsmodalValue}
                            style = {styles.input}
                            />
                            <Pressable style = {styles.modalbutton}>
                                <Text style = {styles.buttontext}>
                                    {modalType === 'create' ? '생성' : '다음'}
                                </Text>
                            </Pressable>
                            </View>
                            <Pressable onPress={CloseModal}>
                                <Text style = {styles.modalText}>창 닫기!</Text>
                            </Pressable>
                            </View>
                        </View>
                        </Modal>
        
        </SafeAreaView>
        
    )
}
export default MainHome;

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
