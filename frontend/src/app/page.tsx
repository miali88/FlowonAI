import { redirect } from 'next/navigation';

export default function RootPage() {
  // By default, redirect to the English version
  redirect('/en');
}
