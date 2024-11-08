const mongoose = require("mongoose");

/**
 * Function to connect to the MongoDB database.
 */
module.exports = () => {
	const connectionParams = { // Connection parameters
		useNewUrlParser: true,
		useUnifiedTopology: true,
	};
	try {
		mongoose.connect(process.env.DB, connectionParams); // Connect to the database
		console.log("Connected to database successfully"); // Log success message
	} catch (error) {
		console.log(error);
		console.log("Could not connect database!"); // Log error message
	}
};