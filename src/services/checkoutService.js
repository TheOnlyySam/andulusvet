import AsyncStorage from '@react-native-async-storage/async-storage';

const CHECKOUT_DRAFT_KEY = 'andulusvet_checkout_draft_v1';
const SAVED_LOCATIONS_KEY = 'andulusvet_saved_locations_v1';

export async function loadCheckoutPreferences() {
  const [draftRaw, locationsRaw] = await Promise.all([
    AsyncStorage.getItem(CHECKOUT_DRAFT_KEY),
    AsyncStorage.getItem(SAVED_LOCATIONS_KEY)
  ]);

  return {
    draft: draftRaw ? JSON.parse(draftRaw) : null,
    locations: locationsRaw ? JSON.parse(locationsRaw) : []
  };
}

export async function saveCheckoutDraft(draft) {
  await AsyncStorage.setItem(CHECKOUT_DRAFT_KEY, JSON.stringify(draft || {}));
}

export async function addSavedLocation(location) {
  const raw = await AsyncStorage.getItem(SAVED_LOCATIONS_KEY);
  const current = raw ? JSON.parse(raw) : [];

  const nextLocation = {
    id: location.id || `loc_${Date.now()}`,
    label: location.label || '',
    governorate: location.governorate || '',
    district: location.district || '',
    closestLandmark: location.closestLandmark || '',
    placeOfResidence: location.placeOfResidence || ''
  };

  const deduped = current.filter(
    (item) =>
      !(
        item.governorate === nextLocation.governorate &&
        item.district === nextLocation.district &&
        item.closestLandmark === nextLocation.closestLandmark &&
        item.placeOfResidence === nextLocation.placeOfResidence
      )
  );

  const next = [nextLocation, ...deduped].slice(0, 15);
  await AsyncStorage.setItem(SAVED_LOCATIONS_KEY, JSON.stringify(next));
  return next;
}

export async function removeSavedLocation(locationId) {
  const raw = await AsyncStorage.getItem(SAVED_LOCATIONS_KEY);
  const current = raw ? JSON.parse(raw) : [];
  const next = current.filter((item) => item.id !== locationId);
  await AsyncStorage.setItem(SAVED_LOCATIONS_KEY, JSON.stringify(next));
  return next;
}
