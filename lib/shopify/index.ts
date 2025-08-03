import {
    HIDDEN_PRODUCT_TAG,
    SHOPIFY_GRAPHQL_API_ENDPOINT,
    TAGS
} from 'lib/constants';
import { isShopifyError } from 'lib/type-guards';
import { ensureStartsWith } from 'lib/utils';
import {
    unstable_cacheLife as cacheLife,
    unstable_cacheTag as cacheTag,
    revalidateTag
} from 'next/cache';
import { cookies, headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import {
    addToCartMutation,
    createCartMutation,
    editCartItemsMutation,
    removeFromCartMutation
} from './mutations/cart';
import {
    customerAccessTokenCreateMutation,
    customerAccessTokenDeleteMutation,
    customerCreateMutation,
    customerRecoverMutation,
    customerUpdateMutation
} from './mutations/customer';
import { getCartQuery } from './queries/cart';
import {
    getCollectionProductsQuery,
    getCollectionQuery,
    getCollectionsQuery
} from './queries/collection';
import { getCustomerQuery } from './queries/customer';
import { getMenuQuery } from './queries/menu';
import { getPageQuery, getPagesQuery } from './queries/page';
import {
    getProductQuery,
    getProductRecommendationsQuery,
    getProductsQuery
} from './queries/product';
import {
    Cart,
    Collection,
    Connection,
    Customer,
    CustomerAccessToken,
    Image,
    Menu,
    Page,
    Product,
    ShopifyAddToCartOperation,
    ShopifyCart,
    ShopifyCartOperation,
    ShopifyCollection,
    ShopifyCollectionOperation,
    ShopifyCollectionProductsOperation,
    ShopifyCollectionsOperation,
    ShopifyCreateCartOperation,
    ShopifyCustomerAccessTokenCreateOperation,
    ShopifyCustomerAccessTokenDeleteOperation,
    ShopifyCustomerCreateOperation,
    ShopifyCustomerOperation,
    ShopifyCustomerRecoverOperation,
    ShopifyCustomerUpdateOperation,
    ShopifyMenuOperation,
    ShopifyPageOperation,
    ShopifyPagesOperation,
    ShopifyProduct,
    ShopifyProductOperation,
    ShopifyProductRecommendationsOperation,
    ShopifyProductsOperation,
    ShopifyRemoveFromCartOperation,
    ShopifyUpdateCartOperation
} from './types';

const domain = process.env.SHOPIFY_STORE_DOMAIN
  ? ensureStartsWith(process.env.SHOPIFY_STORE_DOMAIN, 'https://')
  : '';
const endpoint = `${domain}${SHOPIFY_GRAPHQL_API_ENDPOINT}`;
const key = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN!;

type ExtractVariables<T> = T extends { variables: object }
  ? T['variables']
  : never;

export async function shopifyFetch<T>({
  headers,
  query,
  variables
}: {
  headers?: HeadersInit;
  query: string;
  variables?: ExtractVariables<T>;
}): Promise<{ status: number; body: T } | never> {
  try {
    const result = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': key,
        ...headers
      },
      body: JSON.stringify({
        ...(query && { query }),
        ...(variables && { variables })
      })
    });

    const body = await result.json();

    if (body.errors) {
      throw body.errors[0];
    }

    return {
      status: result.status,
      body
    };
  } catch (e) {
    if (isShopifyError(e)) {
      throw {
        cause: e.cause?.toString() || 'unknown',
        status: e.status || 500,
        message: e.message,
        query
      };
    }

    throw {
      error: e,
      query
    };
  }
}

const removeEdgesAndNodes = <T>(array: Connection<T>): T[] => {
  return array.edges.map(({ node }) => node);
};

// Helper function to reshape customer data
const reshapeCustomer = (customer: any): Customer => {
  return {
    id: customer.id || '',
    firstName: customer.firstName || undefined,
    lastName: customer.lastName || undefined,
    email: customer.email || '',
    phone: customer.phone || undefined,
    acceptsMarketing: customer.acceptsMarketing || false,
    acceptsSMS: customer.acceptsSMS || customer.sms_marketing_consent?.state === 'subscribed' || false,
    createdAt: customer.createdAt || new Date().toISOString(),
    updatedAt: customer.updatedAt || new Date().toISOString(),
    defaultAddress: customer.defaultAddress || undefined,
    addresses: customer.addresses ? removeEdgesAndNodes(customer.addresses) : [],
    orders: customer.orders ? removeEdgesAndNodes(customer.orders) : []
  };
};

