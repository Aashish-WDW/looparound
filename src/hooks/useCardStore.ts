import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Transaction {
    label: string;
    amount: number;
    time: string;
}

interface CardState {
    balance: number;
    uid: string;
    transactions: Transaction[];
    lastUpdated: string;

    // Actions
    setBalance: (amount: number) => void;
    addTransaction: (tx: Transaction) => void;
    resetCard: () => void;
    updateLastUpdated: () => void;
}

const DEFAULT_BALANCE = 1260;
const DEFAULT_UID = "04:A3:9F:22:8B";
const DEFAULT_TRANSACTIONS: Transaction[] = [
    { label: "Coffee", amount: -120, time: "2 mins ago" },
    { label: "Recharge", amount: 500, time: "1 hour ago" },
    { label: "Snacks", amount: -80, time: "3 hours ago" },
    { label: "Bus Fare", amount: -40, time: "Yesterday" },
];

export const useCardStore = create<CardState>()(
    persist(
        (set) => ({
            balance: DEFAULT_BALANCE,
            uid: DEFAULT_UID,
            transactions: DEFAULT_TRANSACTIONS,
            lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),

            setBalance: (amount) => set({ balance: amount }),

            addTransaction: (tx) => set((state) => ({
                transactions: [tx, ...state.transactions].slice(0, 10),
                balance: state.balance + tx.amount,
                lastUpdated: "Just now"
            })),

            updateLastUpdated: () => set({
                lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }),

            resetCard: () => set({
                balance: DEFAULT_BALANCE,
                uid: DEFAULT_UID,
                transactions: DEFAULT_TRANSACTIONS,
                lastUpdated: "Just now"
            }),
        }),
        {
            name: "looparound-card-storage",
        }
    )
);
