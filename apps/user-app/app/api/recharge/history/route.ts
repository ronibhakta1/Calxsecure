import prisma from "@repo/db/client";


export async function GET(req: Request){
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if(!userId){
        return new Response(JSON.stringify({error: "missing userId"}), {status: 400});
    }
    try{
        const history = await prisma.rechargeOrder.findMany({
            where: { userId : parseInt(userId) },
            include: {
                plan: true
            },
            orderBy: { createdAt: 'desc' }
        });
        return new Response(JSON.stringify(history), {status: 200});
    }catch(e){
        console.error("Error fetching recharge history:", e);
        return new Response(JSON.stringify({error: "Failed to fetch recharge history"}), {status: 500});
    }
}