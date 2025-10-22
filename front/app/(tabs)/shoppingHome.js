import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Checkbox } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import TopHeader from '../../components/TopHeader';

const ShoppingHome = () => {
  const [togglebox, setTogglebox] = useState(false);
  const [active,setActive] = useState('need');



  return (
    <SafeAreaView>
      <TopHeader 
            title="채움" 
            showBack={false}
            showIcons={true}
        />
    {/* 여기는 구매 필요/완료 탭바 */}
    <View style = {styles.Tab}>
        <TouchableOpacity onPress={() =>  setActive('need')}  style={[styles.tab, active === 'need' && styles.activeTab]} >
            <Text style={[styles.Text, active === 'need' && styles.activeTabText]} >
                구매 필요</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress = {() => setActive('complete')} style={[styles.tab, active === 'complete' && styles.activeTab]}>
            <Text style = {[styles.Text, active === 'complete' && styles.activeTabText]}>
                구매 완료</Text>
        </TouchableOpacity>
    </View>
    
    <FlatList data = {[ 
         {id : '1' ,name : '우유 500ML',note : '요즘 우유가 맛있어서!'},
         {id : '2' ,name : '계란 한판',note : '계란은 필수지'}, 
         {id : '3' ,name : '전자레인지',note : '지금 전자레인지 너무 오래되서 바꿔야돼'} ]} 
         keyExtractor={(item) => (item.id)} renderItem={({item}) => ( 
         <View style = {styles.List}> 
            <View style = {styles.ListLeft}> 
                <Checkbox status = {togglebox ? 'checked': 'unchecked'} onPress = {() => setTogglebox(!togglebox)} color = "#7DBCE9"/>
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
        contentContainerStyle={{ paddingBottom: 100 }} />

        <View style = {styles.icon}>
            <FontAwesome5 name = "plus-circle" size = {50} color = "#53ACD9"/>
        </View>
    </SafeAreaView>
  );
};

export default ShoppingHome;

const styles = StyleSheet.create({
  SafeAreaView: {
    flex: 1,
    backgroundColor: '#F8F9FB',
  },
  List: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 6,
    padding: 14,
    borderRadius: 10,
    elevation: 2,
    marginTop:20
  },
  ListLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  ListRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  Name: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  Note: {
    fontSize: 13,
    color: '#888',
    marginTop: 2,
  },
  iconBtn: {
    padding: 5,
  },
  floatingBtn: {
    position: 'absolute',
    bottom: 25,
    right: 25,
    backgroundColor: '#7DBCE9',
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
  },
  tab:{flex: 1, paddingVertical: 10, alignItems: 'center',
    },
  activeTab:{ backgroundColor: '#E9F2FF'},
  activeTabText:{
    color: '#4A90E2', fontWeight: 'bold'
  },
  Text:{
    fontSize: 14, color: '#999'
  },
  Tab:{
    flexDirection: 'row',
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginTop: 50,
    borderRadius: 10,
    overflow: 'hidden',
  },
  icon: {
    marginTop:70,
    justifyContent:'flex-end',
    flexDirection: 'row'

  }

});
