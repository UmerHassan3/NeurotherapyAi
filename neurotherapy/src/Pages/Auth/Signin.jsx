import Commonform from "@/Common/CommonForm";
import { SigninInputs } from "@/Options";
import { SignInUser } from "@/store/authSlice/authSlice";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";



export default function Signin() {
    const initialState = {
        email: "",
        password: "",
    };
    const [formData, setFormData] = useState(
        initialState);

    const { isAuthenticated, error, isLoading } = useSelector((state) => state.auth);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const OnSubmit = async (e) => {
        e.preventDefault();
        try {
            const result = await dispatch(SignInUser(formData)).unwrap();
            const role = result?.user?.role;
            toast.success("Sign In successful");
            navigate(role === "admin" ? "/admin/dashboard" : "/");
        } catch (err) {
            toast.error(err?.message || "Sign In failed");
        }
    };



    return (
        <div className="w-full flex justify-center">
            <div className="w-full max-w-md">

                <div className="bg-white/5 backdrop-blur-3xl border border-white/10 shadow-2xl rounded-3xl p-8">

                    <div className="text-center mb-8">
                        <h2 className="text-4xl font-bold text-black-400">
                            Welcome Back
                        </h2>
                        <p className="text-pink-400 text-sm mt-2">
                            Sign in to access your dashboard
                        </p>
                    </div>

                    {error && (
                        <div className="mb-4 text-red-200 bg-red-500/10 p-3 rounded-xl text-center">
                            {error}
                        </div>
                    )}

                    <Commonform
                        formControls={SigninInputs}
                        FormData={formData}
                        setFormData={setFormData}
                        buttonText={isLoading ? "Signing In..." : "Sign In"}
                        onSubmit={OnSubmit}
                        isDisabled={isLoading}
                    />

                    <p className="text-center text-sm text-black-300 mt-5">
                        Forgot password?{" "}
                        <span
                            onClick={() => navigate("/auth/forgot-password")}
                            className="text-pink-400 cursor-pointer hover:text-fuchsia-300"
                        >
                            Reset here
                        </span>
                    </p>

                    <p className="text-center text-sm text-black-300 mt-6">
                        Don’t have an account?{" "}
                        <Link to="/auth/signup" className="text-pink-400 font-semibold">
                            SignUp
                        </Link>
                    </p>

                </div>
            </div>
        </div>
    );
}