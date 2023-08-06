import React from "react";

import { ScrollView, View, Text } from "react-native";

import FlatInput from "../components/FlatInput";
import FlatButton from "../components/FlatButton";

import { AntDesign } from "@expo/vector-icons";

import AsyncStorage from "@react-native-async-storage/async-storage";

export default function SignScreen(props) {
    const [mailAddress, setMailAddress] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [verify, setVerify] = React.useState(false);
    const [verifyCode, setVerifyCode] = React.useState("");
    React.useEffect(() => {
        AsyncStorage.getItem("token").then((tk) => {
            if (tk) {
                props.navigation.navigate("Unsign");
            }
        });
    }, []);
    return (
        <ScrollView contentContainerStyle={{
            justifyContent: "center",
            alignItems: "center",
            height: "100%"
        }}>
            <Text style={{
                fontSize: 50,
                fontWeight: "bold"
            }}>gegir</Text>
            <Text style={{ fontSize: 40, marginBottom: 20 }}>Eğlenceye katıl</Text>
            {verify && <Text style={{ fontSize: 20, marginBottom: 30 }}>{mailAddress.trim().toLowerCase()}</Text>}
            {!verify && <><FlatInput style={{ marginBottom: 20 }} textContentType="emailAddress" placeholder="Mail adresi" value={mailAddress} onChangeText={setMailAddress} />
                <FlatInput style={{ marginBottom: 20 }} secureTextEntry placeholder="Şifre" value={password} onChangeText={setPassword} /></>}
            {verify && <FlatInput style={{ marginBottom: 20 }} placeholder="Onay kodu" value={verifyCode} onChangeText={setVerifyCode} />}
            <View style={{
                flexDirection: "row"
            }}>
                {verify && <FlatButton onPress={() => setVerify(false)} style={{ marginRight: 5, width: 100 }} title={<AntDesign name="leftcircle" size={40} color="black" />} />}
                <FlatButton onPress={() => {
                    if (verify) {
                        fetch(`http://192.168.1.101/api/user/verify?mailAddress=${encodeURIComponent(mailAddress.trim().toLowerCase())}&password=${encodeURIComponent(password.trim())}&code=${encodeURIComponent(verifyCode.trim())}`,
                        {
                            method: "POST"
                        })
                            .then((res) => res.json())
                            .then((result) => {
                                if (result.code === 200) {
                                    AsyncStorage.setItem("token", result.result);
                                    return props.navigation.navigate("Unsign");
                                }
                            });
                    } else {
                        fetch(`http://192.168.1.101/api/user/login?mailAddress=${encodeURIComponent(mailAddress.trim().toLowerCase())}&password=${encodeURIComponent(password.trim())}`,
                        {
                            method: "POST"
                        })
                            .then((res) => res.json())
                            .then((result) => {
                                if (result.code === 200) {
                                    fetch(`http://192.168.1.101/api/user/verify?mailAddress=${encodeURIComponent(mailAddress.trim().toLowerCase())}&password=${encodeURIComponent(password.trim())}`,
                                    {
                                        method: "POST"
                                    })
                                        .then((res) => res.json())
                                        .then((result_2) => {
                                            if (result_2.code === 200) {
                                                AsyncStorage.setItem("token", result_2.result);
                                                return props.navigation.navigate("Unsign");
                                            }
                                            setVerify(true);
                                        });
                                }
                            });
                    }
                }} title={verify ? "Doğrula" : "Katıl"} />
            </View>
        </ScrollView>
    );
}