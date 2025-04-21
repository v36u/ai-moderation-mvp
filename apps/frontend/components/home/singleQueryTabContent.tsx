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
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  TabsContent,
} from "@/components/ui/tabs"
import { ChangeEvent, useCallback, useState } from 'react';
import { ModerateResponse, ModerateSuccessfulResponse, moderateLabelMappings, ModerateResponseSuccessfulDataItem, ModerateRequest } from '@/lib/constants/moderate'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn, displayDecimalAsPercentage } from '@/lib/utils';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShieldHalved } from '@fortawesome/free-solid-svg-icons';

export default function SingleQueryTabContent() {
  // BEFOREPROD: Use an actual form with proper validation handling (using states and such), various triggering mechanisms, etc

  const [query, setQuery] = useState("");
  const [queryResponseData, setQueryResponseData] = useState<ModerateSuccessfulResponse | null>(null);
  const [queryErrorMessage, setQueryErrorMessage] = useState("");
  const [isModerateLoading, setIsModerateLoading] = useState(false);

  const onModerateClick = useCallback(async () => {
    setQueryErrorMessage("");
    setQueryResponseData(null);
    setIsModerateLoading(true);

    const moderatePath = '/api/moderate';
    const body: ModerateRequest = {
      userQuery: query,
    };

    // BEFOREPROD: Add loaders while the query is loading; maybe use a dedicated framework for this

    const bodyJson = JSON.stringify(body);
    const moderateResponse = await fetch(moderatePath, {
      method: 'POST',
      body: bodyJson,
    })

    setIsModerateLoading(false);

    const moderateResponseBody: ModerateResponse = await moderateResponse.json();

    if (moderateResponseBody.success === false) // a `=== false` check is easier to comprehend than a negation prefix `!`
    {
      setQueryErrorMessage(moderateResponseBody.error);
      return;
    }

    setQueryResponseData(moderateResponseBody);
  }, [query]);

  const onQueryInputChange = useCallback((e: ChangeEvent<HTMLTextAreaElement>) => {
    setQueryErrorMessage("");
    setQueryResponseData(null);

    setQuery(e.currentTarget.value);
  }, [])

  let resultColorClass = "text-green-600";
  let classifications: ModerateResponseSuccessfulDataItem[] = [];
  let mostLikelyClassification = {} as ModerateResponseSuccessfulDataItem; // no problem in creating an empty object, because it will always be overwritten
  if (queryResponseData) {
    classifications = queryResponseData.data[0];
    mostLikelyClassification = classifications[0];

    if (mostLikelyClassification.label !== 'OK') {
      resultColorClass = "text-orange-600";
    }
  }

  return (
    <TabsContent value="single">
      <Card>
        <CardHeader>
          <CardTitle>Single query</CardTitle>
          <CardDescription>
            Here you can test a single API call.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="space-y-1">
            <Label htmlFor="userQuery">Query</Label>
            <Textarea onChange={onQueryInputChange} value={query} id="userQuery" placeholder='Start typing your query...' />
          </div>
          {classifications.length > 0 && (
            <div className="space-y-1 text-center">
              <h3 className="font-bold underline">Result</h3>
              <p>Your content was marked as <span className={cn(resultColorClass, "font-bold")}>{moderateLabelMappings[mostLikelyClassification.label]}</span>, with a score of <span className="font-bold">{displayDecimalAsPercentage(mostLikelyClassification.score)}</span>.</p>
              <Accordion type="single" collapsible className="w-full my-10">
                <AccordionItem value="moderate-details">
                  <AccordionTrigger className='text-center'><span className='w-full text-center cursor-pointer'>Details</span></AccordionTrigger>
                  <AccordionContent>
                    <Table>
                      <TableCaption>Moderation details</TableCaption>
                      <TableHeader>
                        <TableRow>
                          <TableHead className='text-center'>Label</TableHead>
                          <TableHead className='text-center'>Text</TableHead>
                          <TableHead className="text-right">Score</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {classifications.map((classification) => (
                          <TableRow key={classification.label}>
                            <TableCell className="font-medium">{classification.label}</TableCell>
                            <TableCell>{moderateLabelMappings[classification.label]}</TableCell>
                            <TableCell className="text-right font-mono">{displayDecimalAsPercentage(classification.score)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          )}
        </CardContent>
        <CardFooter className='flex-col'>
          <Button onClick={onModerateClick} className='cursor-pointer' disabled={isModerateLoading}><FontAwesomeIcon icon={faShieldHalved} /> Moderate</Button>
          <p className='text-red-600 font-medium'>{queryErrorMessage}</p>
        </CardFooter>
      </Card>
    </TabsContent>
  );
}
