"use client";
import { useState } from 'react';
import { Bell, CreditCard, DollarSign, Home, LogOut, Send, Settings, User, Wallet } from 'lucide-react';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { ToastProvider } from "@/components/ui/toast";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

// Mock data
const mockBalance = 1250.75;
const mockTransactions = [
  { id: 1, date: '2025-09-09', type: 'Received', amount: 500, from: 'John Doe', status: 'Completed' },
  { id: 2, date: '2025-09-08', type: 'Sent', amount: -200, from: 'To: Jane Smith', status: 'Completed' },
  { id: 3, date: '2025-09-07', type: 'Received', amount: 100, from: 'Alice Johnson', status: 'Pending' },
  { id: 4, date: '2025-09-06', type: 'Sent', amount: -50, from: 'To: Bob Brown', status: 'Failed' },
];
const mockChartData = [
  { name: 'Jan', received: 4000, sent: 2400 },
  { name: 'Feb', received: 3000, sent: 1398 },
  { name: 'Mar', received: 2000, sent: 9800 },
  { name: 'Apr', received: 2780, sent: 3908 },
  { name: 'May', received: 1890, sent: 4800 },
  { name: 'Jun', received: 2390, sent: 3800 },
];

export default function PaymentDashboard() {
  const [loading, setLoading] = useState(false);

  const handleSendMoney = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      // TODO: Implement toast notification
    }, 2000);
  };

  return (
    <TooltipProvider>
      <ToastProvider>
        <div className="p-6 space-y-6 max-w-[calc(100vw-18rem)] mx-auto">
          {/* Balance Card */}
          <Card>
            <CardHeader>
              <CardTitle>Account Balance</CardTitle>
              <CardDescription>Your current balance and quick actions.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">${mockBalance.toFixed(2)}</div>
            </CardContent>
            <CardFooter className="space-x-4">
              <Dialog>
                <DialogTrigger asChild>
                  <Button>
                    <DollarSign className="mr-2 h-4 w-4" /> Add Funds
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Funds</DialogTitle>
                    <DialogDescription>Enter the amount to add to your balance.</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="amount" className="text-right">Amount</Label>
                      <Input id="amount" type="number" className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="method" className="text-right">Method</Label>
                      <Select>
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Select payment method" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="card">Credit Card</SelectItem>
                          <SelectItem value="bank">Bank Transfer</SelectItem>
                          <SelectItem value="paypal">PayPal</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit">Confirm</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Send className="mr-2 h-4 w-4" /> Send Money
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Send Money</DialogTitle>
                    <DialogDescription>Enter recipient details and amount.</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="recipient" className="text-right">To</Label>
                      <Input id="recipient" placeholder="Email or Phone" className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="amount" className="text-right">Amount</Label>
                      <Input id="amount" type="number" className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="note" className="text-right">Note</Label>
                      <Input id="note" placeholder="Optional note" className="col-span-3" />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit" onClick={handleSendMoney} disabled={loading}>
                      {loading ? <Skeleton className="h-4 w-4 animate-spin" /> : 'Send'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardFooter>
          </Card>
          {/* Tabs for Transactions and Analytics */}
          <Tabs defaultValue="transactions" className="space-y-4">
            <TabsList>
              <TabsTrigger value="transactions">Transactions</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>
            <TabsContent value="transactions">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Transactions</CardTitle>
                  <CardDescription>View your latest payment activities.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>From/To</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockTransactions.map((tx) => (
                        <TableRow key={tx.id}>
                          <TableCell>{tx.date}</TableCell>
                          <TableCell>{tx.type}</TableCell>
                          <TableCell className={tx.amount > 0 ? 'text-green-600' : 'text-red-600'}>
                            ${Math.abs(tx.amount).toFixed(2)}
                          </TableCell>
                          <TableCell>{tx.from}</TableCell>
                          <TableCell>
                            <Badge variant={tx.status === 'Completed' ? 'default' : tx.status === 'Pending' ? 'secondary' : 'destructive'}>
                              {tx.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="analytics">
              <Card>
                <CardHeader>
                  <CardTitle>Payment Analytics</CardTitle>
                  <CardDescription>Overview of your spending and receiving trends.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="w-full h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={mockChartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <ChartTooltip />
                        <Legend />
                        <Line type="monotone" dataKey="received" stroke="#8884d8" activeDot={{ r: 8 }} />
                        <Line type="monotone" dataKey="sent" stroke="#82ca9d" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </ToastProvider>
    </TooltipProvider>
  );
}