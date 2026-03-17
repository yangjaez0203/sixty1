import { useEffect, useState } from "react";
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { getCurrentUser } from "@/services/auth";
import { useAuthStore } from "@/stores/authStore";

type UserInfo = {
  name: string | null;
  email: string;
  photo: string | null;
};

export default function HomeScreen() {
  const logout = useAuthStore((s) => s.logout);
  const [user, setUser] = useState<UserInfo | null>(null);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser) {
      setUser({
        name: currentUser.user.name,
        email: currentUser.user.email,
        photo: currentUser.user.photo,
      });
    }
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error: any) {
      Alert.alert("로그아웃 실패", error.message ?? "알 수 없는 오류");
    }
  };

  return (
    <View style={styles.container}>
      {user?.photo && (
        <Image source={{ uri: user.photo }} style={styles.avatar} />
      )}
      <Text style={styles.name}>{user?.name ?? "사용자"}</Text>
      <Text style={styles.email}>{user?.email ?? ""}</Text>
      <TouchableOpacity style={styles.button} onPress={handleLogout}>
        <Text style={styles.buttonText}>로그아웃</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 24,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 16,
  },
  name: {
    fontSize: 22,
    fontWeight: "600",
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: "#666",
    marginBottom: 32,
  },
  button: {
    backgroundColor: "#333",
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
