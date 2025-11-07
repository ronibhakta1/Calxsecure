'use client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { AlertTriangle, IndianRupee } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function WrongSendModal({ open, setOpen, txnId, amount }: { open: boolean; setOpen: (v: boolean) => void; txnId: number; amount: number }) {
  const handleRequest = async () => {
    try {
      await axios.post('/api/wrong-send', { txnId });
      toast.success('Bank notified. Money will be returned in 24 hrs.');
      setOpen(false);
    } catch {
      toast.error('Failed');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="bg-zinc-900 text-zinc-100 border-red-800/50">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-400">
            <AlertTriangle className="w-6 h-6" /> Wrong Number?
          </DialogTitle>
          <DialogDescription className="text-zinc-400">
            Bank will contact receiver. Return in 24 hrs or ₹50 fee applies.
          </DialogDescription>
        </DialogHeader>
        <div className="bg-zinc-800 rounded-lg p-4 my-4">
          <div className="flex justify-between">
            <span>Amount</span>
            <span className="font-bold">₹{amount}</span>
          </div>
          <div className="flex justify-between text-sm mt-2 text-red-400">
            <span>Penalty (if late)</span>
            <span className="flex items-center gap-1"><IndianRupee className="w-4 h-4" />50</span>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleRequest} className="bg-red-600 hover:bg-red-700">Notify Bank</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}