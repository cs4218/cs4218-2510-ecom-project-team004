# CS4218 Project - Virtual Vault

## 1. Project Introduction

Virtual Vault is a full-stack MERN (MongoDB, Express.js, React.js, Node.js) e-commerce website, offering seamless connectivity and user-friendly features. The platform provides a robust framework for online shopping. The website is designed to adapt to evolving business needs and can be efficiently extended.

## 2. Website Features

- **User Authentication**: Secure user authentication system implemented to manage user accounts and sessions.
- **Payment Gateway Integration**: Seamless integration with popular payment gateways for secure and reliable online transactions.
- **Search and Filters**: Advanced search functionality and filters to help users easily find products based on their preferences.
- **Product Set**: Organized product sets for efficient navigation and browsing through various categories and collections.

## 3. Your Task

- **Unit and Integration Testing**: Utilize Jest for writing and running tests to ensure individual components and functions work as expected, finding and fixing bugs in the process.
- **UI Testing**: Utilize Playwright for UI testing to validate the behavior and appearance of the website's user interface.
- **Code Analysis and Coverage**: Utilize SonarQube for static code analysis and coverage reports to maintain code quality and identify potential issues.
- **Load Testing**: Leverage JMeter for load testing to assess the performance and scalability of the ecommerce platform under various traffic conditions.

## 4. Members Scope
**Milestone 1**
- Baig Taemur: Added unit testing (with the help of GenAI) and fixed bugs. Files worked on: AdminMenu.js, AdminDashboard.js, CategoryForm.js, CreateCategory.js, CreateProduct.js, UpdateProduct.js, categoryController.js (within it: createCategoryController, updateCategoryController, deleteCategoryController, categoryController and singleCategoryController), useCategory.js, Categories.js and categoryModel.js.
- Daphne Shaine Wilhelmina:
  Adding test code for unit testing (with the help of GenAI), improving relevant code quality, and fixing relevant code for Admin View Orders, Admin View Products (Client + Server), Cart, and Payment features:
  - pages/admin/AdminViewOrders.test.js for pages/admin/AdminOrders.js
  - pages/admin/Products.test.js for pages/admin/Products.js 
  - controllers/AdminViewProducts.test.js for controllers/productController.js: createProductController, deleteProductController, updateProductController
  - context/cart.test.js for context/cart.js
  - pages/CartPage.test.js for pages/CartPage.js
  - controllers/Payment.test.js for controllers/productController.js: braintreeTokenController, brainTreePaymentController
- Foo Lin Xuan:
  Write unit tests and fix relevant bugs for Protected Routes, Registration, Login, Admin View Users, Contact, Policy and General features.
