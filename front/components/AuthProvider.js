import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    // 변수 이름을 token으로 변경
    const [token, setToken] = useState(null); 
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // 자동 로그인 기능
        const loadToken = async () => {
            try {
                const storedToken = await AsyncStorage.getItem('userToken');
                if (storedToken) {
                    setToken(storedToken);
                }
            } catch (e) {
                console.error('AsyncStorage Error:', e);
            } finally {
                setIsLoading(false);
            }
        };
        loadToken();
    }, []);

    // 로그인 함수
    const signIn = async (newToken) => {
        await AsyncStorage.setItem('userToken', newToken);
        setToken(newToken); 
    };

    // 로그아웃 함수
    const signOut = async () => {
        await AsyncStorage.removeItem('userToken');
        setToken(null);
    };

    return (
        <AuthContext.Provider value={{ token, isLoading, signIn, signOut }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};