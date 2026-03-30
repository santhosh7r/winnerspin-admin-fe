

// ===========================
// BASE CONFIG
// ===========================
// export const API_BASE_URL = "https://api.winnerspin.in.net/admin";
export const API_BASE_URL = "http://localhost:3000/admin";


export const apiRequest = async (
  endpoint: string,
  options: RequestInit = {}
) => {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("adminToken") : null;

  const config: RequestInit = {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...(token && { token }),
      ...options.headers,
    },
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

  if (!response.ok) {
    const fallback = { message: response.statusText };
    const errorData = await response.json().catch(() => fallback);
    throw new Error(errorData.message || `API Error: ${response.statusText}`);
  }

  return response.json();
};

function getSeasonId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("selectedSeason");
}

// ===========================
// DASHBOARD API
// ===========================
export const dashboardAPI = {
  getStats: (seasonId: string) =>
    apiRequest(`/dashboard-stats?seasonId=${encodeURIComponent(seasonId)}`),
  getRecentTransactions: (seasonId: string) =>
    apiRequest(`/transactions?seasonId=${encodeURIComponent(seasonId)}`),
  getAllPromoters: () => apiRequest("/all-promoters"),
  getNewCustomers: () => apiRequest("/new-customers"),
  getAllWithdrawals: () => apiRequest("/all-withdrawal"),
  getSeasonEarnings: () => apiRequest("/season-earnings"),
  // getDashboard: (seasonId: string) =>
  //  apiRequest(`/dashboard?seasonId=${encodeURIComponent(seasonId)}`),
};

// ===========================
// PROMOTER API
// ===========================
export const promoterAPI = {
  getAll: (seasonId: string) =>
    apiRequest(`/all-promoters?seasonId=${encodeURIComponent(seasonId)}`),

  create: (data: object) =>
    apiRequest("/create-promoter", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  activateForSeason: (promoterId: string, seasonId: string, activate: boolean) =>
    apiRequest("/activate-promoter-for-season", {
      method: "POST",
      body: JSON.stringify({ promoterId, seasonId, activate }),
    }),

  updateProfile: (
    id: string,
    data: Partial<{
      userid: string;
      username: string;
      email: string;
      mobNo: string;
      status?: "approved" | "unapproved";
      selectedSeason?: string;
    }>
  ) =>
    apiRequest("/update-promoter-profile", {
      method: "POST",
      body: JSON.stringify({ promoterId: id, ...data }),
    }),

  getById: (id: string, params?: { seasonId?: string }) => {
    const query = params?.seasonId ? `?seasonId=${params.seasonId}` : "";
    return apiRequest(`/get-promoter/${id}${query}`);
  },

  getNetwork: (promoterId: string, seasonId?: string) => {
    const query = seasonId ? `?seasonId=${seasonId}` : "";
    return apiRequest(`/promoter-network/${promoterId}${query}`);
  },

  getNetworkTree: (seasonId?: string) => {
    const query = seasonId ? `?seasonId=${seasonId}` : "";
    return apiRequest(`/network-tree${query}`);
  },
};

// ===========================
// SEASON API
// ===========================
export const seasonAPI = {
  getAll: () => apiRequest("/all-seasons"),

  getPromotersForNewSeason: (referenceSeasonId?: string) => {
    const query = referenceSeasonId ? `?referenceSeasonId=${referenceSeasonId}` : "";
    return apiRequest(`/promoters-for-new-season${query}`);
  },

  create: (data: object) =>
    apiRequest("/create-season", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: string, data: object) =>
    apiRequest("/update-season", {
      method: "POST",
      body: JSON.stringify({ ...data, seasonId: id }),
    }),

  getById: (id: string) => apiRequest(`/season/${id}`),

  delete: (id: string) =>
    apiRequest(`/season/${id}/delete`, {
      method: "POST",
      body: JSON.stringify({ seasonId: id }),
    }),

  getPreviousPromoters: () => apiRequest("/prev-promoters"),
};

// ===========================
// CUSTOMER API (FIXED)
// ===========================
export const customerAPI = {
  getStats: (seasonId: string) =>
    apiRequest(`/customer-stats?seasonId=${encodeURIComponent(seasonId)}`),
    
  getRequestStats: (seasonId: string) =>
    apiRequest(`/requests-stats?seasonId=${encodeURIComponent(seasonId)}`),

  getAll: (seasonId?: string) => {
    const sId = seasonId || getSeasonId();
    return apiRequest(
      `/all-customers${sId ? `?seasonId=${sId}` : ""}`
    );
  },

  getNew: (seasonId?: string) => {
    const sId = seasonId || getSeasonId();
    return apiRequest(
      `/new-customers${sId ? `?seasonId=${sId}` : ""}`
    );
  },

  approve: (args: {
    customerId: string;
    promoterId: string;
    seasonId: string;
  }) =>
    apiRequest(`/approve-customer`, {
      method: "POST",
      body: JSON.stringify(args),
    }),

  reject: (customerId: string) =>
    apiRequest("/reject-customer", {
      method: "POST",
      body: JSON.stringify({ customerId }),
    }),

  getById: (id: string) => apiRequest(`/customer/${id}`),

  search: (query: string) =>
    apiRequest(`/customers/search?q=${encodeURIComponent(query)}`),
  delete: (id: string) =>
    apiRequest(`/delete-customer/${id}`, {
      method: "DELETE",
    }),
};

// ===========================
// WITHDRAWAL API
// ===========================
export const withdrawalAPI = {
  getAll: (seasonId?: string) =>
    apiRequest(`/all-withdrawal${seasonId ? `?seasonId=${seasonId}` : ""}`),

  update: (withdrawId: string, status: "approved" | "rejected" | "pending") =>
    apiRequest("/update-withdrawal", {
      method: "POST",
      body: JSON.stringify({ withdrawId, check: status }),
    }),

  getById: (id: string) => apiRequest(`/withdrawal/${id}`),
};

// ===========================
// ACTIVITIES API
// ===========================
export const activitiesAPI = {
  getAll: () => apiRequest("/activities"),
};

// ===========================
// TRANSACTION API
// ===========================
export const transactionAPI = {
  getAll: () => {
    const seasonId = getSeasonId();
    return apiRequest(
      `/all-transactions${seasonId ? `?seasonId=${seasonId}` : ""}`
    );
  },

  getByFilter: (filters: {
    seasonId?: string;
    promoterId?: string;
    customerId?: string;
    type?: "credit" | "debit";
    startDate?: string;
    endDate?: string;
  }) => {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(filters)) {
      if (v) params.append(k, String(v));
    }
    return apiRequest(`/transactions?${params.toString()}`);
  },

  getEarningsSummary: () => apiRequest("/earnings-summary"),

  getById: (id: string) => apiRequest(`/transaction/${id}`),
};

