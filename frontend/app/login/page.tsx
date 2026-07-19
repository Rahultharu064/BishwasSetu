import type { Metadata } from "next";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Log in — BishwasSetu",
  description: "Log in to BishwasSetu to book, track, and manage your home services.",
};

export default function LoginPage() {
  return <LoginForm />;
}
