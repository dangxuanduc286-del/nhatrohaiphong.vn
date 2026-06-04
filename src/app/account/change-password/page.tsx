import { ChangePasswordForm } from "@/components/account/change-password-form";
import { requireUserAccountPage } from "@/server/account/utils";

export default async function AccountChangePasswordPage() {
  await requireUserAccountPage();

  return (
    <section className="max-w-3xl">
      <ChangePasswordForm />
    </section>
  );
}
