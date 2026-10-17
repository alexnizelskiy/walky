import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getCurrentUser, isStaff } from "@/lib/auth";
import { getPet } from "@/lib/pets-db";
import { ProfileLogin } from "@/components/auth/profile-login";
import { PetDiary } from "@/components/pets/pet-diary";

export const metadata: Metadata = {
  title: { absolute: "Дневник питомца — walky" },
  robots: { index: false, follow: false },
};

export default async function PetDiaryPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return <div className="bg-background"><ProfileLogin /></div>;
  if (isStaff(user)) redirect("/admin");

  const { id } = await params;
  const pet = await getPet(id, user.id);
  if (!pet) notFound();

  return (
    <div className="container-page py-8 md:py-12">
      <Link href="/cabinet" className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground">
        <ArrowLeft className="size-4" /> В кабинет
      </Link>

      <div className="mt-5 flex items-center gap-4">
        <span className="grid size-16 shrink-0 place-items-center rounded-full bg-brand-100 text-3xl">🐶</span>
        <div>
          <h1 className="text-2xl font-bold md:text-3xl">{pet.name}</h1>
          <p className="text-sm text-muted-foreground">
            {[pet.breed, pet.gender === "female" ? "девочка" : pet.gender === "male" ? "мальчик" : ""].filter(Boolean).join(" · ")}
          </p>
        </div>
      </div>

      <div className="mt-8">
        <PetDiary petId={pet.id} />
      </div>
    </div>
  );
}
