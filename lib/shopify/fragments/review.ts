const reviewFragment = /* GraphQL */ `
  fragment review on ProductReview {
    id
    title
    content
    rating
    status
    author {
      name
      email
    }
    createdAt
    updatedAt
  }
`;

export default reviewFragment; 