import { Control, ControllerRenderProps, Controller, useWatch } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { FormField, FormItem, FormControl, FormMessage } from "@/components/ui/form";
import { useEffect, useState } from "react";

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
    <Card>
      <CardHeader>
        <CardTitle>Call Notifications</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-gray-500 mb-4">
          Get notified as soon as a new call comes in.
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Email Notifications</Label>
              <Controller
                control={control}
                name="callNotifications.emailNotifications.enabled"
                render={({ field }: { field: any }) => (
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
            </div>
            {emailNotificationsEnabled && (
              <FormField
                control={control}
                name="callNotifications.emailNotifications.email"
                render={({
                  field,
                }: {
                  field: ControllerRenderProps<
                    FormValues,
                    "callNotifications.emailNotifications.email"
                  >;
                }) => (
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
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Text Message Notifications</Label>
              <Controller
                control={control}
                name="callNotifications.smsNotifications.enabled"
                render={({ field }: { field: any }) => (
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
            </div>
            {smsNotificationsEnabled && (
              <FormField
                control={control}
                name="callNotifications.smsNotifications.phoneNumber"
                render={({
                  field,
                }: {
                  field: ControllerRenderProps<
                    FormValues,
                    "callNotifications.smsNotifications.phoneNumber"
                  >;
                }) => (
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
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 