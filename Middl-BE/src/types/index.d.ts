import { User } from "@supabase/supabase-js";

declare global {
  namespace Express {
    interface Request {
      user?: User; // This adds the 'user' property to the standard Request
    }
  }
}
