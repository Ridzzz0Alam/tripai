CREATE TYPE "public"."budget_category" AS ENUM('lodging', 'food', 'transport', 'activities');--> statement-breakpoint
CREATE TYPE "public"."trip_pace" AS ENUM('relaxed', 'balanced', 'packed');--> statement-breakpoint
CREATE TYPE "public"."trip_status" AS ENUM('pending', 'generating', 'ready', 'failed');--> statement-breakpoint
CREATE TABLE "activities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"trip_day_id" uuid NOT NULL,
	"place_id" uuid,
	"order" integer NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"time_hint" text,
	"cost_estimate" text
);
--> statement-breakpoint
CREATE TABLE "budget_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"trip_id" uuid NOT NULL,
	"category" "budget_category" NOT NULL,
	"amount" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hotel_suggestions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"trip_id" uuid NOT NULL,
	"place_id" uuid,
	"name" text NOT NULL,
	"price_estimate" text,
	"area" text
);
--> statement-breakpoint
CREATE TABLE "places" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"trip_id" uuid NOT NULL,
	"google_place_id" text,
	"name" text NOT NULL,
	"address" text,
	"lat" double precision,
	"lng" double precision,
	"category" text,
	"geocode_confident" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "trip_days" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"trip_id" uuid NOT NULL,
	"day_number" integer NOT NULL,
	"summary" text
);
--> statement-breakpoint
CREATE TABLE "trip_photos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"trip_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"imagekit_url" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "trips" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"destination" text NOT NULL,
	"days" integer NOT NULL,
	"travelers" integer NOT NULL,
	"budget" text NOT NULL,
	"interests" text,
	"pace" "trip_pace" DEFAULT 'balanced' NOT NULL,
	"status" "trip_status" DEFAULT 'pending' NOT NULL,
	"error" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clerk_id" text NOT NULL,
	"email" text NOT NULL,
	"name" text,
	"image_url" text,
	"home_city" text,
	"interests" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_clerk_id_unique" UNIQUE("clerk_id")
);
--> statement-breakpoint
ALTER TABLE "activities" ADD CONSTRAINT "activities_trip_day_id_trip_days_id_fk" FOREIGN KEY ("trip_day_id") REFERENCES "public"."trip_days"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activities" ADD CONSTRAINT "activities_place_id_places_id_fk" FOREIGN KEY ("place_id") REFERENCES "public"."places"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "budget_items" ADD CONSTRAINT "budget_items_trip_id_trips_id_fk" FOREIGN KEY ("trip_id") REFERENCES "public"."trips"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hotel_suggestions" ADD CONSTRAINT "hotel_suggestions_trip_id_trips_id_fk" FOREIGN KEY ("trip_id") REFERENCES "public"."trips"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hotel_suggestions" ADD CONSTRAINT "hotel_suggestions_place_id_places_id_fk" FOREIGN KEY ("place_id") REFERENCES "public"."places"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "places" ADD CONSTRAINT "places_trip_id_trips_id_fk" FOREIGN KEY ("trip_id") REFERENCES "public"."trips"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trip_days" ADD CONSTRAINT "trip_days_trip_id_trips_id_fk" FOREIGN KEY ("trip_id") REFERENCES "public"."trips"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trip_photos" ADD CONSTRAINT "trip_photos_trip_id_trips_id_fk" FOREIGN KEY ("trip_id") REFERENCES "public"."trips"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trip_photos" ADD CONSTRAINT "trip_photos_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trips" ADD CONSTRAINT "trips_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "activities_trip_day_id_idx" ON "activities" USING btree ("trip_day_id");--> statement-breakpoint
CREATE INDEX "activities_place_id_idx" ON "activities" USING btree ("place_id");--> statement-breakpoint
CREATE INDEX "budget_items_trip_id_idx" ON "budget_items" USING btree ("trip_id");--> statement-breakpoint
CREATE INDEX "hotel_suggestions_trip_id_idx" ON "hotel_suggestions" USING btree ("trip_id");--> statement-breakpoint
CREATE INDEX "hotel_suggestions_place_id_idx" ON "hotel_suggestions" USING btree ("place_id");--> statement-breakpoint
CREATE INDEX "places_trip_id_idx" ON "places" USING btree ("trip_id");--> statement-breakpoint
CREATE INDEX "trip_days_trip_id_idx" ON "trip_days" USING btree ("trip_id");--> statement-breakpoint
CREATE INDEX "trip_photos_trip_id_idx" ON "trip_photos" USING btree ("trip_id");--> statement-breakpoint
CREATE INDEX "trip_photos_user_id_idx" ON "trip_photos" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "trips_user_id_idx" ON "trips" USING btree ("user_id");