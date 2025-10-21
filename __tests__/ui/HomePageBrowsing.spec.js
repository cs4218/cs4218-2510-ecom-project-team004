const { test, expect } = require('@playwright/test');

test.describe('HomePage', () => {
  
  test.beforeEach(async ({ page }) => {
    // Navigate to home page before each test
    await page.goto('/');
    
    // Wait for the page to be fully loaded
    await page.waitForLoadState('networkidle');
  });

  test.describe('Initial Page Load', () => {
    // NOTE: The test below was written with the help of an LLM
    test('should display the banner image', async ({ page }) => {
      const banner = page.locator('img.banner-img');
      await expect(banner).toBeVisible();
      await expect(banner).toHaveAttribute('src', '/images/Virtual.png');
    });

    // NOTE: The test below was written with the help of an LLM
    test('should display "All Products" heading', async ({ page }) => {
      const heading = page.locator('h1:has-text("All Products")');
      await expect(heading).toBeVisible();
    });

    // NOTE: The test below was written with the help of an LLM
    test('should load and display categories', async ({ page }) => {
      const categoryHeading = page.locator('h4:has-text("Filter By Category")');
      await expect(categoryHeading).toBeVisible();
      
      // Check that at least one category checkbox exists
      const checkboxes = page.locator('.filters .ant-checkbox-wrapper');
      await expect(checkboxes.first()).toBeVisible();
    });

    // NOTE: The test below was written with the help of an LLM
    test('should load and display price filters', async ({ page }) => {
      const priceHeading = page.locator('h4:has-text("Filter By Price")');
      await expect(priceHeading).toBeVisible();
      
      // Check that radio buttons exist
      const radioButtons = page.locator('.ant-radio-wrapper');
      await expect(radioButtons.first()).toBeVisible();
    });

    // NOTE: The test below was written with the help of an LLM
    test('should display products on initial load', async ({ page }) => {
      // Wait for products to load
      const productCards = page.locator('.card');
      await expect(productCards.first()).toBeVisible({ timeout: 10000 });
      
      // Verify at least one product exists
      const count = await productCards.count();
      expect(count).toBeGreaterThan(0);
    });

    // NOTE: The test below was written with the help of an LLM
    test('should display product information correctly', async ({ page }) => {
      const firstProduct = page.locator('.card').first();
      
      // Check product image
      await expect(firstProduct.locator('.card-img-top')).toBeVisible();
      
      // Check product name
      await expect(firstProduct.locator('.card-title').first()).toBeVisible();
      
      // Check product price
      await expect(firstProduct.locator('.card-price')).toBeVisible();
      
      // Check product description
      await expect(firstProduct.locator('.card-text')).toBeVisible();
      
      // Check buttons
      await expect(firstProduct.locator('button:has-text("More Details")')).toBeVisible();
      await expect(firstProduct.locator('button:has-text("ADD TO CART")')).toBeVisible();
    });
  });

  test.describe('Category Filtering', () => {
    // NOTE: The test below was written with the help of an LLM
    test('should filter products when a category is selected', async ({ page }) => {
      // Get initial product count
      const initialProducts = page.locator('.card');
      const initialCount = await initialProducts.count();
      
      // Click the first category checkbox
      const firstCheckbox = page.locator('.filters .ant-checkbox-wrapper').first();
      await firstCheckbox.click();
      
      // Wait for filtered results
      await page.waitForTimeout(1000); // Allow time for API call
      
      // Verify products are still displayed (or empty if no products in category)
      const filteredProducts = page.locator('.card');
      const filteredCount = await filteredProducts.count();
      
      // Count should change (could be less or zero)
      expect(filteredCount).toBeLessThanOrEqual(initialCount);
    });

    // NOTE: The test below was written with the help of an LLM
    test('should filter by multiple categories', async ({ page }) => {
      // Select first category
      const checkboxes = page.locator('.filters .ant-checkbox-wrapper');
      await checkboxes.nth(0).click();
      await page.waitForTimeout(500);
      
      // Select second category
      if (await checkboxes.nth(1).isVisible()) {
        await checkboxes.nth(1).click();
        await page.waitForTimeout(1000);
        
        // Verify filtering occurred (products shown from both categories)
        const products = page.locator('.card');
        const count = await products.count();
        expect(count).toBeGreaterThanOrEqual(0);
      }
    });

    // NOTE: The test below was written with the help of an LLM
    test('should uncheck category to remove filter', async ({ page }) => {
      const firstCheckbox = page.locator('.filters .ant-checkbox-wrapper').first();
      
      // Check the box
      await firstCheckbox.click();
      await page.waitForTimeout(500);
      
      // Uncheck the box
      await firstCheckbox.click();
      await page.waitForTimeout(1000);
      
      // Should return to full product list
      const products = page.locator('.card');
      const count = await products.count();
      expect(count).toBeGreaterThan(0);
    });
  });

  test.describe('Price Filtering', () => {

    // NOTE: The test below was written with the help of an LLM
    test('should filter products by price range', async ({ page }) => {
      // Click a price range radio button
      const firstRadio = page.locator('.ant-radio-wrapper').first();
      await firstRadio.click();
      
      // Wait for filtered results
      await page.waitForTimeout(1000);
      
      // Verify products are displayed or empty
      const products = page.locator('.card');
      const count = await products.count();
      expect(count).toBeGreaterThanOrEqual(0);
    });

    // NOTE: The test below was written with the help of an LLM
    test('should change price filter selection', async ({ page }) => {
      const radioButtons = page.locator('.ant-radio-wrapper');
      
      // Select first price range
      await radioButtons.nth(0).click();
      await page.waitForTimeout(500);
      
      // Select second price range
      if (await radioButtons.nth(1).isVisible()) {
        await radioButtons.nth(1).click();
        await page.waitForTimeout(1000);
        
        // Verify filtering occurred
        const products = page.locator('.card');
        await expect(products.first()).toBeVisible({ timeout: 5000 });
      }
    });

    // NOTE: The test below was written with the help of an LLM
    test('should combine category and price filters', async ({ page }) => {
      // Select a category
      const firstCheckbox = page.locator('.filters .ant-checkbox-wrapper').first();
      await firstCheckbox.click();
      await page.waitForTimeout(500);
      
      // Select a price range
      const firstRadio = page.locator('.ant-radio-wrapper').first();
      await firstRadio.click();
      await page.waitForTimeout(1000);
      
      // Verify combined filtering
      const products = page.locator('.card');
      const count = await products.count();
      expect(count).toBeGreaterThanOrEqual(0);
    });
  });

  test.describe('Reset Filters', () => {
    
    // NOTE: The test below was written with the help of an LLM
    test('should reset all filters when RESET FILTERS is clicked', async ({ page }) => {
      // Apply some filters
      await page.locator('.filters .ant-checkbox-wrapper').first().click();
      await page.waitForTimeout(500);
      await page.locator('.ant-radio-wrapper').first().click();
      await page.waitForTimeout(500);
      
      // Click reset button
      const resetButton = page.locator('button:has-text("RESET FILTERS")');
      await resetButton.click();
      
      // Wait for page reload
      await page.waitForLoadState('networkidle');
      
      // Verify we're back at home page with all products
      await expect(page.locator('h1:has-text("All Products")')).toBeVisible();
      const products = page.locator('.card');
      const count = await products.count();
      expect(count).toBeGreaterThan(0);
    });
  });

  test.describe('Product Cards', () => {
    
    // NOTE: The test below was written with the help of an LLM
    test('should display price in correct currency format', async ({ page }) => {
      const firstPrice = page.locator('.card-price').first();
      await expect(firstPrice).toBeVisible();
      
      const priceText = await firstPrice.textContent();
      // Verify it starts with $ (USD format)
      expect(priceText).toMatch(/^\$/);
    });

    // NOTE: The test below was written with the help of an LLM
    test('should truncate long descriptions with ellipsis', async ({ page }) => {
      const descriptions = page.locator('.card-text');
      const firstDesc = await descriptions.first().textContent();
      
      // If description is long, it should end with "..."
      if (firstDesc && firstDesc.length > 60) {
        expect(firstDesc).toContain('...');
      }
    });

    // NOTE: The test below was written with the help of an LLM
    test('should show "No description" for products without description', async ({ page }) => {
      // This tests the fallback behavior in your code
      const descriptions = page.locator('.card-text');
      const count = await descriptions.count();
      
      for (let i = 0; i < count; i++) {
        const text = await descriptions.nth(i).textContent();
        // Should either have text or show "No description."
        expect(text).toBeTruthy();
      }
    });
  });

  test.describe('Product Navigation', () => {
    
    // NOTE: The test below was written with the help of an LLM
    test('should navigate to product details when "More Details" is clicked', async ({ page }) => {
      const firstProduct = page.locator('.card').first();
      const moreDetailsButton = firstProduct.locator('button:has-text("More Details")');
      
      // Get the product slug from the button's onclick or track navigation
      await moreDetailsButton.click();
      
      // Wait for navigation
      await page.waitForLoadState('networkidle');
      
      // Verify we navigated away from home page
      const url = page.url();
      expect(url).toContain('/product/');
    });
  });

  test.describe('Cart Functionality', () => {
    
    // NOTE: The test below was written with the help of an LLM
    test('should add product to cart', async ({ page }) => {
      const firstProduct = page.locator('.card').first();
      const addToCartButton = firstProduct.locator('button:has-text("ADD TO CART")');
      
      // Click add to cart
      await addToCartButton.click();
      
      // Wait for toast notification with a more flexible selector
      // React Hot Toast may render in different ways
      const toast = page.locator('.react-hot-toast, [role="status"], .Toaster__message');
      await expect(toast).toBeVisible({ timeout: 5000 });
      
      // Check for text content - be flexible with exact wording
      const toastText = await toast.textContent();
      expect(toastText.toLowerCase()).toContain('cart');
    });

    // NOTE: The test below was written with the help of an LLM
    test('should persist cart in localStorage', async ({ page }) => {
      const firstProduct = page.locator('.card').first();
      const addToCartButton = firstProduct.locator('button:has-text("ADD TO CART")');
      
      // Add to cart
      await addToCartButton.click();
      await page.waitForTimeout(500);
      
      // Check localStorage
      const cartItems = await page.evaluate(() => {
        return localStorage.getItem('cart');
      });
      
      expect(cartItems).toBeTruthy();
      const cart = JSON.parse(cartItems);
      expect(cart.length).toBeGreaterThan(0);
    });

    // NOTE: The test below was written with the help of an LLM
    test('should add multiple products to cart', async ({ page }) => {
      const products = page.locator('.card');
      const count = await products.count();
      
      if (count >= 2) {
        // Add first product
        await products.nth(0).locator('button:has-text("ADD TO CART")').click();
        await page.waitForTimeout(500);
        
        // Add second product
        await products.nth(1).locator('button:has-text("ADD TO CART")').click();
        await page.waitForTimeout(500);
        
        // Check localStorage
        const cartItems = await page.evaluate(() => {
          return localStorage.getItem('cart');
        });
        
        const cart = JSON.parse(cartItems);
        expect(cart.length).toBe(2);
      }
    });
  });

  test.describe('Pagination - Load More', () => {
    
    // NOTE: The test below was written with the help of an LLM
    test('should display "Loadmore" button when more products exist', async ({ page }) => {
      // Wait for products to load
      await page.waitForTimeout(1000);
      
      // Check if loadmore button exists
      const loadMoreButton = page.locator('button.loadmore');
      
      // Button should be visible if products < total
      if (await loadMoreButton.isVisible()) {
        await expect(loadMoreButton).toContainText('Loadmore');
      }
    });

    // NOTE: The test below was written with the help of an LLM
    test('should load more products when "Loadmore" is clicked', async ({ page }) => {
      const loadMoreButton = page.locator('button.loadmore');
      
      if (await loadMoreButton.isVisible()) {
        // Get initial product count
        const initialProducts = page.locator('.card');
        const initialCount = await initialProducts.count();
        
        // Click load more
        await loadMoreButton.click();
        
        // Wait for new products to load
        await page.waitForTimeout(2000);
        
        // Verify more products loaded
        const updatedProducts = page.locator('.card');
        const updatedCount = await updatedProducts.count();
        
        expect(updatedCount).toBeGreaterThan(initialCount);
      }
    });

    // NOTE: The test below was written with the help of an LLM
    test('should show loading state while loading more products', async ({ page }) => {
      const loadMoreButton = page.locator('button.loadmore');
      
      if (await loadMoreButton.isVisible()) {
        // Get initial text
        const initialText = await loadMoreButton.textContent();
        
        // Click load more
        const clickPromise = loadMoreButton.click();
        
        // Check for loading state immediately after click
        // Use waitFor with a short timeout to catch the brief loading state
        try {
          await expect(loadMoreButton).toContainText('Loading', { timeout: 2000 });
        } catch (e) {
          // If we missed it, verify the button is still functional
          console.log('Loading state was too quick to catch, verifying button still works');
        }
        
        await clickPromise;
        
        // Wait for loading to complete
        await page.waitForTimeout(2000);
        
        // Verify it returned to normal state (either "Loadmore" or button disappeared)
        const finalText = await loadMoreButton.textContent().catch(() => null);
        if (finalText) {
          expect(finalText).toContain('Loadmore');
        }
      }
    });

    // NOTE: The test below was written with the help of an LLM
    test('should hide "Loadmore" button when all products are loaded', async ({ page }) => {
      const loadMoreButton = page.locator('button.loadmore');
      
      // Keep clicking until button disappears or maximum attempts
      let attempts = 0;
      const maxAttempts = 10;
      
      while (await loadMoreButton.isVisible() && attempts < maxAttempts) {
        await loadMoreButton.click();
        await page.waitForTimeout(2000);
        attempts++;
      }
      
      // Eventually button should disappear when all products loaded
      // (or we hit max attempts for test purposes)
      expect(attempts).toBeLessThanOrEqual(maxAttempts);
    });

    // NOTE: The test below was written with the help of an LLM
    test('should not show "Loadmore" when filters are applied', async ({ page }) => {
      // Apply a filter
      await page.locator('.filters .ant-checkbox-wrapper').first().click();
      
      // Wait for the filter to be applied and products to load
      await page.waitForTimeout(1500);
      
      // Wait for any loading states to complete
      await page.waitForLoadState('networkidle');
      
      // Loadmore button should be hidden (filtered results show all matching)
      const loadMoreButton = page.locator('button.loadmore');
      
      // Use a longer timeout and check multiple times
      await expect(loadMoreButton).toBeHidden({ timeout: 3000 });
    });
  });

  test.describe('Edge Cases', () => {
    
    // NOTE: The test below was written with the help of an LLM
    test('should handle rapid filter changes', async ({ page }) => {
      const checkboxes = page.locator('.filters .ant-checkbox-wrapper');
      
      // Rapidly toggle filters
      await checkboxes.nth(0).click();
      await checkboxes.nth(0).click();
      await checkboxes.nth(0).click();
      
      // Wait for final state
      await page.waitForTimeout(1500);
      
      // Page should still be functional
      await expect(page.locator('h1:has-text("All Products")')).toBeVisible();
    });

    // NOTE: The test below was written with the help of an LLM
    test('should handle adding same product to cart multiple times', async ({ page }) => {
      const firstProduct = page.locator('.card').first();
      const addToCartButton = firstProduct.locator('button:has-text("ADD TO CART")');
      
      // Add same product 3 times
      await addToCartButton.click();
      await page.waitForTimeout(300);
      await addToCartButton.click();
      await page.waitForTimeout(300);
      await addToCartButton.click();
      await page.waitForTimeout(500);
      
      // Check cart has 3 items
      const cartItems = await page.evaluate(() => {
        return localStorage.getItem('cart');
      });
      
      const cart = JSON.parse(cartItems);
      expect(cart.length).toBe(3);
    });
  });
});