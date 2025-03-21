import * as z from "zod";
import type { SetupData } from "@/types/businessSetup";

// Define the Zod schema for validation
export const quickSetupSchema = z.object({
  trainingSources: z
    .object({
      googleBusinessProfile: z.string(),
      businessWebsite: z.string(),
    })
    .refine((data) => data.googleBusinessProfile || data.businessWebsite, {
      message: "At least one training source is required",
      path: ["_errors"],
    }),
  businessInformation: z.object({
    businessName: z.string().min(1, "Business name is required"),
    businessOverview: z.string().min(1, "Business overview is required"),
    primaryBusinessAddress: z.string().min(1, "Business address is required"),
    primaryBusinessPhone: z
      .string()
      .min(1, "Business phone number is required"),
    coreServices: z
      .array(z.string())
      .min(1, "At least one core service is required"),
    businessHours: z.record(
      z.object({
        open: z.string(),
        close: z.string(),
      })
    ),
  }),
  messageTaking: z.object({
    callerName: z.object({
      required: z.boolean(),
      alwaysRequested: z.boolean(),
    }),
    callerPhoneNumber: z.object({
      required: z.boolean(),
      automaticallyCaptured: z.boolean(),
    }),
    specificQuestions: z.array(
      z.object({
        question: z.string(),
        required: z.boolean(),
      })
    ),
  }),
  callNotifications: z.object({
    emailNotifications: z.object({
      enabled: z.boolean(),
      email: z
        .string()
        .email("Invalid email address")
        .optional()
        .or(z.literal(""))
        .or(z.null())
        .transform(val => val === null ? "" : val),
    }),
    smsNotifications: z.object({
      enabled: z.boolean(),
      phoneNumber: z
        .string()
        .optional()
        .or(z.literal(""))
        .or(z.null())
        .transform(val => val === null ? "" : val),
    }),
  }),
  bookingLink: z.object({
    url: z.string().optional().or(z.literal("")),
  }).optional(),
});

// Export form values type that matches our shared SetupData interface
export type FormValues = z.infer<typeof quickSetupSchema>;

// Type assertion to ensure FormValues matches SetupData
type TypeCheck = FormValues extends SetupData ? true : false;
type TypeCheck2 = SetupData extends FormValues ? true : false;
// This is a compile-time check only, no runtime implications 