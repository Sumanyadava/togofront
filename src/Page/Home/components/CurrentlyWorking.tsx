import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import TaskUi from "@/components/TodoRelated/TaskUi";
import LongTaskUi from "@/components/TodoRelated/LongTask/LongTaskUi";

export default function CurrentlyWorking() {
  return (
    <Card className="w-[350px] m-5 h-min">
      <CardHeader>
        <CardTitle>Currently Working</CardTitle>
        <CardDescription>
          Just Click and you will you go to your respective pages
        </CardDescription>
      </CardHeader>
      <CardContent className="scrollbar-custom overflow-y-scroll h-[20vh] mb-3">
        {/* <LongTaskUi /> */}
        {/* <LongTaskUi /> */}
        {/* <LongTaskUi /> */}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline">Cancel</Button>
        <Button>Deploy</Button>
      </CardFooter>
    </Card>
  );
}
