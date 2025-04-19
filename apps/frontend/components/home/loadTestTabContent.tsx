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

export default function LoadTestTabContent() {
  // BEFOREPROD: Use an actual form

  const [totalRequests, setTotalRequests] = useState(defaultTotalRequests);
  const [concurrentRequests, setConcurrentRequests] = useState(defaultConcurrentRequests);
  const [queryPool, setQueryPool] = useState<string[]>([defaultQuery]);
  const [loadTestResponseData, setLoadTestResponseData] = useState<ModerateLoadTestSuccessfulResponse | null>(null);
  const [loadTestErrorMessage, setLoadTestErrorMessage] = useState("");

  const onStartClick = useCallback(async () => {
    setLoadTestErrorMessage("");
    setLoadTestResponseData(null);

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

  console.log(loadTestResponseData);

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
          </div>
        </CardContent>
        <CardFooter className='flex-col'>
          <Button onClick={onStartClick} className='cursor-pointer'><FontAwesomeIcon icon={faBolt} /> Start</Button>
          <p className='text-red-600 font-medium'>{loadTestErrorMessage}</p>
        </CardFooter>
      </Card>
    </TabsContent>
  );
}
