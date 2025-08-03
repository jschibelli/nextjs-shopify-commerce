export type SortFilterItem = {
  title: string;
  slug: string | null;
  sortKey: 'RELEVANCE' | 'BEST_SELLING' | 'CREATED_AT' | 'PRICE';
  reverse: boolean;
};

export const defaultSort: SortFilterItem = {
  title: 'Relevance',
  slug: null,
  sortKey: 'RELEVANCE',
  reverse: false
};

export const sorting: SortFilterItem[] = [
  defaultSort,
  { title: 'Trending', slug: 'trending-desc', sortKey: 'BEST_SELLING', reverse: false }, // asc
  { title: 'Latest arrivals', slug: 'latest-desc', sortKey: 'CREATED_AT', reverse: true },
  { title: 'Price: Low to high', slug: 'price-asc', sortKey: 'PRICE', reverse: false }, // asc
  { title: 'Price: High to low', slug: 'price-desc', sortKey: 'PRICE', reverse: true }
];

export const TAGS = {
  collections: 'collections',
  products: 'products',
  cart: 'cart'
};

export const HIDDEN_PRODUCT_TAG = 'nextjs-frontend-hidden';
export const DEFAULT_OPTION = 'Default Title';
export const SHOPIFY_GRAPHQL_API_ENDPOINT = '/api/2023-01/graphql.json';

// Customer Account API Constants
export const SHOPIFY_CUSTOMER_ACCOUNT_API_ENDPOINT = '/api/2023-01/graphql.json';
export const SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID = process.env.SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID;
export const SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_SECRET = process.env.SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_SECRET;
export const SHOPIFY_CUSTOMER_ACCOUNT_AUTH_ENDPOINT = process.env.SHOPIFY_CUSTOMER_ACCOUNT_AUTH_ENDPOINT;
export const SHOPIFY_CUSTOMER_ACCOUNT_TOKEN_ENDPOINT = process.env.SHOPIFY_CUSTOMER_ACCOUNT_TOKEN_ENDPOINT;
export const SHOPIFY_CUSTOMER_ACCOUNT_LOGOUT_ENDPOINT = process.env.SHOPIFY_CUSTOMER_ACCOUNT_LOGOUT_ENDPOINT;
export const SHOPIFY_CUSTOMER_ACCOUNT_REDIRECT_URI = process.env.SHOPIFY_CUSTOMER_ACCOUNT_REDIRECT_URI || 'http://localhost:3000/account/auth/callback';
