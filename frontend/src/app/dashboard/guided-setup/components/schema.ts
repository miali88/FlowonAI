import * as z from "zod";

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
        .or(z.literal("")),
    }),
    smsNotifications: z.object({
      enabled: z.boolean(),
      phoneNumber: z.string().optional().or(z.literal("")),
    }),
  }),
});

export type FormValues = z.infer<typeof quickSetupSchema>; 