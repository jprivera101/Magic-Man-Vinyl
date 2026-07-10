import Image from "next/image";
import { LoginForm } from "./LoginForm";

export const metadata = {
  title: "Admin | Magic Man Vinyl",
};

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-deep-grove px-6 py-12">
      <Image
        src="/branding/logo.png"
        alt="Magic Man Vinyl"
        width={96}
        height={96}
        priority
        className="h-24 w-24"
      />
      <h1 className="font-display mt-4 text-xl font-bold text-vintage-cream">
        Panel de administración
      </h1>
      <div className="mt-6 w-full max-w-sm rounded-2xl bg-vintage-cream p-6 shadow-lg">
        <LoginForm />
      </div>
    </div>
  );
}
