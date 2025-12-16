import React from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";




// Validation Schema
const signupSchema = yup.object({
  name: yup
    .string()
    .required("Full Name is required")
    .min(2, "Name must be at least 2 characters"),
  email: yup
    .string()
    .email("Invalid email address")
    .required("Email is required"),
  phoneNumber: yup.string().nullable(),
  password: yup
    .string()
    .required("Password is required")
    .min(6, "Password must be at least 6 characters"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "Passwords must match")
    .required("Confirm Password is required"),
});

type SignupFormInputs = yup.InferType<typeof signupSchema>;

const SignupPage: React.FC = () => {
  const { register: registerAuth } = useAuth();
  const navigate = useNavigate();
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError
  } = useForm<SignupFormInputs>({
    resolver: yupResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      phoneNumber: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit: SubmitHandler<SignupFormInputs> = async (data) => {
    try {
      await registerAuth({ 
          name: data.name, 
          email: data.email, 
          phoneNumber: data.phoneNumber || undefined, 
          password: data.password,
          confirmPassword : data.confirmPassword
      });
      navigate("/login");
    } catch (err: any) {
        // Handle backend validation errors gracefully
        if(err.response?.data?.errors) {
            err.response.data.errors.forEach((e: any) => {
                setError(e.field, { type: "server", message: e.message });
            });
        } else {
             setError("root", { type: "server", message: err.response?.data?.message || "Registration failed" });
        }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-cream-50">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md border border-cream-200">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">Create Account</h1>
        <p className="text-center text-gray-500 mb-6">Join the Inventory System</p>
        
        {errors.root && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
            {errors.root.message}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-bronze-500 outline-none transition ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="John Doe"
              {...register("name")}
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input
              type="email"
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-bronze-500 outline-none transition ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="admin@example.com"
              {...register("email")}
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <input
              type="tel"
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-bronze-500 outline-none transition ${errors.phoneNumber ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="+91 9876543210"
              {...register("phoneNumber")}
            />
             {errors.phoneNumber && <p className="text-red-500 text-xs mt-1">{errors.phoneNumber.message}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-bronze-500 outline-none transition ${errors.password ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="••••••••"
              {...register("password")}
            />
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
            <input
              type="password"
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-bronze-500 outline-none transition ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="••••••••"
              {...register("confirmPassword")}
            />
            {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-bronze-500 hover:bg-bronze-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Signing Up..." : "Sign Up"}
          </button>
        </form>
        
        <p className="mt-4 text-center text-sm text-gray-500">
          Already have an account? <Link to="/login" className="text-bronze-600 hover:underline">Log in</Link>
        </p>
      </div>
    </div>
  );
};

export default SignupPage;
