export interface CustomerResponse {
  id: string;
  firstName: string;
  lastName: string;
  mobileNo: string;
  alternateMobileNo: string | null;
  emailId: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  createdAt: string;
  updatedAt: string;
}
