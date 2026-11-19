import type { ReactNode } from "react";

// Sign-in removed: every page is open to anyone.
export const ProtectedRoute = ({ children }: { children: ReactNode }) => <>{children}</>;
