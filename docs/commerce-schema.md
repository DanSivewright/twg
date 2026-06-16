# Commerce schema (v1)

Database tables live in `packages/db/src/schema/commerce/` and `packages/db/src/schema/media.ts`.

## Intentional simplifications

These choices keep v1 simple while staying extensible:

### Variant options

`product_variant` has `size` and `colour` as nullable text columns, plus an `options` JSONB column for overflow (e.g. shoe width). We deferred Shopify-style option-definition tables until a product needs more than two dimensions at scale.

### Product attributes

`product.attributes` is JSONB validated at the API boundary with `productAttributesSchema` (Zod). Known keys: `composition`, `fabricWeight`, `features`, `suitableFor`. Extra keys are allowed via `.passthrough()`. We deferred a `product_attribute` EAV table until SQL-level attribute filtering is needed.

### Images

Media is org-scoped and linked to **products** via `product_media` (with `sortOrder` and `isPrimary`). Variant-level images are deferred.

### Visibility

Only **products** have `draft` / `published` status. Categories are always visible when not soft-deleted.

## Applying schema changes

```bash
pnpm run db:push
```
