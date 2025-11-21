import { useRouter } from 'expo-router';
import * as Notifications from 'expo-notifications';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, View, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Clipboard from 'expo-clipboard';

// [분리된 컴포넌트 임포트]
import TopHeader from '../../components/TopHeader';
import { styles } from '../../components/home/HomeStyles';
import RoomList from '../../components/home/RoomList';
import { InputModal, ResultModal } from '../../components/home/GroupModals';

Notifications.setNotificationHandler({
  handleNotification: async () => ({ shouldShowAlert: true, shouldPlaySound: true, shouldSetBadge: false }),
});

const MainHome = () => {
    const router = useRouter();
    
    // --- State 관리 ---
    const [rooms, setRooms] = useState([
        { id: '1', name: '우리집', memberCount: 4 },
        { id: '2', name: 'AAA', memberCount: 2 },
        { id: '3', name: '자취방', memberCount: 1 },
    ]);

    const [isModal, setIsModal] = useState(false);
    const [modalType, setModalType] = useState('');
    const [ismodalValue, setIsmodalValue] = useState("");
    const [isResultModal, setIsResultModal] = useState(false);
    const [inviteCode, setInviteCode] = useState("");
    const [createdGroupName, setCreatedGroupName] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    // --- Functions ---
    useEffect(() => {
        (async () => {
            const { status } = await Notifications.requestPermissionsAsync();
            if (status !== 'granted') alert('알림 권한이 필요합니다!');
        })();
    }, []);

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

    const handleRoomPress = (roomName) => {
        console.log(`${roomName} 방으로 입장합니다.`);
        router.push('/inventory');
    };

    const handleCreateGroup = async () => {
        if (!ismodalValue.trim()) {
            Alert.alert("오류", "그룹 이름을 입력해주세요.");
            return;
        }
        setIsLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        const generatedCode = "NEW-" + Math.floor(Math.random() * 10000);
        const groupName = ismodalValue;
        const newRoomId = Date.now().toString();
        const newRoom = { id: newRoomId, name: groupName, memberCount: 1 };
        
        setRooms(prev => [...prev, newRoom]); 

        setIsLoading(false);
        CloseModal();
        setInviteCode(generatedCode);
        setCreatedGroupName(groupName);
        setIsResultModal(true);
    }

    const handleJoinGroup = async () => {
        if (!ismodalValue.trim()) {
            Alert.alert("오류", "초대 코드를 입력해주세요.");
            return;
        }
        setIsLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1500));
        setIsLoading(false);
        Alert.alert("성공", "그룹에 입장했습니다!");
        CloseModal();
    }

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