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
### Milestone 1
- **Baig Taemur:**
  Added unit testing (with the help of GenAI) and fixed bugs. Files worked on: AdminMenu.js, AdminDashboard.js, CategoryForm.js, CreateCategory.js, CreateProduct.js, UpdateProduct.js, categoryController.js (within it: createCategoryController, updateCategoryController, deleteCategoryController, categoryController and singleCategoryController), useCategory.js, Categories.js and categoryModel.js.
- **Daphne Shaine Wilhelmina:**
  Adding test code for unit testing (with the help of GenAI), improving relevant code quality, and fixing relevant code for Admin View Orders, Admin View Products (Client + Server), Cart, and Payment features:
  - pages/admin/AdminViewOrders.test.js for pages/admin/AdminOrders.js
  - pages/admin/Products.test.js for pages/admin/Products.js 
  - controllers/AdminViewProducts.test.js for controllers/productController.js: createProductController, deleteProductController, updateProductController
  - context/cart.test.js for context/cart.js
  - pages/CartPage.test.js for pages/CartPage.js
  - controllers/Payment.test.js for controllers/productController.js: braintreeTokenController, brainTreePaymentController
- **Foo Lin Xuan:**
  Write unit tests and fix relevant bugs for Protected Routes, Registration, Login, Admin View Users, Contact, Policy and General features.
  - helpers/authHelper.test.js for helpers/authHelper.js
  - middlewares/authMiddleware.test.js for middlewares/authMiddleware.js
  - pages/Auth/Register.test.js for pages/Auth/Register.js
  - pages/Auth/Login.test.js for pages/Auth/Login.js
  - controllers/authController.test.js for controllers/authController.js
    - registerController, loginController, forgotPasswordController and testController
  - pages/admin/Users.test.js for pages/admin/Users.js
  - pages/Contact.test.js for pages/Contact.js
  - pages/Policy.test.js for pages/Policy.js
  - components/Footer.test.js for components/Footer.js
  - components/Header.test.js for components/Header.js
  - components/Layout.test.js for components/Layout.js
  - components/Spinner.test.js for components/Spinner.js
  - pages/About.test.js for pages/About.js
  - pages/Pagenotfound.test.js for pages/Pagenotfound.js
  - config/db.test.js for config/db.js
- **Law Rui Xi:**
  Added unit tests and fixed bugs and typos for General features (including the Private Route, UserMenu, Dashboard and User Model), as well as the Order features and the Profile features. Also, added integration tests and UI tests relating to admin viewing/updating orders, and user viewing order status. Specifically, added, modified or tested the following parts:
  - General features:
    - `components/Routes/Private.js`, `components/Routes/Private.test.js`
    - `components/userMenu.js`, `components/userMenu.test.js`
    - `pages/user/Dashboard.js`, `pages/user/Dashboard.test.js`
    - `models/userModel.js`, `models/userModel.test.js`
  - Order features:
    - `pages/user/Order.js`, `pages/user/Order.test.js`
    - `controllers/authController.js`, `controllers/authController.test.js`
      - `updateProfileController`
      - `getOrdersController`
      - `getAllOrdersController`
      - `orderStatusController`
  - Profile features:
    - `pages/user/Profile.js`, `pages/user/Profile.test.js`
  - Integration Tests:
    - `__tests__/integration/backend/admin_update_order.test.js`
    - `__tests__/integration/backend/order_creation.test.js`
  - UI Tests:
    - `__tests__/ui/admin_manage_order_successful.spec.js`
    - `__tests__/ui/profile_update_successful.spec.js`
- **Zhao Evan:**
  I wrote unit tests and fixed issues for - Product Feature (ProductDetails.js, CategoryProduct.js, productModel.js, productController.js [getProduct, getSingleProduct, productPhoto, productFilters, productCount, productList, searchProduct, realtedProduct, productCategory]), and Search Feature (SearchInput.js, search.js, Search.js), Home Feature (HomePage.js).

