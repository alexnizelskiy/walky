import type { Metadata } from "next";
import { PawPrint } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { ProfileLogin } from "@/components/auth/profile-login";
import { PetCabinet } from "@/components/pets/pet-cabinet";

export const metadata: Metadata = {
  title: { absolute: "Кабинет питомца — walky" },
  robots: { index: false, follow: false },
};

export default async function PetCabinetPage() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <div className="bg-background">
        <ProfileLogin />
      </div>
    );
  }

  return (
    <div className="container-page py-10 md:py-14">
      <div className="mb-8 flex items-center gap-4">
        <span className="grid size-14 place-items-center rounded-full bg-brand-100 text-brand-700">
          <PawPrint className="size-7" />
        </span>
        <div>
          <h1 className="text-2xl font-bold">{user.name || "Кабинет питомца"}</h1>
          <p className="text-sm text-muted-foreground">Профили питомцев и история выгулов</p>
        </div>
      </div>

      <PetCabinet />
    </div>
  );
}
