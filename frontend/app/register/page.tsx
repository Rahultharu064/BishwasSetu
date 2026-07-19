import type { Metadata } from "next";
import { RegisterForm } from "./register-form";

export const metadata: Metadata = {
  title: "Create an account — BishwasSetu",
  description: "Join BishwasSetu as a customer or a verified home service provider.",
};

export default function RegisterPage() {
  return <RegisterForm />;
}
