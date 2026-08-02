import invoiceApi from "@/api/customer/invoiceApi";

export async function invoicesLoader({ request }) {
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;
  if (!user) return { invoices: [], pagination: null, user: null };

  const url = new URL(request.url);
  const page = url.searchParams.get("page") || 1;
  const status = url.searchParams.get("status") || "";

  const params = new URLSearchParams();
  params.set("page", page);
  if (status) params.set("status", status);

  try {
    const res = await invoiceApi.getInvoices(params.toString());
    return {
      invoices: res?.data?.invoices || [],
      pagination: res?.data?.pagination || null,
      user,
    };
  } catch {
    return { invoices: [], pagination: null, user };
  }
}

export async function invoiceDetailLoader({ params }) {
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;

  try {
    const res = await invoiceApi.getInvoiceDetail(params.id);
    return { invoice: res?.data || null, user };
  } catch {
    return { invoice: null, user };
  }
}
