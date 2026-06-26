"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { trackEvent } from "@/components/analytics/event-tracker";
import { Button } from "@/components/ui";

type DeleteLandlordRoomButtonProps = {
  roomId: string;
  roomTitle: string;
};

export function DeleteLandlordRoomButton({ roomId, roomTitle }: DeleteLandlordRoomButtonProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  async function deleteRoom() {
    const confirmed = window.confirm(
      `Xóa mềm phòng "${roomTitle}"? Tin này sẽ không còn hiển thị trong dashboard và tìm kiếm.`,
    );
    if (!confirmed) return;

    setError(null);
    setIsDeleting(true);
    trackEvent("landlord_room_delete_start", { location: "landlord_dashboard_recent_rooms" });

    try {
      const response = await fetch(`/api/landlord/rooms/${roomId}`, { method: "DELETE" });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload?.error?.message ?? "Không thể xóa phòng.");
      }

      trackEvent("landlord_room_delete_success", { location: "landlord_dashboard_recent_rooms" });
      router.refresh();
    } catch (caughtError) {
      trackEvent("client_error", {
        location: "landlord_dashboard_recent_rooms",
        category: "room_delete_failed",
      });
      setError(caughtError instanceof Error ? caughtError.message : "Không thể xóa phòng.");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <Button
        type="button"
        disabled={isDeleting}
        onClick={deleteRoom}
        className="inline-flex rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-700 hover:border-red-300 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isDeleting ? "Đang xóa..." : "Xóa tin"}
      </Button>
      {error ? <p className="max-w-48 text-xs font-medium text-red-700">{error}</p> : null}
    </div>
  );
}
