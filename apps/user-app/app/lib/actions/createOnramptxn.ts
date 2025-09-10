import { authOptions } from "../auth";
import { getServerSession } from "next-auth";
export async function createOnrampTransaction (amount: number, provider : string) {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
}