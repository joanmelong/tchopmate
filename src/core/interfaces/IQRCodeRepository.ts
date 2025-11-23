import { QRCodeDTO } from '../entities/QRCode';

export interface IQRCodeRepository {
  generate(orderId: string): Promise<QRCodeDTO>;
  findByCode(code: string): Promise<QRCodeDTO | null>;
  markAsUsed(code: string): Promise<void>;
}