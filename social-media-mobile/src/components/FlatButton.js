import { TouchableWithoutFeedback, View, Text } from "react-native";

export default function FlatButton(props) {
    return (
        <TouchableWithoutFeedback onPress={props.onPress}>
            <View style={{
                justifyContent: "center",
                alignItems: "center",
                width: 300,
                height: 80,
                backgroundColor: "#fff",
                borderColor: "gray",
                borderWidth: 1,
                borderRadius: 10,
                ...props.style
            }}>
                <Text style={{ fontSize: 40 }}>{props.title}</Text>
            </View>
        </TouchableWithoutFeedback>
    );
}