const reshapeCart = (cart: ShopifyCart): Cart => {
  if (!cart.cost?.totalTaxAmount) {
    cart.cost.totalTaxAmount = {
      amount: '0.0',
      currencyCode: cart.cost.totalAmount.currencyCode
    };
  }

  return {
    ...cart,
    lines: removeEdgesAndNodes(cart.lines)
  };
};

const reshapeCollection = (
  collection: ShopifyCollection
): Collection | undefined => {
  if (!collection) {
    return undefined;
  }

  return {
    ...collection,
    path: `/search/${collection.handle}`
  };
};

const reshapeCollections = (collections: ShopifyCollection[]) => {
  const reshapedCollections = [];

  for (const collection of collections) {
    if (collection) {
      const reshapedCollection = reshapeCollection(collection);

      if (reshapedCollection) {
        reshapedCollections.push(reshapedCollection);
      }
    }
  }

  return reshapedCollections;
};

const reshapeImages = (images: Connection<Image>, productTitle: string) => {
  const flattened = removeEdgesAndNodes(images);

  return flattened.map((image) => {
    const filename = image.url.match(/.*\/(.*)\..*/)?.[1];
    return {
      ...image,
      altText: image.altText || `${productTitle} - ${filename}`
    };
  });
};

const reshapeProduct = (
  product: ShopifyProduct,
  filterHiddenProducts: boolean = true
) => {
  if (
    !product ||
    (filterHiddenProducts && product.tags.includes(HIDDEN_PRODUCT_TAG))
  ) {
    return undefined;
  }

  const { images, variants, ...rest } = product;

  return {
    ...rest,
    images: reshapeImages(images, product.title),
    variants: removeEdgesAndNodes(variants)
  };
};

const reshapeProducts = (products: ShopifyProduct[]) => {
  const reshapedProducts = [];

  for (const product of products) {
    if (product) {
      const reshapedProduct = reshapeProduct(product);

      if (reshapedProduct) {
        reshapedProducts.push(reshapedProduct);
      }
    }
  }

  return reshapedProducts;
};

export async function createCart(): Promise<Cart> {
  const res = await shopifyFetch<ShopifyCreateCartOperation>({
    query: createCartMutation
  });

  return reshapeCart(res.body.data.cartCreate.cart);
}

export async function addToCart(
  lines: { merchandiseId: string; quantity: number }[]
): Promise<Cart> {
  const cartId = (await cookies()).get('cartId')?.value!;
  const res = await shopifyFetch<ShopifyAddToCartOperation>({
    query: addToCartMutation,
    variables: {
      cartId,
      lines
    }
  });
  return reshapeCart(res.body.data.cartLinesAdd.cart);
}

export async function removeFromCart(lineIds: string[]): Promise<Cart> {
  const cartId = (await cookies()).get('cartId')?.value!;
  const res = await shopifyFetch<ShopifyRemoveFromCartOperation>({
    query: removeFromCartMutation,
    variables: {
      cartId,
      lineIds
    }
  });

  return reshapeCart(res.body.data.cartLinesRemove.cart);
}

export async function updateCart(
  lines: { id: string; merchandiseId: string; quantity: number }[]
): Promise<Cart> {
  const cartId = (await cookies()).get('cartId')?.value!;
  const res = await shopifyFetch<ShopifyUpdateCartOperation>({
    query: editCartItemsMutation,
    variables: {
      cartId,
      lines
    }
  });

  return reshapeCart(res.body.data.cartLinesUpdate.cart);
}

export async function getCart(): Promise<Cart | undefined> {
  const cartId = (await cookies()).get('cartId')?.value;

  if (!cartId) {
    return undefined;
  }

  const res = await shopifyFetch<ShopifyCartOperation>({
    query: getCartQuery,
    variables: { cartId }
  });

  // Old carts becomes `null` when you checkout.
  if (!res.body.data.cart) {
    return undefined;
  }

  return reshapeCart(res.body.data.cart);
}