### Milestone 2
- **Taemur Baig**

  Added integration tests (with the help of GenAI) for admin category management and admin product management:
  - `__tests__/integration/backend/adminCategory.test.js`
  - `__tests__/integration/backend/adminProduct.test.js`
 
  Added UI tests for admin category management and admin product management:
  - `__tests__/ui/admin_category_management.spec.js`
  - `__tests__/ui/admin_product_management.spec.js`

- **Daphne Shaine Wilhelmina:**

  Added integration tests (with the help of GenAI) for cart management and checkout (payment) feature:
  - `__tests__/integration/frontend/cartManagement.test.js`
  - `__tests__/integration/backend/payment.test.js`

  Found and fixed 2 major bugs during integration testing:
  1. The interaction of authentication and cart context is not logically persistent after login/logout.
     The fixes implemented in the files, which are shown below:
     - `components/Header.js`
     - `context/cart.js`
     - `pages/CartPage.js`
     - `pages/CategoryProduct.js`
     - `pages/HomePage.js`
  2. Cart and order pages quantity (total) discrepancy when having duplicate products during checkout.
     The fixes implemented in the files, which are shown below:
     - `context/cart.js`
     - `pages/CartPage.js`
     - `pages/user/Orders.js`
     - `controllers/orderV2Controller.js`
     - `controllers/productController.js` (brainTreePaymentController)
     - `models/orderV2Model.js`
     - `routes/productRoutes.js`
     - `routes/orderV2Routes.js`
     
     Notes:
     - To see the fix when running the website, please add the flags below in your `client/.env` before `npm run dev` :

       ```
       REACT_APP_ORDERS_API_VERSION=v2
       REACT_APP_PAYMENT_API_VERSION=v2
       ```
       
     - The order entry will be inserted into orders_v2 (MongoDB).
     - The end-to-end flow will still be the same:

       Login -> Add the same product more than once to the cart -> Go to Cart Page -> Do payment successfully -> Navigate to Orders (User) page
     
  Added UI test for cart management and checkout feature:
  - `__tests__/ui/cart_context_persistent.spec.js`
  - `__tests__/ui/order_successful_history_with_duplicate_products_merged.spec.js`
  - `__tests__/ui/order_successful_with_address_updated.spec.js`
  - `__tests__/ui/order_successful.spec.js`
  - `__tests__/ui/order_unsuccessful_with_empty_card_details.spec.js`
  - `__tests__/ui/order_unsuccessful_with_incorrect_card_details.spec.js`
  - `__tests__/ui/order_unsuccessful_without_login.spec.js`
    
- **Foo Lin Xuan:**
  Write integration, UI tests and fix relevant bugs for Registration, Login, Protected Routes, Admin View Users and Page Layout features.
  | Feature | Integration Test File | UI Tests File |
  | - | - | - |
  | Registration | `registration.test.js` | `registration.spec.js` |
  | Login | `login.test.js` | `login.spec.js` |
  | Protected Routes | `protectedRoutes.test.js` | `protectedRoutes.spec.js` |
  | Admin View Users | - | `adminViewUsers.spec.js` |
  | Page Layout | - | `pageLayout.spec.js` |

  All integration and UI test files are in `__tests__/integration` and `__tests__/ui` directories respectively.
-
- **Zhao Evan:**
  I wrote integration tests and fixed issues for - Product Feature (see __tests__/integration/ productModel.integration.test, productController.integration.test.js, productRoutes.integration.test.js), Search Feature (see client/__tests__/ context-search.integration.test.js, SearchInput.integration.test.js, page-search.integration.test.js), Home Feature (see client/__tests__/HomePage.integration.test.js).
  I also wrote UI tests for Home Page Browsing, Category Page Browsing Product Details Browsing, Search Browsing.

## 5. GitHub Workflow URL

[GitHub Workflow](https://github.com/cs4218/cs4218-2510-ecom-project-team004/actions/runs/18684659500/job/53273971787)

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
