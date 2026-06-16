import Link from "next/link";

export default function TenantNotFound() {
  return (
    <div className="container mx-auto max-w-lg space-y-4 px-4 py-16 text-center">
      <h1 className="font-semibold text-2xl">Store not found</h1>
      <p className="text-muted-foreground">
        This organization does not exist or is not available.
      </p>
      <Link className="text-sm underline" href="/">
        Back to platform home
      </Link>
    </div>
  );
}
