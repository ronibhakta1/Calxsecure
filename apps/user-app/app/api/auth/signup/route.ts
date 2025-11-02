
import  db  from "@repo/db/client";
import bcrypt from "bcrypt";

export async function POST(request: Request){

    try{
        const { phoneNumber, password, name, email, userPin} = await request.json();

        if(!phoneNumber || !password){
            return new Response(JSON.stringify({message: "Phone number and password are required"}), {status: 400});
        }
        const existingUser = await db.user.findUnique({
            where: {number: phoneNumber}

        })
        if(existingUser){
            return new Response(JSON.stringify({message: "User with this phone number already exists"}), {status: 400});
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const hashedPin = await bcrypt.hash(userPin, 10);

        const newUser = await db.user.create({
            data:{
                name,
                number:phoneNumber,
                email : email || null,
                password: hashedPassword,
                userpin : hashedPin,
            }
        })
        return new Response(JSON.stringify({message: "User created successfully", userId: newUser.id}), {status: 201});
    }catch(error){
        console.error("Error during user signup:", error);
        return new Response(JSON.stringify({message: "Internal Server Error"}), {status: 500});
    }
}