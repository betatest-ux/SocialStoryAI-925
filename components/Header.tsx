import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Platform } from "react-native";
import { useRouter, usePathname } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import { Menu, Home, BookOpen, Crown, User, Shield, LogOut } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { MenuDrawer } from "./MenuDrawer";

type HeaderProps = {
  showBackButton?: boolean;
};

export function Header({ showBackButton = false }: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuth();
  const [menuVisible, setMenuVisible] = useState(false);

  const isActivePath = (path: string) => {
    if (path === "/" && pathname === "/") return true;
    if (path !== "/" && pathname.startsWith(path)) return true;
    return false;
  };

  const handleNavigate = (path: string) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push(path as any);
  };

  const handleLogout = async () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    await logout();
    router.replace("/");
  };

  return (
    <>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.logoContainer}
            onPress={() => handleNavigate(isAuthenticated ? "/home" : "/")}
            activeOpacity={0.7}
          >
            <View style={styles.logo}>
              <BookOpen size={24} color="#4A90E2" strokeWidth={2.5} />
            </View>
            <Text style={styles.logoText}>SocialStoryAI</Text>
          </TouchableOpacity>

          {Platform.OS === 'web' && (
            <View style={styles.navLinks}>
              {isAuthenticated ? (
                <>
                  <NavLink
                    label="Home"
                    icon={<Home size={18} color={isActivePath("/home") ? "#4A90E2" : "#4A5568"} />}
                    active={isActivePath("/home")}
                    onPress={() => handleNavigate("/home")}
                  />
                  <NavLink
                    label="My Stories"
                    icon={<BookOpen size={18} color={isActivePath("/my-stories") ? "#4A90E2" : "#4A5568"} />}
                    active={isActivePath("/my-stories")}
                    onPress={() => handleNavigate("/my-stories")}
                  />
                  {!user?.isPremium && (
                    <NavLink
                      label="Pricing"
                      icon={<Crown size={18} color={isActivePath("/pricing") ? "#F59E0B" : "#4A5568"} />}
                      active={isActivePath("/pricing")}
                      onPress={() => handleNavigate("/pricing")}
                    />
                  )}
                  {user?.isAdmin && (
                    <NavLink
                      label="Admin"
                      icon={<Shield size={18} color={isActivePath("/admin") ? "#EF4444" : "#4A5568"} />}
                      active={isActivePath("/admin")}
                      onPress={() => handleNavigate("/admin")}
                    />
                  )}
                </>
              ) : (
                <>
                  <NavLink
                    label="Home"
                    icon={<Home size={18} color={isActivePath("/") ? "#4A90E2" : "#4A5568"} />}
                    active={isActivePath("/")}
                    onPress={() => handleNavigate("/")}
                  />
                  <NavLink
                    label="About"
                    active={isActivePath("/about")}
                    onPress={() => handleNavigate("/about")}
                  />
                  <NavLink
                    label="Pricing"
                    active={isActivePath("/pricing")}
                    onPress={() => handleNavigate("/pricing")}
                  />
                  <NavLink
                    label="FAQ"
                    active={isActivePath("/faq")}
                    onPress={() => handleNavigate("/faq")}
                  />
                </>
              )}
            </View>
          )}

          <View style={styles.headerActions}>
            {isAuthenticated ? (
              <>
                {user?.isPremium && (
                  <View style={styles.premiumBadge}>
                    <Crown size={14} color="#F59E0B" />
                    <Text style={styles.premiumText}>Premium</Text>
                  </View>
                )}
                
                {Platform.OS === 'web' ? (
                  <View style={styles.userMenuWeb}>
                    <TouchableOpacity
                      style={styles.userButton}
                      onPress={() => handleNavigate("/settings")}
                      activeOpacity={0.7}
                    >
                      <User size={18} color="#4A5568" />
                      <Text style={styles.userName}>{user?.name}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.logoutButtonWeb}
                      onPress={handleLogout}
                      activeOpacity={0.7}
                    >
                      <LogOut size={18} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.menuButton}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setMenuVisible(true);
                    }}
                    activeOpacity={0.7}
                  >
                    <Menu size={24} color="#1A202C" />
                  </TouchableOpacity>
                )}
              </>
            ) : (
              <TouchableOpacity
                style={styles.signInButton}
                onPress={() => handleNavigate("/auth")}
                activeOpacity={0.8}
              >
                <Text style={styles.signInText}>Sign In</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      {Platform.OS !== 'web' && (
        <MenuDrawer visible={menuVisible} onClose={() => setMenuVisible(false)} />
      )}
    </>
  );
}

type NavLinkProps = {
  label: string;
  icon?: React.ReactNode;
  active: boolean;
  onPress: () => void;
};

function NavLink({ label, icon, active, onPress }: NavLinkProps) {
  return (
    <TouchableOpacity
      style={[styles.navLink, active && styles.navLinkActive]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {icon && <View style={styles.navLinkIcon}>{icon}</View>}
      <Text style={[styles.navLinkText, active && styles.navLinkTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    zIndex: 1000,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
    maxWidth: 1200,
    marginHorizontal: "auto" as any,
    width: "100%",
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },
  logoText: {
    fontSize: 20,
    fontWeight: "800" as const,
    color: "#1A202C",
    letterSpacing: -0.5,
  },
  navLinks: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
    justifyContent: "center",
  },
  navLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    transition: "background-color 0.2s" as any,
  },
  navLinkActive: {
    backgroundColor: "#EFF6FF",
  },
  navLinkIcon: {
    marginRight: 2,
  },
  navLinkText: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: "#4A5568",
  },
  navLinkTextActive: {
    color: "#4A90E2",
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  premiumBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#FFF9E6",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#FDE68A",
  },
  premiumText: {
    fontSize: 13,
    fontWeight: "700" as const,
    color: "#F59E0B",
  },
  userMenuWeb: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  userButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#F9FAFB",
  },
  userName: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#1A202C",
  },
  logoutButtonWeb: {
    padding: 8,
    borderRadius: 8,
  },
  menuButton: {
    padding: 8,
  },
  signInButton: {
    backgroundColor: "#4A90E2",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    shadowColor: "#4A90E2",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  signInText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700" as const,
    letterSpacing: 0.2,
  },
});
