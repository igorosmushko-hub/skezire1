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
 * Build payment parameters for Robokassa.
 * Returns an object with all params needed for both URL redirect and iframe SDK.
 */
export function createPaymentParams(
  invId: number,
  amount: number,
  description: string,
  options?: {
    email?: string;
    culture?: string;
    shpParams?: Record<string, string>;
  },
) {
  // Robokassa.kz: KZT amounts — use 2 decimal places (standard format)
  const outSum = amount.toFixed(2);

  // Shp_ params must be sorted alphabetically in signature
  const shpParams = options?.shpParams ?? {};
  const shpKeys = Object.keys(shpParams).sort();
  const shpString = shpKeys.map((k) => `${k}=${shpParams[k]}`).join(':');

  // SignatureValue = MD5(MerchantLogin:OutSum:InvId:Password1[:Shp_...])
  const sigParts = [MERCHANT_LOGIN, outSum, String(invId), PASSWORD1];
  if (shpString) sigParts.push(shpString);
  const signature = md5(sigParts.join(':'));

  // Culture: Robokassa only supports 'ru' and 'en'
  const culture = options?.culture === 'en' ? 'en' : 'ru';

  return {
    MerchantLogin: MERCHANT_LOGIN,
    OutSum: outSum,
    InvId: invId,
    Description: description.slice(0, 100),
    SignatureValue: signature,
    Culture: culture,
    Encoding: 'utf-8',
    IsTest: IS_TEST ? 1 : undefined,
    Email: options?.email,
    ...shpParams,
  };
}

/**
 * Generate a Robokassa payment URL (for redirect fallback).
 */
export function createPaymentUrl(
  invId: number,
  amount: number,
  description: string,
  options?: {
    email?: string;
    culture?: string;
    shpParams?: Record<string, string>;
  },
): string {
  const p = createPaymentParams(invId, amount, description, options);

  const params = new URLSearchParams({
    MerchantLogin: p.MerchantLogin,
    OutSum: p.OutSum,
    InvId: String(p.InvId),
    Description: p.Description,
    SignatureValue: p.SignatureValue,
    Culture: p.Culture,
    Encoding: p.Encoding,
  });

  if (p.IsTest) params.set('IsTest', '1');
  if (p.Email) params.set('Email', p.Email);

  // Add Shp_ params
  const shpParams = options?.shpParams ?? {};
  for (const k of Object.keys(shpParams).sort()) {
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
