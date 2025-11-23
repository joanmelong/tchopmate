export interface QRCodeDTO {
  id: string;
  order_id: string;
  code: string;
  expires_at: Date;
  used: boolean;
  used_at?: Date;
  created_at: Date;
}