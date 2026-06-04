import { ChangePasswordForm } from "@/components/account/change-password-form";
import { requireLandlordPage } from "@/server/landlord/utils";

export default async function LandlordChangePasswordPage() {
  await requireLandlordPage();

  return (
    <section className="max-w-3xl">
      <ChangePasswordForm />
    </section>
  );
}
