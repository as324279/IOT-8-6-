import { useRouter } from 'expo-router'; // [수정] useNavigation import 삭제
import * as Notifications from 'expo-notifications';
import { useEffect, useState } from 'react';
import { Button, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { TextInput } from 'react-native-paper'; // TextInput from react-native-paper (for styling consistency)
import { SafeAreaView } from 'react-native-safe-area-context';
// [수정] 파일 이름과 경로를 실제 파일 위치에 맞게 수정 (TopHeader.js로 가정)
import TopHeader from '../../components/TopHeader';

// 알림 기능 위한 것
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true, // 알림창 보이게
    shouldPlaySound: true, // 소리 켜기
    shouldSetBadge: false, // 앱 아이콘 배지 X
  }),
});

const MainHome = ()=>{
    const router = useRouter();
    // [삭제] const navigation = useNavigation(); // 사용 안 함
    const [isModal, setIsModal] = useState(false);
    const [modalType, setModalType] = useState(''); // 'create' or 'invite'
    const [ismodalValue, setIsmodalValue] = useState(""); // Input value for group name or invite code

    useEffect(() => {
    
            (async () => {
            const { status } = await Notifications.requestPermissionsAsync();
            if (status !== 'granted') {
                alert('알림 권한이 필요합니다!');
            }
            })();
        }, []);

    const OpenModal = (type) => {
        setModalType(type);
        setIsModal(true);
    }

    const CloseModal = () => {
        setIsModal(false);
        setIsmodalValue(""); // Clear input on close
    }

    // 프론트에서 알림 띄우는 것 -> 백엔드 및 DB 연동 필수
    const handleNotify = async () => {
        await Notifications.scheduleNotificationAsync({
      content: {
        title: "🛍️ 장보기 알림",
        body: "우유랑 계란 사야 하는 거 잊지 마세요!",
        subtitle: "오늘의 쇼핑 리스트",
    },
        trigger: { seconds: 5 },
        });
    };

    // Placeholder functions for API calls
    const handleCreateGroup = async () => {
        if (!ismodalValue.trim()) {
            // Add alert or feedback for empty input
            return;
        }
        console.log("Creating group:", ismodalValue);
        // TODO: Call backend API POST /api/v1/groups?name=...
        CloseModal();
    }

    const handleJoinGroup = async () => {
        if (!ismodalValue.trim()) {
            // Add alert or feedback for empty input
            return;
        }
        console.log("Joining with code:", ismodalValue);
        // TODO: Call backend API POST /api/v1/invites/redeem?groupId=...&code=...
        // Need groupId from somewhere if joining specific group via code?
        // Or maybe POST /api/v1/invites/redeem-any?code=... if code is globally unique? Check backend API.
        CloseModal();
    }

    return (
        <SafeAreaView style={styles.safeArea} edges={['top']}>
            <TopHeader
                showBack={false}
                showIcons={true}
                title="채움"
            />

            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Button title="로컬 알림 테스트" onPress={handleNotify} />
            </View>

            <Pressable style = { [styles.Button,styles.groupButton] } onPress={() => OpenModal('create')} >
                <Text style = {styles.ButtonText}>새로운 그룹 생성</Text>
            </Pressable>


            <Pressable style = { [styles.Button2,styles.codeButton]} onPress={() => OpenModal('invite')} >
                <Text style = {styles.ButtonText}>초대코드로 입장하기</Text>
            </Pressable>


            <Pressable style = { [styles.Button2,styles.codeButton]} onPress = {() => router.push('./RecieptOCR')}>
                <Text style = {styles.ButtonText}>영수증 시험</Text>
            </Pressable>

            <Modal
                animationType="slide"
                visible={isModal}
                transparent={true}
                onRequestClose={CloseModal} // Added for Android back button handling
                >
                {/* 화면 모달 */}
                <View style = {styles.moadlView}>
                    <View style = {styles.viewContainer} >
                        <Text style = {[styles.viewText, {color: modalType === 'create' ? '#5DADE2' : '#9CCC65'}]}>
                            {modalType === 'create' ? '생성할 그룹 이름을 입력하세요' : '초대 코드를 입력하세요'}
                        </Text>
                        <View style = {styles.Row}>
                            <TextInput // Using Paper's TextInput for better styling potential
                                value = {ismodalValue}
                                onChangeText={setIsmodalValue}
                                style = {styles.input}
                                placeholder={modalType === 'create' ? '그룹 이름' : '초대 코드'}
                                mode="outlined" // Example style
                                dense // Make it slightly smaller
                            />
                            {/* [수정] 버튼 onPress에 맞는 함수 연결 */}
                            <Pressable
                                style={[styles.modalbutton, {backgroundColor: modalType === 'create' ? '#5DADE2' : '#9CCC65'}]}
                                onPress={modalType === 'create' ? handleCreateGroup : handleJoinGroup}
                                >
                                <Text style = {styles.buttontext}>
                                    {modalType === 'create' ? '생성' : '입장'}
                                </Text>
                            </Pressable>
                        </View>
                        <Pressable onPress={CloseModal} style={styles.closeButton}>
                            <Text style = {styles.modalText}>닫기</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>

        </SafeAreaView>

    )
}
export default MainHome;

// --- Styles ---
const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: "#FFFFFF",
        alignItems: 'center',
    },
    Button: { // Style for Create Group button
        width: '70%',
        height: 50,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 8,
        marginTop: 30, // Adjusted margin top
    },
    Button2:{ // Style for Invite Code and OCR buttons
        width: '70%',
        height: 50,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 8,
        marginTop: 30, // Consistent margin top
    },
    ButtonText:{
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    codeButton: { // Invite Code button color
        backgroundColor: '#9CCC65',
    },
    groupButton: { // Create Group button color
        backgroundColor: '#5DADE2',
    },
    // --- Modal Styles ---
    moadlView: { // Modal background overlay
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
    },
    viewContainer:{ // Modal content container
        backgroundColor:'white', // Changed background to white
        borderRadius:20,
        padding: 25, // Adjusted padding
        alignItems: 'center',
        width: '85%', // Make modal wider
        shadowColor: "#000", // Added shadow for depth
        shadowOffset :{
            width:0,
            height:2
        },
        shadowOpacity:0.25,
        shadowRadius:4,
        elevation:5
    },
    viewText: { // Modal title text
        fontSize:18, // Slightly smaller font size
        fontWeight:'bold',
        textAlign:'center',
        marginBottom: 25 // Adjusted margin bottom
    },
    Row:{ // Container for input and button
        flexDirection:'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: 20, // Add space below input row
    },
    input:{ // Modal text input (using react-native-paper TextInput styles)
        flex: 1, // Take available space
        marginRight: 10, // Add space between input and button
        height: 45, // Consistent height
        // Additional styling comes from TextInput mode="outlined"
    },
    modalbutton: { // Modal action button (Create/Join)
        paddingVertical: 12, // Adjusted padding
        paddingHorizontal: 16,
        borderRadius: 8,
        justifyContent: 'center', // Center text vertically
        alignItems: 'center', // Center text horizontally
        minWidth: 60, // Ensure minimum width
    },
    buttontext: { // Text inside modal action button
        color: 'white',
        fontWeight: 'bold',
        fontSize: 14, // Slightly smaller font size
    },
     closeButton: { // Style for the 'Close' button
        marginTop: 15, // Add space above close button
        padding: 10,
    },
    modalText:{ // Text for the 'Close' button
        color:'#555', // Make it less prominent
        fontSize:14,
        textAlign:'center',
        fontWeight:'bold'
    },
    // Removed unused styles like header, headerContainer, headerText, icon, BottomTab etc.
});

