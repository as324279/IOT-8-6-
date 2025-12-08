import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: "#FFFFFF",
    },
    contentContainer: {
        flex: 1,
        width: '100%',
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 20,
        paddingHorizontal: 20,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginHorizontal: 10,
        color: '#000',
        marginRight:270
    },
    dashedLine: {
        flex: 1,
        height: 1,
        borderWidth: 1,
        borderColor: '#000',
        borderStyle: 'dashed',
        borderRadius: 1,
    },
    roomList: {
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    roomCard: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        backgroundColor: '#fff',
    },
    roomIconBox: {
        width: 80,
        height: 80,
        borderWidth: 1,
        borderColor: '#000',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 20,
    },
    iconText: {
        fontSize: 12,
        marginTop: 5,
        fontWeight: 'bold',
    },
    roomInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    roomName: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 5,
        color: '#000',
    },
    memberCount: {
        fontSize: 14,
        color: '#000',
    },
    divider: {
        height: 2,
        backgroundColor: '#f0f0f0',
        marginHorizontal: 20,
        marginBottom: 30,
    },
    fixedButtonContainer: {
        position: 'absolute', 
        bottom: 0,            
        left: 0,
        right: 0,
        backgroundColor: '#FFFFFF', 
        paddingVertical: 20,        
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
        elevation: 10,              
        shadowColor: "#000",        
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },
    Button: { 
        width: '80%', height: 50, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginVertical: 8, marginTop: 10, 
    },
    Button2:{ 
        width: '80%', height: 50, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginVertical: 8, marginTop: 10, 
    },
    ButtonText:{
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    codeButton: { backgroundColor: '#9CCC65' },
    groupButton: { backgroundColor: '#5DADE2' },
    moadlView: { 
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
    },
    viewContainer:{ 
        backgroundColor:'white', 
        borderRadius:20,
        padding: 25, 
        alignItems: 'center',
        width: '85%', 
        shadowColor: "#000", 
        shadowOffset :{ width:0, height:2 },
        shadowOpacity:0.25,
        shadowRadius:4,
        elevation:5
    },
    viewText: { 
        fontSize:18, 
        fontWeight:'bold',
        textAlign:'center',
        marginBottom: 25 
    },
    Row:{ 
        flexDirection:'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: 20, 
    },
    input:{ 
        flex: 1, 
        marginRight: 10, 
        height: 45, 
    },
    modalbutton: { 
        paddingVertical: 12, 
        paddingHorizontal: 16,
        borderRadius: 8,
        justifyContent: 'center', 
        alignItems: 'center', 
        minWidth: 60, 
    },
    buttontext: { 
        color: 'white',
        fontWeight: 'bold',
        fontSize: 14, 
    },
     closeButton: { 
        marginTop: 15, 
        padding: 10,
    },
    modalText:{ 
        color:'#555', 
        fontSize:14,
        textAlign:'center',
        fontWeight:'bold'
    },
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