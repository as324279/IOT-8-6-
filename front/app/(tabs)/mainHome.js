import { useRouter } from 'expo-router'; // [수정] useNavigation import 삭제
import * as Notifications from 'expo-notifications';
import { useEffect, useState } from 'react';
import { Alert, Button, Modal, Pressable, StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import { TextInput } from 'react-native-paper'; // TextInput from react-native-paper (for styling consistency)
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Clipboard from 'expo-clipboard'; // [추가] 클립보드(복사하기) 기능
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
    const [isModal, setIsModal] = useState(false);
    const [modalType, setModalType] = useState(''); // 'create' or 'invite'
    const [ismodalValue, setIsmodalValue] = useState(""); // Input value for group name or invite code

    const [isResultModal, setIsResultModal] = useState(false); // 결과 팝업(모달)
    const [inviteCode, setInviteCode] = useState(""); // 생성된 초대 코드
    const [createdGroupName, setCreatedGroupName] = useState(""); // 생성된 그룹 이름
    const [isLoading, setIsLoading] = useState(false); // API 호출 시 로딩 스피너

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

    // [추가] 결과 팝업 닫기 함수
    const CloseResultModal = () => {
        setIsResultModal(false);
        setInviteCode("");
        setCreatedGroupName("");
        // TODO: 그룹 목록 새로고침 API를 호출
    }

    // 클립보드 코드 복사
    const copyToClipboard = async () => {
        await Clipboard.setStringAsync(inviteCode);
        Alert.alert("복사 완료", "초대 코드가 클립보드에 복사되었습니다.");
    };

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

// [교체] handleCreateGroup 함수
    const handleCreateGroup = async () => {
        if (!ismodalValue.trim()) {
            Alert.alert("오류", "그룹 이름을 입력해주세요.");
            return;
        }

        console.log("Creating group:", ismodalValue);
        setIsLoading(true); // 로딩 시작

        // --- (가상) 백엔드 API 호출 ---
        // TODO: Call backend API POST /api/v1/groups?name=...
        // const response = await axios.post(..., { name: ismodalValue });
        // const generatedCode = response.data.inviteCode;
        // const groupName = response.data.groupName;
        
        // (임시) 2초간 대기 (API 호출 시뮬레이션)
        await new Promise(resolve => setTimeout(resolve, 1500)); 
        
        // (임시) 가짜 데이터 생성
        const generatedCode = "A1B2-C3D4"; // 서버가 돌려준 가짜 초대 코드
        const groupName = ismodalValue; // 내가 입력한 그룹 이름
        // -----------------------------

        setIsLoading(false); // 로딩 끝
        
        CloseModal(); // 1. '입력' 팝업 닫기

        // 2. '결과' 팝업을 위한 데이터 설정
        setInviteCode(generatedCode);
        setCreatedGroupName(groupName);

        // 3. '결과' 팝업 띄우기
        setIsResultModal(true);
    }

// [교체] handleJoinGroup 함수
    const handleJoinGroup = async () => {
        if (!ismodalValue.trim()) {
            Alert.alert("오류", "초대 코드를 입력해주세요.");
            return;
        }
        
        setIsLoading(true); // 로딩 시작
        console.log("Joining with code:", ismodalValue);
        
        // TODO: Call backend API POST /api/v1/invites/redeem?code=...
        await new Promise(resolve => setTimeout(resolve, 1500)); // (API 호출 시뮬레이션)

        setIsLoading(false); // 로딩 끝
        Alert.alert("성공", "그룹에 입장했습니다!"); // (임시 피드백)
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
            {/* [수정] 로딩 중일 때 스피너 표시 */}
            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={modalType === 'create' ? '#5DADE2' : '#9CCC65'} />
                    <Text style={styles.loadingText}>
                        {modalType === 'create' ? '그룹 생성 중...' : '그룹 입장 중...'}
                    </Text>
                </View>
            ) : (
                <>
                    <Text style = {[styles.viewText, {color: modalType === 'create' ? '#5DADE2' : '#9CCC65'}]}>
                        {modalType === 'create' ? '생성할 그룹 이름을 입력하세요' : '초대 코드를 입력하세요'}
                    </Text>
                    <View style = {styles.Row}>
                        <TextInput
                            value = {ismodalValue}
                            onChangeText={setIsmodalValue}
                            style = {styles.input}
                            placeholder={modalType === 'create' ? '그룹 이름' : '초대 코드'}
                            mode="outlined"
                            dense
                        />
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
                </>
            )}
        </View>
    </View>
</Modal>
{/* 초대 코드 보여주기 */}
            <Modal
                animationType="slide"
                visible={isResultModal}
                transparent={true}
                onRequestClose={CloseResultModal}
            >
                <View style={styles.moadlView}>
                    <View style={styles.viewContainer}>
                        <Text style={styles.resultTitle}>🎉 그룹 생성 완료!</Text>
                        <Text style={styles.resultSubTitle}>
                            {createdGroupName} 그룹이 만들어졌습니다.
                        </Text>
                        <Text style={styles.resultInfo}>
                            아래 코드를 복사해 그룹원들에게 공유하세요.
                        </Text>
                        
                        <Pressable onPress={copyToClipboard} style={styles.codeContainer}>
                            <Text style={styles.codeText}>{inviteCode}</Text>
                            <Text style={styles.copyText}>(클릭하여 복사)</Text>
                        </Pressable>

                        <Pressable onPress={CloseResultModal} style={styles.closeButton}>
                            <Text style={styles.modalText}>닫기</Text>
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
    loadingContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 20,
    },
    loadingText: {
        marginTop: 15,
        fontSize: 16,
        color: '#555',
        fontWeight: 'bold',
    },
    resultTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
    },
    resultSubTitle: {
        fontSize: 16,
        color: '#555',
        marginBottom: 20,
        textAlign: 'center',
        paddingHorizontal: 10,
    },
    resultInfo: {
        fontSize: 14,
        color: '#777',
        marginBottom: 20,
        textAlign: 'center',
    },
    codeContainer: {
        backgroundColor: '#F0F0F0',
        borderRadius: 8,
        paddingVertical: 15,
        paddingHorizontal: 25,
        marginBottom: 25,
        borderWidth: 1,
        borderColor: '#DDD',
        alignItems: 'center',
        width: '100%',
    },
    codeText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#000',
        letterSpacing: 2, 
    },
    copyText: {
        fontSize: 12,
        color: '#5DADE2', 
        marginTop: 5,
        fontWeight: 'bold',
    }
});

