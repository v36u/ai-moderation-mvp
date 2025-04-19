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
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBolt, faCircleInfo, faMinus, faPlus } from '@fortawesome/free-solid-svg-icons'
import { ChangeEvent, TextareaHTMLAttributes, useCallback, useState } from 'react';
import { defaultConcurrentRequests, defaultQuery, defaultTotalRequests, maxConcurrentRequests, maxTotalRequests, ModerateLoadTestRequest, ModerateLoadTestResponse, ModerateLoadTestSuccessfulResponse } from '@/lib/constants/moderate';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Result as AutocannonResult } from "autocannon";

export default function LoadTestTabContent() {
  // BEFOREPROD: Use an actual form

  const [totalRequests, setTotalRequests] = useState(defaultTotalRequests);
  const [concurrentRequests, setConcurrentRequests] = useState(defaultConcurrentRequests);
  const [queryPool, setQueryPool] = useState<string[]>([defaultQuery]);
  const [loadTestResponseData, setLoadTestResponseData] = useState<ModerateLoadTestSuccessfulResponse | null>(null);
  const [loadTestErrorMessage, setLoadTestErrorMessage] = useState("");
  const [isLoadTestLoading, setIsLoadTestLoading] = useState(false);

  const onStartClick = useCallback(async () => {
    setLoadTestErrorMessage("");
    setLoadTestResponseData(null);
    setIsLoadTestLoading(true);

    const loadTestPath = '/api/moderate/load-test';
    const body: ModerateLoadTestRequest = {
      totalRequests,
      concurrentRequests,
      // BEFOREPROD: Add validation to make sure that each query in the pool meets at least the basic requirements
      queryPool,
    };

    // BEFOREPROD: Add loaders while the query is loading; maybe use a dedicated framework for this

    const bodyJson = JSON.stringify(body);
    const loadTestResponse = await fetch(loadTestPath, {
      method: 'POST',
      body: bodyJson,
    })

    setIsLoadTestLoading(false);

    const loadTestResponseBody: ModerateLoadTestResponse = await loadTestResponse.json();

    if (loadTestResponseBody.success === false) // a `=== false` check is easier to comprehend than a negation prefix `!`
    {
      setLoadTestErrorMessage(loadTestResponseBody.error);
      return;
    }

    setLoadTestResponseData(loadTestResponseBody);
  }, [totalRequests, concurrentRequests, queryPool]);

  const onTotalRequestsInputChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setLoadTestErrorMessage("");
    setLoadTestResponseData(null);

    setTotalRequests(Number(e.currentTarget.value));
  }, [])

  const onConcurrentRequestsInputChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setLoadTestErrorMessage("");
    setLoadTestResponseData(null);

    setConcurrentRequests(Number(e.currentTarget.value));
  }, [])

  const onQueryPoolAddClick = useCallback(() => {
    const updatedQueryPool = ["", ...queryPool];
    setQueryPool(updatedQueryPool);
  }, [queryPool]);

  const onQueryPoolRemoveClick = useCallback(() => {
    const [_removedElement, ...updatedQueryPool] = queryPool;
    setQueryPool(updatedQueryPool);
  }, [queryPool]);

  return (
    <TabsContent value="load">
      <Card>
        <CardHeader>
          <CardTitle>Load test</CardTitle>
          <CardDescription>
            Here you can load test the API, and you will get a report.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="space-y-1">
            <Label htmlFor="totalRequests">Total requests</Label>
            <Input onChange={onTotalRequestsInputChange} value={totalRequests} type='number' id="totalRequests" min={1} max={maxTotalRequests} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="concurrentRequests">Concurrent requests</Label>
            <Input onChange={onConcurrentRequestsInputChange} value={concurrentRequests} type='number' id="concurrentRequests" min={1} max={maxConcurrentRequests} />
          </div>
          <div className="space-y-1">
            <Label>
              Query pool
              <Tooltip>
                <TooltipTrigger asChild>
                  <FontAwesomeIcon icon={faCircleInfo} />
                </TooltipTrigger>
                <TooltipContent>
                  <p>The queries are cycled through pseudo-randomly.</p>
                </TooltipContent>
              </Tooltip>
            </Label>
            <div className='flex gap-2'>
              <Button onClick={onQueryPoolAddClick} className='my-2.5 cursor-pointer'><FontAwesomeIcon icon={faPlus} /> Add query</Button>
              <Button onClick={onQueryPoolRemoveClick} className='my-2.5 cursor-pointer'><FontAwesomeIcon icon={faMinus} /> Remove query</Button>
            </div>
            {queryPool.map((queryPoolItem, index) => {
              const textareaId = `queryPool${index}`;

              const onQueryChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
                const updatedQueryPool = [...queryPool];
                updatedQueryPool[index] = e.currentTarget.value;
                setQueryPool(updatedQueryPool);
              }

              return <Textarea key={textareaId} id={textareaId} value={queryPoolItem} onChange={onQueryChange} />
            })}
            {loadTestResponseData && (
              <div className="space-y-1 text-center">
                <h3 className="font-bold underline">Result</h3>
                <p>Below is a report of the load test.</p>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="load-test-raw-data">
                    <AccordionTrigger className='text-center'><span className='w-full text-center'>See full raw data</span></AccordionTrigger>
                    <AccordionContent>
                      <RecursiveRawDataValue rawData={loadTestResponseData.data} tableCaption='Load test full raw data' />
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className='flex-col'>
          <Button onClick={onStartClick} className='cursor-pointer' disabled={isLoadTestLoading}><FontAwesomeIcon icon={faBolt} /> Start</Button>
          <p className='text-red-600 font-medium'>{loadTestErrorMessage}</p>
        </CardFooter>
      </Card>
    </TabsContent>
  );
}

type RecursiveRawDataValueParams = {
  rawData: any;
  tableCaption: string;
}

// BEFOREPROD: Add a depth limit
function RecursiveRawDataValue({ rawData, tableCaption }: RecursiveRawDataValueParams) {
  return <Table>
    <TableCaption>{tableCaption}</TableCaption>
    <TableHeader>
      <TableRow>
        <TableHead className='text-center'>Key</TableHead>
        <TableHead className='text-center'>Value</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {Object.keys(rawData).map((rawDataPropKey) => {
        const rawDataPropValue = rawData[rawDataPropKey as keyof typeof rawData];

        return <TableRow key={rawDataPropKey}>
          <TableCell className="font-medium">{rawDataPropKey}</TableCell>
          {typeof (rawDataPropValue) === 'object' && rawDataPropValue instanceof Date === false ?
            rawDataPropValue === null ?
              <TableCell>null</TableCell>
              :
              <TableCell>
                <RecursiveRawDataValue rawData={rawDataPropValue} tableCaption={rawDataPropKey} />
              </TableCell>
            :
            typeof rawDataPropValue === 'undefined' ?
              <TableCell>undefined</TableCell>
              :
              <TableCell>{rawDataPropValue.toString()}</TableCell>
          }
        </TableRow>
      })}
    </TableBody>
  </Table>
}
