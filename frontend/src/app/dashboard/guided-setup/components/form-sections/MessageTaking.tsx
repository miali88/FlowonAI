import { Control, Controller, useWatch } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

import { FormValues } from "../schema";

interface MessageTakingProps {
  control: Control<FormValues>;
  errors: any;
  newQuestion: string;
  setNewQuestion: (value: string) => void;
  addQuestion: () => void;
  getValues: (name?: any) => any;
  setValue: (name: any, value: any) => void;
}

export default function MessageTaking({
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
      <Accordion type="single" collapsible defaultValue="message-taking">
        <AccordionItem value="message-taking" className="border-none">
          <CardHeader className="border-b">
            <AccordionTrigger className="hover:no-underline">
              <CardTitle>Message Taking</CardTitle>
            </AccordionTrigger>
          </CardHeader>
          <AccordionContent>
            <CardContent className="space-y-4 pt-4">
              <div className="space-y-4">
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
                      render={({ field }: { field: any }) => (
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
                      render={({ field }: { field: any }) => (
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      )}
                    />
                  </div>
                  
                  {/* Custom Questions Section */}
                  <div className="pt-4 border-t">
                    <Label className="block mb-2">Specific Questions</Label>
                    <div className="text-sm text-gray-500 mb-4">
                      Add custom questions for Flowon to ask callers. All questions will be required.
                    </div>
                    
                    {/* List of existing questions */}
                    <div className="space-y-3 mb-4">
                      {specificQuestions?.map((_: any, index: number) => (
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
                              const currentQuestions = getValues("messageTaking.specificQuestions");
                              setValue(
                                "messageTaking.specificQuestions",
                                currentQuestions.filter((_: any, i: number) => i !== index)
                              );
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                    
                    {/* Add new question input and button */}
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
              </div>
            </CardContent>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Card>
  );
} 