import connectDB from '@/lib/db';
import Product from '@/models/product.model';
import ProductDetailClient from './ProductDetailClient';

// ── 1. Dynamic Meta Tags for Link Sharing (WhatsApp, Twitter, LinkedIn) ──
export async function generateMetadata({ params }) {
  const { id } = await params;

  try {
    await connectDB();
    const product = await Product.findById(id).lean();

    if (!product) {
      return {
        title: 'Product Not Found | Zuno',
        description: 'This listing is no longer available.',
      };
    }

    const title = `${product.title} - $${product.price} | Zuno`;
    const description = `${product.category} • Condition: ${product.condition}. ${product.description ? product.description.slice(0, 120) + '...' : 'Available on Zuno.'}`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        images: [
          {
            url: product.imageUrl,
            width: 800,
            height: 800,
            alt: product.title,
          },
        ],
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [product.imageUrl],
      },
    };
  } catch (error) {
    return {
      title: 'Zuno Listing',
    };
  }
}

// ── 2. Render Client Component UI ──
export default async function ProductDetailPage({ params }) {
  const resolvedParams = await params;
  return <ProductDetailClient id={resolvedParams.id} />;
}