// ===========================
// ADMIN API
// ===========================
export const adminAPI = {
  login: (username: string, password: string) =>
    apiRequest("/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    }),

  getWallet: () => apiRequest("/admin-wallet"),
};

// ===========================
// POSTER API (FINAL FIXED)
// ===========================
export const posterAPI = {
  getAll: (seasonId: string) =>
    apiRequest(`/posters?seasonId=${encodeURIComponent(seasonId)}`),

  upload: async (file: File, audience: "promoter" | "customer") => {
    const form = new FormData();
    form.append("poster", file);
    form.append("audience", audience);
    form.append("name", file.name);

    const season = getSeasonId();
    if (season) form.append("season", season);

    const token =
      typeof window !== "undefined" ? localStorage.getItem("adminToken") : null;

    const res = await fetch(`${API_BASE_URL}/upload-poster`, {
      method: "POST",
      body: form,
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
        ...(token && { token }),
      },
    });

    if (!res.ok) throw new Error("Upload failed");
    return res.json();
  },

  delete: (id: string) =>
    apiRequest(`/poster/${encodeURIComponent(id)}`, {
      method: "DELETE",
    }),
};

// ===========================
// REPAYMENT API
// ===========================
export const repaymentAPI = {
  getAll: (seasonId: string | null) =>
    apiRequest(`/all-repayments${seasonId ? `?seasonId=${seasonId}` : ""}`),

  approve: (installmentId: string, promoterId: string) =>
    apiRequest(`/approve-repayment`, {
      method: "POST",
      body: JSON.stringify({ installmentId, promoterId }),
    }),
};

// ===========================
// ADMIN STATS API
// ===========================
export const adminStatsAPI = {
  getAdminStats: (seasonId: string) =>
    apiRequest(`/admin-stats${seasonId ? `?seasonId=${seasonId}` : ""}`),
};
