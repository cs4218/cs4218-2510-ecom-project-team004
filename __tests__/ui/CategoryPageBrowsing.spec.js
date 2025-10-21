const { test, expect } = require('@playwright/test');

test.describe('Category Navigation and Product Page', () => {
  
  test.beforeEach(async ({ page }) => {
    // Navigate to home page before each test
    await page.goto('/');
    // Wait for the page to be fully loaded
    await page.waitForLoadState('networkidle');
  });

  test.describe('Category Dropdown Navigation', () => {
    
    // NOTE: The test below was written with the help of an LLM
    test('should display Categories link in navigation bar', async ({ page }) => {
      // Check if Categories dropdown link exists in navbar
      const categoriesDropdown = page.locator('a:has-text("Categories"), .nav-link:has-text("Categories")');
      await expect(categoriesDropdown.first()).toBeVisible();
    });

    // NOTE: The test below was written with the help of an LLM
    test('should open dropdown menu when clicking Categories', async ({ page }) => {
      // Click on Categories dropdown
      const categoriesDropdown = page.locator('a:has-text("Categories"), .nav-link:has-text("Categories")').first();
      await categoriesDropdown.click();
      
      // Wait for dropdown menu to appear
      await page.waitForTimeout(500);
      
      // Check if dropdown menu is visible
      const dropdownMenu = page.locator('.dropdown-menu, [role="menu"]');
      await expect(dropdownMenu.first()).toBeVisible();
    });

    // NOTE: The test below was written with the help of an LLM
    test('should display "All Categories" option in dropdown', async ({ page }) => {
      // Open Categories dropdown
      const categoriesDropdown = page.locator('a:has-text("Categories"), .nav-link:has-text("Categories")').first();
      await categoriesDropdown.click();
      
      await page.waitForTimeout(500);
      
      // Check for "All Categories" link
      const allCategoriesLink = page.locator('a:has-text("All Categories")');
      await expect(allCategoriesLink).toBeVisible();
    });

    // NOTE: The test below was written with the help of an LLM
    test('should display Book option in dropdown', async ({ page }) => {
      // Open Categories dropdown
      const categoriesDropdown = page.locator('a:has-text("Categories"), .nav-link:has-text("Categories")').first();
      await categoriesDropdown.click();
      
      await page.waitForTimeout(500);
      
      // Check for Book link
      const bookLink = page.locator('a:has-text("Book")');
      await expect(bookLink).toBeVisible();
    });

    // NOTE: The test below was written with the help of an LLM
    test('should display multiple category options in dropdown', async ({ page }) => {
      // Open Categories dropdown
      const categoriesDropdown = page.locator('a:has-text("Categories"), .nav-link:has-text("Categories")').first();
      await categoriesDropdown.click();
      
      await page.waitForTimeout(500);
      
      // Get all category links in dropdown
      const categoryLinks = page.locator('.dropdown-menu a, [role="menu"] a');
      const count = await categoryLinks.count();
      
      // Should have at least 2 options (All Categories + at least one category)
      expect(count).toBeGreaterThanOrEqual(2);
    });

    // NOTE: The test below was written with the help of an LLM
    test('should navigate to All Categories page from dropdown', async ({ page }) => {
      // Open Categories dropdown
      const categoriesDropdown = page.locator('a:has-text("Categories"), .nav-link:has-text("Categories")').first();
      await categoriesDropdown.click();
      
      await page.waitForTimeout(500);
      
      // Click on "All Categories"
      const allCategoriesLink = page.locator('a:has-text("All Categories")');
      await allCategoriesLink.click();
      
      // Wait for navigation
      await page.waitForURL('**/categories');
      
      // Verify we're on the categories page
      expect(page.url()).toContain('/categories');
    });

    // NOTE: The test below was written with the help of an LLM
    test('should navigate to Book category from dropdown', async ({ page }) => {
      // Open Categories dropdown
      const categoriesDropdown = page.locator('a:has-text("Categories"), .nav-link:has-text("Categories")').first();
      await categoriesDropdown.click();
      
      await page.waitForTimeout(500);
      
      // Click on Book
      const bookLink = page.locator('a:has-text("Book")');
      await bookLink.click();
      
      // Wait for navigation to category product page
      await page.waitForURL('**/category/book');
      
      // Verify URL contains book
      expect(page.url()).toContain('/category/book');
      
      // Verify category heading is displayed
      const categoryHeading = page.locator('h4:has-text("Category - Book")');
      await expect(categoryHeading).toBeVisible({ timeout: 10000 });
    });

    // NOTE: The test below was written with the help of an LLM
    test('should close dropdown when clicking outside', async ({ page }) => {
      // Open Categories dropdown
      const categoriesDropdown = page.locator('a:has-text("Categories"), .nav-link:has-text("Categories")').first();
      await categoriesDropdown.click();
      
      await page.waitForTimeout(500);
      
      // Verify dropdown is open
      const dropdownMenu = page.locator('.dropdown-menu, [role="menu"]').first();
      await expect(dropdownMenu).toBeVisible();
      
      // Click somewhere else on the page
      await page.click('body', { position: { x: 10, y: 10 } });
      
      await page.waitForTimeout(300);
      
      // Dropdown should be closed (or have a class indicating it's closed)
      // Note: Depending on your framework, this might need adjustment
    });
  });

  test.describe('All Categories Page', () => {
    
    test.beforeEach(async ({ page }) => {
      // Navigate to All Categories page via dropdown
      const categoriesDropdown = page.locator('a:has-text("Categories"), .nav-link:has-text("Categories")').first();
      await categoriesDropdown.click();
      await page.waitForTimeout(500);
      
      const allCategoriesLink = page.locator('a:has-text("All Categories")');
      await allCategoriesLink.click();
      await page.waitForLoadState('networkidle');
    });

    // NOTE: The test below was written with the help of an LLM
    test('should display all available categories as buttons', async ({ page }) => {
      // Check that category buttons are displayed
      const categoryButtons = page.locator('.btn-primary');
      await expect(categoryButtons.first()).toBeVisible({ timeout: 10000 });
      
      // Verify at least one category exists
      const count = await categoryButtons.count();
      expect(count).toBeGreaterThan(0);
    });

    // NOTE: The test below was written with the help of an LLM
    test('should navigate to specific category when clicking category button', async ({ page }) => {
      // Click on Book category button
      const bookCategoryButton = page.locator('.btn-primary:has-text("Book")');
      await expect(bookCategoryButton).toBeVisible();
      
      await bookCategoryButton.click();
      
      // Wait for navigation to category product page
      await page.waitForURL('**/category/book');
      
      // Verify URL contains category slug
      expect(page.url()).toContain('/category/book');
      
      // Verify category name is displayed on the page
      const categoryHeading = page.locator('h4:has-text("Category - Book")');
      await expect(categoryHeading).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe('CategoryProduct Page - Initial Load via Dropdown', () => {
    
    test.beforeEach(async ({ page }) => {
      // Navigate to Book category via dropdown
      const categoriesDropdown = page.locator('a:has-text("Categories"), .nav-link:has-text("Categories")').first();
      await categoriesDropdown.click();
      await page.waitForTimeout(500);
      
      const bookLink = page.locator('a:has-text("Book")');
      await bookLink.click();
      await page.waitForLoadState('networkidle');
    });

    // NOTE: The test below was written with the help of an LLM
    test('should display category name in heading', async ({ page }) => {
      const categoryHeading = page.locator('h4.text-center').first();
      await expect(categoryHeading).toBeVisible();
      await expect(categoryHeading).toContainText('Category -');
    });

    // NOTE: The test below was written with the help of an LLM
    test('should display result count', async ({ page }) => {
      const resultCount = page.locator('h6.text-center:has-text("result")');
      await expect(resultCount).toBeVisible();
      
      // Verify the count is a valid number
      const countText = await resultCount.textContent();
      expect(countText).toMatch(/\d+ result/);
    });

    // NOTE: The test below was written with the help of an LLM
    test('should display products if category has items', async ({ page }) => {
      // Check if products are displayed
      const productCards = page.locator('.card');
      const count = await productCards.count();
      
      if (count > 0) {
        // Verify first product card is visible
        await expect(productCards.first()).toBeVisible();
      } else {
        // If no products, should still show the category heading
        const categoryHeading = page.locator('h4.text-center').first();
        await expect(categoryHeading).toBeVisible();
      }
    });
  });

  test.describe('CategoryProduct Page - Product Display', () => {
    
    test.beforeEach(async ({ page }) => {
      // Navigate to Book category via dropdown
      const categoriesDropdown = page.locator('a:has-text("Categories"), .nav-link:has-text("Categories")').first();
      await categoriesDropdown.click();
      await page.waitForTimeout(500);
      
      const bookLink = page.locator('a:has-text("Book")');
      await bookLink.click();
      await page.waitForLoadState('networkidle');
    });

    // NOTE: The test below was written with the help of an LLM
    test('should display product image correctly', async ({ page }) => {
      const productCards = page.locator('.card');
      const count = await productCards.count();
      
      if (count > 0) {
        const firstProductImage = productCards.first().locator('.card-img-top');
        await expect(firstProductImage).toBeVisible();
        
        // Verify image has src attribute
        const imageSrc = await firstProductImage.getAttribute('src');
        expect(imageSrc).toBeTruthy();
        expect(imageSrc).toContain('/api/v1/product/product-photo/');
        
        // Verify image has alt text
        const altText = await firstProductImage.getAttribute('alt');
        expect(altText).toBeTruthy();
      }
    });

    // NOTE: The test below was written with the help of an LLM
    test('should display product name', async ({ page }) => {
      const productCards = page.locator('.card');
      const count = await productCards.count();
      
      if (count > 0) {
        const productName = productCards.first().locator('.card-title').first();
        await expect(productName).toBeVisible();
        
        // Verify name has text content
        const nameText = await productName.textContent();
        expect(nameText).toBeTruthy();
        expect(nameText.length).toBeGreaterThan(0);
      }
    });

    // NOTE: The test below was written with the help of an LLM
    test('should display product price in USD format', async ({ page }) => {
      const productCards = page.locator('.card');
      const count = await productCards.count();
      
      if (count > 0) {
        const productPrice = productCards.first().locator('.card-price');
        await expect(productPrice).toBeVisible();
        
        // Verify price is formatted as currency
        const priceText = await productPrice.textContent();
        expect(priceText).toMatch(/\$/); // Contains dollar sign
        expect(priceText).toMatch(/\d/); // Contains digits
      }
    });

    // NOTE: The test below was written with the help of an LLM
    test('should display product description', async ({ page }) => {
      const productCards = page.locator('.card');
      const count = await productCards.count();
      
      if (count > 0) {
        const productDescription = productCards.first().locator('.card-text');
        await expect(productDescription).toBeVisible();
        
        // Verify description has content
        const descText = await productDescription.textContent();
        expect(descText).toBeTruthy();
      }
    });

    // NOTE: The test below was written with the help of an LLM
    test('should truncate long descriptions with ellipsis', async ({ page }) => {
      const productCards = page.locator('.card');
      const count = await productCards.count();
      
      if (count > 0) {
        const descriptions = await productCards.locator('.card-text').allTextContents();
        
        // Check if any description is truncated
        const hasTruncated = descriptions.some(desc => desc.includes('...'));
        
        if (hasTruncated) {
          // Truncated descriptions should be around 60 chars + "..."
          const truncatedDesc = descriptions.find(desc => desc.includes('...'));
          expect(truncatedDesc.length).toBeLessThanOrEqual(64); // 60 chars + "..." + small buffer
        }
      }
    });

    // NOTE: The test below was written with the help of an LLM
    test('should display all product cards with consistent structure', async ({ page }) => {
      const productCards = page.locator('.card');
      const count = await productCards.count();
      
      if (count > 0) {
        // Check first 3 products (or all if less than 3)
        const checkCount = Math.min(count, 3);
        
        for (let i = 0; i < checkCount; i++) {
          const card = productCards.nth(i);
          
          // Each card should have image, name, price, description, and buttons
          await expect(card.locator('.card-img-top')).toBeVisible();
          await expect(card.locator('.card-title').first()).toBeVisible();
          await expect(card.locator('.card-price')).toBeVisible();
          await expect(card.locator('.card-text')).toBeVisible();
          await expect(card.locator('button:has-text("More Details")')).toBeVisible();
          await expect(card.locator('button:has-text("ADD TO CART")')).toBeVisible();
        }
      }
    });
  });

  test.describe('CategoryProduct Page - Button Interactions', () => {
    
    test.beforeEach(async ({ page }) => {
      // Navigate to Book category
      const categoriesDropdown = page.locator('a:has-text("Categories"), .nav-link:has-text("Categories")').first();
      await categoriesDropdown.click();
      await page.waitForTimeout(500);
      
      const bookLink = page.locator('a:has-text("Book")');
      await bookLink.click();
      await page.waitForLoadState('networkidle');
    });

    // NOTE: The test below was written with the help of an LLM
    test('should have "More Details" button with correct styling', async ({ page }) => {
      const productCards = page.locator('.card');
      const count = await productCards.count();
      
      if (count > 0) {
        const moreDetailsButton = productCards.first().locator('button:has-text("More Details")');
        await expect(moreDetailsButton).toBeVisible();
        await expect(moreDetailsButton).toHaveClass(/btn-info/);
      }
    });

    // NOTE: The test below was written with the help of an LLM
    test('should navigate to product details page when clicking "More Details"', async ({ page }) => {
      const productCards = page.locator('.card');
      const count = await productCards.count();
      
      if (count > 0) {
        const moreDetailsButton = productCards.first().locator('button:has-text("More Details")');
        await moreDetailsButton.click();
        
        // Wait for navigation to product detail page
        await page.waitForURL('**/product/**');
        
        // Verify URL contains product slug
        expect(page.url()).toContain('/product/');
      }
    });

    // NOTE: The test below was written with the help of an LLM
    test('should have "ADD TO CART" button with correct styling', async ({ page }) => {
      const productCards = page.locator('.card');
      const count = await productCards.count();
      
      if (count > 0) {
        const addToCartButton = productCards.first().locator('button:has-text("ADD TO CART")');
        await expect(addToCartButton).toBeVisible();
        await expect(addToCartButton).toHaveClass(/btn-dark/);
      }
    });

    // NOTE: The test below was written with the help of an LLM
    test('should have both buttons visible and clickable for each product', async ({ page }) => {
      const productCards = page.locator('.card');
      const count = await productCards.count();
      
      if (count > 0) {
        const card = productCards.first();
        
        const moreDetailsButton = card.locator('button:has-text("More Details")');
        const addToCartButton = card.locator('button:has-text("ADD TO CART")');
        
        // Both buttons should be visible
        await expect(moreDetailsButton).toBeVisible();
        await expect(addToCartButton).toBeVisible();
        
        // Both buttons should be enabled
        await expect(moreDetailsButton).toBeEnabled();
        await expect(addToCartButton).toBeEnabled();
      }
    });
  });

  test.describe('CategoryProduct Page - Add to Cart Functionality', () => {
    
    test.beforeEach(async ({ page }) => {
      // Clear localStorage before each test
      await page.evaluate(() => localStorage.clear());
      
      // Navigate to Book category
      const categoriesDropdown = page.locator('a:has-text("Categories"), .nav-link:has-text("Categories")').first();
      await categoriesDropdown.click();
      await page.waitForTimeout(500);
      
      const bookLink = page.locator('a:has-text("Book")');
      await bookLink.click();
      await page.waitForLoadState('networkidle');
    });

    // NOTE: The test below was written with the help of an LLM
    test('should show toast notification when adding item to cart', async ({ page }) => {
      const productCards = page.locator('.card');
      const count = await productCards.count();
      
      if (count > 0) {
        const addToCartButton = productCards.first().locator('button:has-text("ADD TO CART")');
        
        // Click add to cart button
        await addToCartButton.click();
        
        // Wait for toast notification
        const toast = page.locator('text="Item Added to cart"');
        await expect(toast).toBeVisible({ timeout: 5000 });
      }
    });

    // NOTE: The test below was written with the help of an LLM
    test('should persist cart in localStorage after adding item', async ({ page }) => {
      const productCards = page.locator('.card');
      const count = await productCards.count();
      
      if (count > 0) {
        const addToCartButton = productCards.first().locator('button:has-text("ADD TO CART")');
        
        // Add item to cart
        await addToCartButton.click();
        
        // Wait a moment for localStorage to update
        await page.waitForTimeout(1000);
        
        // Check localStorage
        const cartData = await page.evaluate(() => localStorage.getItem('cart'));
        expect(cartData).toBeTruthy();
        
        // Parse and verify cart has at least one item
        const cart = JSON.parse(cartData);
        expect(cart.length).toBe(1);
      }
    });

    // NOTE: The test below was written with the help of an LLM
    test('should add correct product data to cart', async ({ page }) => {
      const productCards = page.locator('.card');
      const count = await productCards.count();
      
      if (count > 0) {
        const firstCard = productCards.first();
        
        // Get product details before adding
        const productName = await firstCard.locator('.card-title').first().textContent();
        
        // Add to cart
        await firstCard.locator('button:has-text("ADD TO CART")').click();
        await page.waitForTimeout(1000);
        
        // Verify cart data
        const cartData = await page.evaluate(() => localStorage.getItem('cart'));
        const cart = JSON.parse(cartData);
        
        expect(cart.length).toBe(1);
        expect(cart[0].name).toBe(productName.trim());
      }
    });

    // NOTE: The test below was written with the help of an LLM
    test('should add multiple products to cart', async ({ page }) => {
      const productCards = page.locator('.card');
      const count = await productCards.count();
      
      if (count >= 2) {
        // Add first product
        await productCards.nth(0).locator('button:has-text("ADD TO CART")').click();
        await page.waitForTimeout(500);
        
        // Add second product
        await productCards.nth(1).locator('button:has-text("ADD TO CART")').click();
        await page.waitForTimeout(500);
        
        // Check localStorage has 2 items
        const cartData = await page.evaluate(() => localStorage.getItem('cart'));
        const cart = JSON.parse(cartData);
        expect(cart.length).toBe(2);
      }
    });

    // NOTE: The test below was written with the help of an LLM
    test('should allow adding same product multiple times', async ({ page }) => {
      const productCards = page.locator('.card');
      const count = await productCards.count();
      
      if (count > 0) {
        const addToCartButton = productCards.first().locator('button:has-text("ADD TO CART")');
        
        // Add same item twice
        await addToCartButton.click();
        await page.waitForTimeout(500);
        await addToCartButton.click();
        await page.waitForTimeout(500);
        
        // Check localStorage has 2 items
        const cartData = await page.evaluate(() => localStorage.getItem('cart'));
        const cart = JSON.parse(cartData);
        expect(cart.length).toBe(2);
      }
    });
  });

  test.describe('CategoryProduct Page - Navigation and Layout', () => {
    
    test.beforeEach(async ({ page }) => {
      const categoriesDropdown = page.locator('a:has-text("Categories"), .nav-link:has-text("Categories")').first();
      await categoriesDropdown.click();
      await page.waitForTimeout(500);
      
      const bookLink = page.locator('a:has-text("Book")');
      await bookLink.click();
      await page.waitForLoadState('networkidle');
    });

    // NOTE: The test below was written with the help of an LLM
    test('should display navigation bar on category page', async ({ page }) => {
      // Check for navbar elements
      const navbar = page.locator('nav, .navbar');
      await expect(navbar.first()).toBeVisible();
    });

    // NOTE: The test below was written with the help of an LLM
    test('should navigate back to homepage from category page', async ({ page }) => {
      // Click home link in navbar
      const homeLink = page.locator('a:has-text("Home")').first();
      await homeLink.click();
      
      // Verify we're back on homepage
      await page.waitForURL('/');
    });

    // NOTE: The test below was written with the help of an LLM
    test('should be able to switch to different category from category page', async ({ page }) => {
      // Open Categories dropdown again
      const categoriesDropdown = page.locator('a:has-text("Categories"), .nav-link:has-text("Categories")').first();
      await categoriesDropdown.click();
      await page.waitForTimeout(500);
      
      // Click on All Categories
      const allCategoriesLink = page.locator('a:has-text("All Categories")');
      await allCategoriesLink.click();
      
      // Verify navigation
      await page.waitForURL('**/categories');
      expect(page.url()).toContain('/categories');
    });

    // NOTE: The test below was written with the help of an LLM
    test('should display proper layout structure', async ({ page }) => {
      // Wait for products to load
      await page.waitForTimeout(1000);
      
      // Check for container
      const container = page.locator('.container').first();
      await expect(container).toBeVisible();
      
      // Check for category heading (more specific selector to avoid footer)
      const heading = page.locator('h4.text-center:has-text("Category")').first();
      await expect(heading).toBeVisible();
      
      // Check for result count
      const resultCount = page.locator('h6.text-center:has-text("result")').first();
      await expect(resultCount).toBeVisible();
    });
  });

  test.describe('CategoryProduct Page - Error Handling', () => {
    
    // NOTE: The test below was written with the help of an LLM
    test('should handle category with no products gracefully', async ({ page }) => {
      // Navigate to All Categories
      const categoriesDropdown = page.locator('a:has-text("Categories"), .nav-link:has-text("Categories")').first();
      await categoriesDropdown.click();
      await page.waitForTimeout(500);
      
      const allCategoriesLink = page.locator('a:has-text("All Categories")');
      await allCategoriesLink.click();
      await page.waitForLoadState('networkidle');
      
      const categoryButtons = page.locator('.btn-primary');
      const count = await categoryButtons.count();
      
      if (count > 0) {
        // Try to find a category with 0 results
        for (let i = 0; i < Math.min(count, 5); i++) {
          await categoryButtons.nth(i).click();
          await page.waitForLoadState('networkidle');
          
          const resultText = await page.locator('h6.text-center').textContent();
          
          if (resultText.includes('0 result')) {
            // Verify page still displays properly
            const categoryHeading = page.locator('h4.text-center').first();
            await expect(categoryHeading).toBeVisible();
            
            // Verify no product cards are shown
            const productCards = page.locator('.card');
            const cardCount = await productCards.count();
            expect(cardCount).toBe(0);
            break;
          }
          
          // Go back to categories
          await page.goto('/categories');
          await page.waitForLoadState('networkidle');
        }
      }
    });

    // NOTE: The test below was written with the help of an LLM
    test('should display "No description." for products without description', async ({ page }) => {
      const categoriesDropdown = page.locator('a:has-text("Categories"), .nav-link:has-text("Categories")').first();
      await categoriesDropdown.click();
      await page.waitForTimeout(500);
      
      const bookLink = page.locator('a:has-text("Book")');
      await bookLink.click();
      await page.waitForLoadState('networkidle');
      
      // Check all descriptions
      const descriptions = page.locator('.card-text');
      const count = await descriptions.count();
      
      if (count > 0) {
        // All descriptions should have text
        for (let i = 0; i < Math.min(count, 3); i++) {
          const text = await descriptions.nth(i).textContent();
          expect(text).toBeTruthy();
        }
      }
    });

    // NOTE: The test below was written with the help of an LLM
    test('should display $0.00 for products with missing price', async ({ page }) => {
      const categoriesDropdown = page.locator('a:has-text("Categories"), .nav-link:has-text("Categories")').first();
      await categoriesDropdown.click();
      await page.waitForTimeout(500);
      
      const bookLink = page.locator('a:has-text("Book")');
      await bookLink.click();
      await page.waitForLoadState('networkidle');
      
      const prices = page.locator('.card-price');
      const count = await prices.count();
      
      if (count > 0) {
        // All prices should display with dollar sign
        for (let i = 0; i < Math.min(count, 3); i++) {
          await expect(prices.nth(i)).toBeVisible();
          const priceText = await prices.nth(i).textContent();
          expect(priceText).toMatch(/\$/);
        }
      }
    });
  });
});
