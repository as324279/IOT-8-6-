import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useState } from 'react';

// 1. Context 객체 생성
const AuthContext = createContext(null);

// 2. Provider 컴포넌트 생성
export const AuthProvider = ({ children }) => {
    const [userToken, setUserToken] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // 앱 시작 시 저장된 토큰 확인
        const loadToken = async () => {
            try {
                const token = await AsyncStorage.getItem('userToken');
                setUserToken(token);
            } catch (e) {
                console.error('AsyncStorage Error:', e);
            } finally {
                setIsLoading(false);
            }
        };
        loadToken();
    }, []);

    // 로그인 함수: 토큰을 저장하고 상태 업데이트
    const signIn = async (token) => {
        await AsyncStorage.setItem('userToken', token);
        setUserToken(token);
    };

    // 로그아웃 함수: 토큰을 삭제하고 상태 초기화
    const signOut = async () => {
        await AsyncStorage.removeItem('userToken');
        setUserToken(null);
    };

    // 로딩 중이거나 토큰이 없을 경우, 스플래시 화면 등을 표시하는 로직 필요

    return (
        <AuthContext.Provider value={{ userToken, isLoading, signIn, signOut }}>
            {children}
        </AuthContext.Provider>
    );
};

// 3. 커스텀 훅 생성 (편의를 위해)
export const useAuth = () => {
    return useContext(AuthContext);
};