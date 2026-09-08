import { useEffect, useState } from 'react';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Cached at module scope so every page/component that uses this hook shares
// one fetch instead of each calling the backend separately.
let cachedRate = null;

export default function useUsdRate() {
  const [rate, setRate] = useState(cachedRate);

  useEffect(() => {
    if (cachedRate) return;
    axios
      .get(`${API_URL}/currency`)
      .then((res) => {
        cachedRate = res.data.usd_to_lkr;
        setRate(cachedRate);
      })
      .catch(() => {
        // If the rate can't be fetched, pages just skip showing the USD line.
      });
  }, []);

  return rate;
}

// Formats an LKR amount as an approximate USD string, e.g. "≈ $12.34 USD".
export function formatUsd(lkrAmount, rate) {
  if (!rate || !lkrAmount) return null;
  return `≈ $${(Number(lkrAmount) / rate).toFixed(2)} USD`;
}
