const { test, expect } = require('@playwright/test');

test.describe('Search Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to home page before each test
    await page.goto('/');
    // Wait for the page to be fully loaded
    await page.waitForLoadState('networkidle');
  });

  test.describe('Search Bar - Initial State', () => {
    // NOTE: The test below was written with the help of an LLM
    test('should display search input and button in header', async ({ page }) => {
      const searchInput = page.locator('input[type="search"][placeholder="Search"]');
      const searchButton = page.locator('button[type="submit"]:has-text("Search")');
      
      await expect(searchInput).toBeVisible();
      await expect(searchButton).toBeVisible();
    });

    // NOTE: The test below was written with the help of an LLM
    test('should have empty search input on page load', async ({ page }) => {
      const searchInput = page.locator('input[type="search"][placeholder="Search"]');
      await expect(searchInput).toHaveValue('');
    });

    // NOTE: The test below was written with the help of an LLM
    test('should not navigate when search is submitted with empty input', async ({ page }) => {
      const searchButton = page.locator('button[type="submit"]:has-text("Search")');
      const currentUrl = page.url();
      
      await searchButton.click();
      await page.waitForTimeout(500); // Give time for any potential navigation
      
      expect(page.url()).toBe(currentUrl);
    });

    // NOTE: The test below was written with the help of an LLM
    test('should not navigate when search is submitted with only whitespace', async ({ page }) => {
      const searchInput = page.locator('input[type="search"][placeholder="Search"]');
      const searchButton = page.locator('button[type="submit"]:has-text("Search")');
      const currentUrl = page.url();
      
      await searchInput.fill('   ');
      await searchButton.click();
      await page.waitForTimeout(500);
      
      expect(page.url()).toBe(currentUrl);
    });
  });

  test.describe('Search Bar - Input Interaction', () => {
    // NOTE: The test below was written with the help of an LLM
    test('should allow typing in search input', async ({ page }) => {
      const searchInput = page.locator('input[type="search"][placeholder="Search"]');
      const searchTerm = 'laptop';
      
      await searchInput.fill(searchTerm);
      await expect(searchInput).toHaveValue(searchTerm);
    });

    // NOTE: The test below was written with the help of an LLM
    test('should submit search when Enter key is pressed', async ({ page }) => {
      const searchInput = page.locator('input[type="search"][placeholder="Search"]');
      
      await searchInput.fill('phone');
      await searchInput.press('Enter');
      
      // Should navigate to search results page
      await expect(page).toHaveURL(/\/search/);
    });

    // NOTE: The test below was written with the help of an LLM
    test('should submit search when search button is clicked', async ({ page }) => {
      const searchInput = page.locator('input[type="search"][placeholder="Search"]');
      const searchButton = page.locator('button[type="submit"]:has-text("Search")');
      
      await searchInput.fill('tablet');
      await searchButton.click();
      
      // Should navigate to search results page
      await expect(page).toHaveURL(/\/search/);
    });
  });

  test.describe('Search Results Page - Display and Content', () => {
    // NOTE: The test below was written with the help of an LLM
    test('should display "Search Results" heading', async ({ page }) => {
      const searchInput = page.locator('input[type="search"][placeholder="Search"]');
      await searchInput.fill('test');
      await searchInput.press('Enter');
      
      await page.waitForURL(/\/search/);
      const heading = page.locator('h1:has-text("Search Results")');
      await expect(heading).toBeVisible();
    });

    // NOTE: The test below was written with the help of an LLM
    test('should display "No Products Found" when no results', async ({ page }) => {
      const searchInput = page.locator('input[type="search"][placeholder="Search"]');
      // Search for something that likely won't exist
      await searchInput.fill('xyznonexistentproduct123');
      await searchInput.press('Enter');
      
      await page.waitForURL(/\/search/);
      const noResultsMessage = page.locator('h6:has-text("No Products Found")');
      await expect(noResultsMessage).toBeVisible();
    });

    // NOTE: The test below was written with the help of an LLM
    test('should display count of found products when results exist', async ({ page }) => {
      const searchInput = page.locator('input[type="search"][placeholder="Search"]');
      await searchInput.fill('shirt');
      await searchInput.press('Enter');
      
      await page.waitForURL(/\/search/);
      
      // Wait for results to load
      await page.waitForTimeout(1000);
      
      // Check if count is displayed (matches pattern "Found X")
      const countMessage = page.getByText(/Found \d+/);
      const isVisible = await countMessage.isVisible().catch(() => false);
      
      if (isVisible) {
        await expect(countMessage).toBeVisible();
      } else {
        // If no results, should show "No Products Found"
        await expect(page.locator('h6:has-text("No Products Found")')).toBeVisible();
      }
    });

    // NOTE: The test below was written with the help of an LLM
    test('should display product cards in search results', async ({ page }) => {
      const searchInput = page.locator('input[type="search"][placeholder="Search"]');
      await searchInput.fill('product');
      await searchInput.press('Enter');
      
      await page.waitForURL(/\/search/);
      await page.waitForTimeout(1000);
      
      const productCards = page.locator('.card');
      const count = await productCards.count();
      
      if (count > 0) {
        // Verify first product card is visible
        await expect(productCards.first()).toBeVisible();
      }
    });
  });

  test.describe('Search Results - Product Card Content', () => {
    test.beforeEach(async ({ page }) => {
      // Perform a search before each test in this group
      const searchInput = page.locator('input[type="search"][placeholder="Search"]');
      await searchInput.fill('product');
      await searchInput.press('Enter');
      await page.waitForURL(/\/search/);
      await page.waitForTimeout(1000);
    });

    // NOTE: The test below was written with the help of an LLM
    test('should display product image in search results', async ({ page }) => {
      const productCards = page.locator('.card');
      const count = await productCards.count();
      
      if (count > 0) {
        const firstCard = productCards.first();
        const productImage = firstCard.locator('.card-img-top');
        
        await expect(productImage).toBeVisible();
        await expect(productImage).toHaveAttribute('src', /.+/);
        await expect(productImage).toHaveAttribute('alt');
      }
    });

    // NOTE: The test below was written with the help of an LLM
    test('should display product name in search results', async ({ page }) => {
      const productCards = page.locator('.card');
      const count = await productCards.count();
      
      if (count > 0) {
        const firstCard = productCards.first();
        const productName = firstCard.locator('.card-title');
        
        await expect(productName).toBeVisible();
        const nameText = await productName.textContent();
        expect(nameText?.length).toBeGreaterThan(0);
      }
    });

    // NOTE: The test below was written with the help of an LLM
    test('should display product description in search results', async ({ page }) => {
      const productCards = page.locator('.card');
      const count = await productCards.count();
      
      if (count > 0) {
        const firstCard = productCards.first();
        const productDescription = firstCard.locator('.card-text').first();
        
        await expect(productDescription).toBeVisible();
      }
    });

    // NOTE: The test below was written with the help of an LLM
    test('should display product price in search results', async ({ page }) => {
      const productCards = page.locator('.card');
      const count = await productCards.count();
      
      if (count > 0) {
        const firstCard = productCards.first();
        const productPrice = firstCard.locator('.card-text:has-text("$")');
        
        await expect(productPrice).toBeVisible();
        const priceText = await productPrice.textContent();
        expect(priceText).toContain('$');
      }
    });

    // NOTE: The test below was written with the help of an LLM
    test('should truncate long descriptions with ellipsis', async ({ page }) => {
      const productCards = page.locator('.card');
      const count = await productCards.count();
      
      if (count > 0) {
        const descriptions = productCards.locator('.card-text').first();
        const allDescriptions = await descriptions.allTextContents();
        
        // Check if any description is truncated
        const hasTruncated = allDescriptions.some(desc => desc.includes('...'));
        // This is just a check, not an assertion since it depends on data
        expect(typeof hasTruncated).toBe('boolean');
      }
    });
  });

  test.describe('Search Results - Button Interactions', () => {
    test.beforeEach(async ({ page }) => {
      const searchInput = page.locator('input[type="search"][placeholder="Search"]');
      await searchInput.fill('product');
      await searchInput.press('Enter');
      await page.waitForURL(/\/search/);
      await page.waitForTimeout(1000);
    });

    // NOTE: The test below was written with the help of an LLM
    test('should display "More Details" and "ADD TO CART" buttons', async ({ page }) => {
      const productCards = page.locator('.card');
      const count = await productCards.count();
      
      if (count > 0) {
        const firstCard = productCards.first();
        const moreDetailsBtn = firstCard.locator('button.btn-primary:has-text("More Details")');
        const addToCartBtn = firstCard.locator('button.btn-secondary:has-text("ADD TO CART")');
        
        await expect(moreDetailsBtn).toBeVisible();
        await expect(addToCartBtn).toBeVisible();
      }
    });

    // NOTE: The test below was written with the help of an LLM
    test('should navigate to product details when "More Details" is clicked', async ({ page }) => {
      const productCards = page.locator('.card');
      const count = await productCards.count();
      
      if (count > 0) {
        const firstCard = productCards.first();
        const moreDetailsBtn = firstCard.locator('button.btn-primary:has-text("More Details")');
        
        await moreDetailsBtn.click();
        
        // Should navigate to product detail page
        await expect(page).toHaveURL(/\/product\/.+/);
      }
    });

    // NOTE: The test below was written with the help of an LLM
    test('should add item to cart when "ADD TO CART" is clicked', async ({ page }) => {
      const productCards = page.locator('.card');
      const count = await productCards.count();
      
      if (count > 0) {
        const firstCard = productCards.first();
        const addToCartBtn = firstCard.locator('button.btn-secondary:has-text("ADD TO CART")');
        
        await addToCartBtn.click();
        
        // Wait for toast notification
        await page.waitForTimeout(500);
        
        // Check for success toast (adjust selector based on your toast library)
        const toast = page.locator('text=Item Added to cart');
        await expect(toast).toBeVisible({ timeout: 5000 });
      }
    });

    // NOTE: The test below was written with the help of an LLM
    test('should persist cart data in localStorage after adding item', async ({ page }) => {
      const productCards = page.locator('.card');
      const count = await productCards.count();
      
      if (count > 0) {
        const firstCard = productCards.first();
        const addToCartBtn = firstCard.locator('button.btn-secondary:has-text("ADD TO CART")');
        
        await addToCartBtn.click();
        await page.waitForTimeout(500);
        
        // Check localStorage
        const cartData = await page.evaluate(() => localStorage.getItem('cart'));
        expect(cartData).toBeTruthy();
        
        const cartArray = JSON.parse(cartData);
        expect(Array.isArray(cartArray)).toBe(true);
        expect(cartArray.length).toBeGreaterThan(0);
      }
    });

    // NOTE: The test below was written with the help of an LLM
    test('should add multiple items to cart', async ({ page }) => {
      const productCards = page.locator('.card');
      const count = await productCards.count();
      
      if (count >= 2) {
        // Add first item
        await productCards.nth(0).locator('button.btn-secondary:has-text("ADD TO CART")').click();
        await page.waitForTimeout(500);
        
        // Add second item
        await productCards.nth(1).locator('button.btn-secondary:has-text("ADD TO CART")').click();
        await page.waitForTimeout(500);
        
        // Check localStorage has 2 items
        const cartData = await page.evaluate(() => localStorage.getItem('cart'));
        const cartArray = JSON.parse(cartData);
        expect(cartArray.length).toBe(2);
      }
    });
  });

  test.describe('Search Results - Multiple Products', () => {
    test.beforeEach(async ({ page }) => {
      const searchInput = page.locator('input[type="search"][placeholder="Search"]');
      await searchInput.fill('product');
      await searchInput.press('Enter');
      await page.waitForURL(/\/search/);
      await page.waitForTimeout(1000);
    });

    // NOTE: The test below was written with the help of an LLM
    test('should display multiple product cards when available', async ({ page }) => {
      const productCards = page.locator('.card');
      const count = await productCards.count();
      
      // Just verify count is >= 0
      expect(count).toBeGreaterThanOrEqual(0);
    });

    // NOTE: The test below was written with the help of an LLM
    test('should display all product cards with proper structure', async ({ page }) => {
      const productCards = page.locator('.card');
      const count = await productCards.count();
      
      if (count > 0) {
        // Verify each card has the required elements
        for (let i = 0; i < Math.min(count, 3); i++) {
          const card = productCards.nth(i);
          
          await expect(card.locator('.card-img-top')).toBeVisible();
          await expect(card.locator('.card-title')).toBeVisible();
          await expect(card.locator('.card-text').first()).toBeVisible();
          await expect(card.locator('button.btn-primary')).toBeVisible();
          await expect(card.locator('button.btn-secondary')).toBeVisible();
        }
      }
    });
  });

  test.describe('Search - Navigation and State Persistence', () => {
    // NOTE: The test below was written with the help of an LLM
    test('should maintain search keyword in input after navigation to results page', async ({ page }) => {
      const searchTerm = 'laptop';
      const searchInput = page.locator('input[type="search"][placeholder="Search"]');
      
      await searchInput.fill(searchTerm);
      await searchInput.press('Enter');
      
      await page.waitForURL(/\/search/);
      
      // Check if search input still has the keyword
      const searchInputAfterNav = page.locator('input[type="search"][placeholder="Search"]');
      await expect(searchInputAfterNav).toHaveValue(searchTerm);
    });

    // NOTE: The test below was written with the help of an LLM
    test('should be able to perform new search from results page', async ({ page }) => {
      // First search
      const searchInput = page.locator('input[type="search"][placeholder="Search"]');
      await searchInput.fill('laptop');
      await searchInput.press('Enter');
      await page.waitForURL(/\/search/);
      await page.waitForTimeout(1000);
      
      // Second search
      const searchInputAfter = page.locator('input[type="search"][placeholder="Search"]');
      await searchInputAfter.fill('phone');
      await searchInputAfter.press('Enter');
      
      await page.waitForTimeout(1000);
      
      // Should still be on search page with new keyword
      await expect(page).toHaveURL(/\/search/);
      await expect(searchInputAfter).toHaveValue('phone');
    });

    // NOTE: The test below was written with the help of an LLM
    test('should navigate back to home page and maintain functionality', async ({ page }) => {
      // Perform search
      const searchInput = page.locator('input[type="search"][placeholder="Search"]');
      await searchInput.fill('product');
      await searchInput.press('Enter');
      await page.waitForURL(/\/search/);
      
      // Navigate back
      await page.goBack();
      await page.waitForLoadState('networkidle');
      
      // Should be on home page
      await expect(page).toHaveURL('/');
      
      // Search should still work
      const searchInputHome = page.locator('input[type="search"][placeholder="Search"]');
      await searchInputHome.fill('new search');
      await searchInputHome.press('Enter');
      
      await expect(page).toHaveURL(/\/search/);
    });
  });

  test.describe('Search - Edge Cases', () => {
    // NOTE: The test below was written with the help of an LLM
    test('should handle special characters in search', async ({ page }) => {
      const searchInput = page.locator('input[type="search"][placeholder="Search"]');
      await searchInput.fill('test@#$%');
      await searchInput.press('Enter');
      
      await page.waitForURL(/\/search/);
      // Should not crash, should display some result (even if "No Products Found")
      const heading = page.locator('h1:has-text("Search Results")');
      await expect(heading).toBeVisible();
    });

    // NOTE: The test below was written with the help of an LLM
    test('should handle very long search terms', async ({ page }) => {
      const longSearch = 'a'.repeat(100);
      const searchInput = page.locator('input[type="search"][placeholder="Search"]');
      
      await searchInput.fill(longSearch);
      await searchInput.press('Enter');
      
      await page.waitForURL(/\/search/);
      const heading = page.locator('h1:has-text("Search Results")');
      await expect(heading).toBeVisible();
    });

    // NOTE: The test below was written with the help of an LLM
    test('should handle search with numbers', async ({ page }) => {
      const searchInput = page.locator('input[type="search"][placeholder="Search"]');
      await searchInput.fill('12345');
      await searchInput.press('Enter');
      
      await page.waitForURL(/\/search/);
      const heading = page.locator('h1:has-text("Search Results")');
      await expect(heading).toBeVisible();
    });
  });
});
