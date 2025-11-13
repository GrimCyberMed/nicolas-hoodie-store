import { ProductForm } from '@/components/admin/ProductForm';

export default function NewProductPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Add New Product</h1>
        <p className="text-secondary mt-2">Create a new product in your catalog</p>
      </div>

      <ProductForm />
    </div>
  );
}
