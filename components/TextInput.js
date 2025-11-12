import { Ionicons } from "@expo/vector-icons";
import { TextInput as RNTextInput, StyleSheet, Text, View } from "react-native";

export default function TextInput({
  label,
  placeholder,
  value,
  onChangeText,
  multiline = false,
  maxLength,
  error,
  icon,
  keyboardType = "default",
  editable = true,
  containerStyle,
}) {
  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.inputWrapper, error && styles.errorBorder]}>
        {icon && (
          <Ionicons name={icon} size={18} color="#A12D2A" style={styles.icon} />
        )}
        <RNTextInput
          style={[styles.input, icon && styles.inputWithIcon]}
          placeholder={placeholder}
          placeholderTextColor="#CCC"
          value={value}
          onChangeText={onChangeText}
          multiline={multiline}
          maxLength={maxLength}
          keyboardType={keyboardType}
          editable={editable}
        />
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
      {maxLength && (
        <Text style={styles.charCount}>
          {value?.length || 0} / {maxLength}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    paddingHorizontal: 12,
    minHeight: 48,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: "#1A1A1A",
    paddingVertical: 12,
    paddingHorizontal: 0,
  },
  inputWithIcon: {
    paddingHorizontal: 8,
  },
  icon: {
    marginRight: 8,
  },
  errorBorder: {
    borderColor: "#E74C3C",
    backgroundColor: "#FFF5F5",
  },
  errorText: {
    fontSize: 12,
    color: "#E74C3C",
    marginTop: 4,
  },
  charCount: {
    fontSize: 11,
    color: "#999",
    marginTop: 4,
    textAlign: "right",
  },
});
