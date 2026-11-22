import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Check, Copy, QrCode, Share2, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { type NzFishingSpot } from '@/data/nzSpots125';

export function ShareQrDialog({ selectedSpot }: { selectedSpot: NzFishingSpot }) {
  const [mode, setMode] = useState<'spot' | 'app'>('spot');
  const [copied, setCopied] = useState(false);

  const baseUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}${window.location.pathname}`
      : 'https://mrmegatronix.github.io/_NIBBLES/';

  const shareUrl = mode === 'spot' ? `${baseUrl}?spot=${selectedSpot.id}` : baseUrl;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const nativeShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: `Nibbles NZ — ${selectedSpot.name}`,
          text: `Live NZ fishing forecast, tides & solunar bite times for ${selectedSpot.name}`,
          url: shareUrl,
        });
      } catch {
        // user cancelled
      }
    }
  };

  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 px-2.5 whitespace-nowrap"
            title="Share Nibbles QR Code"
          >
            <QrCode className="h-4 w-4 text-primary" />
            <span className="hidden sm:inline text-xs">Share QR</span>
          </Button>
        }
      />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display flex items-center gap-2">
            <Smartphone className="h-5 w-5 text-primary" />
            Share Nibbles NZ
          </DialogTitle>
          <DialogDescription>
            Scan with any phone camera to open the live fishing forecast instantly.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-3 py-1">
          <div className="grid w-full grid-cols-2 gap-1.5 rounded-lg border bg-muted/40 p-1">
            <Button
              size="xs"
              variant={mode === 'spot' ? 'default' : 'ghost'}
              onClick={() => setMode('spot')}
              className="truncate"
            >
              This Spot ({selectedSpot.name.split(' ')[0]})
            </Button>
            <Button
              size="xs"
              variant={mode === 'app' ? 'default' : 'ghost'}
              onClick={() => setMode('app')}
            >
              Full App Home
            </Button>
          </div>

          <div className="rounded-2xl border-2 border-cyan-500/30 bg-white p-4 shadow-lg">
            <QRCodeSVG value={shareUrl} size={196} level="M" includeMargin />
          </div>

          <div className="flex w-full items-center gap-2">
            <Input value={shareUrl} readOnly className="font-mono text-xs" />
            <Button size="sm" variant="secondary" onClick={copyLink} className="shrink-0 gap-1">
              {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
              {copied ? 'Copied' : 'Copy'}
            </Button>
          </div>

          {typeof navigator !== 'undefined' && 'share' in navigator && (
            <Button variant="outline" size="sm" onClick={nativeShare} className="w-full gap-1.5">
              <Share2 className="h-4 w-4 text-primary" /> Share via Device
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
