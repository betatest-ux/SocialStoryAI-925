import { View, Text, StyleSheet, TouchableOpacity, Modal, Animated, Dimensions, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Home, 
  BookOpen, 
  Crown, 
  Settings, 
  Info, 
  Shield, 
  FileText, 
  Mail, 
  HelpCircle,
  LogOut,
  User,
  X,
  Menu
} from "lucide-react-native";
import React, { useRef, useEffect } from "react";
import * as Haptics from "expo-haptics";

const { width } = Dimensions.get("window");
const DRAWER_WIDTH = Math.min(width * 0.75, 300);

type MenuDrawerProps = {
  visible: boolean;
  onClose: () => void;
};

export function MenuDrawer({ visible, onClose }: MenuDrawerProps) {
  const router = useRouter();
  const { user, logout } = useAuth();
  const slideAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -DRAWER_WIDTH,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, slideAnim, fadeAnim]);

  const handleNavigate = (path: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
    setTimeout(() => router.push(path as any), 300);
  };

  const handleLogout = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onClose();
    await logout();
    router.replace("/");
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={onClose}
        >
          <Animated.View style={[styles.overlayBg, { opacity: fadeAnim }]} />
        </TouchableOpacity>

        <Animated.View
          style={[
            styles.drawer,
            {
              transform: [{ translateX: slideAnim }],
            },
          ]}
        >
          <View style={styles.drawerHeader}>
            <View style={styles.userInfo}>
              <View style={styles.avatarContainer}>
                <User size={24} color="#FFFFFF" />
              </View>
              <View style={styles.userDetails}>
                <Text style={styles.userName}>{user?.name || "Guest"}</Text>
                <Text style={styles.userEmail}>{user?.email || ""}</Text>
                {user?.isPremium && (
                  <View style={styles.premiumBadge}>
                    <Crown size={12} color="#F59E0B" />
                    <Text style={styles.premiumText}>Premium</Text>
                  </View>
                )}
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.menuItems} showsVerticalScrollIndicator={false}>
            <MenuItem
              icon={<Home size={22} color="#3B82F6" />}
              label="Home"
              onPress={() => handleNavigate("/home")}
            />
            <MenuItem
              icon={<BookOpen size={22} color="#10B981" />}
              label="My Stories"
              onPress={() => handleNavigate("/my-stories")}
            />
            <MenuItem
              icon={<Crown size={22} color="#F59E0B" />}
              label="Pricing"
              onPress={() => handleNavigate("/pricing")}
            />
            <MenuItem
              icon={<Info size={22} color="#8B5CF6" />}
              label="About Social Stories"
              onPress={() => handleNavigate("/about")}
            />

            <View style={styles.divider} />

            <MenuItem
              icon={<Mail size={22} color="#EC4899" />}
              label="Contact Us"
              onPress={() => handleNavigate("/contact")}
            />
            <MenuItem
              icon={<HelpCircle size={22} color="#6366F1" />}
              label="FAQ"
              onPress={() => handleNavigate("/faq")}
            />
            <MenuItem
              icon={<FileText size={22} color="#14B8A6" />}
              label="Terms of Service"
              onPress={() => handleNavigate("/terms")}
            />
            <MenuItem
              icon={<Shield size={22} color="#06B6D4" />}
              label="Privacy Policy"
              onPress={() => handleNavigate("/privacy")}
            />

            {user?.isAdmin && (
              <>
                <View style={styles.divider} />
                <MenuItem
                  icon={<Settings size={22} color="#EF4444" />}
                  label="Admin Dashboard"
                  onPress={() => handleNavigate("/admin")}
                />
              </>
            )}

            <View style={styles.divider} />

            <MenuItem
              icon={<Settings size={22} color="#6B7280" />}
              label="Settings"
              onPress={() => handleNavigate("/settings")}
            />
            <MenuItem
              icon={<LogOut size={22} color="#EF4444" />}
              label="Logout"
              onPress={handleLogout}
            />
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

type MenuItemProps = {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
};

function MenuItem({ icon, label, onPress }: MenuItemProps) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.menuItemIcon}>{icon}</View>
      <Text style={styles.menuItemLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

export function MenuButton({ onPress }: { onPress: () => void }) {
  return (
    <TouchableOpacity
      style={styles.menuButton}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
    >
      <Menu size={24} color="#111827" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  overlayBg: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  drawer: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: DRAWER_WIDTH,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  drawerHeader: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: "#F9FAFB",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#3B82F6",
    alignItems: "center",
    justifyContent: "center",
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 4,
  },
  premiumBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  premiumText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#F59E0B",
  },
  closeButton: {
    padding: 4,
  },
  menuItems: {
    flex: 1,
    padding: 8,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 8,
    marginBottom: 4,
  },
  menuItemIcon: {
    marginRight: 12,
  },
  menuItemLabel: {
    fontSize: 16,
    color: "#111827",
    fontWeight: "500",
  },
  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 8,
    marginHorizontal: 12,
  },
  menuButton: {
    padding: 8,
  },
});
