import { authOptions } from "@/app/lib/auth"
import redis from "@/lib/redis"
import NextAuth from "next-auth"

const handler = NextAuth(authOptions)
 
export { handler as GET, handler as POST }

handler.events = {
    async signOut({ token }: { token?: { number?: string } }) {
        if(token?.number) {
            await redis.del(`session:phone:${token.number}`)
        }
    }
}