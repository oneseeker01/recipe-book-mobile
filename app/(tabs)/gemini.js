import { Ionicons } from "@expo/vector-icons";
import { onAuthStateChanged } from "firebase/auth";
import {
  arrayUnion,
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import AppHeader from "../../components/AppHeader";
import AppLayout from "../../components/AppLayout";
import Card from "../../components/Card";
import { chatSession } from "../../constants/geminiClient";
import { auth, db } from "../../firebaseConfig";

export default function GeminiScreen() {
  // router not needed here
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const flatListRef = useRef(null);
  const isAtBottomRef = useRef(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (u) loadHistory(u.uid);
    });
    return () => unsub();
  }, []);

  const loadHistory = async (uid) => {
    try {
      const chatDocRef = doc(db, "users", uid, "chatHistory", "default");
      const snap = await getDoc(chatDocRef);
      if (snap.exists()) {
        const data = snap.data();
        const persisted = Array.isArray(data.messages) ? data.messages : [];
        // Map persisted messages to the UI shape { id, role, text }
        const mapped = persisted.map((m, idx) => ({
          id: (m.timestamp?.seconds || idx) + "-" + (m.role || "u"),
          role: m.role === "assistant" ? "ai" : m.role || "user",
          text: m.content || m.text || "",
        }));
        if (mapped.length === 0) {
          // show friendly welcome message if no persisted history
          setMessages([
            {
              id: "welcome-1",
              role: "ai",
              text: "Welcome to Recipe Genie! Ask me a cooking question or request a recipe.",
            },
          ]);
        } else {
          setMessages(mapped);
        }
        // scroll to bottom after a tick
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: false });
        }, 50);
      } else {
        // No chat document exists - show welcome message
        setMessages([
          {
            id: "welcome-1",
            role: "ai",
            text: "Welcome to Recipe Genie! Ask me a cooking question or request a recipe.",
          },
        ]);
      }
    } catch (err) {
      console.warn("Failed to load chat history:", err);
      // Even on error, show welcome message
      setMessages([
        {
          id: "welcome-1",
          role: "ai",
          text: "Welcome to Recipe Genie! Ask me a cooking question or request a recipe.",
        },
      ]);
    }
  };

  const persistMessages = async (userMessage, aiText) => {
    try {
      const u = auth.currentUser;
      if (!u) return;
      const chatDocRef = doc(db, "users", u.uid, "chatHistory", "default");
      await setDoc(
        chatDocRef,
        { conversationId: "default", userId: u.uid },
        { merge: true }
      );
      const entries = [];
      if (userMessage) {
        entries.push({
          role: "user",
          content: userMessage.text,
          timestamp: new Date(),
        });
      }
      if (aiText) {
        entries.push({
          role: "assistant",
          content: aiText,
          timestamp: new Date(),
        });
      }
      if (entries.length) {
        await updateDoc(chatDocRef, {
          messages: arrayUnion(...entries),
          updatedAt: serverTimestamp(),
        });
      }
    } catch (err) {
      console.warn("Failed to persist messages:", err);
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMessage = {
      id: Date.now().toString(),
      role: "user",
      text: input,
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      // Use the compatibility wrapper: contents may be an array of text blocks
      const res = await chatSession.generateContent({
        contents: [{ type: "text", text: userMessage.text }],
      });
      const aiText = res?.response?.text?.() || "(no response)";
      const aiMessage = {
        id: Date.now().toString() + "-ai",
        role: "ai",
        text: aiText,
      };
      setMessages((prev) => [...prev, aiMessage]);

      // Persist both messages
      await persistMessages(userMessage, aiText);
    } catch (error) {
      console.error("[Gemini] Error sending message:", error);
      const errorMessage = {
        id: Date.now().toString() + "-error",
        role: "ai",
        text: `Sorry, I encountered an error: ${
          error.message || "Unable to process your request"
        }. Please try again.`,
      };
      setMessages((prev) => [...prev, errorMessage]);
      // try persisting the user message even on error
      try {
        await persistMessages(userMessage, null);
      } catch (e) {
        console.warn("Failed to persist failed message:", e);
      }
    } finally {
      setLoading(false);
    }
  };

  const renderMessage = ({ item }) => (
    <View
      style={[
        styles.messageBubble,
        item.role === "user" ? styles.userBubble : styles.aiBubble,
      ]}
    >
      <Text style={item.role === "user" ? styles.userText : styles.aiText}>
        {item.text}
      </Text>
    </View>
  );

  const onScroll = (e) => {
    const { contentOffset, layoutMeasurement, contentSize } = e.nativeEvent;
    const paddingToBottom = 20;
    const isBottom =
      contentOffset.y + layoutMeasurement.height >=
      contentSize.height - paddingToBottom;
    isAtBottomRef.current = isBottom;
  };

  const scrollToEndIfNeeded = () => {
    if (isAtBottomRef.current) {
      flatListRef.current?.scrollToEnd({ animated: true });
    }
  };

  const handleStartNewChat = async () => {
    Alert.alert(
      "Start New Chat?",
      "This will clear your current chat history.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: async () => {
            try {
              const u = auth.currentUser;
              if (u) {
                const chatDocRef = doc(
                  db,
                  "users",
                  u.uid,
                  "chatHistory",
                  "default"
                );
                await setDoc(chatDocRef, { messages: [] }, { merge: true });
              }
              // Show welcome message
              setMessages([
                {
                  id: "welcome-1",
                  role: "ai",
                  text: "Welcome to Recipe Genie! Ask me a cooking question or request a recipe.",
                },
              ]);
            } catch (err) {
              console.warn("Failed to clear chat:", err);
              Alert.alert("Error", "Failed to clear chat history");
            }
          },
        },
      ]
    );
  };

  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyEntries, setHistoryEntries] = useState([]);

  const loadHistoryEntries = async () => {
    try {
      const u = auth.currentUser;
      if (!u) return;
      const chatDocRef = doc(db, "users", u.uid, "chatHistory", "default");
      const snap = await getDoc(chatDocRef);
      if (!snap.exists()) {
        setHistoryEntries([]);
        return;
      }
      const msgs = Array.isArray(snap.data().messages)
        ? snap.data().messages
        : [];
      const entries = [];
      for (let i = 0; i < msgs.length; i += 2) {
        const userMsg = msgs[i];
        const aiMsg = msgs[i + 1];
        entries.push({
          id: `${i}-${userMsg?.timestamp?.seconds || i}`,
          userText: userMsg?.content || "",
          aiText: aiMsg?.content || "",
          timestamp: userMsg?.timestamp || aiMsg?.timestamp || new Date(),
        });
      }
      setHistoryEntries(entries.reverse());
    } catch (err) {
      console.warn("Failed to load history entries:", err);
    }
  };

  const openHistory = async () => {
    await loadHistoryEntries();
    setShowHistoryModal(true);
  };

  const closeHistory = () => setShowHistoryModal(false);

  const handleLoadConversation = (entry) => {
    // Load a selected conversation pair into the chat view
    const loaded = [];
    if (entry.userText)
      loaded.push({
        id: `h-${Date.now()}`,
        role: "user",
        text: entry.userText,
      });
    if (entry.aiText)
      loaded.push({ id: `h-${Date.now()}-ai`, role: "ai", text: entry.aiText });
    setMessages(loaded);
    closeHistory();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
    >
      <AppLayout
        scrollable={false}
        header={
          <AppHeader
            title="Recipe Genie"
            centered={true}
            rightActions={
              <>
                <TouchableOpacity
                  onPress={openHistory}
                  style={{ padding: 8, marginRight: 6 }}
                >
                  <Ionicons name="albums-outline" size={22} color="#1A1A1A" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleStartNewChat}
                  style={{ padding: 8 }}
                >
                  <Ionicons name="refresh-outline" size={22} color="#1A1A1A" />
                </TouchableOpacity>
              </>
            }
          />
        }
      >
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
          <View style={styles.innerContainer}>
            <FlatList
              ref={flatListRef}
              data={messages}
              renderItem={renderMessage}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.messageList}
              keyboardShouldPersistTaps="handled"
              scrollEnabled={true}
              style={styles.flatList}
              onContentSizeChange={scrollToEndIfNeeded}
              onScroll={onScroll}
              ListFooterComponent={() =>
                loading ? (
                  <View style={styles.typingIndicator}>
                    <ActivityIndicator size="small" color="#666" />
                    <Text style={styles.typingText}>
                      Recipe Genie is thinking...
                    </Text>
                  </View>
                ) : null
              }
            />

            {/* Jump to latest button when user scrolled up */}
            {!isAtBottomRef.current && (
              <TouchableOpacity
                style={styles.jumpButton}
                onPress={() => {
                  flatListRef.current?.scrollToEnd({ animated: true });
                  isAtBottomRef.current = true;
                }}
              >
                <Ionicons name="chevron-down" size={20} color="#FFF" />
              </TouchableOpacity>
            )}

            {/* history modal */}
            <Modal visible={showHistoryModal} animationType="slide">
              <SafeAreaView style={{ flex: 1, backgroundColor: "#FFF" }}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: 12,
                    borderBottomWidth: 1,
                    borderBottomColor: "#EEE",
                  }}
                >
                  <Text style={{ fontSize: 18, fontWeight: "600" }}>
                    Chat History
                  </Text>
                  <TouchableOpacity
                    onPress={closeHistory}
                    style={{ padding: 8 }}
                  >
                    <Ionicons name="close" size={20} color="#666" />
                  </TouchableOpacity>
                </View>
                <FlatList
                  data={historyEntries}
                  keyExtractor={(item) => item.id}
                  contentContainerStyle={{ padding: 12 }}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      onPress={() => handleLoadConversation(item)}
                      style={{ marginBottom: 12 }}
                    >
                      <Card
                        variant="outlined"
                        padding={12}
                        style={{ backgroundColor: "#FFF" }}
                      >
                        <Text style={{ fontWeight: "700", marginBottom: 6 }}>
                          {item.userText?.slice(0, 80) || "Conversation"}
                        </Text>
                        <Text style={{ color: "#666", marginBottom: 8 }}>
                          {item.aiText?.slice(0, 140) || ""}
                        </Text>
                        <Text style={{ fontSize: 12, color: "#999" }}>
                          {(item.timestamp &&
                            (item.timestamp.seconds
                              ? new Date(
                                  item.timestamp.seconds * 1000
                                ).toLocaleString()
                              : item.timestamp.toString())) ||
                            ""}
                        </Text>
                      </Card>
                    </TouchableOpacity>
                  )}
                />
              </SafeAreaView>
            </Modal>

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={input}
                onChangeText={setInput}
                placeholder="Ask me a cooking question..."
                placeholderTextColor="#888"
                editable={!loading}
                returnKeyType="send"
                onSubmitEditing={handleSend}
              />
              <TouchableOpacity
                style={[styles.sendButton, loading && { opacity: 0.7 }]}
                onPress={handleSend}
                disabled={loading || input.trim() === ""}
              >
                <Ionicons name="send" size={20} color="#FFF" />
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </AppLayout>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9F9F9",
  },
  innerContainer: {
    flex: 1,
    width: "100%",
  },
  messageList: {
    paddingHorizontal: 10,
    paddingVertical: 10,
    flexGrow: 1,
  },
  flatList: {
    flex: 1,
  },
  messageBubble: {
    maxWidth: "80%",
    padding: 10,
    borderRadius: 15,
    marginVertical: 4,
  },
  userBubble: {
    backgroundColor: "#A12D2A",
    alignSelf: "flex-end",
    borderBottomRightRadius: 2,
  },
  aiBubble: {
    backgroundColor: "#EAEAEA",
    alignSelf: "flex-start",
    borderBottomLeftRadius: 2,
  },
  userText: {
    color: "#FFF",
    fontSize: 16,
  },
  aiText: {
    color: "#333",
    fontSize: 16,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    paddingBottom: Platform.OS === "android" ? 10 : 0,
    borderTopWidth: 1,
    borderTopColor: "#DDD",
    backgroundColor: "#FFF",
  },
  input: {
    flex: 1,
    height: 40,
    backgroundColor: "#F0F0F0",
    borderRadius: 20,
    paddingHorizontal: 15,
    marginRight: 10,
    fontSize: 16,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#A12D2A",
    justifyContent: "center",
    alignItems: "center",
  },
  startNewButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 16,
    marginBottom: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#A12D2A",
    backgroundColor: "#FFF",
  },
  startNewButtonText: {
    marginLeft: 8,
    color: "#A12D2A",
    fontWeight: "600",
    fontSize: 14,
  },
  typingIndicator: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    marginTop: 6,
    marginBottom: 8,
  },
  typingText: {
    marginLeft: 8,
    color: "#666",
    fontSize: 13,
  },
  jumpButton: {
    position: "absolute",
    right: 16,
    bottom: 80,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#A12D2A",
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
  },
});
