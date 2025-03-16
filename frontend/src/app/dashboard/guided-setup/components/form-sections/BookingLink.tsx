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
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface BookingLinkProps {
  control: Control<any>;
  errors: any;
}

export default function BookingLink({ control, errors }: BookingLinkProps) {
  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Booking Link (optional)</CardTitle>
        <Button
          className="bg-blue-500 hover:bg-blue-600 text-white"
          onClick={() => window.open("/guide/appointment_booking", "_blank")}
        >
          View booking guide <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
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
                  placeholder="your-link-here"
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