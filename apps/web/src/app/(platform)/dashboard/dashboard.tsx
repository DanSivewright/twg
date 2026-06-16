"use client";
import { useQuery } from "@tanstack/react-query";

import OrganizationPanel from "@/components/organization-panel";
import type { authClient } from "@/lib/auth-client";
import { orpc } from "@/utils/orpc";

export default function Dashboard({
  session: _session,
}: {
  session: typeof authClient.$Infer.Session;
}) {
  const privateData = useQuery(orpc.privateData.queryOptions());

  return (
    <div className="space-y-4">
      <p>API: {privateData.data?.message}</p>
      <OrganizationPanel />
    </div>
  );
}
