import Commonform from "@/Common/CommonForm";
import { SignupInputs } from "@/Options";
import { SignUpUser } from "@/store/authSlice/authSlice";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const initialState = {
  firstName: "",
  lastName: "",
  email: "",
  password: ""
};

export default function Signup() {
  const [formData, setFormData] = useState(initialState);
  const { User, isAuthenticated, loading } = useSelector((state) => state.auth);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const OnSubmit = async (e) => {

    e.preventDefault();
    dispatch(SignUpUser(formData))
      .unwrap()
      .then((res) => {
        // Handle success from API response
        if (res.success) {
          toast.success(res.message || "Account created successfully");
          navigate("/auth/signin");
        } else {
          toast.error(res.message || "Failed to create account");
        }
      })
      .catch((err) => {
        // err comes from rejectWithValue in thunk
        toast.error(err.message || err.data?.message || "Failed to create account");
      });
  };

  return (
    <div className="w-full flex items-center justify-center px-4 py-10">

      {/* Card */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-200 p-8 transition-all duration-300">

        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            Create Account
          </h2>
          <p className="text-pink-400 text-sm mt-1">
            Start your journey with us
          </p>
        </div>



        {/* Form */}
        <Commonform
          formControls={SignupInputs}
          FormData={formData}
          setFormData={setFormData}
          buttonText={loading ? "Creating Account..." : "Sign Up"}
          onSubmit={OnSubmit}
          isDisabled={loading}
        />

        {/* Divider */}
        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-[1px] bg-gray-200"></div>
          <span className="text-xs text-gray-400">OR</span>
          <div className="flex-1 h-[1px] bg-gray-200"></div>
        </div>

        {/* Footer */}
        <p className="text-gray-500 text-sm text-center">
          Already have an account?{" "}
          <span
            onClick={() => navigate("/auth/signin")}
            className="text-pink-400 font-medium cursor-pointer hover:underline"
          >
            Sign In
          </span>
        </p>

      </div>
    </div>
  );
}