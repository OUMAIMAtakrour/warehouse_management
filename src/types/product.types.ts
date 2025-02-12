export interface Location {
  city: string;
  latitude: number;
  longitude: number;
}

export interface Stock {
  id: number;
  name: string;
  quantity: number;
  localisation: Location;
}

export interface History {
  warehouseManId: number;
  at: string;
}

export interface Product {
  id: number;
  name: string;
  type: string;
  barcode: string;
  price: number;
  sold?: number;
  supplier: string;
  image: string;
  stocks: [];
  editedBy: History;
}

export interface CreateProductDTO {
  name: string;
  type: string;
  barcode: string;
  price: number;
  solde?: number;
  supplier: string;
  image: string;
  stocks: Stock[];
}
