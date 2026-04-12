/**
 * @typedef {{ ar: string, en: string }} LocalizedText
 *
 * @typedef {{
 *   id: string,
 *   name: LocalizedText,
 *   brand: LocalizedText,
 *   desc: LocalizedText,
 *   categoryId: string,
 *   animalType: string,
 *   lifeStage?: string,
 *   price: number,
 *   image: string
 * }} Product
 *
 * @typedef {{
 *   id: string,
 *   type: 'threshold',
 *   threshold: number,
 *   value: number,
 *   valueType: 'percentage' | 'fixed',
 *   isActive: boolean,
 *   startsAt: string | null,
 *   endsAt: string | null,
 *   scope: 'order',
 *   label: LocalizedText
 * }} DiscountRule
 *
 * @typedef {{
 *   id: string,
 *   name: string,
 *   phoneNumber1: string,
 *   phoneNumber2: string,
 *   placeOfResidence: string,
 *   closestLandmark: string,
 *   governorate: string,
 *   district: string
 * }} Client
 *
 * @typedef {{
 *   subtotal: number,
 *   discountAmount: number,
 *   total: number,
 *   appliedDiscounts: DiscountRule[]
 * }} DiscountResult
 *
 * @typedef {{
 *   customerName: string,
 *   phoneNumber1: string,
 *   phoneNumber2: string,
 *   closestLandmark: string,
 *   placeOfResidence: string,
 *   governorate: string,
 *   district: string
 * }} CheckoutDraft
 *
 * @typedef {{
 *   name: string,
 *   uri: string,
 *   mimeType?: string,
 *   size?: number
 * }} BookingAttachment
 *
 * @typedef {{
 *   id: string,
 *   userId: string,
 *   clientName: string,
 *   location: string,
 *   petName: string,
 *   petType: string,
 *   firstVisitDateIso: string,
 *   petBirthDateIso: string | null,
 *   ownerPhone: string,
 *   ownerEmail: string,
 *   vetName: string,
 *   protocol: string,
 *   notes: string,
 *   attachment: BookingAttachment | null,
 *   image: { uri: string } | null,
 *   records: Array<Record<string, any>>
 * }} VaccineBook
