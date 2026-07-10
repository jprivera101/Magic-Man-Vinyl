import Image from "next/image";
import Link from "next/link";
import { LogOut } from "lucide-react";
import { AdminNav } from "@/components/admin/AdminNav";
import { logoutAction } from "@/app/admin/actions";

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-vintage-cream">
      <header className="bg-deep-grove">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <Link href="/admin" className="flex items-center gap-2">
            <Image
              src="/branding/logo.png"
              alt="Magic Man Vinyl"
              width={36}
              height={36}
              className="h-9 w-9"
            />
            <span className="font-display font-bold text-vintage-cream">
              Admin
            </span>
          </Link>
          <form action={logoutAction}>
            <button
              type="submit"
              className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-vintage-cream/80 transition hover:bg-vintage-cream/10 hover:text-vintage-cream"
            >
              <LogOut size={16} />
              Salir
            </button>
          </form>
        </div>
        <AdminNav />
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">{children}</main>
    </div>
  );
}
