import { cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import Auth from "./Auth";

const auth = vi.hoisted(() => ({
  signUp: vi.fn(),
  signInWithPassword: vi.fn(),
}));
vi.mock("@/integrations/supabase/client", () => ({ supabase: { auth } }));
vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ session: null, loading: false }),
}));

afterEach(() => { cleanup(); vi.clearAllMocks(); });

describe("email/password accounts", () => {
  it("creates an account using email and password without a verification code", async () => {
    auth.signUp.mockResolvedValue({ data: { session: { user: { id: "new-user" } } }, error: null });
    const view = render(<MemoryRouter><Auth /></MemoryRouter>);
    fireEvent.click(view.getByRole("button", { name: "Need an account? Sign up" }));
    fireEvent.change(view.getByPlaceholderText("Email"), { target: { value: "signup@example.com" } });
    fireEvent.change(view.getByPlaceholderText("Password"), { target: { value: "example-password-123" } });
    fireEvent.click(view.getByRole("button", { name: "Create account" }));
    await waitFor(() => expect(auth.signUp).toHaveBeenCalledWith({
      email: "signup@example.com",
      password: "example-password-123",
      options: { emailRedirectTo: window.location.origin },
    }));
  });

  it("signs in using email and password", async () => {
    auth.signInWithPassword.mockResolvedValue({ error: null });
    const view = render(<MemoryRouter><Auth /></MemoryRouter>);
    fireEvent.change(view.getByPlaceholderText("Email"), { target: { value: "signin@example.com" } });
    fireEvent.change(view.getByPlaceholderText("Password"), { target: { value: "example-password-123" } });
    fireEvent.click(view.getByRole("button", { name: "Sign in" }));
    await waitFor(() => expect(auth.signInWithPassword).toHaveBeenCalledWith({
      email: "signin@example.com", password: "example-password-123",
    }));
  });
});