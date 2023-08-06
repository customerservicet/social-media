import React from "react";

import { ScrollView, View, Text } from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";

export default function UnsignScreen(props) {
    const [token, setToken] = React.useState("");
    const [user, setUser] = React.useState({});
    React.useEffect(() => {
        AsyncStorage.getItem("token").then((tk) => {
            fetch(`http://192.168.1.101/api/user/profile?tk=${encodeURIComponent(tk)}`)
                .then((res) => res.json())
                .then((result) => {
                    if (result.code === 200) {
                        setUser(result.result);
                    } else if (result.error === "description.profile.not_found") {
                        props.navigation.navigate("SignProfile");
                    }
                });
            setToken(tk);
        });
    }, []);
    return (
        <ScrollView style={{ backgroundColor: "#efefef" }}>
            
        </ScrollView>
    );
}