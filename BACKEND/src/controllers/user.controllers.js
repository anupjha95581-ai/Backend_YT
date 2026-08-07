import asynchandler from "../utils/asynchaldler.js";



const registerUser = asynchandler(async (req, res) => {
    const { fullName, email, username } = req.body;

    res.status(200).json({
        success: true,
        message: "Register route is working",
        receivedData: {
            fullName: fullName || null,
            email: email || null,
            username: username || null,
        },
    });

})

export { registerUser };