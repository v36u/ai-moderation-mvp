'use client';

import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import StressTestTabContent from '@/components/home/stressTestTabContent'
import SingleQueryTabContent from '@/components/home/singleQueryTabContent'

export default function Home() {
  return (
    <div className='w-full flex justify-center items-center p-10'>
      <Tabs defaultValue="single" className="w-3xl">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="single">Single</TabsTrigger>
          <TabsTrigger value="stress">Stress</TabsTrigger>
        </TabsList>
        <SingleQueryTabContent />
        <StressTestTabContent />
      </Tabs>
    </div>
  );
}
