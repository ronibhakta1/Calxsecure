import { atom } from "recoil";

export const p2pTransactionsAtom = atom<any[]>({
    key: "p2pTransactions",
    default: [],
});