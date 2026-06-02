import { z } from "zod";

const coordinateFromForm = (min: number, max: number) =>
  z.preprocess(
    (value) => {
      if (value === "" || value === null || typeof value === "undefined") {
        return null;
      }

      return Number(value);
    },
    z.number().min(min).max(max).nullable(),
  );

export const landlordRoomInputSchema = z.object({
  title: z.string().trim().min(5).max(180),
  description: z.string().trim().max(2000).optional().nullable(),
  price: z.coerce.number().positive(),
  deposit: z.preprocess((value) => (value === "" || value === null || typeof value === "undefined" ? null : Number(value)), z.number().nonnegative().nullable()),
  area: z.coerce.number().positive(),
  floor: z.preprocess((value) => (value === "" || value === null || typeof value === "undefined" ? null : Number(value)), z.number().int().min(0).nullable()),
  capacity: z.coerce.number().int().min(1).max(20),
  electricPrice: z.preprocess((value) => (value === "" || value === null || typeof value === "undefined" ? null : Number(value)), z.number().nonnegative().nullable()),
  waterPrice: z.preprocess((value) => (value === "" || value === null || typeof value === "undefined" ? null : Number(value)), z.number().nonnegative().nullable()),
  internetFee: z.preprocess((value) => (value === "" || value === null || typeof value === "undefined" ? null : Number(value)), z.number().nonnegative().nullable()),
  serviceFee: z.preprocess((value) => (value === "" || value === null || typeof value === "undefined" ? null : Number(value)), z.number().nonnegative().nullable()),
  parkingFee: z.preprocess((value) => (value === "" || value === null || typeof value === "undefined" ? null : Number(value)), z.number().nonnegative().nullable()),
  address: z.string().trim().min(5).max(255),
  districtId: z.string().min(1),
  wardId: z.string().min(1),
  buildingId: z.string().min(1),
  availableFrom: z.preprocess((value) => (value ? new Date(String(value)) : null), z.date().nullable()),
  latitude: coordinateFromForm(-90, 90),
  longitude: coordinateFromForm(-180, 180),
});

export type LandlordRoomInput = z.infer<typeof landlordRoomInputSchema>;