export async function getCollection(
  handle: string
): Promise<Collection | undefined> {
  'use cache';
  cacheTag(TAGS.collections);
  cacheLife('days');

  const res = await shopifyFetch<ShopifyCollectionOperation>({
    query: getCollectionQuery,
    variables: {
      handle
    }
  });

  return reshapeCollection(res.body.data.collection);
}

export async function getCollectionProducts({
  collection,
  reverse,
  sortKey
}: {
  collection: string;
  reverse?: boolean;
  sortKey?: string;
}): Promise<Product[]> {
  'use cache';
  cacheTag(TAGS.collections);
  cacheLife('days');

  const res = await shopifyFetch<ShopifyCollectionProductsOperation>({
    query: getCollectionProductsQuery,
    variables: {
      handle: collection,
      reverse,
      sortKey: sortKey === 'CREATED_AT' ? 'CREATED' : sortKey
    }
  });

  if (!res.body.data.collection) {
    console.log(`No collection found for \`${collection}\``);
    return [];
  }

  return reshapeProducts(
    removeEdgesAndNodes(res.body.data.collection.products)
  );
}

export async function getCollections(): Promise<Collection[]> {
  'use cache';
  cacheTag(TAGS.collections);
  cacheLife('days');

  const res = await shopifyFetch<ShopifyCollectionsOperation>({
    query: getCollectionsQuery
  });
  const shopifyCollections = removeEdgesAndNodes(res.body?.data?.collections);
  const collections = [
    {
      handle: '',
      title: 'All',
      description: 'All products',
      seo: {
        title: 'All',
        description: 'All products'
      },
      path: '/search',
      updatedAt: new Date().toISOString()
    },
    // Filter out the `hidden` collections.
    // Collections that start with `hidden-*` need to be hidden on the search page.
    ...reshapeCollections(shopifyCollections).filter(
      (collection) => !collection.handle.startsWith('hidden')
    )
  ];

  return collections;
}

export async function getMenu(handle: string): Promise<Menu[]> {
  'use cache';
  cacheTag(TAGS.collections);
  cacheLife('days');

  const res = await shopifyFetch<ShopifyMenuOperation>({
    query: getMenuQuery,
    variables: {
      handle
    }
  });

  return (
    res.body?.data?.menu?.items.map((item: { title: string; url: string }) => ({
      title: item.title,
      path: item.url
        .replace(domain, '')
        .replace('/collections', '/search')
        .replace('/pages', '')
    })) || []
  );
}

export async function getPage(handle: string): Promise<Page> {
  const res = await shopifyFetch<ShopifyPageOperation>({
    query: getPageQuery,
    variables: { handle }
  });

  return res.body.data.pageByHandle;
}

export async function getPages(): Promise<Page[]> {
  const res = await shopifyFetch<ShopifyPagesOperation>({
    query: getPagesQuery
  });

  return removeEdgesAndNodes(res.body.data.pages);
}

export async function getProduct(handle: string): Promise<Product | undefined> {
  'use cache';
  cacheTag(TAGS.products);
  cacheLife('days');

  const res = await shopifyFetch<ShopifyProductOperation>({
    query: getProductQuery,
    variables: {
      handle
    }
  });

  return reshapeProduct(res.body.data.product, false);
}

export async function getProductRecommendations(
  productId: string
): Promise<Product[]> {
  'use cache';
  cacheTag(TAGS.products);
  cacheLife('days');

  const res = await shopifyFetch<ShopifyProductRecommendationsOperation>({
    query: getProductRecommendationsQuery,
    variables: {
      productId
    }
  });

  return reshapeProducts(res.body.data.productRecommendations);
}

export async function getProducts({
  query,
  reverse,
  sortKey
}: {
  query?: string;
  reverse?: boolean;
  sortKey?: string;
}): Promise<Product[]> {
  'use cache';
  cacheTag(TAGS.products);
  cacheLife('days');

  const res = await shopifyFetch<ShopifyProductsOperation>({
    query: getProductsQuery,
    variables: {
      query,
      reverse,
      sortKey
    }
  });

  return reshapeProducts(removeEdgesAndNodes(res.body.data.products));
}

