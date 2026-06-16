"use client";

import { useForm } from "@tanstack/react-form";
import { Button } from "@twg/ui/components/button";
import { Input } from "@twg/ui/components/input";
import { Label } from "@twg/ui/components/label";
import { toast } from "sonner";
import z from "zod";

import { authClient } from "@/lib/auth-client";

const ORG_SLUG_REGEX = /^[a-z0-9-]+$/;

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function OrganizationPanel() {
  const { data: organizations, isPending: isLoadingOrganizations } =
    authClient.useListOrganizations();
  const { data: activeOrganization } = authClient.useActiveOrganization();

  const form = useForm({
    defaultValues: {
      name: "",
      slug: "",
    },
    onSubmit: async ({ value }) => {
      const slug = value.slug || slugify(value.name);

      await authClient.organization.create(
        {
          name: value.name,
          slug,
        },
        {
          onSuccess: async ({ data }) => {
            if (data?.id) {
              await authClient.organization.setActive({
                organizationId: data.id,
              });
            }
            form.reset();
            toast.success("Organization created");
          },
          onError: (error) => {
            toast.error(error.error.message || error.error.statusText);
          },
        }
      );
    },
    validators: {
      onSubmit: z.object({
        name: z.string().min(1, "Name is required"),
        slug: z
          .string()
          .refine(
            (value) => value === "" || ORG_SLUG_REGEX.test(value),
            "Slug can only contain lowercase letters, numbers, and hyphens"
          ),
      }),
    },
  });

  function renderOrganizationList() {
    if (isLoadingOrganizations) {
      return (
        <p className="text-muted-foreground text-sm">
          Loading organizations...
        </p>
      );
    }

    if (!organizations || organizations.length === 0) {
      return (
        <p className="mb-4 text-muted-foreground text-sm">
          You are not a member of any organizations yet.
        </p>
      );
    }

    return (
      <ul className="mb-4 space-y-2">
        {organizations.map((org) => (
          <li className="flex items-center justify-between gap-2" key={org.id}>
            <span>{org.name}</span>
            <Button
              disabled={activeOrganization?.id === org.id}
              onClick={() => handleSetActive(org.id)}
              size="sm"
              type="button"
              variant={
                activeOrganization?.id === org.id ? "secondary" : "outline"
              }
            >
              {activeOrganization?.id === org.id ? "Active" : "Set active"}
            </Button>
          </li>
        ))}
      </ul>
    );
  }

  async function handleSetActive(organizationId: string) {
    await authClient.organization.setActive(
      { organizationId },
      {
        onSuccess: () => {
          toast.success("Active organization updated");
        },
        onError: (error) => {
          toast.error(error.error.message || error.error.statusText);
        },
      }
    );
  }

  return (
    <section className="rounded-lg border p-4">
      <h2 className="mb-2 font-medium">Organization</h2>

      {activeOrganization ? (
        <p className="mb-4 text-muted-foreground text-sm">
          Active:{" "}
          <span className="text-foreground">{activeOrganization.name}</span>
        </p>
      ) : (
        <p className="mb-4 text-muted-foreground text-sm">
          No active organization selected.
        </p>
      )}

      {renderOrganizationList()}

      <form
        className="space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
      >
        <form.Field name="name">
          {(field) => (
            <div className="space-y-2">
              <Label htmlFor={field.name}>Organization name</Label>
              <Input
                id={field.name}
                name={field.name}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="Acme Inc"
                value={field.state.value}
              />
              {field.state.meta.errors.map((error) => (
                <p className="text-red-500" key={error?.message}>
                  {error?.message}
                </p>
              ))}
            </div>
          )}
        </form.Field>

        <form.Field name="slug">
          {(field) => (
            <div className="space-y-2">
              <Label htmlFor={field.name}>Slug (optional)</Label>
              <Input
                id={field.name}
                name={field.name}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="acme-inc"
                value={field.state.value}
              />
              {field.state.meta.errors.map((error) => (
                <p className="text-red-500" key={error?.message}>
                  {error?.message}
                </p>
              ))}
            </div>
          )}
        </form.Field>

        <form.Subscribe
          selector={(state) => ({
            canSubmit: state.canSubmit,
            isSubmitting: state.isSubmitting,
          })}
        >
          {({ canSubmit, isSubmitting }) => (
            <Button disabled={!canSubmit || isSubmitting} type="submit">
              {isSubmitting ? "Creating..." : "Create organization"}
            </Button>
          )}
        </form.Subscribe>
      </form>
    </section>
  );
}
