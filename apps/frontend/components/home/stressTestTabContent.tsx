'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  TabsContent,
} from "@/components/ui/tabs"

export default function StressTestTabContent() {
  return (
    <TabsContent value="stress">
      <Card>
        <CardHeader>
          <CardTitle>Stress test</CardTitle>
          <CardDescription>
            Here you can stress test the API, and you will get a report.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          TODO
        </CardContent>
        <CardFooter>
          <Button>Start</Button>
        </CardFooter>
      </Card>
    </TabsContent>
  );
}
