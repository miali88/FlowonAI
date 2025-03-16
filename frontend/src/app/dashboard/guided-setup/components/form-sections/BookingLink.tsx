import { Control } from "react-hook-form";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface BookingLinkProps {
  control: Control<any>;
  errors: any;
}

export default function BookingLink({ control, errors }: BookingLinkProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Booking Link (Optional)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <FormField
          control={control}
          name="bookingLink.url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Booking URL</FormLabel>
              <FormControl>
                <Input
                  placeholder="https://calendly.com/your-link"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Enter your Calendly or other booking system URL
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
} 