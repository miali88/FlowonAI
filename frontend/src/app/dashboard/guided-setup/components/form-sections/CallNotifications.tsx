import { Control, useWatch } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { FormField, FormItem, FormControl, FormMessage, FormLabel } from "@/components/ui/form";
import { useEffect, useState } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

import { FormValues } from "../schema";

interface CallNotificationsProps {
  control: Control<FormValues>;
  errors: any;
  setValue?: (name: any, value: any, options?: any) => void;
}

export default function CallNotifications({
  control,
  errors,
  setValue,
}: CallNotificationsProps) {
  // State to track if fields have been touched (for hiding validation errors during initial typing)
  const [emailTouched, setEmailTouched] = useState(false);
  const [phoneTouched, setPhoneTouched] = useState(false);
  
  // Watch values for conditional rendering
  const emailNotificationsEnabled = useWatch({
    control,
    name: "callNotifications.emailNotifications.enabled",
  });
  
  const smsNotificationsEnabled = useWatch({
    control,
    name: "callNotifications.smsNotifications.enabled",
  });

  // Reset touched state when toggles change
  useEffect(() => {
    if (!emailNotificationsEnabled) {
      setEmailTouched(false);
    }
  }, [emailNotificationsEnabled]);

  useEffect(() => {
    if (!smsNotificationsEnabled) {
      setPhoneTouched(false);
    }
  }, [smsNotificationsEnabled]);

  // Initialize email field with empty string when enabled
  useEffect(() => {
    if (emailNotificationsEnabled && setValue) {
      setValue("callNotifications.emailNotifications.email", "", { shouldValidate: false });
      console.log("Email notifications enabled, initialized email field with empty string");
    }
  }, [emailNotificationsEnabled, setValue]);

  // Initialize phone number field with empty string when enabled
  useEffect(() => {
    if (smsNotificationsEnabled && setValue) {
      setValue("callNotifications.smsNotifications.phoneNumber", "", { shouldValidate: false });
      console.log("SMS notifications enabled, initialized phone field with empty string");
    }
  }, [smsNotificationsEnabled, setValue]);

  return (
    <Card className={errors.callNotifications ? "border-red-500" : ""}>
      <Accordion type="single" collapsible>
        <AccordionItem value="call-notifications" className="border-none">
          <CardHeader className="border-b">
            <AccordionTrigger className="hover:no-underline">
              <CardTitle>Call Notifications</CardTitle>
            </AccordionTrigger>
          </CardHeader>
          <AccordionContent>
            <CardContent className="space-y-4 pt-4">
              <div className="text-sm text-gray-500 mb-4">
                Configure how you want to be notified about calls and messages.
              </div>
              <div className="space-y-4">
                <FormField
                  control={control}
                  name="callNotifications.emailNotifications.enabled"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between">
                      <FormLabel>Email Notifications</FormLabel>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {emailNotificationsEnabled && (
                  <FormField
                    control={control}
                    name="callNotifications.emailNotifications.email"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="Enter your email"
                            {...field}
                            value={field.value || ""}
                            onBlur={(e) => {
                              field.onBlur();
                              setEmailTouched(true);
                            }}
                            className={
                              emailTouched && errors.callNotifications?.emailNotifications?.email
                                ? "border-red-500"
                                : ""
                            }
                          />
                        </FormControl>
                        {emailTouched && <FormMessage />}
                      </FormItem>
                    )}
                  />
                )}

                {/* SMS Notifications - temporarily hidden
                <FormField
                  control={control}
                  name="callNotifications.smsNotifications.enabled"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between">
                      <FormLabel>SMS Notifications</FormLabel>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {smsNotificationsEnabled && (
                  <FormField
                    control={control}
                    name="callNotifications.smsNotifications.phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            type="tel"
                            placeholder="Add your phone number..."
                            {...field}
                            value={field.value || ""}
                            onBlur={(e) => {
                              field.onBlur();
                              setPhoneTouched(true);
                            }}
                          />
                        </FormControl>
                        {phoneTouched && <FormMessage />}
                      </FormItem>
                    )}
                  />
                )} */}
              </div>
            </CardContent>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Card>
  );
} 