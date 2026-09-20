// Run with: npx ts-node prisma/seed-v2-section-types.ts
// Or add to package.json: "v2:seed:sections": "ts-node prisma/seed-v2-section-types.ts"

import { PrismaClient } from '../lib/prisma-v2-client'

const prisma = new PrismaClient()

const SECTION_TYPES = [
  {
    id: 'hero',
    name: 'Hero',
    description: 'Full-width hero with background media, headline, subheadline, and CTA',
    configSchema: {
      type: 'object',
      properties: {
        headline: { type: 'string', minLength: 1, maxLength: 120 },
        subheadline: { type: 'string', maxLength: 200 },
        ctaLabel: { type: 'string', maxLength: 40 },
        ctaUrl: { type: 'string' },
        overlay: { type: 'boolean' },
        textAlign: { type: 'string', enum: ['left', 'center', 'right'] },
      },
      required: ['headline'],
    },
    allowedBindings: ['MEDIA_ASSET', 'COLLECTION'],
    isActive: true,
  },
  {
    id: 'carousel',
    name: 'Carousel',
    description: 'Horizontal scrolling row of product cards or media items',
    configSchema: {
      type: 'object',
      properties: {
        title: { type: 'string', maxLength: 80 },
        subtitle: { type: 'string', maxLength: 160 },
        itemsPerView: { type: 'number', minimum: 2, maximum: 6 },
        showPrices: { type: 'boolean' },
        showBadges: { type: 'boolean' },
        autoplay: { type: 'boolean' },
      },
      required: [],
    },
    allowedBindings: ['PRODUCT', 'COLLECTION'],
    isActive: true,
  },
  {
    id: 'featured-grid',
    name: 'Featured Grid',
    description: 'Grid of featured products with title and optional subtitle',
    configSchema: {
      type: 'object',
      properties: {
        title: { type: 'string', maxLength: 80 },
        subtitle: { type: 'string', maxLength: 160 },
        columns: { type: 'number', enum: [2, 3, 4] },
        showPrices: { type: 'boolean' },
        showBadges: { type: 'boolean' },
      },
      required: [],
    },
    allowedBindings: ['PRODUCT'],
    isActive: true,
  },
  {
    id: 'promo-banner',
    name: 'Promo Banner',
    description: 'Full-width or half-width promotional banner with optional CTA',
    configSchema: {
      type: 'object',
      properties: {
        headline: { type: 'string', minLength: 1, maxLength: 120 },
        subheadline: { type: 'string', maxLength: 200 },
        ctaLabel: { type: 'string', maxLength: 40 },
        ctaUrl: { type: 'string' },
        layout: { type: 'string', enum: ['full', 'half-left', 'half-right'] },
        backgroundColor: { type: 'string', pattern: '^#[0-9a-fA-F]{6}$' },
      },
      required: ['headline'],
    },
    allowedBindings: ['MEDIA_ASSET'],
    isActive: true,
  },
  {
    id: 'collection-highlight',
    name: 'Collection Highlight',
    description: 'Showcase a collection with cover, name, description, and a product preview strip',
    configSchema: {
      type: 'object',
      properties: {
        title: { type: 'string', maxLength: 80 },
        subtitle: { type: 'string', maxLength: 160 },
        ctaLabel: { type: 'string', maxLength: 40 },
        previewCount: { type: 'number', minimum: 3, maximum: 6 },
      },
      required: [],
    },
    allowedBindings: ['COLLECTION', 'MEDIA_ASSET'],
    isActive: true,
  },
]

async function main() {
  console.log('Seeding V2 section types...')
  for (const sectionType of SECTION_TYPES) {
    await prisma.v2SectionType.upsert({
      where: { id: sectionType.id },
      update: {
        name: sectionType.name,
        description: sectionType.description,
        configSchema: sectionType.configSchema,
        allowedBindings: sectionType.allowedBindings as any,
        isActive: sectionType.isActive,
      },
      create: {
        id: sectionType.id,
        name: sectionType.name,
        description: sectionType.description,
        configSchema: sectionType.configSchema,
        allowedBindings: sectionType.allowedBindings as any,
        isActive: sectionType.isActive,
      },
    })
    console.log(`  ✓ ${sectionType.id}`)
  }
  console.log('Done.')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
