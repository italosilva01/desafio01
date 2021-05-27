import { createContext, ReactNode, useContext, useState } from "react";
import { toast } from "react-toastify";
import { api } from "../services/api";
import { Product, Stock } from "../types";

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<Product[]>(() => {
    const storagedCart = localStorage.getItem("@RocketShoes:cart");

    if (storagedCart) {
      return JSON.parse(storagedCart);
    }

    return storagedCart || [];
  });

  const addProduct = async (productId: number) => {
    console.log("executou");
    try {
      // TODO
      const condit = cart.some((product) => product.id === productId);
      const response = await api.get(`stock/${productId}`);

      const { amount } = response.data;
      console.log(amount);
      if (condit) {
        console.log("já existente");

        const newProduct = cart.find((product) => product.id === productId);
        const newCart = cart.filter((product) => product.id !== productId);
        if (!newProduct) return;

        if (amount >= newProduct.amount + 1) {
          const newProductEdit = [
            ...newCart,
            { ...newProduct, amount: newProduct.amount + 1 },
          ];

          setCart(newProductEdit);
          localStorage.setItem(
            "@RocketShoes:cart",
            JSON.stringify(newProductEdit)
          );
        } else {
          toast.error("Quantidade solicitada fora de estoque");
        }
      } else {
        console.log("novo");
        const response = await api.get(`products/${productId}`);
        const newProduct: Product[] = [
          ...cart,
          { ...response.data, amount: 1 },
        ];

        setCart(newProduct);
        localStorage.setItem("@RocketShoes:cart", JSON.stringify(newProduct));
      }
    } catch {
      // TODO
    }
  };

  const removeProduct = (productId: number) => {
    try {
      // if(cart.includes(productId))
      // TODO
    } catch {
      // TODO
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      // TODO
    } catch {
      // TODO
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
