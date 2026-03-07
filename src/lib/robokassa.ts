import { createHash } from 'crypto';

const MERCHANT_LOGIN = process.env.ROBOKASSA_MERCHANT_LOGIN ?? '';
const PASSWORD1 = process.env.ROBOKASSA_PASSWORD1 ?? '';
const PASSWORD2 = process.env.ROBOKASSA_PASSWORD2 ?? '';
const IS_TEST = process.env.ROBOKASSA_TEST_MODE === 'true';

const BASE_URL = IS_TEST
  ? 'https://auth.robokassa.kz/Merchant/Index.aspx'
  : 'https://auth.robokassa.kz/Merchant/Index.aspx';

function md5(str: string): string {
  return createHash('md5').update(str).digest('hex');
}

/**
 * Generate a RoboCassa payment URL.
 * @param invId  - unique invoice ID (from payments or orders table)
 * @param amount - amount in KZT (integer)
 * @param description - payment description
 * @param options - optional: email, culture (kk/ru), receipt data
 */
export function createPaymentUrl(
  invId: number,
  amount: number,
  description: string,
  options?: {
    email?: string;
    culture?: string;
    /** Extra user params: Shp_type=package, Shp_id=uuid */
    shpParams?: Record<string, string>;
  },
): string {
  const outSum = amount.toFixed(2);

  // Shp_ params must be sorted alphabetically in signature
  const shpParams = options?.shpParams ?? {};
  const shpKeys = Object.keys(shpParams).sort();
  const shpString = shpKeys.map((k) => `${k}=${shpParams[k]}`).join(':');

  // SignatureValue = MD5(MerchantLogin:OutSum:InvId:Password1[:Shp_...])
  const sigParts = [MERCHANT_LOGIN, outSum, String(invId), PASSWORD1];
  if (shpString) sigParts.push(shpString);
  const signature = md5(sigParts.join(':'));

  const params = new URLSearchParams({
    MerchantLogin: MERCHANT_LOGIN,
    OutSum: outSum,
    InvId: String(invId),
    Description: description,
    SignatureValue: signature,
  });

  if (IS_TEST) params.set('IsTest', '1');
  if (options?.email) params.set('Email', options.email);
  if (options?.culture) params.set('Culture', options.culture === 'kk' ? 'kk' : 'ru');

  for (const k of shpKeys) {
    params.set(k, shpParams[k]);
  }

  return `${BASE_URL}?${params.toString()}`;
}

/**
 * Verify ResultURL callback signature from RoboCassa.
 * SignatureValue should equal MD5(OutSum:InvId:Password2[:Shp_...])
 */
export function verifyResultSignature(
  outSum: string,
  invId: string,
  signatureValue: string,
  shpParams?: Record<string, string>,
): boolean {
  const shpKeys = Object.keys(shpParams ?? {}).sort();
  const shpString = shpKeys.map((k) => `${k}=${shpParams?.[k]}`).join(':');

  const parts = [outSum, invId, PASSWORD2];
  if (shpString) parts.push(shpString);
  const expected = md5(parts.join(':'));

  return expected.toLowerCase() === signatureValue.toLowerCase();
}

/**
 * Generate success response for ResultURL callback.
 * RoboCassa expects plain text "OK{InvId}" response.
 */
export function resultOkResponse(invId: string | number): string {
  return `OK${invId}`;
}
