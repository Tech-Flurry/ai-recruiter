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

### 5. Start the Application

With the solution loaded in Visual Studio, you can now start the application.
1.  **Locate the Start Button**
    *   Find the **Start** button ![image.png](/.attachments/image-ae159832-e106-4fc3-b2b3-2efa6485ff34.png) at the top of Visual Studio.
2.  **Run the Application**
    *   Click the **Start** button to build and run the project.
    *   The application should launch, and you can begin using **AI Recruiter**.

### 6. Verify the Setup

Once the application is running, open **Google Chrome** and navigate to the local server address [http://localhost:62835/](http://localhost:62835/) to ensure that the **AI Recruiter** platform is operational.