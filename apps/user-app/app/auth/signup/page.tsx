"use client";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import axios from "axios"

export default function SignUpPage() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [name , setName] = useState("");
  const [email , setEmail] = useState("");
  const [userPin , setPin] = useState("");
  const [image , setImg] = useState("");
  const [error , setError] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError("");

  try {
    const signupResponse = await axios.post("/api/auth/signup", {
      name,
      phoneNumber,
      password,
      email,
      userPin, 
    });

    console.log("Signup success:", signupResponse.data);


    const signInResult = await signIn<"credentials">("credentials", {
      redirect: false,          
      phone: phoneNumber,       
      password,
    });

    if (signInResult?.error) {
      setError("Signup succeeded, but login failed. Try signing in manually.");
      router.push("/auth/signin");
      return;
    } else {
      router.push("/home");
    }
  } catch (err: any) {
    console.error("Signup error:", err);
    const msg = err.response?.data?.message || err.message || "Something went wrong.";
    setError(msg);
  }
};

  return (
    <div className="flex items-center justify-center p-2">
      <Card className=" w-2xl shadow-lg    flex flex-col items-center">
        <CardHeader className="text-center ">
          <CardTitle className="font-bold">Create Account</CardTitle>
        </CardHeader>
        <CardContent>
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          <form onSubmit={handleSubmit} className="space-y-4 flex flex-col items-center">
            <div className="flex items-center justify-between">
              <label className="w-1/3 block text-sm font-medium mb-1">Profile picture</label>
              <input
                type="file"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      setImg(reader.result as string);
                    };
                    reader.readAsDataURL(file);
                  }
                }}
                className="p-2 w-1/2 border rounded-md hover:cursor-pointer"
              />
            </div>
            <div className="flex items-center justify-between w-full">
              <label className="w-1/2 block text-sm font-medium mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2 border rounded-md outline-none "
                placeholder="Enter name"
                required
              />
            </div>
            <div className="flex items-center justify-between w-full">
              <label className="w-1/2 block text-sm font-medium mb-1">
                Phone Number
              </label>
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full p-2 border rounded-md outline-none "
                placeholder="Enter number"
                required
              />
              
            </div>
            <div className="flex items-center justify-between w-full">
              <label className="w-1/2 block text-sm font-medium mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2 border rounded-md outline-none "
                placeholder="Enter email"
              />

            </div>
            <div className="flex items-center justify-between w-full">
              <label className="w-1/2 block text-sm font-medium mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 border rounded-md outline-none "
                placeholder="Enter password"
                required
              />
            </div>
            <div className="flex items-center justify-between w-full">
              <label className="w-1/2 block text-sm font-medium mb-1">Userpin</label>
              <input
                type="password"
                value={userPin}
                onChange={(e) => setPin(e.target.value)}
                className="w-full p-2 border rounded-md outline-none "
                placeholder="Enter pin"
                required
              />
            </div>
            
            <button
              type="submit"
              className="w-2xl  bg-zinc-400 p-2 dark:bg-zinc-600 rounded-md hover:bg-zinc-600 transition"
            >
              Create Account
            </button>
          </form>
          
        </CardContent>
        <CardFooter className="text-sm  text-gray-600">
          
          Already have an account?{" "}
          <a
            href="/auth/signin"
            className="ml-1 text-zinc-500 hover:underline hover:text-zinc-900"
          >
            Sign In
          </a>
        </CardFooter>
      </Card>
    </div>
  );
}
