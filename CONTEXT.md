# Commerce

White-label e-commerce catalog scoped to organizations. Each organization owns its own categories, products, variants, and media.

## Language

**Organization**:
The tenant that owns a catalog. All commerce data belongs to exactly one organization.
_Avoid_: Account, shop, store (unless referring to the storefront UI)

**Category**:
A nested navigation node in the catalog tree. Unlimited depth — a "range" (e.g. Cut 5) is a child category, not a separate concept.
_Avoid_: Range, collection, group

**Catalog division**:
A top-level **Category** that groups product families in navigation (e.g. PPE, Workwear, Footwear). Child categories hold the ranges and product groupings beneath it.
_Avoid_: Department, section, menu item

**Product**:
The parent listing that groups shared information: title, description, datasheet, and attributes. Not directly purchasable.
_Avoid_: SKU, item, listing

**ProductVariant**:
The purchasable SKU for a product. Identified by `sku`, with optional size, colour, and overflow options.
_Avoid_: Product (when meaning the purchasable unit), item

**Media**:
An organization-owned uploaded file (image, etc.) with palette metadata extracted at upload time.
_Avoid_: Image, asset, file (unless referring to the raw file)

**Primary category**:
The canonical category link for breadcrumbs and SEO when a product appears in multiple categories.
_Avoid_: Main category, default category

**Primary image**:
The hero image for a product when multiple media items are attached.
_Avoid_: Thumbnail, cover image

## Relationships

- An **Organization** has many **Categories**, **Products**, and **Media**
- A **Category** may have a parent **Category** and many child **Categories**
- A **Catalog division** is a top-level **Category** with no parent; PPE is a **Catalog division** with Gloves, Head and Face, Respiratory, and Fall Arrest as children
- A **Product** belongs to one **Organization** and has many **ProductVariants**
- A **Product** may belong to many **Categories** via product-category links; one link may be marked primary
- A **Product** may have many **Media** items via product-media links; one may be marked primary
- A **ProductVariant** belongs to exactly one **Product**

## Example dialogue

> **Dev:** "The EVOTECH suit appears under Workwear and High Visibility — how do we model that?"
> **Domain expert:** "Create one **Product** for the suit. Link it to both **Categories** via product-category. Mark Workwear as the **Primary category** for breadcrumbs."

> **Dev:** "Where do glove sizes and colours live?"
> **Domain expert:** "On the **ProductVariant**. The parent **Product** holds the shared title and datasheet; each size/colour combination is its own variant SKU."

## Flagged ambiguities

- "Range" (Cut 5, Chemical) is modeled as a **Category**, not a separate entity — resolved for v1.
- Dromex URLs omit the catalog division slug (e.g. `/gloves/cut-5`); our tree includes it (e.g. `/ppe/gloves/cut-5`) — resolved: **Catalog division** is a real parent **Category**.
- Scraped **Media** and datasheet URLs may hotlink the source CDN during import; self-hosting is deferred.
- Crawl uses the staging site for browsing; stored `sourceUrl` and asset URLs are normalized to `dromex.co.za`.
- **ProductVariant SKU policy (Dromex import):** When WooCommerce variation data is incomplete, generate SKUs as `{productCode}-{size}` from the size range on the product page. Map colour from WooCommerce variation attributes when present; otherwise attach the first listed colour to size variants, or `null` when unknown. Resolved for v1 bulk seed.
