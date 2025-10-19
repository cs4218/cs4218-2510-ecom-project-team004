import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('http://localhost:3000/');
})

// Preconditions: 
// User and admin user must be registered in the database
// Categories must be created in database
const testUser = {
  name: 'testuser',
  email: 'testuser@vault.com',
  password: 'test',
}

const testAdmin = {
  name: 'testadmin',
  email: 'testadmin@vault.com',
  password: 'test',
}

const categories = [
  { name: 'Electronics', slug: 'electronics' }, 
  { name: 'Book', slug: 'book' }, 
  { name: 'Clothing', slug: 'clothing' }, 
];

test('page elements when user is not logged in', async ({ page }) => {
  // To ensure auth state is cleared
  await page.evaluate(() => localStorage.clear()); 
  await page.reload();

  // Header
  await expect(page.getByRole('link', { name: '🛒 Virtual Vault' })).toBeVisible();
  await expect(page.getByRole('search')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Home' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Categories' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Register' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Login' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Cart' })).toBeVisible();

  // Categories submenu
  await page.getByRole('link', { name: 'Categories' }).click();
  await expect(page.getByRole('link', { name: 'All Categories' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Electronics' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Book' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Clothing' })).toBeVisible();

  // Footer
  await expect(page.getByRole('link', { name: 'About' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Contact' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Privacy Policy' })).toBeVisible();
});

test('page elements when user is logged in', async ({ page }) => {
  // Set up logged in state
  await page.goto('http://localhost:3000/login');
  await page.getByRole('textbox', { name: 'Enter Your Email' }).click();
  await page.getByRole('textbox', { name: 'Enter Your Email' }).fill(testUser.email);
  await page.getByRole('textbox', { name: 'Enter Your Email' }).press('Tab');
  await page.getByRole('textbox', { name: 'Enter Your Password' }).fill(testUser.password);
  await page.getByRole('button', { name: 'LOGIN' }).click();
  
  // Header
  await expect(page.getByRole('link', { name: '🛒 Virtual Vault' })).toBeVisible();
  await expect(page.getByRole('search')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Home' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Categories' })).toBeVisible();
  await expect(page.getByRole('button', { name: testUser.name })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Cart' })).toBeVisible();
  
  // Categories submenu
  await page.getByRole('link', { name: 'Categories' }).click();
  await expect(page.getByRole('link', { name: 'All Categories' })).toBeVisible();
  await expect(page.getByRole('link', { name: categories[0].name })).toBeVisible();
  await expect(page.getByRole('link', { name: categories[1].name })).toBeVisible();
  await expect(page.getByRole('link', { name: categories[2].name })).toBeVisible();
  
  // User submenu
  await page.getByRole('button', { name: testUser.name }).click();
  await expect(page.getByRole('link', { name: 'Dashboard' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Logout' })).toBeVisible();
  
  // Footer
  await expect(page.getByRole('link', { name: 'About' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Contact' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Privacy Policy' })).toBeVisible();
});

test.describe('elements behaviour', () => {
  // Header
  test('Virtual Vault logo', async ({ page }) => {
    // Navigate away from homepage
    await page.goto('http://localhost:3000/login');
    
    await page.getByRole('link', { name: '🛒 Virtual Vault' }).click();
    
    // Should navigate to homepage
    await expect(page).toHaveURL('http://localhost:3000/');
  });
  
  test('Search', async ({ page }) => {
    await page.getByRole('searchbox', { name: 'Search' }).fill('NUS');
    await page.getByRole('button', { name: 'Search' }).click();
    
    // Should navigate to /search
    await expect(page).toHaveURL('http://localhost:3000/search');
  });
  
  test('Home', async ({ page }) => {
    // Navigate away from homepage
    await page.goto('http://localhost:3000/login');
    
    await page.getByRole('link', { name: 'Home' }).click();
    
    // Should navigate to homepage
    await expect(page).toHaveURL('http://localhost:3000/');
  });
  
  test('All Categories', async ({ page }) => {
    await page.getByRole('link', { name: 'Categories' }).click();
    await page.getByRole('link', { name: 'All Categories' }).click();
    
    // Should navigate to /categories
    await expect(page).toHaveURL('http://localhost:3000/categories');
  });
  
  test('Specific category', async ({ page }) => {
    // 1st category
    await page.getByRole('link', { name: 'Categories' }).click();
    await page.getByRole('link', { name: categories[0].name }).click();
    
    // Should navigate to respective category page
    await expect(page).toHaveURL(`http://localhost:3000/category/${categories[0].slug}`);
    
    // 2nd category
    await page.getByRole('link', { name: 'Categories' }).click();
    await page.getByRole('link', { name: categories[1].name }).click();
    
    await expect(page).toHaveURL(`http://localhost:3000/category/${categories[1].slug}`);
    
    // 3rd category
    await page.getByRole('link', { name: 'Categories' }).click();
    await page.getByRole('link', { name: categories[2].name }).click();
    
    await expect(page).toHaveURL(`http://localhost:3000/category/${categories[2].slug}`);
  });
  
  test('Register', async ({ page }) => {
    // To ensure auth state is cleared
    await page.evaluate(() => localStorage.clear()); 
    await page.reload();

    await page.getByRole('link', { name: 'Register' }).click();
    
    // Should navigate to /register
    await expect(page).toHaveURL('http://localhost:3000/register');
  });
  
  test('Login', async ({ page }) => {
    // To ensure auth state is cleared
    await page.evaluate(() => localStorage.clear()); 
    await page.reload();

    await page.getByRole('link', { name: 'Login' }).click();
    
    // Should navigate to /login
    await expect(page).toHaveURL('http://localhost:3000/login');
  });
  
  test('User Dashboard', async ({ page }) => {
    // Set up logged in state
    await page.goto('http://localhost:3000/login');
    await page.getByRole('textbox', { name: 'Enter Your Email' }).click();
    await page.getByRole('textbox', { name: 'Enter Your Email' }).fill(testUser.email);
    await page.getByRole('textbox', { name: 'Enter Your Email' }).press('Tab');
    await page.getByRole('textbox', { name: 'Enter Your Password' }).fill(testUser.password);
    await page.getByRole('button', { name: 'LOGIN' }).click();
    
    await page.getByRole('button', { name: testUser.name }).click();
    await page.getByRole('link', { name: 'Dashboard' }).click();
    
    // Should navigate to /dashboard/user
    await expect(page).toHaveURL('http://localhost:3000/dashboard/user');
  });
  
  test('Admin Dashboard', async ({ page }) => {
    // Set up logged in state (admin user)
    await page.goto('http://localhost:3000/login');
    await page.getByRole('textbox', { name: 'Enter Your Email' }).click();
    await page.getByRole('textbox', { name: 'Enter Your Email' }).fill(testAdmin.email);
    await page.getByRole('textbox', { name: 'Enter Your Email' }).press('Tab');
    await page.getByRole('textbox', { name: 'Enter Your Password' }).fill(testAdmin.password);
    await page.getByRole('button', { name: 'LOGIN' }).click();
    
    await page.getByRole('button', { name: testAdmin.name }).click();
    await page.getByRole('link', { name: 'Dashboard' }).click();
    
    // Should navigate to /dashboard/admin
    await expect(page).toHaveURL('http://localhost:3000/dashboard/admin');
  });
  
  test('Logout', async ({ page }) => {
    // Set up logged in state
    await page.goto('http://localhost:3000/login');
    await page.getByRole('textbox', { name: 'Enter Your Email' }).click();
    await page.getByRole('textbox', { name: 'Enter Your Email' }).fill(testUser.email);
    await page.getByRole('textbox', { name: 'Enter Your Email' }).press('Tab');
    await page.getByRole('textbox', { name: 'Enter Your Password' }).fill(testUser.password);
    await page.getByRole('button', { name: 'LOGIN' }).click();
    
    await page.getByRole('button', { name: testUser.name }).click();
    await page.getByRole('link', { name: 'Logout' }).click();
    
    // Show success message
    await expect(page.getByText(/logout successfully/i)).toBeVisible();

    // Cleared auth in localStorage
    const authData = await page.evaluate(() => localStorage.getItem('auth'));
    expect(authData).toBeNull();
    
    // Should navigate to /login
    await expect(page).toHaveURL('http://localhost:3000/login');
  });
  
  test('Cart', async ({ page }) => {
    await page.getByRole('link', { name: 'Cart' }).click();
    
    // Should navigate to /cart
    await expect(page).toHaveURL('http://localhost:3000/cart');
  });

  // Footer
  test('About', async ({ page }) => {
    await page.getByRole('link', { name: 'About' }).click();
    
    // Should navigate to /about
    await expect(page).toHaveURL('http://localhost:3000/about');
  });

  test('Contact', async ({ page }) => {
    await page.getByRole('link', { name: 'Contact' }).click();
    
    // Should navigate to /contact
    await expect(page).toHaveURL('http://localhost:3000/contact');
  });

  test('Privacy Policy', async ({ page }) => {
    await page.getByRole('link', { name: 'Privacy Policy' }).click();
    
    // Should navigate to /policy
    await expect(page).toHaveURL('http://localhost:3000/policy');
  });
});