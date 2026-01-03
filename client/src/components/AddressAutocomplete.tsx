import { useEffect, useState } from "react";
import usePlacesAutocomplete, {
    getGeocode,
    getZipCode,
} from "use-places-autocomplete";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Command, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Loader2, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

declare global {
    interface Window {
        google: any;
    }
}

interface AddressAutocompleteProps {
    onSelect: (address: {
        street: string;
        city: string;
        state: string;
        zip: string;
        country: string;
    }) => void;
    defaultValue?: string;
    className?: string;
}

const LIBRARIES: ("places")[] = ["places"];

export function AddressAutocomplete({ onSelect, defaultValue = "", className }: AddressAutocompleteProps) {
    const [scriptLoaded, setScriptLoaded] = useState(false);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        const loadScript = () => {
            if (window.google?.maps?.places) {
                setScriptLoaded(true);
                return;
            }

            const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
            if (!apiKey) {
                console.warn("Google Maps API Key missing!");
                // We still allow rendering, but it won't work perfectly.
                // In a real app we might show an error or fallback.
                return;
            }

            const script = document.createElement("script");
            script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
            script.async = true;
            script.onload = () => setScriptLoaded(true);
            document.body.appendChild(script);
        };

        loadScript();
    }, []);

    if (!scriptLoaded) {
        return (
            <div className="relative">
                <Input disabled placeholder="Loading specific address search..." className={className} />
                <Loader2 className="absolute right-3 top-2.5 h-4 w-4 animate-spin opacity-50" />
            </div>
        );
    }

    return <AddressSearch onSelect={onSelect} defaultValue={defaultValue} className={className} open={open} setOpen={setOpen} />;
}

function AddressSearch({ onSelect, defaultValue, className, open, setOpen }: any) {
    const {
        ready,
        value,
        suggestions: { status, data },
        setValue,
        clearSuggestions,
    } = usePlacesAutocomplete({
        requestOptions: {
            componentRestrictions: { country: ["it", "es", "fr", "de", "at"] }, // Limit to main EU countries
        },
        debounce: 300,
        defaultValue,
    });

    const handleSelect = async (address: string) => {
        setValue(address, false);
        clearSuggestions();
        setOpen(false);

        try {
            const results = await getGeocode({ address });
            const zip = await getZipCode(results[0], false);

            const components = results[0].address_components;

            const getComponent = (type: string) =>
                components.find((c: any) => c.types.includes(type))?.long_name || "";

            // Naive mapping, google places is complex
            // Street Number
            const streetNumber = getComponent("street_number");
            const route = getComponent("route");
            const city = getComponent("locality") || getComponent("administrative_area_level_3");
            const state = getComponent("administrative_area_level_2"); // Province usually
            const country = getComponent("country");

            onSelect({
                street: `${route} ${streetNumber}`.trim(),
                city,
                state,
                zip: zip || "",
                country
            });

        } catch (error) {
            console.error("Error: ", error);
        }
    };

    return (
        <div className="relative w-full">
            <Input
                value={value}
                onChange={(e) => {
                    setValue(e.target.value);
                    if (e.target.value) setOpen(true);
                }}
                disabled={!ready}
                placeholder="Start typing your address..."
                className={className}
                autoComplete="off" // Disable browser autocomplete
            />
            {status === "OK" && open && (
                <div className="absolute z-50 w-full mt-1 bg-popover text-popover-foreground rounded-md border shadow-md animate-in fade-in-0 zoom-in-95">
                    <Command>
                        <CommandList>
                            <CommandGroup>
                                {data.map(({ place_id, description }) => (
                                    <CommandItem
                                        key={place_id}
                                        onSelect={() => handleSelect(description)}
                                        className="cursor-pointer"
                                    >
                                        <MapPin className="mr-2 h-4 w-4 opacity-50" />
                                        {description}
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </div>
            )}
        </div>
    );
}
