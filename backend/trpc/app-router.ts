import { createTRPCRouter } from "./create-context";
import { authRouter } from "./routes/auth";
import { storiesRouter } from "./routes/stories";
import { adminRouter } from "./routes/admin";

export const appRouter = createTRPCRouter({
  auth: authRouter,
  stories: storiesRouter,
  admin: adminRouter,
});

export type AppRouter = typeof appRouter;
