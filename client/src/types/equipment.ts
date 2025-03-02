export interface Equipment {
  id: string;
  name: string;
  partIds?: string[];
  parentId?: string | null; // Changed to include null
  inventoryPartIds?: string[];
  inventoryId?: string;
}