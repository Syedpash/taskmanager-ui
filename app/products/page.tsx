export default async function Product() {
    const response = await fetch("https://dummyjson.com/products/?limit=10");
    const data = await response.json();
    console.log(data);
    return (<div style={{ width: "60vw" }}>
        <table><tbody>{
            data.products.map((product: any) => (

                <tr key={product.id}><td><h2>{product.title}</h2></td><td><p>{product.description}</p></td></tr>



            ))
        }</tbody></table>
    </div>)
}