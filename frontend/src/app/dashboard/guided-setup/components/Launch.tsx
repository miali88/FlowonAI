"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  CreditCard,
  PhoneForwarded,
  CheckCircle2,
  Loader2,
  Phone,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

interface LaunchProps {
  onNext: () => void;
}

export default function Launch({ onNext }: LaunchProps) {
  const [isForwarding, setIsForwarding] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { userId, getToken } = useAuth();

  useEffect(() => {
    async function fetchPhoneNumber() {
      try {
        setIsLoading(true);
        setError(null);
        
        // Get the authentication token
        const token = await getToken();
        if (!token) {
          throw new Error("Authentication required");
        }

        const response = await fetch(
          `${API_BASE_URL}/guided_setup/phone_number`,
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          }
        );

        if (!response.ok) {
          const errorData = await response.text();
          console.error("Error fetching phone number:", errorData);
          throw new Error("Failed to fetch phone number");
        }

        const data = await response.json();

        if (data.success && data.phone_number) {
          setPhoneNumber(data.phone_number);
        } else {
          throw new Error(data.error || "Invalid response format");
        }
      } catch (err) {
        console.error("Error fetching phone number:", err);
        setError("Could not load your Flowon phone number.");
        // Fallback to a constant
        setPhoneNumber("(814) 261-0317");
      } finally {
        setIsLoading(false);
      }
    }

    fetchPhoneNumber();
  }, [userId, getToken]);

  const handleCompleteSetup = async () => {
    try {
      setIsSubmitting(true);
      setError(null);
      
      // Get the authentication token
      const token = await getToken();
      if (!token) {
        throw new Error("Authentication required");
      }

      // Mark setup as complete
      const response = await fetch(
        `${API_BASE_URL}/guided_setup/mark_complete`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        const errorData = await response.text();
        console.error("Error marking setup as complete:", errorData);
        throw new Error("Failed to complete setup");
      }

      // Show success message
      setSuccessMessage(
        "Setup completed successfully! Redirecting to dashboard..."
      );

      // Proceed to next step after a short delay
      setTimeout(() => {
        onNext();
      }, 2000);
    } catch (err: any) {
      console.error("Error completing setup:", err);
      setError(err.message || "Failed to complete setup");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4 mb-8">
        <div className="flex justify-center">
          <div className="bg-blue-500 p-3 rounded-lg inline-block">
            <CheckCircle2 className="h-6 w-6 text-white" />
          </div>
        </div>
        <h2 className="text-2xl font-bold">Ready to Launch!</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Well done! Forward your business number to Flowon so she can start
          answering your calls. Don&apos;t have a business number yet? No
          problem - reach out and we&apos;ll get you sorted.
        </p>
      </div>

      {/* Show Flowon phone number */}
      <Card className="p-6 border-l-4 border-l-blue-500 bg-gray-50">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Phone className="h-5 w-5 text-blue-500" />
              Your Flowon Agent Number
            </h3>
            <p className="text-gray-600 mt-1">
              This is your dedicated agent number. Forward all business calls to this number:
            </p>
          </div>

          <div className="text-xl font-bold">
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
            ) : (
              phoneNumber
            )}
          </div>
        </div>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {successMessage && (
        <Alert className="bg-green-50 text-green-800 border-green-200">
          <CheckCircle2 className="h-4 w-4 text-green-500" />
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-6">
        {/* Step 1 */}
        <Card className="p-6 border-l-4 border-l-blue-500">
          <div className="flex justify-between items-start">
            <div className="space-y-4">
              <div className="text-blue-500 font-semibold">STEP 1</div>
              <h3 className="text-lg font-semibold">
                Add your credit card details to avoid interruption
              </h3>
              <p className="text-gray-600">
                Add your payment info now to avoid interruption in service. You
                will not be charged until your free minutes have been used.
              </p>
            </div>
            <Button className="bg-blue-500 hover:bg-blue-600 text-white">
              Add Credit Card <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </Card>

        {/* Step 2 */}
        <Card className="p-6 border-l-4 border-l-blue-500">
          <div className="flex justify-between items-start">
            <div className="space-y-4">
              <div className="text-blue-500 font-semibold">STEP 2</div>
              <h3 className="text-lg font-semibold">
                Forward your business number to Flowon
              </h3>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="text-blue-500 text-sm min-w-20 font-medium">
                    OPTION 1
                  </div>
                  <p>Forward all calls to Flowon.</p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="text-blue-500 text-sm min-w-20 font-medium">
                    OPTION 2
                  </div>
                  <p>
                    Conditionally forward calls to Flowon so she only answers
                    when you can&apos;t.
                  </p>
                </div>
              </div>
            </div>
            <Button
              className="bg-blue-500 hover:bg-blue-600 text-white"
              onClick={() =>
                window.open(
                  "http://localhost:3000/guide/call_forwarding",
                  "_blank"
                )
              }
            >
              View Instructions <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </Card>

        {/* Step 3 */}
        <Card className="p-6 border-l-4 border-l-blue-500">
          <div className="flex justify-between items-start">
            <div className="space-y-4">
              <div className="text-blue-500 font-semibold">STEP 3</div>
              <h3 className="text-lg font-semibold">
                Done forwarding your number?
              </h3>
              <p className="text-gray-600">
                Check the box to complete the guided setup.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="forwarding"
                checked={isForwarding}
                onCheckedChange={(checked) =>
                  setIsForwarding(checked as boolean)
                }
                className="border-blue-500 data-[state=checked]:bg-blue-500"
              />
              <label htmlFor="forwarding" className="text-sm font-medium">
                My number is forwarding
              </label>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
