"use client";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
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
    <div className="flex items-center justify-center  bg-zinc-900 p-2">
      <Card className=" max-w-2xl shadow-lg bg-zinc-800 text-white flex flex-col items-center">
        <CardHeader className="text-center ">
          <CardTitle className="font-bold">Create Account</CardTitle>
        </CardHeader>
        <CardContent>
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Profile picture</label>
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
                className="p-2 border rounded-md hover:cursor-pointer"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2 border rounded-md outline-none bg-zinc-700 text-white"
                placeholder="Enter name"
                required
              />
            </div>
            <div>
              
              <label className="block text-sm font-medium mb-1">
                Phone Number
              </label>
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full p-2 border rounded-md outline-none bg-zinc-700 text-white"
                placeholder="Enter number"
                required
              />
              
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2 border rounded-md outline-none bg-zinc-700 text-white"
                placeholder="Enter email"
              />

            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 border rounded-md outline-none bg-zinc-700 text-white"
                placeholder="Enter password"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Userpin</label>
              <input
                type="password"
                value={userPin}
                onChange={(e) => setPin(e.target.value)}
                className="w-full p-2 border rounded-md outline-none bg-zinc-700 text-white"
                placeholder="Enter pin"
                required
              />
            </div>
            
            <button
              type="submit"
              className="w-full bg-zinc-500 text-white py-2 rounded-md hover:bg-zinc-600 transition"
            >
              Create Account
            </button>
          </form>
          
        </CardContent>
        <CardFooter className="text-sm  text-gray-600">
          
          Already have an account?{" "}
          <a
            href="/auth/signin"
            className="ml-1 text-zinc-500 hover:underline"
          >
            Sign In
          </a>
        </CardFooter>
      </Card>
    </div>
  );
}
