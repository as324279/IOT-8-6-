import { useRouter } from 'expo-router';
import * as Notifications from 'expo-notifications';
import { use, useEffect, useState } from 'react';
import { Alert, ScrollView, View, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Clipboard from 'expo-clipboard';
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// [분리된 컴포넌트 임포트]
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
    
    // --- State 관리 ---
    const [rooms, setRooms] = useState([]);
    const [userId,setUserId] = useState(null);
    const [isModal, setIsModal] = useState(false);
    const [modalType, setModalType] = useState('');
    const [ismodalValue, setIsmodalValue] = useState("");
    const [isResultModal, setIsResultModal] = useState(false);
    const [inviteCode, setInviteCode] = useState("");
    const [createdGroupName, setCreatedGroupName] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    // --- Functions ---
    useEffect(() => {
       room();
    }, []);

     // useEffect( () => {
     //   const load = async () => {
     //     const id = await AsyncStorage.getItem("userId");
     //     setUserId(id);
     //   };
     //   load();
     // }, [])

    const OpenModal = (type) => {
        setModalType(type);
        setIsModal(true);
    }
    const CloseModal = () => {
        setIsModal(false);
        setIsmodalValue("");
    }
    
    const copyToClipboard = async () => {
        await Clipboard.setStringAsync(inviteCode);
        Alert.alert("복사 완료", "초대 코드가 클립보드에 복사되었습니다.");
    };

    const handleRoomPress = (room) => {
        console.log("방 입장 그룹 아이디 확인", room);
         router.push({
           pathname:"/inventory",
           params: {group_id:room.id}
         });
        
    };

    const room = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");

      if (!token) {
        Alert.alert("사용자 정보가 필요해요!");
        return;
      }

      const get = await axios.get(`${API_BASE_URL}/api/v1/groups`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log("그룹 조회", get.data);

      const groupList = get.data.data;

      // 🔥 서버에서 받은 전체 목록을 그대로 rooms로 설정
      setRooms(
        groupList.map(g => ({
          id: g.groupId,
          name: g.name,
          memberCount: g.memberCount ?? 1 // 널 방지
        }))
      );

    } catch (error) {
      console.log("그룹 조회 오류!", error.response?.data || error);
    }
  };

    //그룹 만들기 -> 요청은 api/v1/groups
    const handleCreateGroup = async () => {
        if (!ismodalValue.trim()) {
            Alert.alert("오류", "그룹 이름을 입력해주세요.");
            return;
        }
        setIsLoading(true);


        
        try {
            const token = await AsyncStorage.getItem("userToken");
            if (!token) {
                Alert.alert("사용자 정보가 필요해요!");
                setIsLoading(false);
                return;
            }

            //1.그룹 생성
            const createGroupreq = await axios.post(
            `${API_BASE_URL}/api/v1/groups`,
            { name: ismodalValue },
            { headers: { Authorization: `Bearer ${token}` } }
        );

            console.log("그룹 생성",createGroupreq.data);

            console.log("★★★ 그룹 생성 전체 응답 구조 ★★★");
            console.log(JSON.stringify(createGroupreq.data, null, 2));

            const createdGroup = createGroupreq.data.data;
            const groupId = createdGroup.groupId;
            //2. 초대코드 생성
            const createinvitereq = await axios.post(`${API_BASE_URL}/api/v1/groups/${groupId}/invites`,
                {}, {headers: { Authorization: `Bearer ${token}`}}
            );

            console.log("초대 코드 생성", createinvitereq.data);
            const inviteCode = createinvitereq.data.data.code;

            setIsLoading(false);
            CloseModal();

            setRooms(prev => [
                ...prev,
                {
                    id:groupId,
                    name:createdGroup.name,
                    memberCount:1
                }
            ]);

             setCreatedGroupName(createdGroup.name);
            setInviteCode(inviteCode);
            setIsResultModal(true);

        } catch (error) {
            console.log("그룹 생성 오류!",error.response?.data || error);
            setIsLoading(false);
            Alert.alert("오류", error.response?.data?.error || "그룹 생성 실패!");
        }
    }

     const handleJoinGroup = async () => {
    if (!ismodalValue.trim()) {
      Alert.alert("오류", "초대 코드를 입력해주세요.");
      return;
    }

    setIsLoading(true);

    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        Alert.alert("사용자 정보가 필요해요!");
        setIsLoading(false);
        return;
      }

      const joinGroup = await axios.post(
        `${API_BASE_URL}/api/v1/groups/join`,
        { code: ismodalValue },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log("그룹 입장 완료!", joinGroup.data);
      Alert.alert("성공", "그룹에 입장했습니다!");

      // 🔥 입장 후 최신 목록 다시 조회
      await room();

      CloseModal();

    } catch (error) {
      console.log("그룹 가입 오류", error.response?.data || error);
      Alert.alert("오류", error.response?.data?.error || "그룹 가입 실패!");
    } finally {
      setIsLoading(false);
    }
  };

    return (
        <SafeAreaView style={styles.safeArea} edges={['top']}>
            <TopHeader showBack={false} showIcons={true} title="채움" />

            <ScrollView style={styles.contentContainer} contentContainerStyle={{ paddingBottom: 150 }}>
                <View style={styles.sectionHeader}>
                    <View style={styles.dashedLine} />
                    <Text style={styles.sectionTitle}>참여방</Text>
                    <View style={styles.dashedLine} />
                </View>

                {/* [수정] 분리된 RoomList 컴포넌트 사용 */}
                <RoomList rooms={rooms} onRoomPress={handleRoomPress} />
                
                <View style={styles.divider} />
            </ScrollView>

            {/* 하단 고정 버튼 */}
            <View style={styles.fixedButtonContainer}>
                <Pressable style={[styles.Button, styles.groupButton]} onPress={() => OpenModal('create')}>
                    <Text style={styles.ButtonText}>새로운 그룹 생성</Text>
                </Pressable>
                <Pressable style={[styles.Button2, styles.codeButton]} onPress={() => OpenModal('invite')}>
                    <Text style={styles.ButtonText}>초대 코드로 입장하기</Text>
                </Pressable>
            </View>

            {/* [수정] 분리된 Modal 컴포넌트 사용 */}
            <InputModal 
                visible={isModal} 
                onClose={CloseModal} 
                type={modalType} 
                value={ismodalValue}
                onChangeText={setIsmodalValue}
                onAction={modalType === 'create' ? handleCreateGroup : handleJoinGroup}
                isLoading={isLoading}
            />

            <ResultModal 
                visible={isResultModal} 
                onClose={() => setIsResultModal(false)}
                groupName={createdGroupName}
                inviteCode={inviteCode}
                onCopy={copyToClipboard}
            />

        </SafeAreaView>
    );
}
export default MainHome;
