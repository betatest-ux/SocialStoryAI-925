import * as z from "zod";
import { createTRPCRouter, publicProcedure, protectedProcedure } from "@/backend/trpc/create-context";
import { getUserData, createUser, updateUser, verifyPassword, updatePassword } from "@/backend/db/users";

export const authRouter = createTRPCRouter({
  login: publicProcedure
    .input(z.object({ 
      email: z.string().email(),
      password: z.string().min(6)
    }))
    .mutation(({ input }) => {
      const user = getUserData(input.email);
      if (!user || !verifyPassword(input.password, user.password)) {
        throw new Error("Invalid credentials");
      }
      updateUser(user.id, { lastLoginAt: new Date().toISOString() });
      return {
        userId: user.id,
        email: user.email,
        name: user.name,
        isPremium: user.isPremium,
        storiesGenerated: user.storiesGenerated,
        isAdmin: user.isAdmin,
        subscriptionEndDate: user.subscriptionEndDate,
      };
    }),

  register: publicProcedure
    .input(z.object({ 
      email: z.string().email(),
      password: z.string().min(6),
      name: z.string().min(2)
    }))
    .mutation(({ input }) => {
      const existingUser = getUserData(input.email);
      if (existingUser) {
        throw new Error("User already exists");
      }
      
      const user = createUser({
        email: input.email,
        password: input.password,
        name: input.name,
      });
      
      return {
        userId: user.id,
        email: user.email,
        name: user.name,
        isPremium: user.isPremium,
        storiesGenerated: user.storiesGenerated,
        isAdmin: user.isAdmin,
        subscriptionEndDate: user.subscriptionEndDate,
      };
    }),

  updateProfile: protectedProcedure
    .input(z.object({
      name: z.string().min(2).optional(),
      email: z.string().email().optional(),
    }))
    .mutation(({ ctx, input }) => {
      if (input.email) {
        const existingUser = getUserData(input.email);
        if (existingUser && existingUser.id !== ctx.userId) {
          throw new Error("Email already in use");
        }
      }
      updateUser(ctx.userId, input);
      const user = getUserData(ctx.userId);
      if (!user) throw new Error("User not found");
      return {
        userId: user.id,
        email: user.email,
        name: user.name,
        isPremium: user.isPremium,
        storiesGenerated: user.storiesGenerated,
        isAdmin: user.isAdmin,
        subscriptionEndDate: user.subscriptionEndDate,
      };
    }),

  changePassword: protectedProcedure
    .input(z.object({
      currentPassword: z.string(),
      newPassword: z.string().min(6),
    }))
    .mutation(({ ctx, input }) => {
      const user = getUserData(ctx.userId);
      if (!user) throw new Error("User not found");
      if (!verifyPassword(input.currentPassword, user.password)) {
        throw new Error("Current password is incorrect");
      }
      updatePassword(ctx.userId, input.newPassword);
      return { success: true };
    }),

  me: protectedProcedure.query(({ ctx }) => {
    const user = getUserData(ctx.userId);
    if (!user) {
      throw new Error("User not found");
    }
    return {
      userId: user.id,
      email: user.email,
      name: user.name,
      isPremium: user.isPremium,
      storiesGenerated: user.storiesGenerated,
      isAdmin: user.isAdmin,
      subscriptionEndDate: user.subscriptionEndDate,
    };
  }),

  upgrade: protectedProcedure.mutation(({ ctx }) => {
    const subscriptionEndDate = new Date();
    subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + 1);
    updateUser(ctx.userId, { 
      isPremium: true,
      subscriptionEndDate: subscriptionEndDate.toISOString(),
    });
    return { success: true };
  }),

  cancelSubscription: protectedProcedure.mutation(({ ctx }) => {
    updateUser(ctx.userId, { 
      isPremium: false,
      subscriptionEndDate: undefined,
    });
    return { success: true };
  }),
});
