export const getCustomerOrdersQuery = `
  query getCustomerOrders($customerAccessToken: String!, $first: Int!) {
    customer(customerAccessToken: $customerAccessToken) {
      id
      orders(first: $first) {
        edges {
          node {
            id
            name
            orderNumber
            processedAt
            financialStatus
            fulfillmentStatus
            totalPriceSet {
              shopMoney {
                amount
                currencyCode
              }
            }
            subtotalPriceSet {
              shopMoney {
                amount
                currencyCode
              }
            }
            totalTaxSet {
              shopMoney {
                amount
                currencyCode
              }
            }
            totalShippingPriceSet {
              shopMoney {
                amount
                currencyCode
              }
            }
            shippingAddress {
              firstName
              lastName
              company
              address1
              address2
              city
              province
              country
              zip
              phone
            }
            billingAddress {
              firstName
              lastName
              company
              address1
              address2
              city
              province
              country
              zip
              phone
            }
            lineItems(first: 50) {
              edges {
                node {
                  id
                  title
                  quantity
                  variant {
                    id
                    title
                    price
                    image {
                      url
                      altText
                    }
                  }
                  originalTotalSet {
                    shopMoney {
                      amount
                      currencyCode
                    }
                  }
                }
              }
            }
            fulfillments {
              id
              status
              trackingInfo {
                number
                url
                company
              }
            }
            tags
            note
            createdAt
            updatedAt
          }
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
`;

export const getOrderQuery = `
  query getOrder($customerAccessToken: String!, $orderId: ID!) {
    customer(customerAccessToken: $customerAccessToken) {
      id
      order(id: $orderId) {
        id
        name
        orderNumber
        processedAt
        financialStatus
        fulfillmentStatus
        totalPriceSet {
          shopMoney {
            amount
            currencyCode
          }
        }
        subtotalPriceSet {
          shopMoney {
            amount
            currencyCode
          }
        }
        totalTaxSet {
          shopMoney {
            amount
            currencyCode
          }
        }
        totalShippingPriceSet {
          shopMoney {
            amount
            currencyCode
          }
        }
        shippingAddress {
          firstName
          lastName
          company
          address1
          address2
          city
          province
          country
          zip
          phone
        }
        billingAddress {
          firstName
          lastName
          company
          address1
          address2
          city
          province
          country
          zip
          phone
        }
        lineItems(first: 50) {
          edges {
            node {
              id
              title
              quantity
              variant {
                id
                title
                price
                image {
                  url
                  altText
                }
              }
              originalTotalSet {
                shopMoney {
                  amount
                  currencyCode
                }
              }
            }
          }
        }
        fulfillments {
          id
          status
          trackingInfo {
            number
            url
            company
          }
        }
        tags
        note
        createdAt
        updatedAt
      }
    }
  }
`; 