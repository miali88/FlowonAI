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
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface BookingLinkProps {
  control: Control<any>;
  errors: any;
}

export default function BookingLink({ control, errors }: BookingLinkProps) {
  return (
    <Card className="w-full">
      <Accordion type="single" collapsible>
        <AccordionItem value="message-taking" className="border-none">
          <CardHeader className="border-b">
            <AccordionTrigger className="hover:no-underline">
              <CardTitle>Booking Link (optional)</CardTitle>
            </AccordionTrigger>
          </CardHeader>
          <AccordionContent>
            <CardContent className="space-y-4">
              <div className="flex justify-end pt-4">
                <Button 
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                  onClick={() => window.open("/guide/appointment_booking", "_blank")}
                >
                  View Booking Guide <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
              <div className=" ">
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
              </div>
            </CardContent>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Card>
  );
} 