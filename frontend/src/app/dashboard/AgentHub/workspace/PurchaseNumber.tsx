import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PurchaseNumberProps {
  countryCodes: {
    countries: string[];
    [key: string]: any;
  };
  onNumberPurchased?: (number: string) => void;
}

const getCountryFlag = (countryCode: string): string => {
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0));
  
  return String.fromCodePoint(...codePoints);
};

export const PurchaseNumber: React.FC<PurchaseNumberProps> = ({ 
  countryCodes,
  onNumberPurchased 
}) => {
  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [availableNumbers, setAvailableNumbers] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAvailableNumbers = async () => {
      if (!selectedCountry) {
        console.log('No country selected, skipping fetch');
        return;
      }
      
      setIsLoading(true);
      setError(null);
      
      const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/twilio/available_numbers/${selectedCountry}`;
      console.log('Fetching numbers for country:', selectedCountry);
      console.log('Request URL:', url);
      
      try {
        const response = await fetch(url);
        console.log('Response status:', response.status);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Raw response data:', data);
        
        // Handle the dictionary response structure
        if (data.numbers && data.numbers[selectedCountry]) {
          const countryNumbers = data.numbers[selectedCountry];
          console.log(`Found ${countryNumbers.length} numbers for ${selectedCountry}:`, countryNumbers);
          setAvailableNumbers(countryNumbers);
        } else {
          console.log('No numbers found in response for country:', selectedCountry);
          setAvailableNumbers([]);
        }
      } catch (err) {
        console.error('Error fetching numbers:', err);
        setError('Failed to load available numbers. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAvailableNumbers();
  }, [selectedCountry]);

  const handleNumberSelection = (number: string) => {
    onNumberPurchased?.(number);
    setIsDialogOpen(false); // Only close dialog after selection
    setSelectedCountry(""); // Reset selected country
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <button 
          className="w-full px-3 py-2 hover:bg-accent cursor-pointer flex items-center gap-2 rounded-sm"
          onClick={(e) => {
            e.stopPropagation(); // Prevent event from bubbling up
            setIsDialogOpen(true);
          }}
        >
          <Plus className="h-4 w-4" />
          <span className="text-sm">Purchase a new number</span>
        </button>
      </DialogTrigger>
      <DialogContent onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Purchase Phone Number</DialogTitle>
          <DialogDescription>
            Select a phone number to purchase for your agent.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Country</label>
            <Select
              value={selectedCountry}
              onValueChange={setSelectedCountry}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a country" />
              </SelectTrigger>
              <SelectContent>
                {!countryCodes?.countries ? (
                  <SelectItem value="loading" disabled>
                    Loading countries...
                  </SelectItem>
                ) : countryCodes.countries.length === 0 ? (
                  <SelectItem value="none" disabled>
                    No countries available
                  </SelectItem>
                ) : (
                  countryCodes.countries.map((countryCode) => (
                    <SelectItem 
                      key={countryCode} 
                      value={countryCode}
                      className="flex items-center gap-2"
                    >
                      <span className="mr-2">{getCountryFlag(countryCode)}</span>
                      {countryCode}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          
          {selectedCountry && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Available Numbers</label>
              <div className="max-h-[200px] overflow-y-auto border rounded-md">
                {isLoading ? (
                  <div className="px-3 py-2 text-center text-muted-foreground">
                    Loading available numbers...
                  </div>
                ) : error ? (
                  <div className="px-3 py-2 text-center text-destructive">
                    {error}
                  </div>
                ) : availableNumbers.length === 0 ? (
                  <div className="px-3 py-2 text-center text-muted-foreground">
                    No numbers available for this country
                  </div>
                ) : (
                  availableNumbers.map((number) => (
                    <div
                      key={number}
                      className="px-3 py-2 hover:bg-accent cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNumberSelection(number);
                      }}
                    >
                      {number}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
