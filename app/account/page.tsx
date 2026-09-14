import { redirect } from "next/navigation";

export const metadata = {
  title: "Account",
  description: "Create or manage your private Sugar Papi account.",
  robots: { index: false, follow: false },
};

export default function AccountPage() {
  redirect("https://sugar-papi.nundo-com.chatgpt.site/account");
}
