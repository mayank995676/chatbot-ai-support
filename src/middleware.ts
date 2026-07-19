export { auth as middleware } from "@/auth";

export const config = {
  // Protect /chat and /knowledge directories and their subroutes
  matcher: ["/chat/:path*", "/knowledge/:path*", "/login"],
};
