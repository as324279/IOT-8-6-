import { NavigationContainer } from "@react-navigation/native";
import MainHome from "./mainHome";

<NavigationContainer>
    <Tab.Navagator>
        <Tab.Screen name = 'Home' component = {MainHome}></Tab.Screen>
        {/* <Tab.Screen name = 'shoppingList' component = {}></Tab.Screen>
        <Tab.Screen name = 'User' component = {}></Tab.Screen> */}
    </Tab.Navagator>


</NavigationContainer>