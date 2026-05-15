import { useState } from "react";
import Commonform from "@/Common/CommonForm";
import { ForgotPasswordInputs } from "../../Options/index";

import { toast } from "sonner";

const initialState = {
    email: ""
};

export default function Forgot() {
    const [formData, setFormData] = useState(initialState);
    const [submitted, setSubmitted] = useState(false);

    const { ForgotPassword, loading } = useAuthStore();

    const OnSubmit = async (e) => {
        e.preventDefault();

        try {
            const res = await ForgotPassword(formData); // assuming it returns response

            setSubmitted(true);

            // ✅ Better handling (avoid stale Zustand error)
            if (res?.success) {
                toast.success("Reset link sent to your email");
            } else {
                toast.error(res?.message || "Something went wrong");
            }

        } catch (err) {
            toast.error("Server error. Try again.");
        }
    };

    return (
        <div className="w-full flex items-center justify-center px-4 py-10">

            <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-200 p-8">

                {/* Header */}
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">
                        Forgot Password
                    </h2>
                    <p className="text-gray-500 text-sm mt-1">
                        Enter your email to receive a reset link
                    </p>
                </div>

               

                {/* Form */}
                <Commonform
                    formControls={ForgotPasswordInputs}
                    FormData={formData}
                    setFormData={setFormData}
                    onSubmit={OnSubmit}
                    buttonText={loading ? "Sending..." : "Send Reset Link"}
                    isDisabled={loading}
                />

                {/* Footer */}
                <p className="text-xs text-gray-400 text-center mt-5">
                    Check your spam folder if you don’t see the email.
                </p>

            </div>
        </div>
    );
}