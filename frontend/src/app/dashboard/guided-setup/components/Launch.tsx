"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  CreditCard,
  PhoneForwarded,
  CheckCircle2,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";

interface LaunchProps {
  onNext: () => void;
}

export default function Launch({ onNext }: LaunchProps) {
  const [isForwarding, setIsForwarding] = useState(false);

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
          Well done! Forward your business number to Rosie so she can start
          answering your calls. Don&apos;t have a business number yet? No
          problem - reach out and we&apos;ll get you sorted.
        </p>
      </div>

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
                Forward your business number to Rosie
              </h3>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="text-blue-500 text-sm font-medium">
                    OPTION 1
                  </div>
                  <p>Forward all calls to Rosie.</p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="text-blue-500 text-sm font-medium">
                    OPTION 2
                  </div>
                  <p>
                    Conditionally forward calls to Rosie so she only answers
                    when you can&apos;t.
                  </p>
                </div>
              </div>
            </div>
            <Button className="bg-blue-500 hover:bg-blue-600 text-white">
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

      <div className="flex justify-end pt-8">
        <Button
          onClick={onNext}
          className="bg-black hover:bg-gray-800 text-white"
          disabled={!isForwarding}
        >
          Complete Setup <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
