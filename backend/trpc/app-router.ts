import { createTRPCRouter } from "./create-context";
import { authRouter } from "./routes/auth";
import { storiesRouter } from "./routes/stories";
import { adminRouter } from "./routes/admin";
import { contactRouter } from "./routes/contact";

export const appRouter = createTRPCRouter({
  auth: authRouter,
  stories: storiesRouter,
  admin: adminRouter,
  contact: contactRouter,
});

export type AppRouter = typeof appRouter;