// This is called from `app/api/revalidate.ts` so providers can control revalidation logic.
export async function revalidate(req: NextRequest): Promise<NextResponse> {
  // We always need to respond with a 200 status code to Shopify,
  // otherwise it will continue to retry the request.
  const collectionWebhooks = [
    'collections/create',
    'collections/delete',
    'collections/update'
  ];
  const productWebhooks = [
    'products/create',
    'products/delete',
    'products/update'
  ];
  const topic = (await headers()).get('x-shopify-topic') || 'unknown';
  const secret = req.nextUrl.searchParams.get('secret');
  const isCollectionUpdate = collectionWebhooks.includes(topic);
  const isProductUpdate = productWebhooks.includes(topic);

  if (!secret || secret !== process.env.SHOPIFY_REVALIDATION_SECRET) {
    console.error('Invalid revalidation secret.');
    return NextResponse.json({ status: 401 });
  }

  if (!isCollectionUpdate && !isProductUpdate) {
    // We don't need to revalidate anything for any other topics.
    return NextResponse.json({ status: 200 });
  }

  if (isCollectionUpdate) {
    revalidateTag(TAGS.collections);
  }

  if (isProductUpdate) {
    revalidateTag(TAGS.products);
  }

  return NextResponse.json({ status: 200, revalidated: true, now: Date.now() });
}

// Customer management functions
export async function createCustomer({
  firstName,
  lastName,
  email,
  password,
  phone,
  acceptsMarketing
}: {
  firstName?: string;
  lastName?: string;
  email: string;
  password: string;
  phone?: string;
  acceptsMarketing?: boolean;
}): Promise<Customer> {
  const res = await shopifyFetch<ShopifyCustomerCreateOperation>({
    query: customerCreateMutation,
    variables: {
      input: {
        firstName,
        lastName,
        email,
        password,
        phone,
        acceptsMarketing
      }
    }
  });

  if (res.body.data.customerCreate.customerUserErrors.length > 0) {
    throw new Error(res.body.data.customerCreate.customerUserErrors[0]?.message || 'Unknown error');
  }

  const createdCustomer = res.body.data.customerCreate.customer;
  if (!createdCustomer) {
    throw new Error('Failed to create customer');
  }

  return reshapeCustomer(createdCustomer);
}

export async function createCustomerAccessToken({
  email,
  password
}: {
  email: string;
  password: string;
}): Promise<CustomerAccessToken> {
  const res = await shopifyFetch<ShopifyCustomerAccessTokenCreateOperation>({
    query: customerAccessTokenCreateMutation,
    variables: {
      input: {
        email,
        password
      }
    }
  });

  if (res.body.data.customerAccessTokenCreate.customerUserErrors.length > 0) {
    throw new Error(res.body.data.customerAccessTokenCreate.customerUserErrors[0]?.message || 'Unknown error');
  }

  const customerAccessToken = res.body.data.customerAccessTokenCreate.customerAccessToken;
  if (!customerAccessToken) {
    throw new Error('Failed to create customer access token');
  }

  return customerAccessToken;
}

export async function deleteCustomerAccessToken(
  customerAccessToken: string
): Promise<void> {
  await shopifyFetch<ShopifyCustomerAccessTokenDeleteOperation>({
    query: customerAccessTokenDeleteMutation,
    variables: {
      customerAccessToken
    }
  });
}

export async function getCustomer(
  customerAccessToken: string
): Promise<Customer> {
  const res = await shopifyFetch<ShopifyCustomerOperation>({
    query: getCustomerQuery,
    variables: {
      customerAccessToken
    }
  });

  const customer = res.body.data.customer;
  if (!customer) {
    throw new Error('Customer not found');
  }
  return reshapeCustomer(customer);
}

export async function updateCustomer({
  customer,
  customerAccessToken
}: {
  customer: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    acceptsMarketing?: boolean;
  };
  customerAccessToken: string;
}): Promise<Customer> {
  const res = await shopifyFetch<ShopifyCustomerUpdateOperation>({
    query: customerUpdateMutation,
    variables: {
      customer,
      customerAccessToken
    }
  });

  if (res.body.data.customerUpdate.customerUserErrors.length > 0) {
    throw new Error(res.body.data.customerUpdate.customerUserErrors[0]?.message || 'Unknown error');
  }

  const updatedCustomer = res.body.data.customerUpdate.customer;
  if (!updatedCustomer) {
    throw new Error('Failed to update customer');
  }

  return reshapeCustomer(updatedCustomer);
}

