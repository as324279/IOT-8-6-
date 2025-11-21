import React from 'react';
import { Modal, View, Text, Pressable, ActivityIndicator } from 'react-native';
import { TextInput } from 'react-native-paper';
import { styles } from './HomeStyles';

// 입력 모달 (생성/입장)
export const InputModal = ({ 
    visible, onClose, type, value, onChangeText, onAction, isLoading 
}) => {
    return (
        <Modal animationType="slide" visible={visible} transparent={true} onRequestClose={onClose}>
            <View style={styles.moadlView}>
                <View style={styles.viewContainer}>
                    {isLoading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color={type === 'create' ? '#5DADE2' : '#9CCC65'} />
                            <Text style={styles.loadingText}>
                                {type === 'create' ? '그룹 생성 중...' : '그룹 입장 중...'}
                            </Text>
                        </View>
                    ) : (
                        <>
                            <Text style={[styles.viewText, { color: type === 'create' ? '#5DADE2' : '#9CCC65' }]}>
                                {type === 'create' ? '생성할 그룹 이름을 입력하세요' : '초대 코드를 입력하세요'}
                            </Text>
                            <View style={styles.Row}>
                                <TextInput 
                                    value={value} 
                                    onChangeText={onChangeText} 
                                    style={styles.input} 
                                    placeholder={type === 'create' ? '그룹 이름' : '초대 코드'} 
                                    mode="outlined" 
                                    dense 
                                />
                                <Pressable 
                                    style={[styles.modalbutton, { backgroundColor: type === 'create' ? '#5DADE2' : '#9CCC65' }]} 
                                    onPress={onAction}
                                >
                                    <Text style={styles.buttontext}>{type === 'create' ? '생성' : '입장'}</Text>
                                </Pressable>
                            </View>
                            <Pressable onPress={onClose} style={styles.closeButton}>
                                <Text style={styles.modalText}>닫기</Text>
                            </Pressable>
                        </>
                    )}
                </View>
            </View>
        </Modal>
    );
};

// 결과 모달 (초대코드 표시)
export const ResultModal = ({ 
    visible, onClose, groupName, inviteCode, onCopy 
}) => {
    return (
        <Modal animationType="slide" visible={visible} transparent={true} onRequestClose={onClose}>
            <View style={styles.moadlView}>
                <View style={styles.viewContainer}>
                    <Text style={styles.resultTitle}>🎉 그룹 생성 완료!</Text>
                    <Text style={styles.resultSubTitle}>{groupName} 그룹이 만들어졌습니다.</Text>
                    <Text style={styles.resultInfo}>아래 코드를 복사해 그룹원들에게 공유하세요.</Text>
                    
                    <Pressable onPress={onCopy} style={styles.codeContainer}>
                        <Text style={styles.codeText}>{inviteCode}</Text>
                        <Text style={styles.copyText}>(클릭하여 복사)</Text>
                    </Pressable>

                    <Pressable onPress={onClose} style={styles.closeButton}>
                        <Text style={styles.modalText}>닫기</Text>
                    </Pressable>
                </View>
            </View>
        </Modal>
    );
};