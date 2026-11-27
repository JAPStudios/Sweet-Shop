export const CATEGORIES = [
  { value: "sweets", label: "Sweets & treats" },
  { value: "pantry", label: "Pantry staples" },
  { value: "handcrafted", label: "Handcrafted" },
  { value: "devices", label: "Devices & equipment" },
  { value: "home", label: "Home & cleaning" },
  { value: "care", label: "Baby & care" },
];

export const categoryLabel = (value) =>
  CATEGORIES.find((c) => c.value === value)?.label ?? value ?? "Other";

export const VERIFICATION = {
  draft: { label: "Draft", tone: "bg-muted text-muted-foreground" },
  pending: { label: "In verification", tone: "bg-[hsl(38_92%_88%)] text-[hsl(28_45%_28%)]" },
  verified: { label: "Verified", tone: "bg-secondary text-secondary-foreground" },
  rejected: { label: "Rejected", tone: "bg-destructive/10 text-destructive" },
};

export const ORDER_STATUS = {
  awaiting_payment: { label: "Awaiting payment", tone: "bg-[hsl(38_92%_88%)] text-[hsl(28_45%_28%)]" },
  placed: { label: "Placed", tone: "bg-muted text-muted-foreground" },
  packing: { label: "Seller packing", tone: "bg-[hsl(38_92%_88%)] text-[hsl(28_45%_28%)]" },
  ready_for_pickup: { label: "Ready for pickup", tone: "bg-accent text-accent-foreground" },
  in_transit: { label: "Out for delivery", tone: "bg-primary/10 text-primary" },
  delivered: { label: "Delivered", tone: "bg-secondary text-secondary-foreground" },
  cancelled: { label: "Cancelled", tone: "bg-destructive/10 text-destructive" },
};

export const MAKER_TYPES = {
  self: "Independent seller",
  incarcerated_artisan: "Incarcerated maker",
  organisation: "Organisation workshop",
};