export async function recoverCustomer(email: string): Promise<void> {
  const res = await shopifyFetch<ShopifyCustomerRecoverOperation>({
    query: customerRecoverMutation,
    variables: {
      email
    }
  });

  if (res.body.data.customerRecover.customerUserErrors.length > 0) {
    throw new Error(res.body.data.customerRecover.customerUserErrors[0]?.message || 'Unknown error');
  }
}

// Admin API functions for customer creation
export async function createCustomerWithAdminAPI({
  firstName,
  lastName,
  email,
  password,
  phone,
  acceptsMarketing,
  acceptsSMS
}: {
  firstName?: string;
  lastName?: string;
  email: string;
  password: string;
  phone?: string;
  acceptsMarketing?: boolean;
  acceptsSMS?: boolean;
}): Promise<Customer> {
  const domain = process.env.SHOPIFY_STORE_DOMAIN;
  const adminKey = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;

  if (!domain || !adminKey) {
    throw new Error('SHOPIFY_STORE_DOMAIN and SHOPIFY_ADMIN_ACCESS_TOKEN are required');
  }

  const baseUrl = domain.startsWith('https://') ? domain : `https://${domain}`;
  const adminEndpoint = `${baseUrl}/admin/api/2023-01/customers.json`;

  const customerData = {
    customer: {
      first_name: firstName,
      last_name: lastName,
      email,
      password,
      password_confirmation: password, // Required by Shopify
      phone: phone ? phone.replace(/\D/g, '') : undefined, // Clean phone number and make optional
      accepts_marketing: acceptsMarketing,
      accepts_marketing_updated_at: acceptsMarketing ? new Date().toISOString() : undefined,
      // SMS marketing consent - only set if SMS marketing is enabled in the store
      // For now, we'll skip this to avoid potential errors
      // sms_marketing_consent: acceptsSMS ? {
      //   state: "subscribed",
      //   opt_in_level: "single_opt_in",
      //   consent_updated_at: new Date().toISOString(),
      //   consent_collected_from: "SHOPIFY"
      // } : undefined,
      verified_email: true
    }
  };

  console.log('Creating customer with Admin API:', {
    endpoint: adminEndpoint,
    customerData: { ...customerData, customer: { ...customerData.customer, password: '***' } }
  });

  const response = await fetch(adminEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': adminKey
    },
    body: JSON.stringify(customerData)
  });

  console.log('Admin API response status:', response.status);

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Admin API error response:', errorText);
    
    // Handle specific error cases
    if (response.status === 422) {
      try {
        const errorData = JSON.parse(errorText);
        if (errorData.errors && errorData.errors.email) {
          throw new Error('An account with this email already exists');
        }
        if (errorData.errors && errorData.errors.password) {
          throw new Error('Password must be at least 5 characters long');
        }
        throw new Error(errorData.errors || 'Validation error');
      } catch (parseError) {
        throw new Error(`Customer creation failed: ${errorText}`);
      }
    }
    
    throw new Error(`Failed to create customer: ${response.status} - ${errorText}`);
  }

  const result = await response.json();
  const customer = result.customer;

  if (!customer) {
    throw new Error('No customer data returned from Shopify');
  }

  console.log('Customer created successfully:', customer.id);

  return {
    id: customer.id.toString(),
    firstName: customer.first_name || undefined,
    lastName: customer.last_name || undefined,
    email: customer.email,
    phone: customer.phone || undefined,
    acceptsMarketing: customer.accepts_marketing || false,
    acceptsSMS: customer.sms_marketing_consent?.state === 'subscribed' || false,
    createdAt: customer.created_at,
    updatedAt: customer.updated_at,
    defaultAddress: undefined,
    addresses: [],
    orders: []
  };
}

// Helper function to extract numeric ID from GraphQL GID
function extractNumericId(gid: string): string {
  if (gid.startsWith('gid://')) {
    return gid.split('/').pop() || gid;
  }
  return gid;
}

