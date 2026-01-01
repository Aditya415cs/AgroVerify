import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Props { paths: string[] }

const SupportingFilesList: React.FC<Props> = ({ paths }) => {
  const [urls, setUrls] = useState<Record<string,string>>({});

  useEffect(() => {
    let mounted = true;
    (async () => {
      const mapping: Record<string,string> = {};
      for (const p of paths) {
        try {
          const { data } = await supabase.storage.from('documents').createSignedUrl(p, 60 * 60);
          if (data?.signedUrl) mapping[p] = data.signedUrl;
        } catch (e) {
          // ignore per-file failures
        }
      }
      if (mounted) setUrls(mapping);
    })();
    return () => { mounted = false };
  }, [paths]);

  return (
    <div>
      <p className="text-sm font-medium">Supporting Documents</p>
      <ul className="text-sm text-muted-foreground list-disc ml-5">
        {paths.map((p) => (
          <li key={p}>
            {urls[p] ? (
              <a href={urls[p]} target="_blank" rel="noreferrer" className="underline">{p.split('/').pop()}</a>
            ) : (
              <span>{p.split('/').pop()}</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SupportingFilesList;
