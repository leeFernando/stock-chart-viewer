import { StockPriceChart } from "./components/stock-price-chart"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col p-24">
      <StockPriceChart />
    </main>
  )
}
