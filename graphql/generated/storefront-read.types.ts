export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  JSONObject: { input: Record<string, unknown>; output: Record<string, unknown>; }
};

export type BrandSummary = {
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  slug: Scalars['String']['output'];
};

export type BreadcrumbItem = {
  href: Scalars['String']['output'];
  label: Scalars['String']['output'];
};

export type CategorySummary = {
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  slug: Scalars['String']['output'];
};

export type CollectionPageViewModel = {
  collection: StorefrontCollectionDetail;
  products: Array<ProductCardViewModel>;
  seo: SeoMeta;
};

export type CollectionSummaryViewModel = {
  heroMedia?: Maybe<MediaViewModel>;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  slug: Scalars['String']['output'];
  subtitle?: Maybe<Scalars['String']['output']>;
  type: CollectionType;
};

export enum CollectionType {
  B2B = 'B2B',
  Editorial = 'EDITORIAL',
  Launch = 'LAUNCH',
  Outlet = 'OUTLET',
  Promo = 'PROMO',
  Seasonal = 'SEASONAL'
}

export type HomepageViewModel = {
  sections: Array<RenderedSection>;
  seo: SeoMeta;
  shop: ShopSummary;
};

export type JsonLdBrand = {
  name: Scalars['String']['output'];
  type: Scalars['String']['output'];
};

export type MediaFocalPoint = {
  x: Scalars['Float']['output'];
  y: Scalars['Float']['output'];
};

export type MediaViewModel = {
  altText?: Maybe<Scalars['String']['output']>;
  focalPoint?: Maybe<MediaFocalPoint>;
  height?: Maybe<Scalars['Int']['output']>;
  url: Scalars['String']['output'];
  width?: Maybe<Scalars['Int']['output']>;
};

export enum ProductBadge {
  Bestseller = 'BESTSELLER',
  Featured = 'FEATURED',
  Limited = 'LIMITED',
  New = 'NEW',
  Promo = 'PROMO',
  Seasonal = 'SEASONAL'
}

export type ProductCardViewModel = {
  badges: Array<ProductBadge>;
  brand?: Maybe<BrandSummary>;
  coverMedia?: Maybe<MediaViewModel>;
  id: Scalars['ID']['output'];
  isPurchasable: Scalars['Boolean']['output'];
  priceCents?: Maybe<Scalars['Int']['output']>;
  shortDescription?: Maybe<Scalars['String']['output']>;
  slug: Scalars['String']['output'];
  title: Scalars['String']['output'];
};

export type ProductJsonLd = {
  brand?: Maybe<JsonLdBrand>;
  context: Scalars['String']['output'];
  description?: Maybe<Scalars['String']['output']>;
  image: Array<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  offers: ProductOfferJsonLd;
  type: Scalars['String']['output'];
};

export type ProductOfferJsonLd = {
  availability: Scalars['String']['output'];
  price?: Maybe<Scalars['Float']['output']>;
  priceCurrency: Scalars['String']['output'];
  type: Scalars['String']['output'];
};

export type ProductPageViewModel = {
  breadcrumbs: Array<BreadcrumbItem>;
  product: StorefrontProductDetail;
  relatedCollections: Array<CollectionSummaryViewModel>;
  seo: SeoMeta;
};

export type RenderedSection = {
  /** Slot name -> resolved entities (product cards, collection, media, or manual JSON) */
  bindings: Scalars['JSONObject']['output'];
  config: Scalars['JSONObject']['output'];
  id: Scalars['ID']['output'];
  /** Section type id, e.g. hero, carousel, featured-grid */
  type: Scalars['String']['output'];
};

export type SeoMeta = {
  canonicalUrl: Scalars['String']['output'];
  description?: Maybe<Scalars['String']['output']>;
  ogImage?: Maybe<Scalars['String']['output']>;
  title: Scalars['String']['output'];
};

export type ShopSummary = {
  address?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  imageUrl?: Maybe<Scalars['String']['output']>;
  mapUrl?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  slug: Scalars['String']['output'];
  whatsapp?: Maybe<Scalars['String']['output']>;
};

export type StorefrontCollectionDetail = {
  description?: Maybe<Scalars['String']['output']>;
  endAt?: Maybe<Scalars['String']['output']>;
  heroMedia?: Maybe<MediaViewModel>;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  slug: Scalars['String']['output'];
  startAt?: Maybe<Scalars['String']['output']>;
  subtitle?: Maybe<Scalars['String']['output']>;
  type: CollectionType;
};

export type StorefrontProductDetail = {
  badges: Array<ProductBadge>;
  brand?: Maybe<BrandSummary>;
  category?: Maybe<CategorySummary>;
  highlights: Array<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  isPurchasable: Scalars['Boolean']['output'];
  longDescription?: Maybe<Scalars['String']['output']>;
  media: Array<StorefrontProductMedia>;
  priceCents?: Maybe<Scalars['Int']['output']>;
  shortDescription?: Maybe<Scalars['String']['output']>;
  slug: Scalars['String']['output'];
  structuredData: ProductJsonLd;
  title: Scalars['String']['output'];
  variants: Array<VariantViewModel>;
};

export type StorefrontProductMedia = {
  altText?: Maybe<Scalars['String']['output']>;
  focalPoint?: Maybe<MediaFocalPoint>;
  height?: Maybe<Scalars['Int']['output']>;
  url: Scalars['String']['output'];
  width?: Maybe<Scalars['Int']['output']>;
};

export type StorefrontQuery = {
  /** Collection listing — GET .../frontend/{shopSlug}/collections/{slug} */
  collectionPage?: Maybe<CollectionPageViewModel>;
  /** Homepage with composed sections — GET .../frontend/{shopSlug}/homepage */
  homepage?: Maybe<HomepageViewModel>;
  /** Product detail — GET .../frontend/{shopSlug}/products/{slug} */
  productPage?: Maybe<ProductPageViewModel>;
};


export type StorefrontQueryCollectionPageArgs = {
  collectionSlug: Scalars['String']['input'];
  shopSlug: Scalars['String']['input'];
};


export type StorefrontQueryHomepageArgs = {
  shopSlug: Scalars['String']['input'];
};


export type StorefrontQueryProductPageArgs = {
  productSlug: Scalars['String']['input'];
  shopSlug: Scalars['String']['input'];
};

export type VariantViewModel = {
  attributes: Scalars['JSONObject']['output'];
  coverMedia?: Maybe<MediaViewModel>;
  id: Scalars['ID']['output'];
  isAvailable: Scalars['Boolean']['output'];
  label: Scalars['String']['output'];
  priceCents?: Maybe<Scalars['Int']['output']>;
  sku?: Maybe<Scalars['String']['output']>;
};
