import { useNavigation } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

const MainHome = ()=>{
    const router = useRouter();
    const navigation = useNavigation();
    
    return (
        <View style = {styles.container}>
            {/* 채움 헤더 부분*/}
            {/* <View style = {styles.header}>
                <View style = {styles.headerContainer}></View>
                <Text style = {styles.headerText}>채움</Text>
                <Ionicons name = "notifications-outline" size = {20} color = "black" style = {styles.icon}/>
            </View>  */}

            <Pressable style = { [styles.Button,styles.groupButton] } >
                <Text style = {styles.ButtonText}>새로운 그룹 생성</Text>
            </Pressable>
                        
            
            <Pressable style  = { [styles.Button,styles.codeButton]} >
                <Text style = {styles.ButtonText}>초대코드로 입장하기</Text>
            </Pressable>
            
        
            
        </View>
    )
}
export default MainHome;

const styles = StyleSheet.create({
    container:{flex: 1,
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

    headerContainer: {flexDirection: 'row',
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
        width: '100%', 
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