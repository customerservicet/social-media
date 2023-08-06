import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

import SignScreen from "./src/screens/SignScreen";
import SignProfileScreen from "./src/screens/SignProfileScreen";
import UnsignScreen from "./src/screens/UnsignScreen";

const Stack = createStackNavigator();

export default function App() {
    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{
                headerShown: false
            }}>
                <Stack.Screen name="Sign" component={SignScreen} />
                <Stack.Screen name="SignProfile" component={SignProfileScreen} />
                <Stack.Screen name="Unsign" component={UnsignScreen} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}