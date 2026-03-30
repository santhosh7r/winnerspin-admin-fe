"use client";

import { StatsResponse } from "@/lib/types";
import { 
  Users, 
  UserCheck, 
  UserPlus, 
  UserMinus, 
  Building2, 
  HandCoins,
  History,
  Clock,
  CheckCircle2,
  XCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ExtendedStatsResponse extends StatsResponse {
  approvedCustomers?: number;
  rejectedCustomers?: number;
  companyIncome?: number;
  promoterCommissions?: number;
  totalOverallIncome?: number;
  pendingWithdrawals?: number;
  approvedWithdrawals?: number;
  rejectedWithdrawals?: number;
  pendingWithdrawalsCount?: number;
  approvedWithdrawalsCount?: number;
  rejectedWithdrawalsCount?: number;
}

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  subtitle?: string;
  prefix?: string;
}

function StatCard({ label, value, icon: Icon, iconColor, iconBg, subtitle, prefix }: StatCardProps) {
  return (
    <div className="bg-white dark:bg-[#0a0a0a] border border-[#e2e8f0] dark:border-zinc-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow min-h-[140px]">
      <div className="flex justify-between items-start">
        <span className="text-[13px] font-medium text-[#64748b] dark:text-zinc-400 mt-1">{label}</span>
        <div className={cn("h-10 w-10 flex items-center justify-center rounded-lg", iconBg)}>
          <Icon className={cn("h-[18px] w-[18px] stroke-[2]", iconColor)} />
        </div>
      </div>
      <div className="mt-6 flex flex-col justify-end">
        <span className="text-[28px] font-medium text-[#0f172a] dark:text-white leading-none tracking-tight">
          {prefix}{typeof value === "number" ? value.toLocaleString() : (value || "0")}
        </span>
        {subtitle && (
          <span className="text-[12px] text-[#94a3b8] dark:text-zinc-500 mt-2 font-medium">
             {subtitle}
          </span>
        )}
      </div>
    </div>
  );
}

export function StatsOverview({ stats }: { stats: ExtendedStatsResponse }) {
  return (
    <div className="space-y-8">
      {/* System Users */}
      <section className="space-y-4">
        <h2 className="text-[14px] font-bold text-[#0f172a] dark:text-white tracking-widest uppercase opacity-40">System Users</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            label="Total Promoters"
            value={stats.totalPromoters}
            icon={UserPlus}
            iconColor="text-blue-600 dark:text-blue-400"
            iconBg="bg-blue-50/50 dark:bg-blue-500/10"
          />
          <StatCard
            label="Total Customers"
            value={stats.totalCustomers}
            icon={Users}
            iconColor="text-purple-600 dark:text-purple-400"
            iconBg="bg-purple-50/50 dark:bg-purple-500/10"
          />
          <StatCard
            label="Approved Customers"
            value={stats.approvedCustomers || 0}
            icon={UserCheck}
            iconColor="text-emerald-600 dark:text-emerald-400"
            iconBg="bg-emerald-50/50 dark:bg-emerald-500/10"
          />
          <StatCard
            label="Rejected Customers"
            value={stats.rejectedCustomers || 0}
            icon={UserMinus}
            iconColor="text-rose-600 dark:text-rose-400"
            iconBg="bg-rose-50/50 dark:bg-rose-500/10"
          />
        </div>
      </section>

      {/* Financial Overview */}
      <section className="space-y-4">
        <h2 className="text-[14px] font-bold text-[#0f172a] dark:text-white tracking-widest uppercase opacity-40">Financial Overview</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <StatCard
            label="Company Income"
            value={stats.companyIncome || 0}
            icon={Building2}
            iconColor="text-indigo-600 dark:text-indigo-400"
            iconBg="bg-indigo-50/50 dark:bg-indigo-500/10"
            prefix="₹"
          />
          <StatCard
            label="Promoter Commissions"
            value={stats.promoterCommissions || 0}
            icon={HandCoins}
            iconColor="text-teal-600 dark:text-teal-400"
            iconBg="bg-teal-50/50 dark:bg-teal-500/10"
            prefix="₹"
          />
          <StatCard
            label="Total Overall Income"
            value={stats.totalOverallIncome || stats.totalIncome || 0}
            icon={History}
            iconColor="text-amber-600 dark:text-amber-400"
            iconBg="bg-amber-50/50 dark:bg-amber-500/10"
            prefix="₹"
          />
        </div>
      </section>

      {/* Withdrawals */}
      <section className="space-y-4">
        <h2 className="text-[14px] font-bold text-[#0f172a] dark:text-white tracking-widest uppercase opacity-40">Withdrawals</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <StatCard
            label="Pending Withdrawals"
            value={stats.pendingWithdrawals || 0}
            subtitle={`${stats.pendingWithdrawalsCount || 0} pending requests`}
            icon={Clock}
            iconColor="text-orange-600 dark:text-orange-400"
            iconBg="bg-orange-50/50 dark:bg-orange-500/10"
            prefix="₹"
          />
          <StatCard
            label="Approved Withdrawals"
            value={stats.approvedWithdrawals || 0}
            subtitle={`${stats.approvedWithdrawalsCount || 0} approved requests`}
            icon={CheckCircle2}
            iconColor="text-green-600 dark:text-green-400"
            iconBg="bg-green-50/50 dark:bg-green-500/10"
            prefix="₹"
          />
          <StatCard
            label="Rejected Withdrawals"
            value={stats.rejectedWithdrawals || 0}
            subtitle={`${stats.rejectedWithdrawalsCount || 0} rejected requests`}
            icon={XCircle}
            iconColor="text-rose-600 dark:text-rose-400"
            iconBg="bg-rose-50/50 dark:bg-rose-500/10"
            prefix="₹"
          />
        </div>
      </section>
    </div>
  );
}
