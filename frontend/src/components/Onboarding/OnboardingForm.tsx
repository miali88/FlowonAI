// /frontend/src/components/Onboarding/OnboardingForm.tsx

import {
    Button,
    FormControl,
    FormErrorMessage,
    FormLabel,
    Input,
    VStack,
  } from "@chakra-ui/react";
  import { useMutation } from "@tanstack/react-query";
  import { useForm, SubmitHandler } from "react-hook-form";
  import { UsersService, type UserRegister } from "../../client";
  import useCustomToast from "../../hooks/useCustomToast";
  import { emailPattern } from "../../formUtils";
  
  interface OnboardingFormInputs extends UserRegister {
    confirm_password: string;
  }
  
  const OnboardingForm = () => {
    const showToast = useCustomToast();
    const {
      register,
      handleSubmit,
      getValues,
      formState: { errors, isSubmitting },
    } = useForm<OnboardingFormInputs>({
      mode: "onBlur",
      criteriaMode: "all",
      defaultValues: {
        email: "",
        full_name: "",
        password: "",
        confirm_password: "",
      },
    });
  
    const mutation = useMutation({
        mutationFn: (data: UserRegister) => UsersService.registerUser({ requestBody: data }),
        onSuccess: () => {
        showToast("Success!", "Account created successfully.", "success");
        // You might want to add redirection logic here
      },
      onError: (err: any) => {
        if (err.status === 401) {
          showToast("Error", "Unable to create account. Please contact support.", "error");
        } else {
          const errDetail = err.body?.detail || "An unexpected error occurred";
          showToast("Error", `${errDetail}`, "error");
        }
      },
    });
  
    const onSubmit: SubmitHandler<OnboardingFormInputs> = (data) => {
      mutation.mutate(data);
    };
  
    return (
      <VStack as="form" onSubmit={handleSubmit(onSubmit)} spacing={4}>
        <FormControl isInvalid={!!errors.email}>
          <FormLabel htmlFor="email">Email</FormLabel>
          <Input
            id="email"
            {...register("email", {
              required: "Email is required",
              pattern: emailPattern,
            })}
            placeholder="Email"
            type="email"
          />
          {errors.email && <FormErrorMessage>{errors.email.message}</FormErrorMessage>}
        </FormControl>
        <FormControl isInvalid={!!errors.full_name}>
          <FormLabel htmlFor="full_name">Full Name</FormLabel>
          <Input
            id="full_name"
            {...register("full_name", { required: "Full name is required" })}
            placeholder="Full Name"
            type="text"
          />
          {errors.full_name && <FormErrorMessage>{errors.full_name.message}</FormErrorMessage>}
        </FormControl>
        <FormControl isInvalid={!!errors.password}>
          <FormLabel htmlFor="password">Password</FormLabel>
          <Input
            id="password"
            {...register("password", {
              required: "Password is required",
              minLength: { value: 8, message: "Password must be at least 8 characters" },
            })}
            placeholder="Password"
            type="password"
          />
          {errors.password && <FormErrorMessage>{errors.password.message}</FormErrorMessage>}
        </FormControl>
        <FormControl isInvalid={!!errors.confirm_password}>
          <FormLabel htmlFor="confirm_password">Confirm Password</FormLabel>
          <Input
            id="confirm_password"
            {...register("confirm_password", {
              required: "Please confirm your password",
              validate: (value) => value === getValues().password || "The passwords do not match",
            })}
            placeholder="Confirm Password"
            type="password"
          />
          {errors.confirm_password && (
            <FormErrorMessage>{errors.confirm_password.message}</FormErrorMessage>
          )}
        </FormControl>
        <Button type="submit" isLoading={isSubmitting}>
          Create Account
        </Button>
      </VStack>
    );
  };
  
  export default OnboardingForm;