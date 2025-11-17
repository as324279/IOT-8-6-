import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
// 컴포넌트
import TopHeader from '../../components/TopHeader';
import NewItemForm from '../../components/shopping/NewItemForm';
import ShoppingListItem from '../../components/shopping/ShoppingListItem';

// 임시 데이터
const INITIAL_ITEMS = [
    {id : '1' ,name : '우유 500ML', note : '요즘 우유가 맛있어서!', quantity: 1, isCompleted: false, isSelected: false},
    {id : '2' ,name : '계란 한판', note : '계란은 필수지', quantity: 1, isCompleted: false, isSelected: false},
    {id : '3' ,name : '전자레인지', note : '지금 전자레인지 너무 오래되서 바꿔야돼', quantity: 1, isCompleted: false, isSelected: false}
];

// 메인 컴포넌트
const ShoppingHome = ()=>{
    const router = useRouter();
    const [items, setItems] = useState(INITIAL_ITEMS);
    const [active, setActive] = useState('need');
    const [newInput, setNewInput] = useState(false); 

    // 핸들러

    const handleToggleSelect = (id) => {
        setItems(currentItems => 
            currentItems.map(item => 
                item.id === id ? { ...item, isSelected: !item.isSelected } : item
            )
        );
    };

    const handleBatchComplete = () => {
        setItems(currentItems =>
            currentItems.map(item =>
                item.isSelected && !item.isCompleted
                ? { ...item, isCompleted: true, isSelected: false }
                : item
            )
        );
    };

    const handleQuantityChange = (id, amount) => {
        setItems(currentItems =>
            currentItems.map(item => 
                item.id === id 
                ? { ...item, quantity: Math.max(1, item.quantity + amount) } 
                : item
            )
        );
    };

    const addItem = (name, note) => {
        const newItem = {
            id: String(Date.now()),
            name: name,
            note: note,
            quantity: 1,
            isCompleted: false,
            isSelected: false,
        };
        setItems(currentItems => [newItem, ...currentItems]);
        setNewInput(false);
    };


    const selectedCount = useMemo(() => {
        return items.filter(item => item.isSelected && !item.isCompleted).length;
    }, [items]);

    const filteredItems = useMemo(() => {
        if (active === 'need') {
            return items.filter(item => !item.isCompleted);
        } else {
            return items.filter(item => item.isCompleted);
        }
    }, [items, active]);

    return (
      <KeyboardAvoidingView style = {{flex:1}} behavior={Platform.select({ ios : 'padding', android : 'undefined'})}>
        <SafeAreaView style = {{flex:1, backgroundColor: '#fff'}}>
        <TopHeader 
            showBack={false}
            showIcons={true}
            title="쇼핑리스트"
        />
        
        <View style = {styles.Tab}>
            <TouchableOpacity style = {[styles.tab1, active === 'need' && styles.activeTab]} onPress ={()=>setActive('need')}>
                <Text style = {[styles.tabText, active === 'need' && styles.activeText]}>구매 필요</Text>
            </TouchableOpacity>
            <TouchableOpacity style = {[styles.tab1, active === 'buy' && styles.activeTab]} onPress={() => setActive('buy')}>
                <Text style = {[styles.tabText, active === 'buy' && styles.activeText]}>구매 완료</Text>
            </TouchableOpacity>
        </View>

        <FlatList 
            data = {filteredItems}
            keyExtractor={(item) => (item.id)}
            renderItem={({item}) => (
                <ShoppingListItem
                    item={item}
                    onToggleSelect={() => handleToggleSelect(item.id)}
                    onQuantityChange={(amount) => handleQuantityChange(item.id, amount)}
                />
            )}
            contentContainerStyle={{ paddingBottom: 150 }} 
        />
        
        {/* 일괄 구매 완료 버튼 */}
        {selectedCount > 0 && active === 'need' && !newInput && (
            <TouchableOpacity 
                style={styles.batchButton} 
                onPress={handleBatchComplete}
            >
                <Text style={styles.batchButtonText}>
                    {selectedCount}개 항목 구매 완료
                </Text>
            </TouchableOpacity>
        )}
        
        {/* + 버튼 */}
        {!newInput && (
            <TouchableOpacity style={styles.icon} onPress={() => setNewInput(true)}>
                <FontAwesome5 name="plus" size={24} color="#fff" />
            </TouchableOpacity>
        )}
        
        {/* 새 물품 추가 */}
        {newInput && (
            <NewItemForm
                onAdd={addItem}
                onCancel={() => setNewInput(false)}
            />
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
        marginTop: 20, 
        borderRadius: 10,
        overflow: 'hidden',
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 1 },
        shadowRadius: 3,
    },
    tab1: { flex:1, paddingVertical: 12, alignItems:'center' },
    activeTab : { backgroundColor: '#E9F2FF' },
    tabText : { fontSize: 14, color: '#999' },
    activeText: { color: '#4A90E2', fontWeight: 'bold' },

    icon:{ // + 버튼
      position: 'absolute',
      bottom: 20,
      right: 20,
      backgroundColor: '#53ACD9', 
      width: 56,
      height: 56,
      borderRadius: 28, 
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 5,
    },
    batchButton: { // 일괄 완료 버튼
        position: 'absolute',
        bottom: 90,
        left: 20,
        right: 20,
        backgroundColor: '#007AFF',
        paddingVertical: 16,
        borderRadius: 10,
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 3,
    },
    batchButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});