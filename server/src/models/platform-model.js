export const PLATFORM_INPUT_MAP = {
  "pc-steam": "pc",
  "pc-epic": "pc",
  pc: "pc",
  ps5: "ps5",
  xbox: "xbox-series",
  "xbox-series": "xbox-series",
  crossplay: "crossplay",
};

export function toPlatformSlug(value) {
  return PLATFORM_INPUT_MAP[value] ?? value;
}
