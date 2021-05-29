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
    try {
      // TODO
      const condit = cart.some((product) => product.id === productId);
      const response = await api.get(`stock/${productId}`);
      const { amount } = response.data;

      if (condit) {
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
        if (amount > 0) {
          const { data } = await api.get(`products/${productId}`);

          const newProduct: Product[] = [...cart, { ...data, amount: 1 }];

          setCart(newProduct);
          localStorage.setItem("@RocketShoes:cart", JSON.stringify(newProduct));
        } else {
          toast.error("Quantidade solicitada fora de estoque");
        }
      }
    } catch {
      // TODO
      toast.error("Erro na adição do produto");
    }
  };

  const removeProduct = (productId: number) => {
    try {
      // TODO
      const conditRemove = cart.some((product) => product.id === productId);
      if (conditRemove) {
        const newCart = cart.filter((product) => product.id !== productId);

        setCart(newCart);
        localStorage.setItem("@RocketShoes:cart", JSON.stringify(newCart));
      } else {
        toast.error("Erro na remoção do produto");
      }
    } catch {
      // TODO
      toast.error("Erro na remoção do produto");
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    if (amount <= 0) return;

    try {
      // TODO
      const response = await api.get(`stock/${productId}`);
      if (amount <= response.data.amount) {
        const product = cart.find((product) => product.id == productId);

        if (!product) return;

        const newProduct: Product = {
          ...product,
          amount: amount,
        };
        const newCart = cart.filter((product) => product.id !== productId);

        setCart([...newCart, { ...newProduct }]);
        localStorage.setItem(
          "@RocketShoes:cart",
          JSON.stringify([...newCart, { ...newProduct }])
        );
      } else {
        toast.error("Quantidade solicitada fora de estoque");
      }
    } catch {
      // TODO
      toast.error("Erro na alteração de quantidade do produto");
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
