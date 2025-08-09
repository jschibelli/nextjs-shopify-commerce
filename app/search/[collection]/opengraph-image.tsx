import OpengraphImage from 'components/opengraph-image';
import { getCollection } from 'lib/shopify';

export default async function Image({ params }: { params: Promise<{ collection: string }> }) {
  const { collection } = await params;
  const collectionData = await getCollection(collection);
  const title = collectionData?.seo?.title || collectionData?.title;

  return await OpengraphImage({ title });
}
