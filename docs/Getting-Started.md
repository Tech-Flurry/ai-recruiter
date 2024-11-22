# Getting Started

## Prerequisites

Before you can run **AI Recruiter**, ensure that you have the following tools and software installed on your machine:

- **Visual Studio 2022**
  - **Version:** 17.12.1 or later
  - [Download Visual Studio 2022](https://visualstudio.microsoft.com/downloads/)
  
- **Visual Studio Code (VS Code)**
  - [Download VS Code](https://code.visualstudio.com/)
  
- **Git**
  - [Download Git](https://git-scm.com/downloads)
  
- **Node.js**
  - [Download Node.js](https://nodejs.org/)
  
- **MongoDB Instance**
  - **Option 1:** Local Installation
    - [Download MongoDB Community Server](https://www.mongodb.com/try/download/community)
  - **Option 2:** Cloud-Based (e.g., MongoDB Atlas)
    - [Get Started with MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
  
- **MongoDB Compass**
  - [Download MongoDB Compass](https://www.mongodb.com/products/compass)
  
- **Google Chrome**
  - [Download Google Chrome](https://www.google.com/chrome/)

Ensure that all the above tools are properly installed and configured before proceeding to the installation steps.

## Installation

Follow the steps below to set up and run the **AI Recruiter** project on your local machine.

### 1. Clone the Repository

First, clone the **AI Recruiter** repository from Azure DevOps using Git.

### 2. Open the Project in VS Code

Navigate to the cloned repository and open it in Visual Studio Code.

### 3. One-Time Setup Using Terminal

Perform the following steps in the terminal to set up the project dependencies and build the necessary tools.

#### 1. Open Terminal in VS Code
-  You can open the terminal by pressing `` Ctrl + ` `` or navigating to **View > Terminal** in the menu.

#### 2. Navigate to the Tools Directory
```bash
cd theme/tools
```

#### 3. Install Gulp CLI Globally
```bash
npm install --global gulp-cli
```

#### 4. Install Project Dependencies
```bash
npm install
```

#### 5. Run Gulp Tasks
```bash
gulp
```

This command will build the necessary assets and prepare the project for development.

### 4. Open the Solution in Visual Studio

After completing the one-time setup, open the solution file in Visual Studio 2022 to work on the server-side and frontend components.
1.  **Launch Visual Studio 2022**
    
2.  **Open the Solution File**
    *   Navigate to **File > Open > Project/Solution**.
    *   Select the `AIRecruiter.sln` file from the cloned repository.

### 5. Setting Up MongoDB Server
    
   To ensure **AI Recruiter** can interact with the database correctly, you need to set up a MongoDB server and configure the connection settings.
    
   #### a. Install MongoDB Server
    
   - **Option 1: Local Installation**
      - Download and install the [MongoDB Community Server](https://www.mongodb.com/try/download/community) suitable for your operating system.
      - Follow the installation instructions provided on the download page.
      - After installation, ensure that the MongoDB service is running. You can verify this by accessing `mongodb://localhost:27017` in your browser or using MongoDB Compass.
    
   - **Option 2: Cloud-Based (MongoDB Atlas)**
      - Sign up for a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
      - Create a new cluster following the setup wizard.
      - Whitelist your IP address and create a database user with appropriate permissions.
      - Obtain the connection string from the Atlas dashboard.
    
   #### b. Configure Connection String and Database Name
    
   1. **Locate the Configuration File**
    
       Open the `appsettings.development.json` file located in the `Dointo.AiRecruiter.RestApi` project directory.
    
   2. **Update the Connection String and Database Name**
    
       Replace the existing `ConnectionString` and `DatabaseName` values with your MonggoDB server details.
    
       ```json
       "MongoDb": {
           "ConnectionString": "your_mongodb_connection_string",
           "DatabaseName": "AiRecruiterDb"
       }

*   **For Local MongoDB:**
    
        "MongoDb": {
            "ConnectionString": "mongodb://localhost:27017",
            "DatabaseName": "AiRecruiterDb"
        }
        
    
*   **For MongoDB Atlas:**
    
        "MongoDb": {
            "ConnectionString": "mongodb+srv://<username>:<password>@cluster0.mongodb.net",
            "DatabaseName": "AiRecruiterDb"
        }
        
    
Ensure that you replace `<username>` and `<password>` with your actual MongoDB Atlas credentials.

### 6. Configuring Unit Test Database (Optional)

When running unit tests, it's important to use a separate database to prevent test data from affecting your development or production databases.

#### a. Set Up a Separate Unit Test Database

1.  **Create a Unit Test Database**
    *   If using a local MongoDB instance, you can create a new database named `dointo-recruiter-test`.
    *   If using MongoDB Atlas, create a new cluster or a new database within an existing cluster for testing purposes.

#### b. Configure the Unit Test Database Connection

1.  **Open the `DbContextProvider` File**
    Navigate to the `Dointo.AiRecruiter.DbInfrastructure` project and open the `DbContextProvider.cs` file.
    
2.  **Update the Connection String and Database Name**
    Modify the `GetDbContext` method to use the unit test database connection string and database name.
    
        internal static class DbContextProvider
        {
            public static DointoDbContext GetDbContext()
            {
                var options = new DbContextOptionsBuilder<DointoDbContext>()
                    .UseMongoDB("mongodb://localhost:27017", "dointo-recruiter-test")
                    .Options;
                return new DointoDbContext(options);
            }
        }
        
    
    *   **For Local MongoDB:**
        
            .UseMongoDB("mongodb://localhost:27017", "dointo-recruiter-test")
            
        
    *   **For MongoDB Atlas:**
        
            .UseMongoDB("your_mongodb_atlas_connection_string", "dointo-recruiter-test")
            
        
    Ensure that the connection string points to your unit test MongoDB server and that the database name is set to `dointo-analytics-test` or your preferred test database name.
    

#### c. Running Unit Tests

After configuring the unit test database, you can run the unit tests without affecting your main database.
1.  **Open the Test Explorer in Visual Studio**
    *   Navigate to **Test > Test Explorer**.
2.  **Run All Tests**
    *   Click on **Run All** to execute the unit tests.
    *   The tests will use the configured unit test database for any database operations.


### 6. Start the Application

With the solution loaded in Visual Studio, you can now start the application.
1.  **Locate the Start Button**
    *   Find the **Start** button ![image.png](/.attachments/image-ae159832-e106-4fc3-b2b3-2efa6485ff34.png) at the top of Visual Studio.
2.  **Run the Application**
    *   Click the **Start** button to build and run the project.
    *   The application should launch, and you can begin using **AI Recruiter**.

### 6. Verify the Setup

Once the application is running, open **Google Chrome** and navigate to the local server address [http://localhost:62835/](http://localhost:62835/) to ensure that the **AI Recruiter** platform is operational.