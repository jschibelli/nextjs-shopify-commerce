export type Maybe<T> = T | null;

export type Connection<T> = {
  edges: Array<Edge<T>>;
};

export type Edge<T> = {
  node: T;
};

export type Cart = Omit<ShopifyCart, 'lines'> & {
  lines: CartItem[];
};

export type CartProduct = {
  id: string;
  handle: string;
  title: string;
  featuredImage: Image;
};

export type CartItem = {
  id: string | undefined;
  quantity: number;
  cost: {
    totalAmount: Money;
  };
  merchandise: {
    id: string;
    title: string;
    selectedOptions: {
      name: string;
      value: string;
    }[];
    product: CartProduct;
  };
};

export type Collection = ShopifyCollection & {
  path: string;
};

export type Image = {
  url: string;
  altText: string;
  width: number;
  height: number;
};

export type Menu = {
  title: string;
  path: string;
};

export type Money = {
  amount: string;
  currencyCode: string;
};

export type Page = {
  id: string;
  title: string;
  handle: string;
  body: string;
  bodySummary: string;
  seo?: SEO;
  createdAt: string;
  updatedAt: string;
};

export type Product = Omit<ShopifyProduct, 'variants' | 'images'> & {
  variants: ProductVariant[];
  images: Image[];
};

export type ProductOption = {
  id: string;
  name: string;
  values: string[];
};

export type ProductVariant = {
  id: string;
  title: string;
  availableForSale: boolean;
  selectedOptions: {
    name: string;
    value: string;
  }[];
  price: Money;
};

export type SEO = {
  title: string;
  description: string;
};

export type ShopifyCart = {
  id: string | undefined;
  checkoutUrl: string;
  cost: {
    subtotalAmount: Money;
    totalAmount: Money;
    totalTaxAmount: Money;
  };
  lines: Connection<CartItem>;
  totalQuantity: number;
};

export type ShopifyCollection = {
  handle: string;
  title: string;
  description: string;
  seo: SEO;
  updatedAt: string;
};

export type ShopifyProduct = {
  id: string;
  handle: string;
  availableForSale: boolean;
  title: string;
  description: string;
  descriptionHtml: string;
  options: ProductOption[];
  priceRange: {
    maxVariantPrice: Money;
    minVariantPrice: Money;
  };
  variants: Connection<ProductVariant>;
  featuredImage: Image;
  images: Connection<Image>;
  seo: SEO;
  tags: string[];
  updatedAt: string;
  reviews?: Connection<ProductReview>;
};

export type ProductReview = {
  id: string;
  title: string;
  content: string;
  rating: number;
  author: {
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
  status: string;
};

export type ReviewStats = {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    [key: number]: number;
  };
};

export type ShopifyCartOperation = {
  data: {
    cart: ShopifyCart;
  };
  variables: {
    cartId: string;
  };
};

export type ShopifyCreateCartOperation = {
  data: { cartCreate: { cart: ShopifyCart } };
};

export type ShopifyAddToCartOperation = {
  data: {
    cartLinesAdd: {
      cart: ShopifyCart;
    };
  };
  variables: {
    cartId: string;
    lines: {
      merchandiseId: string;
      quantity: number;
    }[];
  };
};

export type ShopifyRemoveFromCartOperation = {
  data: {
    cartLinesRemove: {
      cart: ShopifyCart;
    };
  };
  variables: {
    cartId: string;
    lineIds: string[];
  };
};

export type ShopifyUpdateCartOperation = {
  data: {
    cartLinesUpdate: {
      cart: ShopifyCart;
    };
  };
  variables: {
    cartId: string;
    lines: {
      id: string;
      merchandiseId: string;
      quantity: number;
    }[];
  };
};

export type ShopifyCollectionOperation = {
  data: {
    collection: ShopifyCollection;
  };
  variables: {
    handle: string;
  };
};

export type ShopifyCollectionProductsOperation = {
  data: {
    collection: {
      products: Connection<ShopifyProduct>;
    };
  };
  variables: {
    handle: string;
    reverse?: boolean;
    sortKey?: string;
  };
};

export type ShopifyCollectionsOperation = {
  data: {
    collections: Connection<ShopifyCollection>;
  };
};

export type ShopifyMenuOperation = {
  data: {
    menu?: {
      items: {
        title: string;
        url: string;
      }[];
    };
  };
  variables: {
    handle: string;
  };
};

export type ShopifyPageOperation = {
  data: { pageByHandle: Page };
  variables: { handle: string };
};

export type ShopifyPagesOperation = {
  data: {
    pages: Connection<Page>;
  };
};

export type ShopifyProductOperation = {
  data: { product: ShopifyProduct };
  variables: {
    handle: string;
  };
};

export type ShopifyProductRecommendationsOperation = {
  data: {
    productRecommendations: ShopifyProduct[];
  };
  variables: {
    productId: string;
  };
};

export type ShopifyProductsOperation = {
  data: {
    products: Connection<ShopifyProduct>;
  };
  variables: {
    query?: string;
    reverse?: boolean;
    sortKey?: string;
  };
};

