// =============================
// 🧩 SEASON INTERFACE
// =============================
export interface Season {
  _id: string;
  season?: string; // normalized lowercase key
  amount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
export interface Poster {
  _id: string;
  url: string;
  name: string;
  audience: "promoter" | "customer";
  season?: {
    _id: string;
    season: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

// =============================
// 🧩 PROMOTER INTERFACE
// =============================
export interface Promoter {
  _id: string;
  userid: string;
  username?: string;
  email: string;
  mobNo: string;
  balance: number;
  isActive: boolean;
  seasonData?: Array<{
    season: string;
    status: "approved" | "unapproved";
  }>;
}

// =============================
// 🧩 TRANSACTION INTERFACE
// =============================
export interface Transaction {
  id: string;
  _id: string;
  type: "credit" | "debit";
  amount: number;
  from: string;
  to: string;
  seasonId?: string;
  seasonName?: string;
  promoterId?: string;
  promoterName?: string;
  customerId?: string;
  customerName?: string;
  date: string;
  status: "pending" | "completed" | "failed";
  transactionType?:
    | "customer-payment"
    | "promoter-repayment"
    | "admin-credit"
    | "withdrawal";
  creditedTo?: "admin" | "promoter";
  createdAt?: string;
  updatedAt?: string;
  description?: string;
}

// =============================
// 🧩 WITHDRAWAL INTERFACE
// =============================// =============================
// 🧩 WITHDRAWAL INTERFACE (FINAL)
// =============================
export interface Withdrawal {
  _id: string;
  promoterId: string;

  requester?: {
    _id?: string;
    userid?: string;
    username?: string;
  };

  amount: number;

  status: "pending" | "approved" | "rejected";

  createdAt: string;
  updatedAt: string;

  requestDate?: string;
  approvedAt?: string;

  promoterName?: string;
  promoterUsername?: string;
  notes?: string;

  processedDate?: string;
}

// =============================
// 🧩 EXTENDED WITHDRAWAL (FINAL)
// =============================
export type ExtendedWithdrawal = Withdrawal & {
  requester?: {
    _id?: string;
    userid?: string;
    username?: string;
  };
};

// =============================
// 🧩 REPAYMENT INTERFACE
// =============================
export interface Repayment {
  _id: string;
  promoter: {
    _id: string;
    username: string;
    userid: string;
  };
  season: {
    _id: string;
    season: string;
  };
  amount: number;
  status: "pending" | "approved" | "rejected";
  installments: Array<{
    _id: string;
    amount: number;
    status: "paid" | "unpaid";
    dueDate: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

// =============================
// 🧩 CUSTOMER INTERFACE (Unified)
// =============================
export interface Customer {
  _id: string;
  customerid?: string;
  username: string;
  email: string;
  mobNo?: string;
  mobile?: string;
  phone?: string;
  cardNo?: string;

  // ✅ Make this REQUIRED (not optional)
  status: "pending" | "approved" | "rejected";

  promoterId?: string;
  promoterName?: string;
  seasonId?: string;
  seasonName?: string;
  createdAt: string;
  updatedAt?: string;
  productDetails?: string;
  promoter?: Promoter;
  seasons?: Season[];
  isApproved?: boolean;
}

// =============================
// 🧩 OPTIONAL FRONTEND EXTENSIONS
// =============================


export interface ExtendedTransaction extends Transaction {
  seasonName?: string;
  promoterName?: string;
  customerName?: string;
}

export interface StatsResponse {
  totalPromoters: number;
  totalCustomers: number;
  totalWithdrawals: number;
  totalIncome: number;
}

export interface TransactionUser {
  _id: string;
  username: string;
}

export interface TransactionItem {
  _id: string;
  amount: number;
  to: "admin" | "promoter";
  createdAt: string;
  customer?: TransactionUser;
  promoter?: TransactionUser;
}

export interface CustomerItem {
  _id: string;
  username: string;
  status: string;
  createdAt: string;
}

export interface WithdrawalItem {
  _id: string;
  amount: string;
  createdAt: string;
  status: string;
  requester?: TransactionUser;
}

export interface DashboardRecent {
  transactions: TransactionItem[];
  customers: CustomerItem[];
  withdrawals: WithdrawalItem[];
}

export interface DashboardApiResponse {
  success: boolean;
  stats: StatsResponse;
  recent: DashboardRecent;
}
