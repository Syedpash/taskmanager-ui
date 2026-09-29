type ProductPageProps = {
    params: Promise<{
        id: string;
    }>;
};
export default async function ProductPage({ params }: ProductPageProps) {

    const { id } = await params;
    const response = await fetch(`https://dummyjson.com/products/${id}`);
    const data = await response.json();
    console.log(data);
    console.log(params);
    return (
        <div>
            <h1>{data.title}</h1>
            <p>{data.description}</p>
        </div>
    )
}