// Update customer preferences with Admin API
export async function updateCustomerWithAdminAPI({
  customerId,
  preferences
}: {
  customerId: string;
  preferences: {
    acceptsMarketing?: boolean;
    acceptsSMS?: boolean;
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
  };
}): Promise<Customer> {
  const domain = process.env.SHOPIFY_STORE_DOMAIN;
  const adminKey = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;

  if (!domain || !adminKey) {
    throw new Error('SHOPIFY_STORE_DOMAIN and SHOPIFY_ADMIN_ACCESS_TOKEN are required');
  }

  const baseUrl = domain.startsWith('https://') ? domain : `https://${domain}`;
  const numericCustomerId = extractNumericId(customerId);
  const adminEndpoint = `${baseUrl}/admin/api/2023-01/customers/${numericCustomerId}.json`;

  const updateData: any = {
    customer: {}
  };

  if (preferences.acceptsMarketing !== undefined) {
    updateData.customer.accepts_marketing = preferences.acceptsMarketing;
  }

  if (preferences.acceptsSMS !== undefined) {
    // Only update SMS consent if the store has SMS marketing enabled
    // For now, we'll skip SMS consent updates to avoid 406 errors
    // This can be enabled once SMS marketing is properly configured in Shopify
    console.log('SMS consent update skipped - requires SMS marketing setup in Shopify');
  }

  if (preferences.firstName !== undefined) {
    updateData.customer.first_name = preferences.firstName;
  }

  if (preferences.lastName !== undefined) {
    updateData.customer.last_name = preferences.lastName;
  }

  if (preferences.email !== undefined) {
    updateData.customer.email = preferences.email;
  }

  if (preferences.phone !== undefined) {
    updateData.customer.phone = preferences.phone;
  }

  // Only proceed if we have actual data to update
  if (Object.keys(updateData.customer).length === 0) {
    console.log('No customer data to update');
    // Return a mock customer object since we're not actually updating
    return {
      id: customerId,
      firstName: undefined,
      lastName: undefined,
      email: '',
      phone: undefined,
      acceptsMarketing: preferences.acceptsMarketing || false,
      acceptsSMS: preferences.acceptsSMS || false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      defaultAddress: undefined,
      addresses: [],
      orders: []
    };
  }

  console.log('Updating customer with Admin API:', {
    endpoint: adminEndpoint,
    updateData,
    customerId: customerId,
    numericCustomerId: numericCustomerId
  });

  const response = await fetch(adminEndpoint, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': adminKey
    },
    body: JSON.stringify(updateData)
  });

  console.log('Admin API update response status:', response.status);

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Admin API update error response:', errorText);
    throw new Error(`Failed to update customer: ${response.status} - ${errorText}`);
  }

  const result = await response.json();
  const customer = result.customer;

  if (!customer) {
    throw new Error('No customer data returned from Shopify');
  }

  console.log('Customer updated successfully:', customer.id);

  return {
    id: customer.id.toString(),
    firstName: customer.first_name || undefined,
    lastName: customer.last_name || undefined,
    email: customer.email,
    phone: customer.phone || undefined,
    acceptsMarketing: customer.accepts_marketing || false,
    acceptsSMS: customer.sms_marketing_consent?.state === 'subscribed' || false,
    createdAt: customer.created_at,
    updatedAt: customer.updated_at,
    defaultAddress: undefined,
    addresses: [],
    orders: []
  };
}

