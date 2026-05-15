import Commonform from '@/Common/CommonForm';
import { ProfileUpdateInputs } from '../../Options/index';
import React, { useEffect, useState } from 'react';

import { cos } from 'three/src/nodes/math/MathNode.js';

const initialState = {
    firstName: "",
    lastName: "",
    email: ""
};

const Profile = () => {
    const { User } = useAuthStore();
    const { loading, updateUser } = useUserStore();
    const [formData, setFormData] = useState(initialState);

    const OnSubmit = async (e) => {
        e.preventDefault();

        if (userid) {
            console.log("User not ready");
            return;
        }
        await updateUser(formData, userid);
    };

    // ✅ Fetch user only ONCE
    useEffect(() => {
        if (User) {
            console.log("User loaded in Profile.jsx:", User);
        }
        const userid = User?._id;
    }, []);



    return (
        <div className="min-h-screen flex items-center justify-center bg-black text-white px-4">

            <div className="w-full max-w-3xl bg-zinc-900 border border-red-600/40 rounded-2xl shadow-2xl p-8">

                {/* Header */}
                <h1 className="text-3xl font-bold text-red-500 text-center mb-6">
                    Profile Settings
                </h1>

                {/* User Info */}
                <div className="bg-black/60 border border-red-500/30 rounded-xl p-5 mb-8">
                    <p><span className="text-red-500">First Name:</span> {User?.firstName}</p>
                    <p><span className="text-red-500">Last Name:</span> {User?.lastName}</p>
                    <p><span className="text-red-500">Email:</span> {User?.email}</p>
                </div>

                {/* Form */}
                <div className="bg-zinc-950 border border-red-500/30 rounded-xl p-6">
                    <Commonform
                        formControls={ProfileUpdateInputs}
                        FormData={formData}
                        setFormData={setFormData}
                        buttonText={loading ? "Updating..." : "Update Profile"}
                        onSubmit={OnSubmit}
                    />
                </div>

            </div>
        </div>
    );
};

export default Profile;