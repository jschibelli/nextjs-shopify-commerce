import reviewFragment from '../fragments/review';

export const getProductReviewsQuery = /* GraphQL */ `
  query getProductReviews($productId: ID!, $first: Int!, $after: String) {
    product(id: $productId) {
      id
      reviews(first: $first, after: $after) {
        edges {
          node {
            ...review
          }
          cursor
        }
        pageInfo {
          hasNextPage
          hasPreviousPage
          startCursor
          endCursor
        }
      }
    }
  }
  ${reviewFragment}
`;

export const getProductReviewStatsQuery = /* GraphQL */ `
  query getProductReviewStats($productId: ID!) {
    product(id: $productId) {
      id
      reviews(first: 1000) {
        edges {
          node {
            rating
            status
          }
        }
      }
    }
  }
`;

export const createProductReviewMutation = /* GraphQL */ `
  mutation createProductReview($input: ProductReviewInput!) {
    productReviewCreate(input: $input) {
      productReview {
        ...review
      }
      userErrors {
        field
        message
      }
    }
  }
  ${reviewFragment}
`;

export const updateProductReviewMutation = /* GraphQL */ `
  mutation updateProductReview($input: ProductReviewUpdateInput!) {
    productReviewUpdate(input: $input) {
      productReview {
        ...review
      }
      userErrors {
        field
        message
      }
    }
  }
  ${reviewFragment}
`;

export const deleteProductReviewMutation = /* GraphQL */ `
  mutation deleteProductReview($input: ProductReviewDeleteInput!) {
    productReviewDelete(input: $input) {
      deletedProductReviewId
      userErrors {
        field
        message
      }
    }
  }
`; 