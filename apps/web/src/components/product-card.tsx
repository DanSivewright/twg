import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";

export interface ProductCardItem {
  primaryImageUrl: string | null;
  productCode: string | null;
  slug: string;
  title: string;
  uid: string;
}

interface ProductCardProps {
  href: Route;
  product: ProductCardItem;
}

const PLACEHOLDER_IMAGE =
  "https://dromex.co.za/wp-content/uploads/2023/10/home-block-img-02.jpg";

export function ProductCard({ href, product }: ProductCardProps) {
  const imageUrl = product.primaryImageUrl ?? PLACEHOLDER_IMAGE;

  return (
    <Link
      className="group flex flex-col overflow-hidden rounded-lg border bg-card transition-shadow hover:shadow-md"
      href={href}
    >
      <div className="relative aspect-square overflow-hidden bg-muted">
        <Image
          alt={product.title}
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          src={imageUrl}
          unoptimized
        />
      </div>
      <div className="flex flex-1 flex-col gap-1 p-4">
        <h3 className="font-medium text-sm leading-snug group-hover:underline">
          {product.title}
        </h3>
        {product.productCode ? (
          <p className="text-muted-foreground text-xs">{product.productCode}</p>
        ) : null}
      </div>
    </Link>
  );
}
