/**
 * Yandex Metrika analytics helper.
 * Usage: ym('goal_name') or ymParams('goal_name', { key: value })
 *
 * All goals are prefixed by category for easy filtering in Metrika.
 */

declare global {
  interface Window {
    ym?: (id: number, method: string, target?: string, params?: Record<string, unknown>) => void;
  }
}

const YM_ID = 107086067;

/** Send a Yandex Metrika goal */
export function ymGoal(target: string, params?: Record<string, unknown>) {
  if (typeof window !== 'undefined' && window.ym) {
    window.ym(YM_ID, 'reachGoal', target, params);
  }
}

// ── Navigation ──────────────────────────────────────────────
export const navClick = (link: string) => ymGoal('nav_click', { link });
export const footerClick = (link: string) => ymGoal('footer_click', { link });

// ── Hero ────────────────────────────────────────────────────
export const heroCreateTree = () => ymGoal('hero_create_tree');
export const heroAiFeatures = () => ymGoal('hero_ai_features');

// ── Auth ────────────────────────────────────────────────────
export const authLoginOpen = () => ymGoal('auth_login_open');
export const authSendCode = () => ymGoal('auth_send_code');
export const authVerifyCode = () => ymGoal('auth_verify_code');
export const authLogout = () => ymGoal('auth_logout');

// ── AI Section (main page grid) ─────────────────────────────
export const aiCardTry = (type: string) => ymGoal('ai_card_try', { type });
export const aiCardDetails = (slug: string) => ymGoal('ai_card_details', { slug });

// ── AI Showcase ─────────────────────────────────────────────
export const aiShowcaseClick = (slug: string) => ymGoal('ai_showcase_click', { slug });

// ── AI Generation (modals + pages) ──────────────────────────
export const aiUploadPhoto = (type: string) => ymGoal('ai_upload_photo', { type });
export const aiGenerate = (type: string) => ymGoal('ai_generate', { type });
export const aiGenerateSuccess = (type: string) => ymGoal('ai_generate_success', { type });
export const aiGenerateError = (type: string) => ymGoal('ai_generate_error', { type });
export const aiDownload = (type: string) => ymGoal('ai_download', { type });
export const aiShare = (type: string) => ymGoal('ai_share', { type });
export const aiTryAgain = (type: string) => ymGoal('ai_try_again', { type });
export const aiOrderCanvas = (type: string) => ymGoal('ai_order_canvas', { type });
export const aiChangePhoto = (type: string) => ymGoal('ai_change_photo', { type });
export const aiSelectGender = (type: string, gender: string) => ymGoal('ai_select_gender', { type, gender });

// ── Family Portrait specific ────────────────────────────────
export const fpAddPerson = () => ymGoal('fp_add_person');
export const fpRemovePerson = (role: string) => ymGoal('fp_remove_person', { role });
export const fpSelectBg = (bg: string) => ymGoal('fp_select_bg', { bg });
export const fpUploadPhoto = (role: string) => ymGoal('fp_upload_photo', { role });

// ── AI Landing pages ────────────────────────────────────────
export const aiLandingCta = (slug: string) => ymGoal('ai_landing_cta', { slug });
export const aiLandingRelated = (slug: string) => ymGoal('ai_landing_related', { slug });

// ── Family Portrait CTA (main page) ────────────────────────
export const fpCtaClick = () => ymGoal('fp_cta_click');

// ── Canvas ordering ─────────────────────────────────────────
export const orderSelectProduct = (productId: string) => ymGoal('order_select_product', { productId });
export const orderSubmit = () => ymGoal('order_submit');
export const orderPromoAi = () => ymGoal('order_promo_ai');

// ── Tree form & sharing ─────────────────────────────────────
export const treeShare = () => ymGoal('tree_share');
export const treeDownload = () => ymGoal('tree_download');
export const treeEdit = () => ymGoal('tree_edit');
export const treePdf = () => ymGoal('tree_pdf');
export const treeFormSubmit = () => ymGoal('tree_form_submit');

// ── Pricing ─────────────────────────────────────────────────
export const pricingBuy = (packageName: string) => ymGoal('pricing_buy', { packageName });
export const pricingOpen = () => ymGoal('pricing_open');
