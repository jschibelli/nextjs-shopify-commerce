// In-memory storage for wishlist items (in production, this would be a database)
const wishlistStorage = new Map<string, Set<string>>();

// Function to get wishlist storage (for internal use)
export function getWishlistStorage() {
  return wishlistStorage;
}

// Function to clear wishlist data for a specific customer
export function clearWishlistForCustomer(customerId: string) {
  if (wishlistStorage.has(customerId)) {
    wishlistStorage.delete(customerId);
    console.log('Wishlist cleared for customer:', customerId);
  }
}

// Function to clear all wishlist data (useful for testing or admin purposes)
export function clearAllWishlistData() {
  const customerCount = wishlistStorage.size;
  wishlistStorage.clear();
  console.log('All wishlist data cleared. Customers affected:', customerCount);
  return customerCount;
} 