- Law Rui Xi: Added unit tests and fixed bugs and typos for General features (including the Private Route, UserMenu, Dashboard and User Model), as well as the Order features and the Profile features.
- Zhao Evan:

  ## Sprint 1 & 2
  I wrote unit tests and fixed issues for - Product Feature (ProductDetails.js, CategoryProduct.js, productModel.js, productController.js [getProduct, getSingleProduct, productPhoto, productFilters, productCount, productList, searchProduct, realtedProduct, productCategory]), and Search Feature (SearchInput.js, search.js, Search.js), Home Feature (HomePage.js). The tests I wrote are as follows:

  ## productController Tests
  
  ### getProductController
  #### Success Paths
  - should get products successfully
  - should handle empty products list
  - should return correctly spelled response properties
  - should match expected response structure snapshot
  
  #### Error Paths
  - should handle database error
  
  ### getSingleProductController
  #### Success Paths
  - should get single product by slug
  
  #### Error Paths
  - should handle database error
  - should return 404 when product is not found
  - should return 404 when product is undefined
  
  ### productPhotoController
  #### Success Paths
  - should return photo when it exists
  - should handle product with no photo data
  
  #### Error Paths
  - should handle database error
  - should return 404 when product is not found (null)
  - should return 404 when product is undefined
  - should return 404 when product.photo is null
  - should return 404 when product.photo is undefined
  - should return 404 when photo exists but data is missing
  - should return 404 when photo.data is null
  - should return 404 when photo.data is empty string
  - should return 404 when photo.data is undefined
  - should return 404 when photo.data is false
  - should handle invalid ObjectId format
  
  ### productFiltersController
  #### Filter Combinations
  - should handle no filters
  - should handle category filter only
  - should handle price filter only
  - should handle both filters
  
  #### Validation for req.body properties
  - should handle undefined checked and radio
  - should handle null checked value
  - should handle null radio value
  - should handle completely missing req.body
  
  #### radio.length check edge cases
  - should not apply price filter with empty radio array
  - should not apply price filter with single element radio array
  - should apply price filter only with exactly 2 elements
  - should apply price filter only with exactly 2 elements
  - should handle radio array with more than 2 elements
  
  #### Category filter operator usage
  - should use $in operator for single category
  - should use $in operator for multiple categories
  - should work correctly with both category and price filters using $in
  
  #### Data sanitization for price values
  - should reject negative minimum price
  - should reject negative maximum price
  - should reject when min price is greater than max price
  - should reject string price values
  - should reject NaN price values
  - should reject Infinity price values
  - should accept valid zero as minimum price
  - should accept equal min and max prices
  - should handle object injection attempts in radio array
  
  #### Error Paths
  - should handle database error during filtering
  
  ### productCountController
  - should return product count successfully
  - should handle count error
  - should return zero when collection is empty
  - should handle database connection error
  - should handle large product counts
  
  ### productListController
  #### Pagination
  - should handle first page (default)
  - should handle specific page number
  - should default to page 1 when page is null
  - should handle decimal page numbers by parsing to integer
  - should handle invalid page number gracefully
  
  #### Error Paths
  - should handle pagination error
  - should handle error when counting total products
  
  ### searchProductController
  #### Success Paths
  - should handle empty search results
  - should handle search with special characters
  - should handle empty keyword search
  
  #### Error Paths
  - should handle search database error
  
  ### realtedProductController
  #### Success Paths
  - should find related products excluding current product
  - should handle no related products found
  
  #### Error Paths
  - should handle related products database error
  
  ### productCategoryController
  #### Category-based Product Retrieval
  - should get products by category successfully
  - should handle category not found
  - should pass only category._id to find()
  - should clearly differentiate: category not found vs no products
  
  #### Error Paths
  - should handle category lookup error
  - should handle products lookup error
  - should return 404 when category is not found
  
  ---
  
  ## categoryProduct Tests
  
  - renders category name and product count
  - renders product details
  - navigates to product detail page on button click
  - handles empty product list
  - handles API error gracefully
  
  ### Multiple Products
  - renders multiple products correctly
  - More Details button exists and is clickable for each product
  - clicking buttons does not cause errors
  
  ### Price Handling
  - handles missing price gracefully
  - formats price correctly
  
  ### Description Length Handling
  - handles product with missing description
  - handles product with description of length 0
  - handles product with description of length 1
  - handles product with description of length 59
  - handles product with description of length 60
  - handles product with description of length 61
  
  ### Add to Cart Functionality
  - Add to Cart button exists for each product
  - Add to Cart button calls setCart with product
  - Add to Cart works with multiple products
  
  ---
  
  ## productDetails Tests
  
  - renders product details correctly
  - handles API error gracefully
  - Main product Add to Cart button exists and is clickable
  - Main product Add to Cart button calls setCart function
  - Main product handles missing price gracefully
  - renders related products
  - shows fallback when no related products
  - Related product handles missing price gracefully
  
  ### Description length handling of Similar Products
  - handles product with missing description
  - handles product with description of length 0
  - handles product with description of length 1
  - handles product with description of length 59
  - handles product with description of length 60
  - handles product with description of length 61
  
  ### Similar Products Button Functionality
  - More Details button exists and is clickable for each product
  - More Details button navigates to product page
  - Add to Cart button exists and is clickable for each product
  - Add to Cart button calls setCart function
  - clicking buttons does not cause errors
  
  ---
  
  ## Search Component Tests
  
  ### Structure
  - renders Layout with correct title
  - renders heading and subheading
  
  ### No Results Case
  - displays "No Products Found" when results array is empty
  
  ### Results Present
  - displays correct count when results exist
  - renders product cards with correct content
  - renders action buttons for each product
  
  ### Description length handling
  - handles product with missing description
  - handles product with description of length 0
  - handles product with description of length 1
  - handles product with description of length 29
  - handles product with description of length 30
  - handles product with description of length 31
  
  ### Button Functionality
  - More Details button navigates to product page
  - Add to Cart button calls setCart function
  - More Details button exists and is clickable for each product
  - Add to Cart button exists and is clickable for each product
  - clicking buttons does not cause errors
  
  ### Edge Cases
  - handles product with missing price
  
  ---
  
  ## Search Context Tests
  
  ### Provider Structure
  - renders children inside provider
  
  ### Default State
  - provides default keyword and results
  
  ### State Updates
  - updates keyword and results when setValues is called
  - can reset state back to empty values
  
  ### Edge Cases
  - handles large results array
  - throws error if useSearch is used outside provider
  - nested providers isolate state
  - handles async updates to state
  - accepts unexpected data shapes without crashing
  - multiple components share the same state
  - state merging preserves other properties
  
  ---
  
  ## SearchInput Component - Unit Tests
  
  ### Structure
  - renders input with placeholder and button
  
  ### Input Behavior
  - updates keyword on change
  - handles empty input gracefully
  - handles long keyword input
  
  ### Form Submission
  - submits with valid keyword and updates results
  - does not submit when keyword is empty
  - logs error when API call fails
  - handles unexpected API response by defaulting to empty array
  
  ---
  
  ## HomePage Component - Unit Tests
  
  ### Component Structure
  - renders layout with correct title
  - renders banner image with correct attributes
  - renders filter section
  
  ### Initial Load Behavior
  - makes correct API calls on component mount
  - displays categories after successful load
  - displays products after successful load
  
  ### Category Filter Behavior - Exhaustive Testing
  #### Single Category Selection
  - selects Electronics only
  - selects Clothing only
  - selects Books only
  
  #### Two Category Combinations
  - selects Electronics AND Clothing
  - selects Electronics AND Books
  - selects Clothing AND Books
  
  #### All Categories Selected
  - selects Electronics AND Clothing AND Books
  
  #### Category Deselection
  - deselects single category to return to all products
  - removes one category from multiple selections
  - deselects all categories from three selections
  
  #### Checkbox State Management
  - checkboxes maintain correct checked state
  
  ### Price Filter Behavior
  - displays only products in selected price range
  
  ### Category and Price Filter Behavior
  - Electronics + $0 to $19 filter
  - Electronics + $20 to $39 filter
  - Electronics + $40 to $59 filter
  - Clothing + $20 to $39 filter
  - Clothing + $40 to $59 filter
  - Clothing + $0 to $19 filter
  - Books + $40 to $59 filter
  - Books + $0 to $19 filter
  - Books + $20 to $39 filter
  - changes price filter while category is active
  - multiple categories with single price filter
  
  ### Reset Functionality
  - reloads page when reset button is clicked
  
  ### Load More Functionality
  - shows load more button when products count is less than total
  - hides load more button when all products are loaded
  - loads next page when load more button is clicked
  - hides load more button when products are filtered
  - load more works correctly after unchecking all category filters
  - can load more multiple times through many pages
  
  ### Cart Functionality
  - adds product to cart when ADD TO CART button is clicked
  - adds correct product to cart when specific product ADD TO CART is clicked
  - handles single product ADD TO CART correctly
  
  ### Description Length Handling
  - handles product with missing description
  - handles product with description of length 0
  - handles product with description of length 1
  - handles product with description of length 59
  - handles product with description of length 60
  - handles product with description of length 61
  - handles product with very long description
  
  ### Page Number State Management
  - page starts at 1 on initial load
  - increments page number when load more is clicked
  - page number is reset after applying filter
  - tracks correct products through pagination lifecycle
  
  ### Navigation Functionality
  - navigates to product details when More Details button is clicked
  - navigates to correct product when specific More Details button is clicked
  - handles single product More Details correctly
  
  ### Error Handling
  - handles category loading error gracefully
  - handles product loading error gracefully
  - handles filter API error gracefully
  
  ### Price Handling
  - handles product with missing price
  - handles product with null price
  - handles product with price of 0
  
  ### Edge Cases
  - handles empty categories response
  - handles empty products response
  - restores correct state after load more, filter, then clear filter sequence

