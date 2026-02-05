import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { JobMarketModule } from './JobMarketModule';
import { CareerPathwayModule } from './CareerPathwayModule';
import { Globe, Target } from 'lucide-react';

export function IntelligencePanel() {
  return (
    <div className="flex flex-col h-full">
      <Tabs defaultValue="market" className="flex flex-col h-full">
        <div className="flex-shrink-0 px-4 pt-4 border-b border-border">
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="market" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              <span className="hidden sm:inline">Job Market</span>
              <span className="sm:hidden">Market</span>
            </TabsTrigger>
            <TabsTrigger value="pathway" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              <span className="hidden sm:inline">Career Pathway</span>
              <span className="sm:hidden">Pathway</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <ScrollArea className="flex-1 p-4">
          <TabsContent value="market" className="mt-0">
            <JobMarketModule />
          </TabsContent>
          <TabsContent value="pathway" className="mt-0">
            <CareerPathwayModule />
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </div>
  );
}
