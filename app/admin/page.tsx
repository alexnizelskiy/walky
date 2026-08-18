import type { Metadata } from "next";
import { getCurrentUser, isStaff } from "@/lib/auth";
import { ProfileLogin } from "@/components/auth/profile-login";
import { AdminPanel } from "@/components/admin/admin-panel";

export const metadata: Metadata = {
  title: { absolute: "Панель управления — walky" },
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <div className="bg-background">
        <ProfileLogin />
      </div>
    );
  }

  if (!isStaff(user)) {
    return (
      <div className="container-page py-20 text-center">
        <h1 className="text-2xl font-bold">Нет доступа</h1>
        <p className="mt-2 text-muted-foreground">Панель управления доступна только сотрудникам.</p>
      </div>
    );
  }

  return (
    <div className="container-page py-10 md:py-14">
      <h1 className="text-2xl font-bold md:text-3xl">Панель управления</h1>
      <p className="mt-1 text-sm text-muted-foreground">Заявки и пользователи walky</p>
      <div className="mt-8">
        <AdminPanel isAdmin={user.role === "admin"} />
      </div>
    </div>
  );
}
