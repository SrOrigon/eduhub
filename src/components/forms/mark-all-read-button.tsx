"use client";

import { markAllNotificationsReadAction } from "@/actions/notifications";
import { Button } from "@/components/ui/button";

export function MarkAllReadButton() {
  return (
    <form
      action={async () => {
        await markAllNotificationsReadAction();
      }}
    >
      <Button type="submit" variant="outline">
        Marcar todas como lidas
      </Button>
    </form>
  );
}
