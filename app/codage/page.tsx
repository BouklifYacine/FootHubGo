type Product = {
  id: number;
  name: string;
  price: number;
  inStock: boolean;
};

function page() {
  function getAffordableInStock(products: Product[]) {
   const array =  products.filter(
      (element) => element.inStock == true && element.price < 100
    );

    return array;
  }

  const products: Product[] = [
    { id: 1, name: "Laptop", price: 1200, inStock: true },
    { id: 2, name: "Mouse", price: 25, inStock: true },
    { id: 3, name: "Keyboard", price: 150, inStock: false },
    { id: 4, name: "Monitor", price: 300, inStock: true },
  ];

    console.log(getAffordableInStock(products));

  return <div>page</div>;
}

export default page;
