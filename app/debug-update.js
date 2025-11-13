import * as Updates from "expo-updates";
import { useEffect, useState } from "react";
import {
  Alert,
  Button,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import AppHeader from "../components/AppHeader";
import AppLayout from "../components/AppLayout";

export default function DebugUpdateScreen() {
  const [metadata, setMetadata] = useState(null);
  const [check, setCheck] = useState(null);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const md = await Updates.getUpdateMetadataAsync();
        setMetadata(md || null);
        const ch = await Updates.checkForUpdateAsync();
        setCheck(ch || null);
      } catch (e) {
        console.warn("Update debug error", e);
      }
    })();
  }, []);

  const handleFetch = async () => {
    setFetching(true);
    try {
      const fetched = await Updates.fetchUpdateAsync();
      if (fetched.isNew) {
        Alert.alert(
          "Update fetched",
          "A new update was downloaded. App will reload now."
        );
        await Updates.reloadAsync();
      } else {
        Alert.alert("No update", "No new update was available.");
      }
    } catch (e) {
      console.error(e);
      Alert.alert("Error", "Failed to fetch update. See console for details.");
    } finally {
      setFetching(false);
    }
  };

  return (
    <AppLayout
      scrollable={true}
      header={<AppHeader title="Update Debug" showBack />}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.heading}>Expo Updates Debug</Text>

        <View style={styles.section}>
          <Text style={styles.label}>isEnabled:</Text>
          <Text style={styles.value}>{String(Updates.isEnabled)}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Runtime Version:</Text>
          <Text style={styles.value}>{Updates.runtimeVersion ?? "n/a"}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Current Update Metadata:</Text>
          <Text style={styles.value}>
            {metadata ? JSON.stringify(metadata, null, 2) : "none"}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Check For Update Result:</Text>
          <Text style={styles.value}>
            {check ? JSON.stringify(check, null, 2) : "unknown"}
          </Text>
        </View>

        <View style={styles.actions}>
          <Button
            title={fetching ? "Fetching..." : "Fetch Update Now"}
            onPress={handleFetch}
            disabled={fetching}
          />
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </AppLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  heading: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 12,
  },
  section: {
    marginBottom: 12,
  },
  label: {
    fontWeight: "600",
    marginBottom: 6,
  },
  value: {
    fontFamily: "monospace",
  },
  actions: {
    marginTop: 16,
  },
});
