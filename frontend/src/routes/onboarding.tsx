// /frontend/src/routes/onboarding.tsx

import { Box, Container, Heading } from "@chakra-ui/react";
import { createFileRoute } from "@tanstack/react-router";
import OnboardingForm from "../components/Onboarding/OnboardingForm";

export const Route = createFileRoute('/onboarding')({
  component: OnboardingPage,
});

function OnboardingPage() {
  return (
    <Container maxW="container.sm" py={10}>
      <Box textAlign="center" mb={8}>
        <Heading as="h1" size="xl">
          Create Your Account
        </Heading>
      </Box>
      <OnboardingForm />
    </Container>
  );
}