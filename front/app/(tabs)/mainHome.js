import { useRouter } from 'expo-router';
import * as Notifications from 'expo-notifications';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, View, Text, Pressable, Modal, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Clipboard from 'expo-clipboard';
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialCommunityIcons } from '@expo/vector-icons';

// 컴포넌트
import TopHeader from '../../components/TopHeader';
import { styles } from '../../components/home/HomeStyles';
import RoomList from '../../components/home/RoomList';
import { InputModal, ResultModal } from '../../components/home/GroupModals';
import { API_BASE_URL } from '../../config/apiConfig';

Notifications.setNotificationHandler({
  handleNotification: async () => ({ shouldShowAlert: true, shouldPlaySound: true, shouldSetBadge: false }),
});

const MainHome = () => {
    const router = useRouter();
    
    const [rooms, setRooms] = useState([]);
    const [userId, setUserId] = useState(null); // 내 ID 저장용

    // 기존 모달 상태들
    const [isModal, setIsModal] = useState(false);
    const [modalType, setModalType] = useState('');
    const [ismodalValue, setIsmodalValue] = useState("");
    const [isResultModal, setIsResultModal] = useState(false);
    const [inviteCode, setInviteCode] = useState("");
    const [createdGroupName, setCreatedGroupName] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    // [신규] 메뉴 및 수정 모달 상태
    const [selectedRoom, setSelectedRoom] = useState(null); // 현재 선택된 방
    const [isMenuVisible, setIsMenuVisible] = useState(false); // 점 3개 메뉴
    const [isRenameVisible, setIsRenameVisible] = useState(false); // 이름 변경 모달
    const [newRoomName, setNewRoomName] = useState(""); // 변경할 이름

    useEffect(() => {
       initData();
    }, []);

    const initData = async () => {
        const token = await AsyncStorage.getItem("userToken");
        // 토큰에서 내 정보나 ID를 가져오는 로직이 있다면 여기서 userId 세팅
        // 예: setUserId(decodedToken.sub); 
        // 일단 방 목록 조회
        room(token);
    };

    // [MainHome.js] room 함수 수정
    const room = async (token) => {
        try {
            if (!token) token = await AsyncStorage.getItem("userToken");
            if (!token) return;

            // 🔍 [디버깅] 내 아이디가 잘 가져와지는지 확인
            const myId = await AsyncStorage.getItem("userId"); 
            console.log("📱 내 폰에 저장된 ID:", myId);
            setUserId(myId);

            const get = await axios.get(`${API_BASE_URL}/api/v1/groups`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const groupList = get.data.data;
            
            // 🔍 [디버깅] 서버가 주는 방장 ID 확인 (첫 번째 방만 확인)
            if (groupList.length > 0) {
                console.log("🏠 첫 번째 방의 방장 ID:", groupList[0].createdBy.userId);
            }

            setRooms(groupList.map(g => ({
                id: g.groupId,
                name: g.name,
                memberCount: g.memberCount ?? 1,
                ownerId: g.createdBy.userId 
            })));
        } catch (error) {
            console.log("그룹 조회 오류!", error);
        }
    };

    // [핸들러] 방 클릭 -> 이동
    const handleRoomPress = (room) => {
         router.push({
           pathname: "/inventory",  // 👈 원래 파일 위치로 지정
           params: { 
               group_id: room.id,   // inventory.js가 받는 변수명에 맞춤
               name: room.name 
           }
         });
    };

    // [수정] 메뉴 버튼 핸들러 (롱프레스 로직 삭제)
    const handleMenuPress = (room, type) => {
        setSelectedRoom(room);
        // 무조건 하단 메뉴 모달 띄우기 (타입 구분 X)
        setIsMenuVisible(true);
    };

    // [기능 1] 초대 코드 생성 및 복사
    const handleInviteCopy = async () => {
        try {
            const token = await AsyncStorage.getItem("userToken");
            // API 호출하여 새 코드 발급
            const res = await axios.post(`${API_BASE_URL}/api/v1/groups/${selectedRoom.id}/invites`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            const code = res.data.data.code;
            await Clipboard.setStringAsync(code);
            
            setIsMenuVisible(false); // 메뉴 닫기
            Alert.alert("초대 코드 복사됨", `새 코드: ${code}\n클립보드에 복사되었습니다.`);
        } catch (error) {
            Alert.alert("오류", "초대 코드 생성 실패");
        }
    };

    // [수정] 그룹 이름 변경 실행 함수
    const executeRename = async () => {
        if (!newRoomName.trim()) return;
        try {
            const token = await AsyncStorage.getItem("userToken");
            
            // 👇 로그 추가: 내가 뭘 보내는지 확인
            console.log(`[이름변경 요청] ID: ${selectedRoom.id}, 변경할 이름: ${newRoomName}`);

            await axios.patch(`${API_BASE_URL}/api/v1/groups/${selectedRoom.id}`, 
                { name: newRoomName }, 
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            setIsRenameVisible(false);
            room(token); 
            Alert.alert("성공", "그룹 이름이 변경되었습니다.");

        } catch (error) {
            // 👇 [핵심] 에러 상세 내용 출력
            console.log("❌ 이름 변경 실패 상태코드:", error.response?.status);
            console.log("❌ 서버 에러 메시지:", error.response?.data);
            
            Alert.alert("오류", "이름 변경 권한이 없거나 실패했습니다.");
        }
    };

    // [통합 기능] 그룹 나가기 (오너면 삭제, 멤버면 탈퇴)
    const handleLeaveGroup = async () => {
        // 1. 내가 오너인지 확인
        const isOwner = selectedRoom.ownerId === userId;

        // 2. 오너면 '삭제' 경고, 멤버면 '나가기' 경고
        const title = isOwner ? "그룹 삭제" : "그룹 나가기";
        const message = isOwner 
            ? "방장이 나가면 그룹이 완전히 사라집니다.\n정말 삭제하시겠습니까?" 
            : "정말 이 그룹에서 나가시겠습니까?";
        const buttonText = isOwner ? "삭제" : "나가기";

        Alert.alert(title, message, [
            { text: "취소", style: "cancel" },
            { 
                text: buttonText, 
                style: "destructive", // 빨간색 강조
                onPress: async () => {
                    try {
                        const token = await AsyncStorage.getItem("userToken");
                        
                        // 팀원이 "오너가 나가면 삭제된다"고 했으니, 
                        // 오너든 멤버든 똑같은 '나가기 API'를 호출합니다.
                        // (API 주소는 팀원에게 확인 필요, 보통 /groups/{id}/leave 또는 /groups/{id}/members/me)
                        await axios.delete(`${API_BASE_URL}/api/v1/groups/${selectedRoom.id}/leave`, {
                             headers: { Authorization: `Bearer ${token}` } 
                        });
                        
                        setIsMenuVisible(false);
                        room(token); // 목록 갱신
                        
                        const successMsg = isOwner ? "그룹이 삭제되었습니다." : "그룹에서 나갔습니다.";
                        Alert.alert("완료", successMsg);

                    } catch (error) {
                        console.log("오류 발생", error);
                        Alert.alert("오류", "요청 처리에 실패했습니다.");
                    }
                }
            }
        ]);
    };

    // ... (기존 OpenModal, CloseModal, 그룹 생성/가입 로직 유지) ...
    // 기존 코드들...
    const OpenModal = (type) => { setModalType(type); setIsModal(true); }
    const CloseModal = () => { setIsModal(false); setIsmodalValue(""); }
    const copyToClipboard = async () => { await Clipboard.setStringAsync(inviteCode); Alert.alert("복사 완료", "복사됨"); };
    const handleCreateGroup = async () => { /* 기존 로직 유지 */ };
    const handleJoinGroup = async () => { /* 기존 로직 유지 */ };


    return (
        <SafeAreaView style={styles.safeArea} edges={['top']}>
            <TopHeader showBack={false} showIcons={true} title="채움" />

            <ScrollView style={styles.contentContainer} contentContainerStyle={{ paddingBottom: 150 }}>
                <View style={styles.sectionHeader}>
                    <View style={styles.dashedLine} />
                    <Text style={styles.sectionTitle}>참여방</Text>
                    <View style={styles.dashedLine} />
                </View>

                {/* [변경] RoomList에 onMenuPress 전달 */}
                <RoomList 
                    rooms={rooms} 
                    onRoomPress={handleRoomPress} 
                    onMenuPress={handleMenuPress} 
                    currentUserId={userId}
                />
                
            </ScrollView>

            <View style={styles.fixedButtonContainer}>
                <Pressable style={[styles.Button, styles.groupButton]} onPress={() => OpenModal('create')}>
                    <Text style={styles.ButtonText}>새로운 그룹 생성</Text>
                </Pressable>
                <Pressable style={[styles.Button2, styles.codeButton]} onPress={() => OpenModal('invite')}>
                    <Text style={styles.ButtonText}>초대 코드로 입장하기</Text>
                </Pressable>
            </View>

            {/* 기존 생성/입장 모달들 */}
            <InputModal visible={isModal} onClose={CloseModal} type={modalType} value={ismodalValue} onChangeText={setIsmodalValue} onAction={modalType === 'create' ? handleCreateGroup : handleJoinGroup} isLoading={isLoading} />
            <ResultModal visible={isResultModal} onClose={() => setIsResultModal(false)} groupName={createdGroupName} inviteCode={inviteCode} onCopy={copyToClipboard} />


            {/* 하단 메뉴 모달 */}
            <Modal
                transparent={true}
                visible={isMenuVisible}
                onRequestClose={() => setIsMenuVisible(false)}
                animationType="fade"
            >
                <TouchableOpacity 
                    style={localStyles.modalOverlay} 
                    activeOpacity={1} 
                    onPress={() => setIsMenuVisible(false)}
                >
                    <View style={localStyles.menuSheet}>
                        <Text style={localStyles.menuTitle}>{selectedRoom?.name} 관리</Text>
                        
                        <TouchableOpacity style={localStyles.menuItem} onPress={handleInviteCopy}>
                            <MaterialCommunityIcons name="content-copy" size={24} color="#555" />
                            <Text style={localStyles.menuText}>새 초대 코드 복사</Text>
                        </TouchableOpacity>

                        {/* 이름 변경은 오너만 */}
                        {selectedRoom?.ownerId === userId && (
                            <TouchableOpacity style={localStyles.menuItem} onPress={() => { setIsMenuVisible(false); setNewRoomName(selectedRoom.name); setIsRenameVisible(true); }}>
                                <MaterialCommunityIcons name="pencil-outline" size={24} color="#555" />
                                <Text style={localStyles.menuText}>그룹 이름 변경</Text>
                            </TouchableOpacity>
                        )}

                        {/* ✅ [수정] 오너면 '그룹 삭제', 멤버면 '그룹 나가기'로 표시 */}
                        <TouchableOpacity style={[localStyles.menuItem, { borderBottomWidth: 0 }]} onPress={handleLeaveGroup}>
                            <MaterialCommunityIcons 
                                name={selectedRoom?.ownerId === userId ? "trash-can-outline" : "exit-to-app"} 
                                size={24} 
                                color="#FF5252" 
                            />
                            <Text style={[localStyles.menuText, { color: '#FF5252' }]}>
                                {selectedRoom?.ownerId === userId ? "그룹 삭제 (방장)" : "그룹 나가기"}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>

            {/* ✅ [신규] 이름 변경 모달 */}
            <Modal
                transparent={true}
                visible={isRenameVisible}
                onRequestClose={() => setIsRenameVisible(false)}
                animationType="slide"
            >
                <View style={localStyles.modalOverlay}>
                    <View style={localStyles.renameBox}>
                        <Text style={localStyles.renameTitle}>그룹 이름 변경</Text>
                        <TextInput 
                            style={localStyles.renameInput}
                            value={newRoomName}
                            onChangeText={setNewRoomName}
                            placeholder="변경할 이름을 입력하세요"
                        />
                        <View style={localStyles.renameButtons}>
                            <TouchableOpacity onPress={() => setIsRenameVisible(false)} style={localStyles.cancelBtn}>
                                <Text style={{color:'#666'}}>취소</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={executeRename} style={localStyles.confirmBtn}>
                                <Text style={{color:'white', fontWeight:'bold'}}>변경</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

        </SafeAreaView>
    );
}

// 모달 전용 스타일
const localStyles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end', // 하단 정렬 (메뉴용)
    },
    menuSheet: {
        backgroundColor: 'white',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        paddingBottom: 40,
    },
    menuTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
        color: '#333',
        textAlign: 'center'
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    menuText: {
        fontSize: 16,
        marginLeft: 15,
        color: '#333',
    },
    // 이름 변경 모달 스타일 (화면 중앙)
    renameBox: {
        backgroundColor: 'white',
        width: '80%',
        borderRadius: 15,
        padding: 20,
        alignSelf: 'center', // 중앙 정렬
        marginTop: 'auto',
        marginBottom: 'auto',
        elevation: 5,
    },
    renameTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
    renameInput: { 
        borderBottomWidth: 1, borderColor: '#5DADE2', fontSize: 16, padding: 5, marginBottom: 20 
    },
    renameButtons: { flexDirection: 'row', justifyContent: 'flex-end' },
    cancelBtn: { padding: 10, marginRight: 10 },
    confirmBtn: { backgroundColor: '#5DADE2', paddingHorizontal: 15, paddingVertical: 10, borderRadius: 8 }
});

export default MainHome;