## 5. GitHub Workflow URL

[GitHub Workflow](https://github.com/cs4218/cs4218-2510-ecom-project-team004/actions/runs/18255664528/job/51976561167)

## 6. Setting Up The Project

### 1. Installing Node.js

1. **Download and Install Node.js**:

   - Visit [nodejs.org](https://nodejs.org) to download and install Node.js.

2. **Verify Installation**:
   - Open your terminal and check the installed versions of Node.js and npm:
     ```bash
     node -v
     npm -v
     ```

### 2. MongoDB Setup

1. **Download and Install MongoDB Compass**:

   - Visit [MongoDB Compass](https://www.mongodb.com/products/tools/compass) and download and install MongoDB Compass for your operating system.

2. **Create a New Cluster**:

   - Sign up or log in to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register).
   - After logging in, create a project and within that project deploy a free cluster.

3. **Configure Database Access**:

   - Create a new user for your database (if not alredy done so) in MongoDB Atlas.
   - Navigate to "Database Access" under "Security" and create a new user with the appropriate permissions.

4. **Whitelist IP Address**:

   - Go to "Network Access" under "Security" and whitelist your IP address to allow access from your machine.
   - For example, you could whitelist 0.0.0.0 to allow access from anywhere for ease of use.

5. **Connect to the Database**:

   - In your cluster's page on MongoDB Atlas, click on "Connect" and choose "Compass".
   - Copy the connection string.

6. **Establish Connection with MongoDB Compass**:
   - Open MongoDB Compass on your local machine, paste the connection string (replace the necessary placeholders), and establish a connection to your cluster.

### 3. Application Setup

To download and use the MERN (MongoDB, Express.js, React.js, Node.js) app from GitHub, follow these general steps:

1. **Clone the Repository**

   - Go to the GitHub repository of the MERN app.
   - Click on the "Code" button and copy the URL of the repository.
   - Open your terminal or command prompt.
   - Use the `git clone` command followed by the repository URL to clone the repository to your local machine:
     ```bash
     git clone <repository_url>
     ```
   - Navigate into the cloned directory.

2. **Install Frontend and Backend Dependencies**

   - Run the following command in your project's root directory:

     ```
     npm install && cd client && npm install && cd ..
     ```

3. **Add database connection string to `.env`**

   - Add the connection string copied from MongoDB Atlas to the `.env` file inside the project directory (replace the necessary placeholders):
     ```env
     MONGO_URL = <connection string>
     ```

4. **Adding sample data to database**

   - Download “Sample DB Schema” from Canvas and extract it.
   - In MongoDB Compass, create a database named `test` under your cluster.
   - Add four collections to this database: `categories`, `orders`, `products`, and `users`.
   - Under each collection, click "ADD DATA" and import the respective JSON from the extracted "Sample DB Schema".

5. **Running the Application**
   - Open your web browser.
   - Use `npm run dev` to run the app from root directory, which starts the development server.
   - Navigate to `http://localhost:3000` to access the application.

## 7. Unit Testing with Jest

Unit testing is a crucial aspect of software development aimed at verifying the functionality of individual units or components of a software application. It involves isolating these units and subjecting them to various test scenarios to ensure their correctness.  
Jest is a popular JavaScript testing framework widely used for unit testing. It offers a simple and efficient way to write and execute tests in JavaScript projects.

### Getting Started with Jest

To begin unit testing with Jest in your project, follow these steps:

1. **Install Jest**:  
   Use your preferred package manager to install Jest. For instance, with npm:

   ```bash
   npm install --save-dev jest

   ```

2. **Write Tests**  
   Create test files for your components or units where you define test cases to evaluate their behaviour.

3. **Run Tests**  
   Execute your tests using Jest to ensure that your components meet the expected behaviour.  
   You can run the tests by using the following command in the root of the directory:

   - **Frontend tests**

     ```bash
     npm run test:frontend
     ```

   - **Backend tests**

     ```bash
     npm run test:backend
     ```

   - **All the tests**
     ```bash
     npm run test
     ```