// Update customer password with Admin API
export async function updateCustomerPasswordWithAdminAPI({
  customerId,
  currentPassword,
  newPassword
}: {
  customerId: string;
  currentPassword: string;
  newPassword: string;
}): Promise<void> {
  const domain = process.env.SHOPIFY_STORE_DOMAIN;
  const adminKey = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;

  if (!domain || !adminKey) {
    throw new Error('SHOPIFY_STORE_DOMAIN and SHOPIFY_ADMIN_ACCESS_TOKEN are required');
  }

  const baseUrl = domain.startsWith('https://') ? domain : `https://${domain}`;
  const numericCustomerId = extractNumericId(customerId);
  const adminEndpoint = `${baseUrl}/admin/api/2023-01/customers/${numericCustomerId}.json`;

  const updateData = {
    customer: {
      password: newPassword,
      password_confirmation: newPassword
    }
  };

  console.log('Updating customer password with Admin API:', {
    endpoint: adminEndpoint,
    customerId: numericCustomerId
  });

  const response = await fetch(adminEndpoint, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': adminKey
    },
    body: JSON.stringify(updateData)
  });

  console.log('Admin API password update response status:', response.status);

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Admin API password update error response:', errorText);
    
    // Handle specific error cases
    if (response.status === 422) {
      try {
        const errorData = JSON.parse(errorText);
        if (errorData.errors && errorData.errors.password) {
          throw new Error('Password is too weak or invalid');
        }
        throw new Error(errorData.errors || 'Validation error');
      } catch (parseError) {
        throw new Error(`Password update failed: ${errorText}`);
      }
    }
    
    throw new Error(`Failed to update password: ${response.status} - ${errorText}`);
  }

  console.log('Customer password updated successfully:', numericCustomerId);
}

export async function createCustomerAddressWithAdminAPI({
  customerId,
  address
}: {
  customerId: string;
  address: {
    firstName: string;
    lastName: string;
    company?: string;
    address1: string;
    address2?: string;
    city: string;
    province: string;
    country: string;
    zip: string;
    phone?: string;
  };
}): Promise<any> {
  const domain = process.env.SHOPIFY_STORE_DOMAIN;
  const adminKey = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;

  if (!domain || !adminKey) {
    throw new Error('SHOPIFY_STORE_DOMAIN and SHOPIFY_ADMIN_ACCESS_TOKEN are required');
  }

  const numericCustomerId = extractNumericId(customerId);
  const baseUrl = domain.startsWith('https://') ? domain : `https://${domain}`;
  const endpoint = `${baseUrl}/admin/api/2023-01/customers/${numericCustomerId}/addresses.json`;

  console.log('Creating address with Admin API:', {
    endpoint,
    customerId: numericCustomerId,
    addressData: address
  });

  const addressData = {
    address: {
      first_name: address.firstName,
      last_name: address.lastName,
      company: address.company,
      address1: address.address1,
      address2: address.address2,
      city: address.city,
      province: address.province,
      country: address.country,
      zip: address.zip,
      phone: address.phone
    }
  };

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': adminKey
    },
    body: JSON.stringify(addressData)
  });

  console.log('Shopify Admin API response status:', response.status);

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Shopify Admin API error:', response.status, errorText);
    throw new Error(`Failed to create address: ${response.status} - ${errorText}`);
  }

  const result = await response.json();
  console.log('Shopify Admin API success response:', result);
  return result.address;
}

export async function updateCustomerAddressWithAdminAPI({
  customerId,
  addressId,
  address
}: {
  customerId: string;
  addressId: string;
  address: {
    firstName: string;
    lastName: string;
    company?: string;
    address1: string;
    address2?: string;
    city: string;
    province: string;
    country: string;
    zip: string;
    phone?: string;
  };
}): Promise<any> {
  const domain = process.env.SHOPIFY_STORE_DOMAIN;
  const adminKey = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;

  if (!domain || !adminKey) {
    throw new Error('SHOPIFY_STORE_DOMAIN and SHOPIFY_ADMIN_ACCESS_TOKEN are required');
  }

  const numericCustomerId = extractNumericId(customerId);
  const numericAddressId = extractNumericId(addressId);
  const baseUrl = domain.startsWith('https://') ? domain : `https://${domain}`;
  const endpoint = `${baseUrl}/admin/api/2023-01/customers/${numericCustomerId}/addresses/${numericAddressId}.json`;

  const addressData = {
    address: {
      first_name: address.firstName,
      last_name: address.lastName,
      company: address.company,
      address1: address.address1,
      address2: address.address2,
      city: address.city,
      province: address.province,
      country: address.country,
      zip: address.zip,
      phone: address.phone
    }
  };

  const response = await fetch(endpoint, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': adminKey
    },
    body: JSON.stringify(addressData)
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Shopify Admin API error:', response.status, errorText);
    throw new Error(`Failed to update address: ${response.status} - ${errorText}`);
  }

  const result = await response.json();
  return result.address;
}

