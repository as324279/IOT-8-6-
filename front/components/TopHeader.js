import { usePathname, useRouter } from 'expo-router';
import { Image, Pressable, StatusBar, StyleSheet, Text, View } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const TopHeader = ({ showBack = false, showIcons = true, title,  }) =>{
  const router = useRouter();
  const pathname = usePathname();

  
  return (
    <>
      <StatusBar backgroundColor="#53ACD9" barStyle="dark-content" />
      <View style={styles.header}>
            <View style={styles.logoContainer}>
          
                <Image
                    source={require('../assets/images/projectlogo.png')}
                    style={styles.logo}
                    resizeMode="contain"
                />
            </View>

            <View style = {styles.center}>
                <Text style = {styles.appName}>{title || '채움'}</Text>
            </View>

        {showIcons && (
          <View style={styles.headerRight}>
            <Pressable style={styles.menuButton}>
              <MaterialIcons name="notifications" size={24} color="#000000" />
            </Pressable>
          </View>
        )}
      </View>
    </>
  );
}
export default TopHeader;

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space=between',
    alignItems: 'center',
    paddingVertical: 2,
    paddingHorizontal: 8,
    backgroundColor: '#53ACD9',
    width:'100%',
    height:60,
  },
  logoContainer: {
    position: 'absolute',
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 60,
    height: 60,
  },
  center:{
    flex: 1,
    alignItems: 'center',
  },
  appName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
  },
  headerRight: {
    position: 'absolute',
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuButton: {
    padding: 8,
  },
});
