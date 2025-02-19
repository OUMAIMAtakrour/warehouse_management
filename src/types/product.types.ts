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
  stocks: Stock[];
  editedBy: History;
}

export interface CreateStockDto {
  name: string;
  quantity: number;
  localisation: Location;
}

export interface CreateProductDTO {
  name: string;
  type: string;
  barcode: string;
  price: number;
  sold?: number;
  supplier: string;
  image: string;
  stocks: Stock[];
}

export interface ProductDetailsProps {
  route: {
    params: {
      productId: string;
      barcode?: string;
    };
  };
  navigation: any;
}

export interface InfoItemProps {
  icon: string;
  label: string;
  value: string | number;
}
