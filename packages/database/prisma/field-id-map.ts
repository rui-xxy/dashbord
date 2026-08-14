export const FIELD_ID_RENAMES = {
  'tank_98-1': 'acid98_tank_2',
  'tank_98-2': 'acid98_tank_3',
  'tank_98-3': 'acid98_tank_4',
  'tank_98-4': 'acid98_transfer_tank',
  'tank_fy-1': 'fuming_acid_tank_1',
  'tank_fy-2': 'fuming_acid_tank_5',
  'tank_fy-3': 'fuming_acid_transfer_tank',
  'tank_fy-4': 'amino_transfer_tank',
  'tank_jp-1': 'reagent_acid_tank_1',
  'tank_jp-2': 'reagent_acid_tank_2',
  'tank_jp-3': 'reagent_acid_tank_3',
  'tank_jp-4': 'reagent_acid_tank_4',
  'tank_syc-1': 'hydrogen_peroxide_tank',
  meter_3: 'power_meter_motor_1',
  meter_4: 'power_meter_motor_2',
  meter_5: 'power_meter_furnace_1',
  meter_6: 'power_meter_furnace_2',
  meter_mgso4_phase2: 'power_meter_mgso4_phase2',
  meter_amino: 'power_meter_amino',
} as const;

type JsonRecord = Record<string, unknown>;

export function renameFieldId(fieldId: string): string {
  return FIELD_ID_RENAMES[fieldId as keyof typeof FIELD_ID_RENAMES] ?? fieldId;
}

export function renameSchemaFieldIds<T extends { id: string }>(schema: T[]): T[] {
  return schema.map((field) => ({
    ...field,
    id: renameFieldId(field.id),
  }));
}

export function renameSubmissionKeys<T extends JsonRecord>(data: T): T {
  const next: JsonRecord = { ...data };

  for (const [oldKey, newKey] of Object.entries(FIELD_ID_RENAMES)) {
    if (!Object.prototype.hasOwnProperty.call(next, oldKey)) continue;
    if (!Object.prototype.hasOwnProperty.call(next, newKey)) {
      next[newKey] = next[oldKey];
    }
    delete next[oldKey];
  }

  return next as T;
}
