import { Control, Controller, useWatch, UseFormGetValues, UseFormSetValue } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

// Define the form values interface
export interface MessageTakingFormValues {
  messageTaking: {
    callerName: {
      required: boolean;
      alwaysRequested: boolean;
    };
    callerPhoneNumber: {
      required: boolean;
      automaticallyCaptured: boolean;
    };
    specificQuestions: Array<{
      question: string;
      required: boolean;
    }>;
  };
}

export interface MessageTakingProps {
  control: Control<MessageTakingFormValues>;
  errors: Record<string, unknown>;
  newQuestion: string;
  setNewQuestion: (value: string) => void;
  addQuestion: () => void;
  getValues: UseFormGetValues<MessageTakingFormValues>;
  setValue: UseFormSetValue<MessageTakingFormValues>;
}

export function MessageTaking({
  control,
  errors,
  newQuestion,
  setNewQuestion,
  addQuestion,
  getValues,
  setValue,
}: MessageTakingProps) {
  // Watch for specific questions to render the list
  const specificQuestions = useWatch({
    control,
    name: "messageTaking.specificQuestions",
  });

  return (
    <Card className={errors.messageTaking ? "border-red-500" : ""}>
      <Accordion type="single" collapsible>
        <AccordionItem value="message-taking" className="border-none">
          <CardHeader className="border-b">
            <AccordionTrigger className="hover:no-underline">
              <CardTitle>Message Taking</CardTitle>
            </AccordionTrigger>
          </CardHeader>
          <AccordionContent>
            <CardContent className="space-y-4 pt-4">
              <div className="text-sm text-gray-500 mb-4">
                Add specific questions you&apos;d like Flowon to ask your callers
                when taking a message.
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Caller Name</Label>
                  <Controller
                    control={control}
                    name="messageTaking.callerName.alwaysRequested"
                    render={({ field }) => (
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    )}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Caller Phone Number</Label>
                  <Controller
                    control={control}
                    name="messageTaking.callerPhoneNumber.automaticallyCaptured"
                    render={({ field }) => (
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    )}
                  />
                </div>
                
                {/* Custom Questions Section */}
                <div>
                  <Label className="block mb-2">Specific Questions</Label>
                  <div className="text-sm text-gray-500 mb-4">
                    Add custom questions for Flowon to ask callers. All questions will be required.
                  </div>
                  
                  {/* List of existing questions */}
                  <div className="space-y-3 mb-4">
                    {specificQuestions?.map((_, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <div className="flex-1">
                          <Controller
                            control={control}
                            name={`messageTaking.specificQuestions.${index}.question`}
                            render={({ field }) => (
                              <Input 
                                {...field} 
                                placeholder="Enter question..." 
                              />
                            )}
                          />
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const currentQuestions = getValues("messageTaking.specificQuestions") as unknown as Array<{ question: string; required: boolean }>;
                            setValue(
                              "messageTaking.specificQuestions",
                              currentQuestions.filter((_, i) => i !== index)
                            );
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <div className="flex-1">
                      <Input
                        placeholder="Type new question here..."
                        value={newQuestion}
                        onChange={(e) => setNewQuestion(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === "Enter" && newQuestion.trim()) {
                            e.preventDefault();
                            addQuestion();
                          }
                        }}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addQuestion}
                      disabled={!newQuestion.trim()}
                    >
                      <span className="mr-1">+</span> Add
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Card>
  );
} 