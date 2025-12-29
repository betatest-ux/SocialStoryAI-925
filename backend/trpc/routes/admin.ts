import { createTRPCRouter, protectedProcedure } from "@/backend/trpc/create-context";
import { getUserData, getAllUsers, updateUser, deleteUser } from "@/backend/db/users";
import { getAllStories, deleteStory } from "@/backend/db/stories";
import { getAdminSettings, updateAdminSettings, getApiKeys, updateApiKeys, addActivityLog, getActivityLogs } from "@/backend/db/admin";
import { z } from "zod";
import bcrypt from 'bcryptjs';

export const adminRouter = createTRPCRouter({
  analytics: protectedProcedure.query(({ ctx }) => {
    const user = getUserData(ctx.userId);
    if (!user?.isAdmin) {
      throw new Error("Unauthorized");
    }

    const users = getAllUsers();
    const stories = getAllStories();

    const totalUsers = users.length;
    const premiumUsers = users.filter((u) => u.isPremium).length;
    const totalStories = stories.length;
    const freeUsers = totalUsers - premiumUsers;

    const storiesPerDay = stories.reduce((acc: Record<string, number>, story) => {
      const date = new Date(story.createdAt).toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalUsers,
      premiumUsers,
      freeUsers,
      totalStories,
      averageStoriesPerUser: totalUsers > 0 ? (totalStories / totalUsers).toFixed(2) : "0",
      recentStories: stories.slice(-10).reverse(),
      storiesPerDay,
    };
  }),

  users: protectedProcedure.query(({ ctx }) => {
    const user = getUserData(ctx.userId);
    if (!user?.isAdmin) {
      throw new Error("Unauthorized");
    }

    return getAllUsers().map((u) => ({
      id: u.id,
      email: u.email,
      name: u.name,
      isPremium: u.isPremium,
      storiesGenerated: u.storiesGenerated,
      createdAt: u.createdAt,
      isAdmin: u.isAdmin,
      subscriptionEndDate: u.subscriptionEndDate,
      lastLoginAt: u.lastLoginAt,
    }));
  }),

  stories: protectedProcedure.query(({ ctx }) => {
    const user = getUserData(ctx.userId);
    if (!user?.isAdmin) {
      throw new Error("Unauthorized");
    }

    return getAllStories();
  }),

  togglePremium: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .mutation(({ ctx, input }) => {
      const user = getUserData(ctx.userId);
      if (!user?.isAdmin) {
        throw new Error("Unauthorized");
      }

      const targetUser = getUserData(input.userId);
      if (!targetUser) {
        throw new Error("User not found");
      }

      const newPremiumStatus = !targetUser.isPremium;
      const updates: any = { isPremium: newPremiumStatus };
      
      if (newPremiumStatus) {
        const subscriptionEndDate = new Date();
        subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + 1);
        updates.subscriptionEndDate = subscriptionEndDate.toISOString();
      } else {
        updates.subscriptionEndDate = undefined;
      }

      updateUser(input.userId, updates);
      addActivityLog(
        "toggle_premium",
        ctx.userId,
        `Changed premium status for ${targetUser.email} to ${newPremiumStatus}`
      );

      return { success: true };
    }),

  extendSubscription: protectedProcedure
    .input(z.object({ 
      userId: z.string(),
      months: z.number().min(1).max(12),
    }))
    .mutation(({ ctx, input }) => {
      const user = getUserData(ctx.userId);
      if (!user?.isAdmin) {
        throw new Error("Unauthorized");
      }

      const targetUser = getUserData(input.userId);
      if (!targetUser) {
        throw new Error("User not found");
      }

      const currentEndDate = targetUser.subscriptionEndDate 
        ? new Date(targetUser.subscriptionEndDate)
        : new Date();
      
      currentEndDate.setMonth(currentEndDate.getMonth() + input.months);
      
      updateUser(input.userId, { 
        isPremium: true,
        subscriptionEndDate: currentEndDate.toISOString(),
      });
      
      addActivityLog(
        "extend_subscription",
        ctx.userId,
        `Extended subscription for ${targetUser.email} by ${input.months} months`
      );

      return { success: true };
    }),

  resetPassword: protectedProcedure
    .input(z.object({ 
      userId: z.string(),
      newPassword: z.string().min(6),
    }))
    .mutation(({ ctx, input }) => {
      const user = getUserData(ctx.userId);
      if (!user?.isAdmin) {
        throw new Error("Unauthorized");
      }

      const targetUser = getUserData(input.userId);
      if (!targetUser) {
        throw new Error("User not found");
      }

      const hashedPassword = bcrypt.hashSync(input.newPassword, 10);
      updateUser(input.userId, { password: hashedPassword });
      
      addActivityLog(
        "reset_password",
        ctx.userId,
        `Reset password for ${targetUser.email}`
      );

      return { success: true };
    }),

  toggleAdmin: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .mutation(({ ctx, input }) => {
      const user = getUserData(ctx.userId);
      if (!user?.isAdmin) {
        throw new Error("Unauthorized");
      }

      const targetUser = getUserData(input.userId);
      if (!targetUser) {
        throw new Error("User not found");
      }

      updateUser(input.userId, { isAdmin: !targetUser.isAdmin });
      addActivityLog(
        "toggle_admin",
        ctx.userId,
        `Changed admin status for ${targetUser.email} to ${!targetUser.isAdmin}`
      );

      return { success: true };
    }),

  deleteUser: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .mutation(({ ctx, input }) => {
      const user = getUserData(ctx.userId);
      if (!user?.isAdmin) {
        throw new Error("Unauthorized");
      }

      const targetUser = getUserData(input.userId);
      if (!targetUser) {
        throw new Error("User not found");
      }

      deleteUser(input.userId);
      addActivityLog("delete_user", ctx.userId, `Deleted user ${targetUser.email}`);

      return { success: true };
    }),

  deleteStory: protectedProcedure
    .input(z.object({ storyId: z.string() }))
    .mutation(({ ctx, input }) => {
      const user = getUserData(ctx.userId);
      if (!user?.isAdmin) {
        throw new Error("Unauthorized");
      }

      deleteStory(input.storyId);
      addActivityLog("delete_story", ctx.userId, `Deleted story ${input.storyId}`);

      return { success: true };
    }),

  getSettings: protectedProcedure.query(({ ctx }) => {
    const user = getUserData(ctx.userId);
    if (!user?.isAdmin) {
      throw new Error("Unauthorized");
    }

    return getAdminSettings();
  }),

  updateSettings: protectedProcedure
    .input(
      z.object({
        freeStoryLimit: z.number().optional(),
        enableRegistration: z.boolean().optional(),
        maintenanceMode: z.boolean().optional(),
        premiumPrice: z.number().optional(),
      })
    )
    .mutation(({ ctx, input }) => {
      const user = getUserData(ctx.userId);
      if (!user?.isAdmin) {
        throw new Error("Unauthorized");
      }

      updateAdminSettings(input);
      addActivityLog("update_settings", ctx.userId, `Updated app settings`);

      return getAdminSettings();
    }),

  getActivityLogs: protectedProcedure.query(({ ctx }) => {
    const user = getUserData(ctx.userId);
    if (!user?.isAdmin) {
      throw new Error("Unauthorized");
    }

    const users = getAllUsers();
    const logs = getActivityLogs();
    return logs.map((log) => {
      const logUser = users.find((u) => u.id === log.userId);
      return {
        ...log,
        userName: logUser?.name || "Unknown",
        userEmail: logUser?.email || "Unknown",
      };
    });
  }),

  getApiKeys: protectedProcedure.query(({ ctx }) => {
    const user = getUserData(ctx.userId);
    if (!user?.isAdmin) {
      throw new Error("Unauthorized");
    }

    const keys = getApiKeys();
    return {
      openaiKey: keys.openaiKey || '',
      geminiKey: keys.geminiKey || '',
      stripeSecretKey: keys.stripeSecretKey || '',
      stripePublishableKey: keys.stripePublishableKey || '',
      googleOAuthWebClientId: keys.googleOAuthWebClientId || '',
      googleOAuthIosClientId: keys.googleOAuthIosClientId || '',
      googleOAuthAndroidClientId: keys.googleOAuthAndroidClientId || '',
    };
  }),

  updateApiKeys: protectedProcedure
    .input(
      z.object({
        openaiKey: z.string().optional(),
        geminiKey: z.string().optional(),
        stripeSecretKey: z.string().optional(),
        stripePublishableKey: z.string().optional(),
        googleOAuthWebClientId: z.string().optional(),
        googleOAuthIosClientId: z.string().optional(),
        googleOAuthAndroidClientId: z.string().optional(),
      })
    )
    .mutation(({ ctx, input }) => {
      const user = getUserData(ctx.userId);
      if (!user?.isAdmin) {
        throw new Error("Unauthorized");
      }

      updateApiKeys(input);
      addActivityLog("update_api_keys", ctx.userId, "Updated API keys configuration");

      const keys = getApiKeys();
      return {
        openaiKey: keys.openaiKey || '',
        geminiKey: keys.geminiKey || '',
        stripeSecretKey: keys.stripeSecretKey || '',
        stripePublishableKey: keys.stripePublishableKey || '',
        googleOAuthWebClientId: keys.googleOAuthWebClientId || '',
        googleOAuthIosClientId: keys.googleOAuthIosClientId || '',
        googleOAuthAndroidClientId: keys.googleOAuthAndroidClientId || '',
      };
    }),
});
