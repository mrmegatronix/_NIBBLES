import { useMemo, useState } from 'react';
import { Check, ChevronsUpDown, LocateFixed, MapPin, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { NZ_SPOTS_125, type NzFishingSpot } from '@/data/nzSpots125';

interface SpotComboboxProps {
  selectedSpot: NzFishingSpot;
  onSelectSpot: (spot: NzFishingSpot) => void;
  onLocateNearest: () => void;
  locating?: boolean;
}

export function SpotCombobox({
  selectedSpot,
  onSelectSpot,
  onLocateNearest,
  locating = false,
}: SpotComboboxProps) {
  const [open, setOpen] = useState(false);

  const groupedByRegion = useMemo(() => {
    const map = new Map<string, NzFishingSpot[]>();
    for (const s of NZ_SPOTS_125) {
      const key = `${s.island} — ${s.region}`;
      const list = map.get(key) ?? [];
      list.push(s);
      map.set(key, list);
    }
    return Array.from(map.entries());
  }, []);

  return (
    <div className="flex items-center gap-1.5 min-w-0">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="h-9 max-w-[260px] justify-between gap-2 bg-card/80 px-3 text-xs sm:max-w-[360px] sm:text-sm"
            >
              <span className="flex min-w-0 items-center gap-2 truncate">
                <Search className="h-3.5 w-3.5 shrink-0 text-primary" />
                <span className="truncate font-medium">
                  {selectedSpot.name} · {selectedSpot.region}
                </span>
                <span className="hidden text-xs text-muted-foreground lg:inline whitespace-nowrap">
                  ({NZ_SPOTS_125.length} NZ Spots)
                </span>
              </span>
              <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 opacity-60" />
            </Button>
          }
        />
        <PopoverContent className="w-[330px] p-0 sm:w-[400px]" align="center">
          <Command>
            <CommandInput placeholder="Search 125 NZ spots or regions..." />
            <CommandList className="max-h-80">
              <CommandEmpty>No fishing spot found.</CommandEmpty>
              {groupedByRegion.map(([groupName, spots]) => (
                <CommandGroup key={groupName} heading={groupName}>
                  {spots.map((spot) => (
                    <CommandItem
                      key={spot.id}
                      value={`${spot.name} ${spot.region} ${spot.island}`}
                      onSelect={() => {
                        onSelectSpot(spot);
                        setOpen(false);
                      }}
                      className="flex items-center justify-between gap-2"
                    >
                      <span className="flex min-w-0 items-center gap-2 truncate">
                        <MapPin className="h-3.5 w-3.5 shrink-0 text-primary" />
                        <span className="truncate">{spot.name}</span>
                      </span>
                      {spot.id === selectedSpot.id && (
                        <Check className="h-4 w-4 shrink-0 text-emerald-400" />
                      )}
                    </CommandItem>
                  ))}
                </CommandGroup>
              ))}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <Button
        size="icon"
        variant="outline"
        onClick={onLocateNearest}
        disabled={locating}
        className="h-9 w-9 shrink-0"
        title="Find Nearest NZ Fishing Spot via GPS"
        aria-label="Find nearest spot"
      >
        <LocateFixed className={`h-4 w-4 text-primary ${locating ? 'animate-pulse' : ''}`} />
      </Button>
    </div>
  );
}
