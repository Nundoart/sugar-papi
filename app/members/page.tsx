import { redirect } from "next/navigation";

export const metadata = {
  title: "Discover",
  description: "Focused, one-at-a-time matching.",
  robots: { index: false, follow: false },
};

export default function MembersPage() {
  redirect("/dating");
}
