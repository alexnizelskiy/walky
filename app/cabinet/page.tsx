import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PawPrint, Briefcase } from "lucide-react";
import { getCurrentUser, isStaff } from "@/lib/auth";
import { ProfileLogin } from "@/components/auth/profile-login";
import { PetCabinet } from "@/components/pets/pet-cabinet";
import { ExecutorCabinet } from "@/components/pets/executor-cabinet";

export const metadata: Metadata = {
  title: { absolute: "Личный кабинет — walky" },
  robots: { index: false, follow: false },
};

export default async function CabinetPage() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <div className="bg-background">
        <ProfileLogin />
      </div>
    );
  }

  // staff/admin manage from the panel, not the client pet cabinet
  if (isStaff(user)) redirect("/admin");

  const isExecutor = user.role === "executor";

  return (
    <div className="container-page py-10 md:py-14">
      <div className="mb-8 flex items-center gap-4">
        <span className="grid size-14 place-items-center rounded-full bg-brand-100 text-brand-700">
          {isExecutor ? <Briefcase className="size-7" /> : <PawPrint className="size-7" />}
        </span>
        <div>
          <h1 className="text-2xl font-bold">{user.name || (isExecutor ? "Кабинет исполнителя" : "Кабинет питомца")}</h1>
          <p className="text-sm text-muted-foreground">
            {isExecutor ? "Ваши назначенные заявки" : "Профили питомцев и история выгулов"}
          </p>
        </div>
      </div>

      {isExecutor ? <ExecutorCabinet /> : <PetCabinet />}
    </div>
  );
}
