import Commonform from "@/Common/CommonForm";
import { ContactForm } from "@/Options";
import { addContact } from "@/store/userSlice/userSlice";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { Skeleton } from "@/Components/ui/skeleton";

const initialState = {
    name: "",
    email: "",
    message: "",
};

const Contact = () => {
    const [formData, setformData] = useState(initialState);
    const dispatch = useDispatch();

    const loading = useSelector((state) => state.user.loading);

    const OnSubmit = async (e) => {
        e.preventDefault();

        try {
            await dispatch(addContact(formData)).unwrap();

            toast.success("Message sent successfully");
            setformData(initialState);

        } catch (error) {
            toast.error(error?.message || "Something went wrong");
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 flex items-center justify-center px-4">

            <div className="w-full max-w-3xl bg-white shadow-2xl rounded-2xl border border-gray-100 p-8 md:p-10">

                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
                        Get in Touch
                    </h1>
                    <p className="text-gray-500 mt-2">
                        Have a question? We’re here to help you anytime.
                    </p>
                </div>

                {/* LOADING SKELETON */}
                {loading ? (
                    <div className="space-y-4">
                        <Skeleton className="h-10 w-full rounded-md" />
                        <Skeleton className="h-10 w-full rounded-md" />
                        <Skeleton className="h-32 w-full rounded-md" />
                        <Skeleton className="h-10 w-40 rounded-md" />
                    </div>
                ) : (
                    <Commonform
                        formControls={ContactForm}
                        FormData={formData}
                        setFormData={setformData}
                        onSubmit={OnSubmit}
                        buttonText="Send Message"
                    />
                )}

                {/* Footer */}
                <div className="text-center mt-6 text-xs text-gray-400">
                    We usually respond within 24 hours ⚡
                </div>
            </div>
        </div>
    );
};

export default Contact;