// Customer types
export type Customer = {
  id: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone?: string;
  acceptsMarketing: boolean;
  acceptsSMS?: boolean;
  createdAt: string;
  updatedAt: string;
  defaultAddress?: CustomerAddress;
  addresses: CustomerAddress[];
  orders: CustomerOrder[];
};

export type CustomerAddress = {
  id: string;
  firstName?: string;
  lastName?: string;
  company?: string;
  address1?: string;
  address2?: string;
  city?: string;
  province?: string;
  country?: string;
  zip?: string;
  phone?: string;
};

export type CustomerOrder = {
  id: string;
  name: string;
  processedAt: string;
  fulfillmentStatus: string;
  financialStatus: string;
  totalPriceSet: {
    shopMoney: Money;
  };
  lineItems: CustomerOrderLineItem[];
};

export type CustomerOrderLineItem = {
  id: string;
  title: string;
  quantity: number;
  variant: {
    id: string;
    title: string;
    price: Money;
    product: {
      id: string;
      title: string;
      handle: string;
      featuredImage?: Image;
    };
  };
};

export type CustomerAccessToken = {
  accessToken: string;
  expiresAt: string;
};

export type ShopifyCustomer = {
  id: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone?: string;
  acceptsMarketing: boolean;
  acceptsSMS?: boolean;
  createdAt: string;
  updatedAt: string;
  defaultAddress?: CustomerAddress;
  addresses: Connection<CustomerAddress>;
  orders: Connection<CustomerOrder>;
};

export type ShopifyCustomerCreateOperation = {
  data: {
    customerCreate: {
      customer: ShopifyCustomer;
      customerUserErrors: {
        code: string;
        field: string[];
        message: string;
      }[];
    };
  };
  variables: {
    input: {
      firstName?: string;
      lastName?: string;
      email: string;
      password: string;
      phone?: string;
      acceptsMarketing?: boolean;
    };
  };
};

export type ShopifyCustomerAccessTokenCreateOperation = {
  data: {
    customerAccessTokenCreate: {
      customerAccessToken: CustomerAccessToken;
      customerUserErrors: {
        code: string;
        field: string[];
        message: string;
      }[];
    };
  };
  variables: {
    input: {
      email: string;
      password: string;
    };
  };
};

export type ShopifyCustomerAccessTokenDeleteOperation = {
  data: {
    customerAccessTokenDelete: {
      deletedAccessToken: string;
      deletedCustomerAccessTokenId: string;
      userErrors: {
        code: string;
        field: string[];
        message: string;
      }[];
    };
  };
  variables: {
    customerAccessToken: string;
  };
};

export type ShopifyCustomerOperation = {
  data: {
    customer: ShopifyCustomer;
  };
  variables: {
    customerAccessToken: string;
  };
};

export type ShopifyCustomerUpdateOperation = {
  data: {
    customerUpdate: {
      customer: ShopifyCustomer;
      customerUserErrors: {
        code: string;
        field: string[];
        message: string;
      }[];
    };
  };
  variables: {
    customer: {
      firstName?: string;
      lastName?: string;
      email?: string;
      phone?: string;
      acceptsMarketing?: boolean;
    };
    customerAccessToken: string;
  };
};

export type ShopifyCustomerRecoverOperation = {
  data: {
    customerRecover: {
      customerUserErrors: {
        code: string;
        field: string[];
        message: string;
      }[];
    };
  };
  variables: {
    email: string;
  };
};

export type ShopifyCustomerOrdersOperation = {
  data: {
    customer: {
      orders: Connection<CustomerOrder>;
    };
  };
  variables: {
    customerAccessToken: string;
    first: number;
  };
};

export type ShopifyOrderOperation = {
  data: {
    customer: {
      order: CustomerOrder | null;
    };
  };
  variables: {
    customerAccessToken: string;
    orderId: string;
  };
};

export type ShopifyProductReviewsOperation = {
  data: {
    product: {
      id: string;
      reviews: Connection<ProductReview>;
    };
  };
  variables: {
    productId: string;
    first: number;
    after?: string;
  };
};

export type ShopifyProductReviewStatsOperation = {
  data: {
    product: {
      id: string;
      reviews: Connection<{
        rating: number;
        status: string;
      }>;
    };
  };
  variables: {
    productId: string;
  };
};

export type ShopifyCreateProductReviewOperation = {
  data: {
    productReviewCreate: {
      productReview: ProductReview;
      userErrors: {
        field: string[];
        message: string;
      }[];
    };
  };
  variables: {
    input: {
      productId: string;
      title: string;
      content: string;
      rating: number;
      authorName: string;
      authorEmail: string;
    };
  };
};

export type ShopifyUpdateProductReviewOperation = {
  data: {
    productReviewUpdate: {
      productReview: ProductReview;
      userErrors: {
        field: string[];
        message: string;
      }[];
    };
  };
  variables: {
    input: {
      id: string;
      title?: string;
      content?: string;
      rating?: number;
    };
  };
};

export type ShopifyDeleteProductReviewOperation = {
  data: {
    productReviewDelete: {
      deletedProductReviewId: string;
      userErrors: {
        field: string[];
        message: string;
      }[];
    };
  };
  variables: {
    input: {
      id: string;
    };
  };
};
