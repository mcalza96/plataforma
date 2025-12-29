import { createClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return redirect('/login');
  }

  const cookieStore = await cookies();
  const learnerId = cookieStore.get('learner_id')?.value;

  if (learnerId) {
    return redirect('/dashboard');
  }

  return redirect('/select-profile');
}
