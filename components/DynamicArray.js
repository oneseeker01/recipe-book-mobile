import { Ionicons } from "@expo/vector-icons";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function DynamicArray({
  label,
  items = [],
  onAddItem,
  onRemoveItem,
  onUpdateItem,
  fieldLabels = [],
  placeholders = [],
  error,
  showPrice = false,
  containerStyle,
  onItemsChange,
}) {
  const effectiveFieldLabels = showPrice
    ? [...fieldLabels, "price"]
    : fieldLabels;
  const effectivePlaceholders = showPrice
    ? [...placeholders, "Price"]
    : placeholders;

  const isSimpleArray = effectiveFieldLabels.length === 0;

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}

      {items.map((item, index) => (
        <View key={index} style={styles.itemContainer}>
          <View style={styles.itemContent}>
            {isSimpleArray ? (
              <TextInput
                style={styles.input}
                placeholder={placeholders[0] || ""}
                placeholderTextColor="#CCC"
                value={item}
                onChangeText={(text) => onUpdateItem(index, text)}
              />
            ) : (
              effectiveFieldLabels.map((field, fieldIndex) => (
                <TextInput
                  key={field}
                  style={[styles.input, styles.multiInput]}
                  placeholder={effectivePlaceholders[fieldIndex] || ""}
                  placeholderTextColor="#CCC"
                  value={item[field] || ""}
                  onChangeText={(text) => onUpdateItem(index, field, text)}
                  keyboardType={field === "price" ? "numeric" : "default"}
                />
              ))
            )}
          </View>

          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => onRemoveItem(index)}
          >
            <Ionicons name="trash-outline" size={20} color="#E74C3C" />
          </TouchableOpacity>
        </View>
      ))}

      <TouchableOpacity style={styles.addButton} onPress={onAddItem}>
        <Ionicons name="add-circle-outline" size={20} color="#A12D2A" />
        <Text style={styles.addButtonText}>Add {label}</Text>
      </TouchableOpacity>

      {error && <Text style={styles.errorText}>{error}</Text>}

      {items.length === 0 && (
        <Text style={styles.emptyText}>
          At least one {label.toLowerCase()} is required
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
    marginBottom: 12,
  },
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  itemContent: {
    flex: 1,
    gap: 8,
  },
  input: {
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: "#1A1A1A",
    minHeight: 44,
  },
  multiInput: {
    flex: 1,
  },
  removeButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#FFF5F5",
    justifyContent: "center",
    alignItems: "center",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#A12D2A",
    borderRadius: 8,
    backgroundColor: "#FFF9F9",
    marginBottom: 12,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#A12D2A",
  },
  errorText: {
    fontSize: 12,
    color: "#E74C3C",
    marginTop: 8,
  },
  emptyText: {
    fontSize: 12,
    color: "#999",
    fontStyle: "italic",
    marginTop: 8,
  },
});
