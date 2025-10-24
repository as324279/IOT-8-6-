import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Button, FlatList, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Checkbox } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import TopHeader from '../../components/Header';

const ShoppingHome = ()=>{

    const router = useRouter();
    const [togglebox, setTogglebox] = useState(false);
    const [active, setActive] = useState('need');
    const [newInput, setNewInput] = useState(false);
    const [newName, setNewName] = useState("");
    const [newNote, setNewNote] = useState("");

    const [ButtonVisible, setButtonVisibel ] = useState(false);
    
    const ButtonInput = () => {
        setButtonVisibel(prev => !prev)
    }
    return (
      <KeyboardAvoidingView style = {{flex:1}} behavior={Platform.select({ ios : 'padding', android : 'undefined'})}>
        <SafeAreaView style = {{flex:1}}>
        <TopHeader 
            showBack={false}
            showIcons={true}
            title="쇼핑리스트"
        />

        
        {/* 구매 필요/완료 탭바 */}
        <View style = {styles.Tab}>
            <TouchableOpacity style = {[styles.tab1, active === 'need' && styles.activeTab]} onPress ={()=>setActive('need')}>
                <Text style = {[styles.tabText, active === 'need' && styles.activeText]}>구매 필요</Text>
            </TouchableOpacity>

            <TouchableOpacity style = {[styles.tab1, active === 'buy' && styles.activeTab]} onPress={() => setActive('buy')}>
                <Text style = {[styles.tabText, active === 'need' && styles.activeText]}>구매 완료</Text>
            </TouchableOpacity>
        </View>

        {/* 리스트 뷰 -> flatList로 표현 */}
        <FlatList 
            data = {[
                {id : '1' ,name : '우유 500ML',note : '요즘 우유가 맛있어서!'},
                {id : '2' ,name : '계란 한판',note : '계란은 필수지'},
                {id : '3' ,name : '전자레인지',note : '지금 전자레인지 너무 오래되서 바꿔야돼'}
            ]}
            keyExtractor={(item) => (item.id)}
            renderItem={({item}) => (
                <View style = {styles.List}>
                    <View style = {styles.ListLeft}>
                        <Checkbox
                            status = {togglebox ? 'checked': 'unchecked'}
                            onPress = {() => setTogglebox(!togglebox)}
                            color = "#7DBCE9"/>
                        <View>
                            <Text style = {styles.Name}>{item.name}</Text>
                            <Text style = {styles.Note}>{item.note}</Text>
                        </View>
                    </View>

                    <View style = {styles.ListRight}>
                        <TouchableOpacity>
                            <Ionicons name = "remove-outline" size = {20} color = "#666"/>
                        </TouchableOpacity>

                        <TouchableOpacity>
                            <Ionicons name = "add-outline" size = {20} color = "#666"/>
                        </TouchableOpacity>
                    </View>
                    
                </View>
            )}
        contentContainerStyle={{ paddingBottom: 100 }}
        />
        
        
        <View style = {styles.icon}>
            <FontAwesome5
          name="plus-circle"
          size={50}
          color="#53ACD9"
          onPress={() => setNewInput(!newInput)}
        />
        </View>
        
      

      {newInput && (
        <View style={styles.newContainer}>
          <TextInput
            
            label="이름"
            value={newName}
            onChangeText={setNewName}
            style={styles.input}
            placeholder='이름'
            placeholderTextColor={"blcak"}
            
          />
          <TextInput
            
            label="메모"
            value={newNote}
            onChangeText={setNewNote}
            style={styles.input}
            placeholder='메모'
            placeholderTextColor={"blcak"}
            
          />
          <Button
            mode="contained"
            // onPress={additem}
            style={styles.addButton}
            buttonColor="#0000"
            title = "추가"  
          >
            
          </Button>
          </View>
      )}
      
        </SafeAreaView>
        </KeyboardAvoidingView>
      
    )
}
export default ShoppingHome;

const styles = StyleSheet.create({
    
    
    Tab :{
    flexDirection: 'row',
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginTop: 50,
    borderRadius: 10,
    overflow: 'hidden',
    },
    tab1: {
        flex:1,
        paddingVertical:10,
        alignItems:'center'
    },
    activeTab : {
        backgroundColor: '#E9F2FF'
    },
    tabText : {
        fontSize: 14, color: '#999'
    },
    activeText: {
        color: '#4A90E2', fontWeight: 'bold'
    },
    List : {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginVertical: 6,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 1,
    },
    ListLeft : {
        flexDirection: 'row', alignItems: 'center', gap: 10 
    },
    ListRight:{
        flexDirection: 'row', alignItems: 'center'
    },
    Name: { fontWeight: 'bold', color: '#333' },
    Note: { fontSize: 12, color: '#888' },
    icon:{
      position: 'absolute',
    bottom: 40,
    right: 30,
    },
    input: {
      marginVertical: 8,
      borderWidth: 1,
      borderColor: 'black',
      borderRadius: 8,
      padding: 10,
    },
    addButton:{
      marginTop:8,
      borderRadius:8,
    },
    newContainer:{
    backgroundColor: '#fff',
    padding: 16,
    margin: 16,
    borderRadius: 10,
    elevation: 4,
    }


    

})
