import { createServerClient } from '@/lib/supabase';

export async function ExploreAreas() {
  const supabase = await createServerClient();
  const { data: areas } = await supabase.from('areas').select('*');

  return (
    <div>
      <h2>Explore Areas</h2>
      <ul>{areas?.map((area) => <li key={area.id}>{area.name}</li>)}</ul>
    </div>
  );
}
