# Strategic Planning System

### Project Description

The **Strategic Planning System** is a web application designed to assist organizations and companies in creating and managing strategic plans. It allows users to define and structure their plans, including organizational identity (mission, vision, and values), as well as the management of objectives, goals, activities, and indicators.


### System Architecture
- **General Design**: Utilizes a client-server architecture with the Model-View-Controller (MVC) pattern.

#### Installation Instructions
- **Development Environment**: Requires the installation of the following dependencies:
  - Node.js (v21.7.3)
  - MongoDB (v7.0.8)
  - Express.js (v4.19.2)
  - Angular CLI (v18.2.4)
  
- **Production Environment**: Requires the installation of the following dependencies:
  - Node.js (v21.7.3)
  - MongoDB (v7.0.8)
  - Express.js (v4.19.2)

### System Settings

#### Application Email Configuration

First, create a Gmail account with the desired address that will represent the web application for strategic plans. It is necessary to create an app password that allows the system to send emails from the created email account:

1. Enable Two-Step Verification:
- Go to your Google account.
- In the left sidebar, select **Security**.
- In the **Signing in to Google** section, make sure that **Two-Step Verification** is enabled. If it is not, follow the steps to enable it.

 2. Generate an App Password:
- After enabling Two-Step Verification, go to **App passwords** in the same **Security** section.
- From the dropdown menu, select the app and the device for which you want to generate the password. If you are configuring a server, select **Mail** for the app and **Other** (custom name) for the device.
- Enter a custom name (for example, “Server”) and click **Generate**. A 16-character password will appear.

After that, it should be configured in the backend of the project, in the `.env` file.

#### Setting `.env` file

To set up the development environment for this project, configure the the database, password encryption and email sending, you must create a .env file in the root of the backend folder. This file must contain the following lines:

```
DB = mongodb://server_ip/database_name
SALT = a_SALT's_number

# DEV is for development. User PROD for production.
TARGET = DEV 

# You can change for the port that you want to use 
PORT = 8080 

# Change if your are using other host for email
SMTP_HOST=smtp.gmail.com 
SMTP_PORT=587 SMTP_USER=your_email@gmail.com 

SMTP_PASS=[previously generated application password] 
RESET_PASSWORD_DEV_URL=http://localhost:4200/reset-password 
RESET_PASSWORD_PROD_ URL=http://140.84.171.60:8080/reset-password 
INVITATION_DEV_URL=http://localhost:4200/Invitations 
INVITATION_PROD_URL=http://140.84.171.60:8080/Invitations

```

### Running the Project

To start the backend server and the Angular frontend (in case of a development environment), you need to run the following command in a terminal within both modules:

```bash
npm start
```

#### Preparing the Frontend Build
(Only if you need to compile changes in Production): Build the Angular frontend using the command:

```
ng build --prod
```

This will generate a `dist/` folder with static files that will be served by the backend.
Copy the contents of the `dist/` folder to the server directory where the backend will run.

### Contact
For inquiries and support, please contact:
- Gerald Matarrita Alvarado: geramatarr@estudiantec.cr
- Isaac Meléndez Gatgens: isaacgatgens@estudiantec.cr
- Emmanuel López Ramírez: emma1399@estudiantec.cr
