export function getAttachmentLabel(attachment) {
  if (!attachment) return '-';
  return attachment.name || attachment.uri || '-';
}

export function buildBookPayload({
  currentUserId,
  petName,
  petType,
  clientName,
  location,
  firstVisitDateIso,
  petBirthDateIso,
  ownerPhone,
  ownerEmail,
  vetName,
  protocol,
  notes,
  attachment,
  image,
  records
}) {
  return {
    currentUserId,
    petName,
    petType,
    clientName,
    location,
    firstVisitDateIso,
    petBirthDateIso,
    ownerPhone,
    ownerEmail,
    vetName,
    protocol,
    notes,
    attachment,
    image,
    records
  };
}
