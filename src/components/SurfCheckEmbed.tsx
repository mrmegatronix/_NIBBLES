import { useEffect, useRef } from 'react';

export function SurfCheckEmbed({ theme = 'dark' }: { theme?: 'dark' | 'light' }) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      const f = iframeRef.current;
      if (f && e.data && e.data.scEmbed && e.source === f.contentWindow && typeof e.data.height === 'number') {
        f.style.height = `${e.data.height}px`;
      }
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  return (
    <div className="rounded-2xl border bg-card p-4">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="font-display text-base font-bold">New Brighton Surf &amp; Bar Forecast (SurfCheck NZ)</h2>
        <a
          href="https://surfcheck.nz/spots/new-brighton/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-medium text-primary hover:underline"
        >
          SurfCheck.nz →
        </a>
      </div>
      <div className="overflow-hidden rounded-xl border bg-background">
        <iframe
          ref={iframeRef}
          id="scfc4n1b7d"
          src={`https://surfcheck.nz/embed/?spot=new-brighton&view=max&theme=${theme}`}
          width="100%"
          height={620}
          loading="lazy"
          style={{ border: 0, maxWidth: '760px' }}
          title="New Brighton surf forecast"
          className="mx-auto block"
        />
      </div>
      <p className="mt-1.5 text-xs text-muted-foreground">
        <a
          href="https://surfcheck.nz/spots/new-brighton/"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:underline"
        >
          New Brighton surf forecast
        </a>{' '}
        · NIBBLES
      </p>
    </div>
  );
}
