import ReceiptGenerator from '@/components/ReceiptGenerator'
import { Toaster } from "@/components/ui/toaster"

export default function Home() {
  return (
    <main className="container mx-auto py-8">
      <ReceiptGenerator />
      <Toaster />
    </main>
  )
}