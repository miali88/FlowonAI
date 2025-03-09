import { Control, ControllerRenderProps, Controller, useWatch } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { FormField, FormItem, FormControl, FormMessage } from "@/components/ui/form";

import { FormValues } from "../schema";

interface CallNotificationsProps {
  control: Control<FormValues>;
  errors: any;
}

export default function CallNotifications({
  control,
  errors,
}: CallNotificationsProps) {
  // Watch values for conditional rendering
  const emailNotificationsEnabled = useWatch({
    control,
    name: "callNotifications.emailNotifications.enabled",
  });
  
  const smsNotificationsEnabled = useWatch({
    control,
    name: "callNotifications.smsNotifications.enabled",
  });

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
                        className={
                          errors.callNotifications?.emailNotifications
                            ?.email
                            ? "border-red-500"
                            : ""
                        }
                      />
                    </FormControl>
                    <FormMessage />
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
                      />
                    </FormControl>
                    <FormMessage />
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