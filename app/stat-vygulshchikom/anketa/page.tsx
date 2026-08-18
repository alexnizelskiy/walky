import type { Metadata } from "next";
import { SitterForm } from "@/components/pets/sitter-form";

export const metadata: Metadata = {
  title: { absolute: "Анкета выгульщика и ситтера — walky" },
  description: "Заполните анкету, чтобы стать выгульщиком или ситтером walky в Ростове-на-Дону.",
  robots: { index: false, follow: false },
};

export default function SitterApplicationPage() {
  return <SitterForm />;
}
