// export const DisplayPriceInRupees = (price)=>{
//     return new Intl.NumberFormat('th-TH',{
//         style : 'currency',
//         currency : 'THB'
//     }).format(price)
// }
export const DisplayPriceInRupees = (price)=>{
    const parts = price.toFixed(2).split('.'); const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.'); const decimalPart = parts[1]; return `₭ ${integerPart},${decimalPart}`;
}
