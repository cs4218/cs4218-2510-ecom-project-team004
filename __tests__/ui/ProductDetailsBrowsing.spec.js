const { test, expect } = require('@playwright/test');

test.describe('ProductDetails', () => {
  
  test.beforeEach(async ({ page }) => {
    // Navigate to home page first
    await page.goto('/');
    
    // Wait for the page to be fully loaded
    await page.waitForLoadState('networkidle');
    
    // Wait for products to load on homepage
    await page.waitForSelector('.card', { timeout: 10000 });
    
    // Click on the first product's "More Details" button to navigate to ProductDetails
    const firstProductDetailsBtn = page.locator('.card .btn-info').first();
    await firstProductDetailsBtn.click();
    
    // Wait for navigation to product details page
    await page.waitForLoadState('networkidle');
    
    // Verify we're on a product details page (URL contains /product/)
    await expect(page).toHaveURL(/\/product\/.+/);
    
    // CRITICAL: Wait for product data to actually load
    // Wait for the product name element to have actual content (not just the "Name :" label)
    await page.waitForFunction(() => {
      const elements = document.querySelectorAll('.product-details-info h6');
      for (let el of elements) {
        if (el.textContent.includes('Name :') && el.textContent.length > 10) {
          return true;
        }
      }
      return false;
    }, { timeout: 10000 });
  });

  test.describe('Product Details Display', () => {
    // NOTE: The test below was written with the help of an LLM
    test('should display "Product Details" heading', async ({ page }) => {
      const heading = page.locator('h1:has-text("Product Details")');
      await expect(heading).toBeVisible();
    });

    // NOTE: The test below was written with the help of an LLM
    test('should display product image', async ({ page }) => {
      const productImage = page.locator('.product-details .card-img-top');
      await expect(productImage).toBeVisible();
      
      // Check that image has proper attributes
      await expect(productImage).toHaveAttribute('alt');
      await expect(productImage).toHaveAttribute('src', /\/api\/v1\/product\/product-photo\/.+/);
    });

    // NOTE: The test below was written with the help of an LLM
    test('should display product name', async ({ page }) => {
      // Locate the h6 element containing "Name :"
      const nameElement = page.locator('.product-details-info h6').filter({ hasText: 'Name :' });
      await expect(nameElement).toBeVisible({ timeout: 10000 });
      
      // Get the text content
      const nameText = await nameElement.textContent();
      
      // Verify name has actual content beyond just "Name :"
      expect(nameText.trim().length).toBeGreaterThan(10);
      expect(nameText).toContain('Name :');
      
      // Verify the actual name part is not empty
      const actualName = nameText.replace('Name :', '').trim();
      expect(actualName.length).toBeGreaterThan(0);
    });

    // NOTE: The test below was written with the help of an LLM
    test('should display product description', async ({ page }) => {
      // Locate the h6 element containing "Description :"
      const descElement = page.locator('.product-details-info h6').filter({ hasText: 'Description :' });
      await expect(descElement).toBeVisible({ timeout: 10000 });
      
      // Get the text content
      const descText = await descElement.textContent();
      
      // Verify description has actual content beyond just "Description :"
      expect(descText.trim().length).toBeGreaterThan(15);
      expect(descText).toContain('Description :');
      
      // Verify the actual description part is not empty
      const actualDesc = descText.replace('Description :', '').trim();
      expect(actualDesc.length).toBeGreaterThan(0);
    });

    // NOTE: The test below was written with the help of an LLM
    test('should display product price in correct format', async ({ page }) => {
      // Locate the h6 element containing "Price :"
      const priceElement = page.locator('.product-details-info h6').filter({ hasText: 'Price :' });
      await expect(priceElement).toBeVisible({ timeout: 10000 });
      
      // Get the text content
      const priceText = await priceElement.textContent();
      
      // Verify price contains "Price :" label and a dollar amount
      expect(priceText).toContain('Price :');
      expect(priceText).toMatch(/\$\d+\.?\d*/); // Matches $XX or $XX.XX format
    });

    // NOTE: The test below was written with the help of an LLM
    test('should display product category', async ({ page }) => {
      // Locate the h6 element containing "Category :"
      const categoryElement = page.locator('.product-details-info h6').filter({ hasText: 'Category :' });
      await expect(categoryElement).toBeVisible({ timeout: 10000 });
      
      // Get the text content
      const categoryText = await categoryElement.textContent();
      
      // Verify category has actual content beyond just "Category :"
      expect(categoryText.trim().length).toBeGreaterThan(12);
      expect(categoryText).toContain('Category :');
      
      // Verify the actual category part is not empty
      const actualCategory = categoryText.replace('Category :', '').trim();
      expect(actualCategory.length).toBeGreaterThan(0);
    });

    // NOTE: The test below was written with the help of an LLM
    test('should display "ADD TO CART" button', async ({ page }) => {
      const addToCartBtn = page.locator('.product-details-info .btn-secondary:has-text("ADD TO CART")');
      await expect(addToCartBtn).toBeVisible({ timeout: 10000 });
      await expect(addToCartBtn).toBeEnabled();
    });
  });

  test.describe('Add to Cart Functionality', () => {
    
    // NOTE: The test below was written with the help of an LLM
    test('should add product to cart when "ADD TO CART" button is clicked', async ({ page }) => {
      const addToCartBtn = page.locator('.product-details-info .btn-secondary:has-text("ADD TO CART")');
      
      // Click add to cart button
      await addToCartBtn.click();
      
      // Wait for toast notification
      const toast = page.locator('.hot-toast, .Toastify, [role="status"]');
      await expect(toast).toBeVisible({ timeout: 5000 });
      
      // Verify toast message
      await expect(toast).toContainText(/Item Added to cart/i);
    });

    // NOTE: The test below was written with the help of an LLM
    test('should persist cart items in localStorage', async ({ page }) => {
      const addToCartBtn = page.locator('.product-details-info .btn-secondary:has-text("ADD TO CART")');
      
      // Click add to cart
      await addToCartBtn.click();
      
      // Wait a moment for localStorage to update
      await page.waitForTimeout(1000);
      
      // Check localStorage
      const cartData = await page.evaluate(() => {
        return localStorage.getItem('cart');
      });
      
      expect(cartData).toBeTruthy();
      
      // Parse and verify cart contains at least one item
      const cart = JSON.parse(cartData);
      expect(cart.length).toBeGreaterThan(0);
    });

    // NOTE: The test below was written with the help of an LLM
    test('should allow adding same product multiple times', async ({ page }) => {
      const addToCartBtn = page.locator('.product-details-info .btn-secondary:has-text("ADD TO CART")');
      
      // Get initial cart count
      const initialCartData = await page.evaluate(() => {
        return localStorage.getItem('cart');
      });
      const initialCount = initialCartData ? JSON.parse(initialCartData).length : 0;
      
      // Add to cart twice
      await addToCartBtn.click();
      await page.waitForTimeout(1000);
      
      await addToCartBtn.click();
      await page.waitForTimeout(1000);
      
      // Check localStorage cart count increased
      const finalCartData = await page.evaluate(() => {
        return localStorage.getItem('cart');
      });
      
      const finalCart = JSON.parse(finalCartData);
      expect(finalCart.length).toBe(initialCount + 2);
    });
  });

  test.describe('Similar Products Section', () => {
    
    // NOTE: The test below was written with the help of an LLM
    test('should display "Similar Products" heading', async ({ page }) => {
      // Wait a bit for similar products section to render
      await page.waitForTimeout(1000);
      
      const heading = page.locator('h4:has-text("Similar Products")');
      await expect(heading).toBeVisible({ timeout: 10000 });
    });

    // NOTE: The test below was written with the help of an LLM
    test('should display similar products or "no products" message', async ({ page }) => {
      // Wait for similar products section to load
      await page.waitForTimeout(2000);
      
      // Check if similar products exist or no products message is shown
      const similarProductCards = page.locator('.similar-products .card');
      const noProductsMessage = page.locator('p:has-text("No Similar Products found")');
      
      const cardCount = await similarProductCards.count();
      
      if (cardCount > 0) {
        // If products exist, verify they're visible
        await expect(similarProductCards.first()).toBeVisible();
      } else {
        // If no products, verify message is shown
        await expect(noProductsMessage).toBeVisible();
      }
    });

    // NOTE: The test below was written with the help of an LLM
    test('should display similar product cards with all required information', async ({ page }) => {
      // Wait for similar products to load
      await page.waitForTimeout(2000);
      
      const similarProductCards = page.locator('.similar-products .card');
      const cardCount = await similarProductCards.count();
      
      // Only run this test if similar products exist
      if (cardCount > 0) {
        const firstCard = similarProductCards.first();
        
        // Check product image
        await expect(firstCard.locator('.card-img-top')).toBeVisible();
        
        // Check product name
        const nameElement = firstCard.locator('.card-title').first();
        await expect(nameElement).toBeVisible();
        const nameText = await nameElement.textContent();
        expect(nameText.trim().length).toBeGreaterThan(0);
        
        // Check product price
        const priceElement = firstCard.locator('.card-price');
        await expect(priceElement).toBeVisible();
        
        // Verify price format
        const priceText = await priceElement.textContent();
        expect(priceText).toMatch(/\$\d+\.?\d*/);
        
        // Check product description
        await expect(firstCard.locator('.card-text')).toBeVisible();
        
        // Check "More Details" button
        await expect(firstCard.locator('.btn-info:has-text("More Details")')).toBeVisible();
        
        // Check "ADD TO CART" button
        await expect(firstCard.locator('.btn-dark:has-text("ADD TO CART")')).toBeVisible();
      }
    });

    // NOTE: The test below was written with the help of an LLM
    test('should truncate long descriptions in similar products', async ({ page }) => {
      // Wait for similar products to load
      await page.waitForTimeout(2000);
      
      const similarProductCards = page.locator('.similar-products .card');
      const cardCount = await similarProductCards.count();
      
      if (cardCount > 0) {
        const descriptions = similarProductCards.locator('.card-text');
        const descCount = await descriptions.count();
        
        if (descCount > 0) {
          const firstDescription = await descriptions.first().textContent();
          
          // If description exists and is truncated, it should end with "..."
          if (firstDescription && firstDescription.length > 60) {
            expect(firstDescription).toContain('...');
          }
        }
      }
    });

    // NOTE: The test below was written with the help of an LLM
    test('should navigate to another product when clicking "More Details" on similar product', async ({ page }) => {
      // Wait for similar products to load
      await page.waitForTimeout(2000);
      
      const similarProductCards = page.locator('.similar-products .card');
      const cardCount = await similarProductCards.count();
      
      if (cardCount > 0) {
        const currentURL = page.url();
        
        // Click "More Details" on first similar product
        const moreDetailsBtn = similarProductCards.first().locator('.btn-info:has-text("More Details")');
        await moreDetailsBtn.click();
        
        // Wait for navigation
        await page.waitForLoadState('networkidle');
        
        // Verify URL changed (navigated to different product)
        const newURL = page.url();
        expect(newURL).toMatch(/\/product\/.+/);
        
        // Verify we're on a product details page
        await expect(page.locator('h1:has-text("Product Details")')).toBeVisible({ timeout: 10000 });
      }
    });

    // NOTE: The test below was written with the help of an LLM
    test('should add similar product to cart', async ({ page }) => {
      // Wait for similar products to load
      await page.waitForTimeout(2000);
      
      const similarProductCards = page.locator('.similar-products .card');
      const cardCount = await similarProductCards.count();
      
      if (cardCount > 0) {
        const addToCartBtn = similarProductCards.first().locator('.btn-dark:has-text("ADD TO CART")');
        
        // Click add to cart
        await addToCartBtn.click();
        
        // Wait for toast notification
        const toast = page.locator('.hot-toast, .Toastify, [role="status"]');
        await expect(toast).toBeVisible({ timeout: 5000 });
        
        // Verify toast message
        await expect(toast).toContainText(/Item Added to cart/i);
      }
    });
  });

  test.describe('Layout and Responsiveness', () => {
    
    // NOTE: The test below was written with the help of an LLM
    test('should have proper layout structure', async ({ page }) => {
      // Check main container
      const mainContainer = page.locator('.product-details');
      await expect(mainContainer).toBeVisible();
      
      // Check two-column layout
      const columns = mainContainer.locator('.col-md-6');
      expect(await columns.count()).toBe(2);
    });

    // NOTE: The test below was written with the help of an LLM
    test('should display horizontal rule between sections', async ({ page }) => {
      const horizontalRules = page.locator('hr');
      expect(await horizontalRules.count()).toBeGreaterThanOrEqual(1);
    });
  });

  test.describe('Navigation', () => {
    
    // NOTE: The test below was written with the help of an LLM
    test('should be able to navigate back to homepage', async ({ page }) => {
      // Assuming there's a navigation link/logo to go back (adjust selector as needed)
      const homeLink = page.locator('a[href="/"]').first();
      
      if (await homeLink.isVisible()) {
        await homeLink.click();
        await page.waitForLoadState('networkidle');
        
        // Verify we're back on homepage
        await expect(page).toHaveURL('/');
        
        // Verify homepage content
        const banner = page.locator('img.banner-img');
        await expect(banner).toBeVisible();
      }
    });
  });
});
