import { TextInput } from "react-native";

export default function FlatInput(props) {
    return (
        <TextInput {...props} style={{
            width: "95%",
            height: 80,
            backgroundColor: "#fff",
            fontSize: 30,
            borderRadius: 10,
            padding: 20,
            ...props.style
        }} />
    );
}