import React from "react";

import { ScrollView, View, Text } from "react-native";

import FlatInput from "../components/FlatInput";
import FlatButton from "../components/FlatButton";

import { AntDesign } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

function makeFirstCharacterBig(text) {
    let txt = (text[0] + "").toUpperCase();
    for (let i = 1; i < text.length; i++) {
        txt += (text[i] + "").toLowerCase();
    }
    return txt.trim();
}

export default function SignProfileScreen(props) {
    const [token, setToken] = React.useState("");
    const [name, setName] = React.useState("");
    const [lastname, setLastname] = React.useState("");
    const [fullname, setFullname] = React.useState("");
    const [description, setDescription] = React.useState("");
    React.useEffect(() => {
        AsyncStorage.getItem("token").then(setToken);
    }, []);
    React.useEffect(() => {
        setFullname(`${makeFirstCharacterBig(name)} ${makeFirstCharacterBig(lastname)}`.trim());
    }, [name, lastname]);
    return (
        <ScrollView contentContainerStyle={{
            alignItems: "center"
        }}>
            <View style={{ width: "95%", height: 300, alignItems: "center", justifyContent: "center" }}>
                <View style={{ width: 200, height: 200, borderRadius: 200, borderStyle: "dotted", borderWidth: 5, borderColor: "#000" }}>
                </View>
            </View>
            <FlatInput style={{ marginBottom: 20 }} placeholder="Ad" value={name} onChangeText={setName} />
            <FlatInput style={{ marginBottom: 20 }} placeholder="Soyad" value={lastname} onChangeText={setLastname} />
            <FlatInput multiline maxLength={100} style={{ height: 200, borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }} textAlignVertical={"top"} placeholder="Açıklama" value={description} onChangeText={setDescription} />
            <View style={{
                backgroundColor: "#fff",
                width: "95%",
                height: 80,
                borderBottomLeftRadius: 5,
                borderBottomRightRadius: 5,
                flexDirection: "row",
                justifyContent: "flex-end",
                alignItems: "center",
                paddingLeft: 20,
                paddingRight: 20,
                marginBottom: 20
            }}>
                <Text style={{ fontSize: 40, color: description.length === 100 ? "crimson" : "#000" }}>({description.length}/100)</Text>
            </View>
            <View style={{
                flexDirection: "row"
            }}>
                <FlatButton onPress={() => props.navigation.navigate("Sign")} style={{ marginRight: 5, width: 100 }} title={<AntDesign name="leftcircle" size={40} color="black" />} />
                <FlatButton onPress={() => {
                    fetch(`http://192.168.1.101/api/profile?tk=${encodeURIComponent(token)}&fullname=${encodeURIComponent(fullname)}&description=${encodeURIComponent(description)}`,
                        {
                            method: "POST"
                        }).then((res) => res.json())
                            .then((result) => {
                                if (result.code === 200) {
                                    props.navigation.navigate("Unsign");
                                }
                            });
                }} title="Oluştur" />
            </View>
        </ScrollView>
    );
}