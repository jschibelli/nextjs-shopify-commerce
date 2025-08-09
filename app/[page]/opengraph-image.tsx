import OpengraphImage from 'components/opengraph-image';
import { getPage } from 'lib/shopify';

export default async function Image({ params }: { params: Promise<{ page: string }> }) {
  const { page } = await params;
  const pageData = await getPage(page);
  const title = pageData.seo?.title || pageData.title;

  return await OpengraphImage({ title });
}
