"use client"
import React from "react"
import { Card, CardContent } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { formatCurrency } from "@/lib/utils"

export interface CampaignCardProps {
  id: number | string;
  deliverable: string;
  status: string;
  budget: number;
  isBrand?: boolean;
  onAction?: (id: number | string) => void;
  actionText?: string;
  loading?: boolean;
}

export function CampaignCard({ 
  id, 
  deliverable, 
  status, 
  budget, 
  isBrand = false,
  onAction,
  actionText = "Action",
  loading = false
}: CampaignCardProps) {
  const isCompleted = status === 'COMPLETED';

  return (
    <Card className="hover:border-slate-700 transition-colors bg-slate-900/50">
      <CardContent className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1 flex-1">
          <p className="text-sm font-medium text-blue-400">Campaign #{id}</p>
          <h4 className="font-bold text-lg text-white">{deliverable}</h4>
          <p className="text-slate-500 text-sm">
            Status: <span className={`uppercase font-bold text-xs ${isCompleted ? 'text-green-500' : 'text-slate-300'}`}>{status}</span>
          </p>
        </div>
        <div className="text-left md:text-right w-full md:w-auto">
          <p className="text-xl font-bold mb-3 text-white">{formatCurrency(budget)}</p>
          {!isBrand && !isCompleted && onAction && (
            <Button 
              onClick={() => onAction(id)} 
              className="bg-blue-600 hover:bg-blue-700 font-bold w-full md:w-auto"
              disabled={loading}
            >
              {loading ? "Processing..." : actionText}
            </Button>
          )}
          {isBrand && !isCompleted && (
            <div className="text-xs text-slate-400 border border-slate-800 rounded px-2 py-1 inline-block">
              Awaiting Influencer
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
