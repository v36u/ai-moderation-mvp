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
import { ChangeEvent, useCallback, useState } from 'react';
import { defaultConcurrentRequests, defaultQuery, defaultTotalRequests, maxConcurrentRequests, maxTotalRequests, ModerateLoadTestRequest, ModerateLoadTestResponse, ModerateLoadTestSuccessfulResponse } from '@/lib/constants/moderate';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ChartConfig, ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { CartesianGrid, Line, LineChart, Pie, PieChart, XAxis, YAxis } from 'recharts';
import { generateRandomHexColor } from '@/lib/utils';

const percentageRegex = /p\d/;

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
    // and maybe some kind of progress bar

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

  type StatusCodesChartDataItem = {
    status: string;
    count: number;
    fill: string;
  }

  // BEFOREPROD: Use `useMemo` or similar hooks to avoid changing colors and other details on each rerender
  let statusCodesChartData: StatusCodesChartDataItem[] = [];
  let statusCodesChartConfig: ChartConfig = {};
  if (loadTestResponseData) {
    if (loadTestResponseData.data.statusCodeStats) {
      statusCodesChartData = Object.keys(loadTestResponseData.data.statusCodeStats).map(statusCodeStatKey => {
        if (typeof loadTestResponseData.data.statusCodeStats === 'undefined') {
          return null;
        }

        const statusCodeStatValue = loadTestResponseData.data.statusCodeStats[statusCodeStatKey as keyof typeof loadTestResponseData.data.statusCodeStats];
        if (typeof statusCodeStatValue.count === 'undefined') {
          return null;
        }

        const randomColor = generateRandomHexColor();

        const statusCodesChartDataItem: StatusCodesChartDataItem = {
          status: statusCodeStatKey,
          count: statusCodeStatValue.count,
          fill: randomColor,
        };
        return statusCodesChartDataItem;
      })
        .filter(item => item !== null);

      for (const item of statusCodesChartData) {
        statusCodesChartConfig[item.status] = {
          label: item.status,
        };
      }
    }
  }

  type LatencyChartDataItem = {
    percentage: string;
    ms: number;
  }

  // BEFOREPROD: Use `useMemo` or similar hooks to avoid changing colors and other details on each rerender
  let latencyChartData: LatencyChartDataItem[] = [];
  let latencyChartConfig: ChartConfig = {};
  if (loadTestResponseData) {
    latencyChartData = Object.keys(loadTestResponseData.data.latency).map(latencyKey => {
      if (percentageRegex.test(latencyKey) === false) {
        return null;
      }

      let displayedPercentage = latencyKey.substring(1).replace("_", ".");
      displayedPercentage = `${displayedPercentage}%`;

      const latencyValue = loadTestResponseData.data.latency[latencyKey as keyof typeof loadTestResponseData.data.latency];

      const latencyChartDataItem: LatencyChartDataItem = {
        percentage: displayedPercentage,
        ms: latencyValue,
      };
      return latencyChartDataItem;
    })
      .filter(item => item !== null);

    for (const item of latencyChartData) {
      latencyChartConfig[item.percentage] = {
        label: item.percentage,
      }
    }
  }

  type ThroughputChartDataItem = {
    percentage: string;
    bytes: number;
  }

  // BEFOREPROD: Use `useMemo` or similar hooks to avoid changing colors and other details on each rerender
  let throughputChartData: ThroughputChartDataItem[] = [];
  let throughputChartConfig: ChartConfig = {};
  if (loadTestResponseData) {
    throughputChartData = Object.keys(loadTestResponseData.data.throughput).map(throughputKey => {
      if (percentageRegex.test(throughputKey) === false) {
        return null;
      }

      let displayedPercentage = throughputKey.substring(1).replace("_", ".");
      displayedPercentage = `${displayedPercentage}%`;

      const throughputValue = loadTestResponseData.data.throughput[throughputKey as keyof typeof loadTestResponseData.data.throughput];

      const throughputChartDataItem: ThroughputChartDataItem = {
        percentage: displayedPercentage,
        bytes: throughputValue,
      };
      return throughputChartDataItem;
    })
      .filter(item => item !== null);

    for (const item of throughputChartData) {
      throughputChartConfig[item.percentage] = {
        label: item.percentage,
      }
    }
  }

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
                <p className='italic mb-5'>Below is a report of the load test. It starts with some charts, and at the end is the raw data.</p>
                {statusCodesChartData.length > 0 &&
                  <div className='flex flex-col items-center justify-center my-5'>
                    <ChartContainer config={statusCodesChartConfig} className="min-h-[200px] w-full">
                      <PieChart>
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <ChartLegend content={<ChartLegendContent />} />

                        <Pie
                          data={statusCodesChartData}
                          dataKey="count"
                          nameKey="status"
                          outerRadius={150}
                        />
                      </PieChart>
                    </ChartContainer>
                    <p
                      className="text-muted-foreground text-sm">
                      Status codes
                    </p>
                  </div>
                }
                {latencyChartData.length > 0 &&
                  <div className='flex flex-col items-center justify-center my-10'>
                    <ChartContainer config={latencyChartConfig} className="min-h-[200px] w-full">
                      <LineChart data={latencyChartData}>
                        <defs>
                          <linearGradient id="latencyGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="red" />
                            <stop offset="50%" stopColor="orange" />
                            <stop offset="100%" stopColor="green" />
                          </linearGradient>
                        </defs>
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <ChartLegend content={<ChartLegendContent />} />

                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="percentage" />
                        <YAxis dataKey="ms" />
                        <Line type="monotone" dataKey="ms" stroke="url(#latencyGradient)" />
                      </LineChart>
                    </ChartContainer>
                    <p
                      className="text-muted-foreground text-sm">
                      Latency (ms) - lower is better
                    </p>
                  </div>
                }
                {throughputChartData.length > 0 &&
                  <div className='flex flex-col items-center justify-center my-10'>
                    <ChartContainer config={throughputChartConfig} className="min-h-[200px] w-full">
                      <LineChart data={throughputChartData}>
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <ChartLegend content={<ChartLegendContent />} />

                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="percentage" />
                        <YAxis dataKey="bytes" />
                        <Line type="monotone" dataKey="bytes" stroke="purple" />
                      </LineChart>
                    </ChartContainer>
                    <p
                      className="text-muted-foreground text-sm">
                      Throughput (bytes) - depicts traffic generated by the test
                    </p>
                  </div>
                }
                <Accordion type="single" collapsible className="w-full my-10">
                  <AccordionItem value="load-test-raw-data">
                    <AccordionTrigger className='text-center'><span className='w-full text-center cursor-pointer'>See full raw data</span></AccordionTrigger>
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
