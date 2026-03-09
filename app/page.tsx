'use client';

import { useRouter } from 'next/navigation';
import AddressForm from '@/components/AddressForm';

export default function HomePage() {
  const router = useRouter();

  function handleSubmit(address: string) {
    router.push(`/analyze?address=${encodeURIComponent(address)}`);
  }

  return <AddressForm onSubmit={handleSubmit} />;
}
