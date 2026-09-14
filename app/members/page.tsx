import { redirect } from "next/navigation";

export const metadata = {
  title: "Member Discovery",
  description: "Private Sugar Papi member discovery.",
  robots: { index: false, follow: false },
};

export default function MembersPage() {
  redirect("https://sugar-papi.nundo-com.chatgpt.site/members");
}
