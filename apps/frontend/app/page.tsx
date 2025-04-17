import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"

export default function Home() {
  return (
    <div className='w-full flex justify-center items-center p-10'>
      <Tabs defaultValue="basic" className="w-[400px]">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="basic">Basic</TabsTrigger>
          <TabsTrigger value="stress">Stress</TabsTrigger>
        </TabsList>
        <TabsContent value="basic">
          <Card>
            <CardHeader>
              <CardTitle>Basic test</CardTitle>
              <CardDescription>
                Here you can test a single API call.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="space-y-1">
                <Label htmlFor="userQuery">Query</Label>
                <Input id="userQuery" defaultValue="" placeholder='Start typing your query...' />
              </div>
            </CardContent>
            <CardFooter>
              <Button>Moderate</Button>
            </CardFooter>
          </Card>
        </TabsContent>
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
      </Tabs>
    </div>
  );
}