export async function deleteCustomerAddressWithAdminAPI({
  customerId,
  addressId
}: {
  customerId: string;
  addressId: string;
}): Promise<void> {
  const domain = process.env.SHOPIFY_STORE_DOMAIN;
  const adminKey = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;

  if (!domain || !adminKey) {
    throw new Error('SHOPIFY_STORE_DOMAIN and SHOPIFY_ADMIN_ACCESS_TOKEN are required');
  }

  const numericCustomerId = extractNumericId(customerId);
  const numericAddressId = extractNumericId(addressId);
  const baseUrl = domain.startsWith('https://') ? domain : `https://${domain}`;
  const endpoint = `${baseUrl}/admin/api/2023-01/customers/${numericCustomerId}/addresses/${numericAddressId}.json`;

  const response = await fetch(endpoint, {
    method: 'DELETE',
    headers: {
      'X-Shopify-Access-Token': adminKey
    }
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Shopify Admin API error:', response.status, errorText);
    throw new Error(`Failed to delete address: ${response.status} - ${errorText}`);
  }
}

export async function getCustomerWithAdminAPI(customerId: string): Promise<any> {
  const domain = process.env.SHOPIFY_STORE_DOMAIN;
  const adminKey = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;

  if (!domain || !adminKey) {
    throw new Error('SHOPIFY_STORE_DOMAIN and SHOPIFY_ADMIN_ACCESS_TOKEN are required');
  }

  const numericCustomerId = extractNumericId(customerId);
  const baseUrl = domain.startsWith('https://') ? domain : `https://${domain}`;
  const endpoint = `${baseUrl}/admin/api/2023-01/customers/${numericCustomerId}.json`;

  const response = await fetch(endpoint, {
    headers: {
      'X-Shopify-Access-Token': adminKey
    }
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Shopify Admin API error:', response.status, errorText);
    throw new Error(`Failed to get customer: ${response.status} - ${errorText}`);
  }

  const result = await response.json();
  return result.customer;
}

export async function setDefaultCustomerAddressWithAdminAPI({
  customerId,
  addressId
}: {
  customerId: string;
  addressId: string;
}): Promise<void> {
  const domain = process.env.SHOPIFY_STORE_DOMAIN;
  const adminKey = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;

  if (!domain || !adminKey) {
    throw new Error('SHOPIFY_STORE_DOMAIN and SHOPIFY_ADMIN_ACCESS_TOKEN are required');
  }

  const numericCustomerId = extractNumericId(customerId);
  const numericAddressId = extractNumericId(addressId);
  const baseUrl = domain.startsWith('https://') ? domain : `https://${domain}`;
  const endpoint = `${baseUrl}/admin/api/2023-01/customers/${numericCustomerId}.json`;

  const customerData = {
    customer: {
      id: numericCustomerId,
      default_address_id: numericAddressId
    }
  };

  const response = await fetch(endpoint, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': adminKey
    },
    body: JSON.stringify(customerData)
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Shopify Admin API error:', response.status, errorText);
    throw new Error(`Failed to set default address: ${response.status} - ${errorText}`);
  }
}

export async function deleteCustomerWithAdminAPI(customerId: string): Promise<void> {
  const domain = process.env.SHOPIFY_STORE_DOMAIN;
  const adminKey = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;

  if (!domain || !adminKey) {
    throw new Error('SHOPIFY_STORE_DOMAIN and SHOPIFY_ADMIN_ACCESS_TOKEN are required');
  }

  const numericCustomerId = extractNumericId(customerId);
  const baseUrl = domain.startsWith('https://') ? domain : `https://${domain}`;
  const endpoint = `${baseUrl}/admin/api/2023-01/customers/${numericCustomerId}.json`;

  console.log('Deleting customer with Admin API:', {
    endpoint,
    customerId: numericCustomerId
  });

  const response = await fetch(endpoint, {
    method: 'DELETE',
    headers: {
      'X-Shopify-Access-Token': adminKey
    }
  });

  console.log('Admin API delete response status:', response.status);

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Admin API delete error response:', errorText);
    throw new Error(`Failed to delete customer: ${response.status} - ${errorText}`);
  }

  console.log('Customer deleted successfully:', numericCustomerId);
}