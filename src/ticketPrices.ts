import { useEffect, useState } from "react";
import { firebaseConfigured } from "./firebase";

export type TicketPrices = {
  showAdult: number;
  showChild: number;
  comboAdult: number;
  comboChild: number;
};

export const DEFAULT_TICKET_PRICES: TicketPrices = {
  showAdult: 175000,
  showChild: 90000,
  comboAdult: 250000,
  comboChild: 165000,
};

export type PriceStatus = "loading" | "connected" | "unconfigured" | "error";

export function useTicketPrices() {
  const [prices, setPrices] = useState<TicketPrices>(DEFAULT_TICKET_PRICES);
  const [status, setStatus] = useState<PriceStatus>(
    firebaseConfigured ? "loading" : "unconfigured",
  );

  useEffect(() => {
    if (!firebaseConfigured) {
      setStatus("unconfigured");
      return;
    }

    let disposed = false;
    let unsubscribe = () => {};
    void import("./ticketPricesFirestore")
      .then(({ subscribeTicketPrices }) => {
        if (disposed) return;
        unsubscribe = subscribeTicketPrices(
          (nextPrices) => {
            setPrices(nextPrices);
            setStatus("connected");
          },
          () => setStatus("error"),
        );
      })
      .catch(() => setStatus("error"));

    return () => {
      disposed = true;
      unsubscribe();
    };
  }, []);

  return { prices, status };
}
