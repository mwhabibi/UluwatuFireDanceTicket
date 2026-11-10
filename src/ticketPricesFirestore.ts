import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { db } from "./ticketPricesStore";
import type { TicketPrices } from "./ticketPrices";

const priceFields = ["showAdult", "showChild", "comboAdult", "comboChild"] as const;
const priceDocument = db ? doc(db, "settings", "ticketPrices") : null;

function parsePrices(value: Record<string, unknown>): TicketPrices | null {
  const prices = {} as TicketPrices;
  for (const field of priceFields) {
    const amount = value[field];
    if (typeof amount !== "number" || !Number.isSafeInteger(amount) || amount < 0) {
      return null;
    }
    prices[field] = amount;
  }
  return prices;
}

export function subscribeTicketPrices(
  onPriceChange: (prices: TicketPrices) => void,
  onError: (error: Error) => void,
) {
  if (!priceDocument) {
    onError(new Error("Firebase belum dikonfigurasi."));
    return () => {};
  }

  return onSnapshot(
    priceDocument,
    (snapshot) => {
      const prices = snapshot.exists() ? parsePrices(snapshot.data()) : null;
      if (!prices) {
        onError(new Error("Dokumen harga belum ada atau formatnya tidak sesuai."));
        return;
      }
      onPriceChange(prices);
    },
    onError,
  );
}

export async function saveTicketPrices(prices: TicketPrices) {
  if (!priceDocument) throw new Error("Firebase belum dikonfigurasi.");
  await setDoc(priceDocument, prices);
}
