export interface VendorCategorySummary {
  id: string;
  categoryName: string;
}

export interface VendorResponse {
  id: string;
  categoryId: string | null;
  vendorName: string;
  mobile: string | null;
  email: string | null;
  address: string | null;
  gstNumber: string | null;
  notes: string | null;
  createdAt: string;
  category: VendorCategorySummary | null;
}
