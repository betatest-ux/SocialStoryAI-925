import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useRef, useState } from "react";
import { BookOpen, Plus, Settings, Crown, LogOut } from "lucide-react-native";
import * as Haptics from "expo-haptics";

export default function HomePage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, logout, remainingFreeStories } = useAuth();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const [createButtonScale] = useState(new Animated.Value(1));

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 30,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/");
    }
  }, [isAuthenticated, isLoading, router]);

  const animateButton = (scale: Animated.Value) => {
    Animated.sequence([
      Animated.timing(scale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  if (isLoading || !user) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  const remaining = remainingFreeStories();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, {user.name}!</Text>
          {!user.isPremium && (
            <Text style={styles.storiesRemaining}>
              {remaining} free {remaining === 1 ? "story" : "stories"} remaining
            </Text>
          )}
          {user.isPremium && (
            <View style={styles.premiumBadge}>
              <Crown size={16} color="#FFD700" />
              <Text style={styles.premiumText}>Premium</Text>
            </View>
          )}
        </View>
        <TouchableOpacity 
          onPress={() => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            logout();
          }} 
          style={styles.logoutButton}
        >
          <LogOut size={24} color="#E74C3C" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
        >
          <Animated.View style={{ transform: [{ scale: createButtonScale }] }}>
            <TouchableOpacity
              style={styles.createCard}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                animateButton(createButtonScale);
                router.push("/create-story");
              }}
              activeOpacity={0.9}
            >
            <View style={styles.createCardIcon}>
              <Plus size={32} color="#FFFFFF" strokeWidth={3} />
            </View>
            <View style={styles.createCardContent}>
              <Text style={styles.createCardTitle}>Create New Story</Text>
              <Text style={styles.createCardSubtitle}>
                Generate a personalized social story
              </Text>
            </View>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>

        <Animated.View
          style={[
            styles.quickActions,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push("/my-stories");
            }}
            activeOpacity={0.8}
          >
            <BookOpen size={28} color="#4A90E2" />
            <Text style={styles.actionCardTitle}>My Stories</Text>
          </TouchableOpacity>

          {!user.isPremium && (
            <TouchableOpacity
              style={[styles.actionCard, styles.premiumCard]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push("/pricing");
              }}
              activeOpacity={0.8}
            >
              <Crown size={28} color="#FFD700" />
              <Text style={styles.actionCardTitle}>Go Premium</Text>
            </TouchableOpacity>
          )}

          {user.isAdmin && (
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push("/admin");
              }}
              activeOpacity={0.8}
            >
              <Settings size={28} color="#6C5CE7" />
              <Text style={styles.actionCardTitle}>Admin</Text>
            </TouchableOpacity>
          )}
        </Animated.View>

        <Animated.View
          style={[
            styles.infoSection,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Text style={styles.infoTitle}>What are Social Stories?</Text>
          <Text style={styles.infoText}>
            Social stories help individuals with autism understand social situations,
            expectations, and appropriate responses through simple, personalized narratives.
          </Text>
          <TouchableOpacity 
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push("/about");
            }} 
            activeOpacity={0.7}
          >
            <Text style={styles.learnMoreLink}>Learn more →</Text>
          </TouchableOpacity>
        </Animated.View>

        {!user.isPremium && (
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push("/settings");
            }}
          >
            <Settings size={20} color="#4A90E2" />
            <Text style={styles.settingsButtonText}>Account Settings</Text>
          </TouchableOpacity>
        )}

        {user.isPremium && (
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push("/settings");
            }}
          >
            <Settings size={20} color="#4A90E2" />
            <Text style={styles.settingsButtonText}>Account Settings</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F8F9FD",
  },
  loadingText: {
    fontSize: 18,
    color: "#666",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: 24,
    paddingTop: 60,
    backgroundColor: "#FFFFFF",
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  greeting: {
    fontSize: 32,
    fontWeight: "800" as const,
    color: "#1A202C",
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  storiesRemaining: {
    fontSize: 16,
    color: "#718096",
    fontWeight: "500" as const,
  },
  premiumBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: "#FFF9E6",
    borderRadius: 14,
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: "#FFE9B3",
  },
  premiumText: {
    fontSize: 15,
    fontWeight: "700" as const,
    color: "#F39C12",
    letterSpacing: 0.3,
  },
  logoutButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FFEBEE",
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flex: 1,
    padding: 24,
  },
  createCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4A90E2",
    borderRadius: 24,
    padding: 28,
    marginBottom: 28,
    shadowColor: "#4A90E2",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 6,
  },
  createCardIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  createCardContent: {
    flex: 1,
  },
  createCardTitle: {
    fontSize: 22,
    fontWeight: "800" as const,
    color: "#FFFFFF",
    marginBottom: 6,
    letterSpacing: 0.2,
  },
  createCardSubtitle: {
    fontSize: 15,
    color: "rgba(255, 255, 255, 0.92)",
    fontWeight: "500" as const,
  },
  quickActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 24,
  },
  actionCard: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  premiumCard: {
    backgroundColor: "#FFF9E6",
  },
  actionCardTitle: {
    fontSize: 17,
    fontWeight: "700" as const,
    color: "#1A202C",
    marginTop: 14,
    textAlign: "center",
  },
  infoSection: {
    backgroundColor: "#F0F9FF",
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#BAE6FD",
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: "800" as const,
    color: "#1A202C",
    marginBottom: 10,
  },
  infoText: {
    fontSize: 15,
    color: "#4A5568",
    lineHeight: 22,
    marginBottom: 14,
    fontWeight: "400" as const,
  },
  learnMoreLink: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#4A90E2",
    letterSpacing: 0.2,
  },
  settingsButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 18,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  settingsButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#4A5568",
  },
});
