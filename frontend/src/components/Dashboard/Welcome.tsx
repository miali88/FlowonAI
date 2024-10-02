import React from 'react';
import { Card, CardHeader, CardTitle } from "@/components/ui/card";

const Welcome: React.FC = () => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-3xl text-center">Welcome to the Future</CardTitle>
      </CardHeader>
    </Card>
  );
};

export default Welcome;
