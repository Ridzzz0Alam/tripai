import { relations } from "drizzle-orm";
import {
  boolean,
  doublePrecision,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

// ---------------------------------------------------------------------------
// Enums
// ---------------------------------------------------------------------------

export const tripStatus = pgEnum("trip_status", [
  "pending",
  "generating",
  "ready",
  "failed",
]);

export const tripPace = pgEnum("trip_pace", ["relaxed", "balanced", "packed"]);

export const budgetCategory = pgEnum("budget_category", [
  "lodging",
  "food",
  "transport",
  "activities",
]);

// ---------------------------------------------------------------------------
// Tables
// ---------------------------------------------------------------------------

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  clerkId: text("clerk_id").notNull().unique(),
  email: text("email").notNull(),
  homeCity: text("home_city"),
  interests: text("interests"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const trips = pgTable("trips", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  destination: text("destination").notNull(),
  days: integer("days").notNull(),
  travelers: integer("travelers").notNull(),
  budget: text("budget").notNull(),
  interests: text("interests"),
  pace: tripPace("pace").notNull().default("balanced"),
  status: tripStatus("status").notNull().default("pending"),
  error: text("error"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// Cached, geocoded real-world places. Coordinates are nullable so the itinerary
// degrades gracefully to text when geocoding cannot confidently resolve a place.
export const places = pgTable("places", {
  id: uuid("id").defaultRandom().primaryKey(),
  tripId: uuid("trip_id")
    .notNull()
    .references(() => trips.id, { onDelete: "cascade" }),
  googlePlaceId: text("google_place_id"),
  name: text("name").notNull(),
  address: text("address"),
  lat: doublePrecision("lat"),
  lng: doublePrecision("lng"),
  category: text("category"),
  geocodeConfident: boolean("geocode_confident").notNull().default(false),
});

export const tripDays = pgTable("trip_days", {
  id: uuid("id").defaultRandom().primaryKey(),
  tripId: uuid("trip_id")
    .notNull()
    .references(() => trips.id, { onDelete: "cascade" }),
  dayNumber: integer("day_number").notNull(),
  summary: text("summary"),
});

export const activities = pgTable("activities", {
  id: uuid("id").defaultRandom().primaryKey(),
  tripDayId: uuid("trip_day_id")
    .notNull()
    .references(() => tripDays.id, { onDelete: "cascade" }),
  placeId: uuid("place_id").references(() => places.id, { onDelete: "set null" }),
  order: integer("order").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  timeHint: text("time_hint"),
  costEstimate: text("cost_estimate"),
});

export const hotelSuggestions = pgTable("hotel_suggestions", {
  id: uuid("id").defaultRandom().primaryKey(),
  tripId: uuid("trip_id")
    .notNull()
    .references(() => trips.id, { onDelete: "cascade" }),
  placeId: uuid("place_id").references(() => places.id, { onDelete: "set null" }),
  name: text("name").notNull(),
  priceEstimate: text("price_estimate"),
  area: text("area"),
});

export const budgetItems = pgTable("budget_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  tripId: uuid("trip_id")
    .notNull()
    .references(() => trips.id, { onDelete: "cascade" }),
  category: budgetCategory("category").notNull(),
  amount: text("amount").notNull(),
});

export const tripPhotos = pgTable("trip_photos", {
  id: uuid("id").defaultRandom().primaryKey(),
  tripId: uuid("trip_id")
    .notNull()
    .references(() => trips.id, { onDelete: "cascade" }),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  imagekitUrl: text("imagekit_url").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// ---------------------------------------------------------------------------
// Relations
// ---------------------------------------------------------------------------

export const usersRelations = relations(users, ({ many }) => ({
  trips: many(trips),
  photos: many(tripPhotos),
}));

export const tripsRelations = relations(trips, ({ one, many }) => ({
  user: one(users, { fields: [trips.userId], references: [users.id] }),
  days: many(tripDays),
  places: many(places),
  hotelSuggestions: many(hotelSuggestions),
  budgetItems: many(budgetItems),
  photos: many(tripPhotos),
}));

export const tripDaysRelations = relations(tripDays, ({ one, many }) => ({
  trip: one(trips, { fields: [tripDays.tripId], references: [trips.id] }),
  activities: many(activities),
}));

export const activitiesRelations = relations(activities, ({ one }) => ({
  day: one(tripDays, { fields: [activities.tripDayId], references: [tripDays.id] }),
  place: one(places, { fields: [activities.placeId], references: [places.id] }),
}));

export const placesRelations = relations(places, ({ one, many }) => ({
  trip: one(trips, { fields: [places.tripId], references: [trips.id] }),
  activities: many(activities),
}));

export const hotelSuggestionsRelations = relations(hotelSuggestions, ({ one }) => ({
  trip: one(trips, { fields: [hotelSuggestions.tripId], references: [trips.id] }),
  place: one(places, { fields: [hotelSuggestions.placeId], references: [places.id] }),
}));

export const budgetItemsRelations = relations(budgetItems, ({ one }) => ({
  trip: one(trips, { fields: [budgetItems.tripId], references: [trips.id] }),
}));

export const tripPhotosRelations = relations(tripPhotos, ({ one }) => ({
  trip: one(trips, { fields: [tripPhotos.tripId], references: [trips.id] }),
  user: one(users, { fields: [tripPhotos.userId], references: [users.id] }),
}));

// ---------------------------------------------------------------------------
// Inferred types
// ---------------------------------------------------------------------------

export type User = typeof users.$inferSelect;
export type Trip = typeof trips.$inferSelect;
export type NewTrip = typeof trips.$inferInsert;
export type TripDay = typeof tripDays.$inferSelect;
export type Activity = typeof activities.$inferSelect;
export type Place = typeof places.$inferSelect;
export type HotelSuggestion = typeof hotelSuggestions.$inferSelect;
export type BudgetItem = typeof budgetItems.$inferSelect;
export type TripPhoto = typeof tripPhotos.$inferSelect;
