import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface User {
    id: string;
    email?: string | null;
    name?: string | null;
    shopId?: string;
    shopSlug?: string;
  }
  interface Session {
    user: User & {
      id: string;
      shopId: string;
      shopSlug: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    shopId?: string;
    shopSlug?: string;
  }
}
