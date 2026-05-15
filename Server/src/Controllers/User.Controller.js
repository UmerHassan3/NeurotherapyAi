import User from '../Models/Auth.Model.js';

/* ================= FETCH USER ================= */
export const fetchUser = async (req, res) => {
    const {userId} = req.query;
    console.log("USER ID:", req.query.userId);
    try {
        const user = await User.findById(userId).select('-password'); // Exclude password

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json(user);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/* ================= UPDATE USER ================= */
export const updateUser = async (req, res) => {
    try {
        const { firstName, lastName, email } = req.body;
        const userId = req.params.userId; // better than params (secure)

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.firstName = firstName || user.firstName;
        user.lastName = lastName || user.lastName;
        user.email = email || user.email;

        const updatedUser = await user.save();

        res.status(200).json(updatedUser);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};