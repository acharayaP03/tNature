# tNature


This Project demonstrates a Node.js Restfull API implementation with Express.js and Atlas MongoDb cluster with AWS.

- All Tour models and controllers have been designed with its appropriate middleware and routes as well as proper error handeling has been done and commited on initial commit. 


# AuthController Doumentation

This section has all information about user authentication with json web token and user model.

-  In order to validate fields we have used "validator" package from npm. see its documentation for its use.
-  We use bcrypt package to hash password and save it to the database. 
-  Also when retrieving password from database we are using instance method on user model where we decrypt password and compare with user password. then when loged in we generate the token. 
-  In order to delete tour, we actually check if the user is logged in and has access flag of either admin or lead-guide. Before we run deleteTour middleware, we run protectedRoutes middleware, once varified with jwt, then we check access flag, if user has admin role, then deletion is allowed else 403 permission error will be shown. 

- Forgot password: validateBeforeSave has to be set to false or else, we will get validation error from mongoose. becasue at resetToken we only modified the document, but while saving it we actually need to pass validateBeforeSave option and set it to false inorder to save it to the database. Up on accessing this forgotpassword route, if no user email is specified, we will get error, but if email is present then, a resettoken will be saved with hashed form, this token will be sent to user via secure method. 

- Sending email: In order to mimic sending email in dev mode, we will actually use a service called mailtrap where we will test the email for password reset. Also we need to install nodemailer to send email from node application. With mail Trap if port 25 does'nt work then use other port provide ie, in our case, port 2525 works fine. 

# Rate limiter

- install express package called express-rate-limit, 

- This will then sit as a global middleware, which prevents number of requests coming from same ip address which causes denial of service or brut force attack. 

# Setting up Express Headers.

- Install express helmet package with npm install helmet

- simply use this before any middle is called inside app.use


# Data sanitization 

- install express called express-mongo-sanitize & xss-clean

- Here we are preventing NoSQL query injectionn and XSS attack by sanitizing data.