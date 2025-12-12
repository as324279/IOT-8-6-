import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const LocationPickerModal = ({
  visible,
  onClose,
  locations,
  selectedLocation,
  onSelect,
}) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>보관 장소 선택</Text>

          {locations.length > 0 ? (
            <FlatList
              data={locations}
              keyExtractor={(item) => item.locationId}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => {
                    onSelect(item);
                    onClose();
                  }}
                >
                  <Text
                    style={[
                      styles.modalItemText,
                      selectedLocation?.locationId === item.locationId &&
                        styles.selectedItemText,
                    ]}
                  >
                    {item.name}
                  </Text>
                  {selectedLocation?.locationId === item.locationId && (
                    <MaterialCommunityIcons
                      name="check"
                      size={20}
                      color="#5AC8FA"
                    />
                  )}
                </TouchableOpacity>
              )}
            />
          ) : (
            <Text style={styles.emptyText}>선택 가능한 장소가 없습니다.</Text>
          )}

          <TouchableOpacity style={styles.modalCloseButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>닫기</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "80%",
    maxHeight: "60%",
    backgroundColor: "white",
    borderRadius: 15,
    padding: 20,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  modalItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  modalItemText: { fontSize: 16, color: "#333" },
  selectedItemText: { color: "#5AC8FA", fontWeight: "bold" },
  emptyText: { textAlign: "center", padding: 20, color: "#999" },
  modalCloseButton: {
    marginTop: 20,
    backgroundColor: "#5AC8FA",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  closeButtonText: { color: "#fff", fontWeight: "bold" },
});

export default LocationPickerModal;