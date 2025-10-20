"use client";
import { Button } from "@repo/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TextInput } from "@repo/ui/textinput";
import { useState } from "react";
import { createSplitRequests } from "@/app/lib/actions/createSplitRequests";

export function SplitCard() {
  const [totalAmount, setTotalAmount] = useState("");
  const [friends, setFriends] = useState<string[]>(["", "", ""]); // 3 friends max
  const [loading, setLoading] = useState(false);

  const handleSplit = async () => {
    const validFriends = friends.filter(f => f.trim());
    if (validFriends.length < 2) return alert("Add at least 2 friends");
    
    setLoading(true);
    await createSplitRequests(
      validFriends, 
      Number(totalAmount) * 100 / validFriends.length
    );
    alert("✅ Split requests sent!");
    setLoading(false);
  };

  return (
    <Card className="bg-zinc-800">
      <CardHeader>
        <CardTitle>Split Bill</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <TextInput 
          label="Total Amount" 
          placeholder="2000" 
          onChange={setTotalAmount} 
        />
        
        <div>
          <label className="text-sm font-medium text-zinc-400">Friends Numbers</label>
          {friends.map((friend, i) => (
            <TextInput
              key={i}
              label={`Friend ${i+1}`}
              placeholder={`Friend ${i+1} (1111111111)`}
              onChange={(value: string) => {
                const newFriends = [...friends];
                newFriends[i] = value;
                setFriends(newFriends);
              }}
            />
          ))}
        </div>
        
        <div className="text-center text-zinc-400">
          Each pays: ₹{(Number(totalAmount) / 3 || 0).toFixed(0)}
        </div>

        <Button onClick={handleSplit}>
          Split ₹{totalAmount}
        </Button>
      </CardContent>
    </Card>
  );
}